/**
 * Spend guard for public, unauthenticated AI chat endpoints.
 *
 * WHY: these widgets are public and call Gemini on Elad's personal key. He funds it
 * himself and had just run out of credit, so an uncapped endpoint bills him directly.
 * A per-IP limit stops one flooder; it does nothing about many separate visitors or a
 * crawler rotating addresses, which is the case that actually empties the account.
 *
 * TWO LAYERS:
 *   1. per-IP window   — in-memory, per lambda. Cheap, instant, no network. Good enough
 *                        for its job because one abusive client tends to land on one
 *                        warm instance.
 *   2. per-site daily  — a SHARED counter in Supabase, so every lambda of every region
 *                        agrees on one number. This is the real ceiling.
 *
 * The daily counter deliberately does NOT use in-process state. Serverless instances do
 * not share memory: a local counter resets on cold start and each concurrent instance
 * gets a fresh budget, so it looks like a cap while capping nothing.
 *
 * FAIL-OPEN on infrastructure trouble, FAIL-CLOSED on the ceiling. If Supabase is
 * unreachable the answer still goes out — these are visitor-facing widgets and a
 * database blip must not take them down. The ceiling itself is enforced strictly.
 *
 * Requires AI_GUARD_SUPABASE_URL and AI_GUARD_SUPABASE_KEY. The key is publishable by
 * design: RLS gives anon no access to the counter table, and the RPC can only ever
 * increment-and-report, so a leaked key cannot read traffic or reset anyone's count.
 */

type Bucket = { count: number; resetAt: number };

const ipBuckets = new Map<string, Bucket>();
const MAX_TRACKED_IPS = 5000;

const IP_LIMIT = Number(process.env.AI_CHAT_IP_LIMIT ?? 10);
const IP_WINDOW_MS = 60_000;

/**
 * Site-wide answers per day. At ~600 output tokens of gemini-flash (~$0.002 an
 * answer) 400 is under a dollar a day, and far more than any of these sites
 * legitimately serves.
 */
const DAILY_LIMIT = Number(process.env.AI_CHAT_DAILY_LIMIT ?? 400);

/**
 * Deliberately dedicated variable names, NOT the generic NEXT_PUBLIC_SUPABASE_*.
 * Several of these sites already point those at their OWN Supabase project
 * (hitechkids has a standalone one), and reusing the generic names would send the
 * counter RPC to a project that has no such function — failing open silently,
 * which is the worst kind of broken cap: one that looks configured.
 */
const SUPABASE_URL = process.env.AI_GUARD_SUPABASE_URL || "";
const SUPABASE_ANON = process.env.AI_GUARD_SUPABASE_KEY || "";

export type GuardVerdict = {
  ok: boolean;
  reason?: "rate" | "daily";
  used?: number;
  limit?: number;
  /** true when the daily ceiling could not be consulted (no shared store configured). */
  degraded?: boolean;
};

export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") || "unknown";
}

/** Per-IP window. Synchronous and local on purpose — no network on the hot path. */
function ipAllows(req: Request): boolean {
  const now = Date.now();
  const ip = clientIp(req);
  const existing = ipBuckets.get(ip);
  if (!existing || existing.resetAt <= now) {
    if (ipBuckets.size > MAX_TRACKED_IPS) {
      for (const [k, v] of ipBuckets) if (v.resetAt <= now) ipBuckets.delete(k);
    }
    ipBuckets.set(ip, { count: 1, resetAt: now + IP_WINDOW_MS });
    return true;
  }
  existing.count += 1;
  return existing.count <= IP_LIMIT;
}

/**
 * Charge one answer against the shared daily ceiling.
 * `site` must be stable per project — it is the counter key.
 */
export async function aiGuard(req: Request, site: string): Promise<GuardVerdict> {
  if (!ipAllows(req)) {
    return { ok: false, reason: "rate" };
  }

  if (!SUPABASE_URL || !SUPABASE_ANON) {
    // No shared store configured. Say so rather than pretending there is a cap.
    return { ok: true, degraded: true };
  }

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/bump_ai_usage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON,
        Authorization: `Bearer ${SUPABASE_ANON}`,
      },
      body: JSON.stringify({ p_site: site, p_limit: DAILY_LIMIT }),
      // Never let the counter become the slowest part of answering a visitor.
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return { ok: true, degraded: true };
    const d = (await res.json()) as { allowed?: boolean; used?: number; limit?: number };
    if (typeof d?.allowed !== "boolean") return { ok: true, degraded: true };
    return d.allowed
      ? { ok: true, used: d.used, limit: d.limit }
      : { ok: false, reason: "daily", used: d.used, limit: d.limit };
  } catch {
    return { ok: true, degraded: true };
  }
}
