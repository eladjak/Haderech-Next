// Retrieval helpers for the Smart Advisor RAG (Phase 21).
//
// Mirrors the proven zehut-site bookRetrieval pattern: embed the question
// with the SAME Gemini embedding model the index was built with
// (gemini-embedding-001, 768 dims, free tier), then vector-search the
// `knowledgeChunks` table (Convex native vectorIndex — the cosine ranking
// happens server-side in ctx.vectorSearch, unlike zehut's in-memory scan).
//
// Never throws: embedding failure returns null and the advisor answers
// from its base knowledge — the free-degradation contract is preserved.

export const EMBED_MODEL = "gemini-embedding-001";
export const EMBED_DIMS = 768;
export const TOP_K = 5;
/** Convex vectorSearch returns cosine similarity in _score (higher = closer). */
export const MIN_SCORE = 0.45;

const EMBED_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${EMBED_MODEL}:embedContent`;

/** Embed a retrieval QUERY (not a document). Returns null on any failure. */
export async function embedQuery(
  geminiKey: string,
  text: string
): Promise<number[] | null> {
  const q = text.trim();
  if (q.length < 4) return null;
  try {
    const res = await fetch(`${EMBED_ENDPOINT}?key=${geminiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: `models/${EMBED_MODEL}`,
        content: { parts: [{ text: q.slice(0, 1500) }] },
        taskType: "RETRIEVAL_QUERY",
        outputDimensionality: EMBED_DIMS,
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { embedding?: { values?: number[] } };
    return data.embedding?.values ?? null;
  } catch {
    return null;
  }
}

export interface RetrievedPassage {
  ref: string;
  text: string;
}

/**
 * Format retrieved passages as a grounding block appended to the advisor's
 * system prompt. PURE (unit-tested). Empty input -> empty string.
 */
export function buildGroundingBlock(passages: RetrievedPassage[]): string {
  if (passages.length === 0) return "";
  const body = passages
    .map((p) => `[${p.ref}]\n${p.text}`)
    .join("\n\n---\n\n");
  return `\n\n--- קטעי מקור מתוך הקורס והספר של אלעד, רלוונטיים לשאלה הנוכחית ---
הסתמך עליהם כשאתה עונה, וכשאתה נשען על קטע — ציין את מקורו בסוגריים, למשל: (מתוך שיעור 30: שלוש רמות המשיכה).
אל תמציא מקורות. אם הקטעים לא רלוונטיים — התעלם מהם.

${body}`;
}

/** Unique, order-preserving source refs (for the UI citation line). PURE. */
export function uniqueRefs(passages: RetrievedPassage[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const p of passages) {
    if (!seen.has(p.ref)) {
      seen.add(p.ref);
      out.push(p.ref);
    }
  }
  return out;
}
