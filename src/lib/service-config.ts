export type ServiceConfigEnv = {
  VERCEL_ENV?: string;
  NEXT_PUBLIC_APP_URL?: string;
  NEXT_PUBLIC_CONVEX_URL?: string;
  PRODUCTION_CONVEX_URL?: string;
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?: string;
  NEXT_PUBLIC_CLERK_PROXY_URL?: string;
  CLERK_SECRET_KEY?: string;
  NEXT_PUBLIC_CLERK_SIGN_IN_URL?: string;
  NEXT_PUBLIC_CLERK_SIGN_UP_URL?: string;
  NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL?: string;
  NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL?: string;
};

function requiredTrimmed(value: string | undefined, name: string): string {
  if (!value) throw new Error(`${name} is required.`);
  const trimmed = value.trim();
  if (!trimmed) throw new Error(`${name} is required.`);
  if (trimmed !== value) {
    throw new Error(`${name} must not contain leading or trailing whitespace.`);
  }
  return trimmed;
}

function requiredLocalPath(value: string | undefined, name: string): string {
  const path = requiredTrimmed(value, name);
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("://")) {
    throw new Error(`${name} must be a local absolute path.`);
  }
  return path;
}

export function getConvexDeploymentUrl(
  value: string | undefined,
  name = "NEXT_PUBLIC_CONVEX_URL"
): string {
  const raw = requiredTrimmed(value, name);
  const url = new URL(raw);
  if (url.protocol !== "https:" || !url.hostname.endsWith(".convex.cloud")) {
    throw new Error(`${name} must be an HTTPS convex.cloud deployment URL.`);
  }
  if (url.pathname !== "/" || url.search || url.hash) {
    throw new Error(`${name} must not contain a path, query or fragment.`);
  }
  return url.origin;
}

export function getAppUrl(value: string | undefined, production = false): string {
  const raw = requiredTrimmed(value, "NEXT_PUBLIC_APP_URL");
  const url = new URL(raw);
  if (production && url.protocol !== "https:") {
    throw new Error("NEXT_PUBLIC_APP_URL must use HTTPS in production.");
  }
  if (production && ["localhost", "127.0.0.1"].includes(url.hostname)) {
    throw new Error("NEXT_PUBLIC_APP_URL must not point to localhost in production.");
  }
  return url.origin;
}

export function getClerkIssuerFromPublishableKey(value: string | undefined): string {
  const key = requiredTrimmed(value, "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY");
  if (!/^pk_(test|live)_/.test(key)) {
    throw new Error("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY has an invalid prefix.");
  }

  const encoded = key.replace(/^pk_(test|live)_/, "");
  let hostname: string;
  try {
    hostname = atob(encoded).replace(/\$$/, "");
  } catch {
    throw new Error("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY has an invalid payload.");
  }
  if (!hostname || /[\s/]/.test(hostname)) {
    throw new Error("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY does not contain a valid issuer hostname.");
  }
  return `https://${hostname}`;
}

export function getClerkHealthProbeBaseUrl(
  publishableKey: string | undefined,
  proxyUrl?: string,
): string {
  if (proxyUrl === undefined) {
    return getClerkIssuerFromPublishableKey(publishableKey);
  }

  const raw = requiredTrimmed(proxyUrl, "NEXT_PUBLIC_CLERK_PROXY_URL");
  const url = new URL(raw);
  if (
    url.protocol !== "https:" ||
    url.pathname !== "/__clerk" ||
    url.search ||
    url.hash
  ) {
    throw new Error(
      "NEXT_PUBLIC_CLERK_PROXY_URL must be an HTTPS origin followed by /__clerk.",
    );
  }
  return url.toString().replace(/\/$/u, "");
}

export function assertProductionServiceConfiguration(
  env: ServiceConfigEnv = process.env as ServiceConfigEnv
): void {
  if (env.VERCEL_ENV !== "production") return;

  const publicConvexUrl = getConvexDeploymentUrl(env.NEXT_PUBLIC_CONVEX_URL);
  const expectedConvexUrl = getConvexDeploymentUrl(
    env.PRODUCTION_CONVEX_URL,
    "PRODUCTION_CONVEX_URL"
  );
  if (publicConvexUrl !== expectedConvexUrl) {
    throw new Error(
      "NEXT_PUBLIC_CONVEX_URL must exactly match the independently configured PRODUCTION_CONVEX_URL."
    );
  }

  const appUrl = getAppUrl(env.NEXT_PUBLIC_APP_URL, true);

  const publishableKey = requiredTrimmed(
    env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
  );
  const secretKey = requiredTrimmed(env.CLERK_SECRET_KEY, "CLERK_SECRET_KEY");
  if (!publishableKey.startsWith("pk_live_")) {
    throw new Error("Vercel Production requires a Clerk pk_live_ publishable key.");
  }
  if (!secretKey.startsWith("sk_live_")) {
    throw new Error("Vercel Production requires a Clerk sk_live_ secret key.");
  }
  const clerkProxyUrl = getClerkHealthProbeBaseUrl(
    publishableKey,
    requiredTrimmed(
      env.NEXT_PUBLIC_CLERK_PROXY_URL,
      "NEXT_PUBLIC_CLERK_PROXY_URL",
    ),
  );
  if (new URL(clerkProxyUrl).origin !== appUrl) {
    throw new Error(
      "NEXT_PUBLIC_CLERK_PROXY_URL must use the NEXT_PUBLIC_APP_URL origin.",
    );
  }
  requiredLocalPath(env.NEXT_PUBLIC_CLERK_SIGN_IN_URL, "NEXT_PUBLIC_CLERK_SIGN_IN_URL");
  requiredLocalPath(env.NEXT_PUBLIC_CLERK_SIGN_UP_URL, "NEXT_PUBLIC_CLERK_SIGN_UP_URL");
  requiredLocalPath(
    env.NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL,
    "NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL"
  );
  requiredLocalPath(
    env.NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL,
    "NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL"
  );
}
