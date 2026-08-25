import path from "node:path";

export const STG1_CLERK = Object.freeze({
  apiBaseUrl: "https://api.clerk.com/v1",
  deploymentName: "content-dog-757",
  fixtureVersion: "stg1-v1",
  manifestVersion: "1.0",
  aliases: Object.freeze([
    "U0",
    "A",
    "B",
    "E",
    "X",
    "ADMIN",
    "IMPOSTOR",
  ]),
  createConfirmation: "CREATE_STG1_CLERK_USERS_CONTENT_DOG_757",
  banConfirmation: "BAN_STG1_CLERK_USERS_CONTENT_DOG_757",
  unbanConfirmation: "UNBAN_STG1_CLERK_USERS_CONTENT_DOG_757",
  e07Confirmation: "RUN_STG1_E07_CONTENT_DOG_757",
  allowedPreviewHost: "haderech-preview.vercel.app",
  convexCloudUrl: "https://content-dog-757.convex.cloud",
});

const USER_ID_PATTERN = /^user_[A-Za-z0-9]+$/u;

export function expectedStg1Email(alias) {
  assertAlias(alias);
  return `stg1+clerk_test_${alias.toLowerCase()}@example.com`;
}

export function expectedStg1ExternalId(alias) {
  assertAlias(alias);
  return `stg1:${STG1_CLERK.deploymentName}:${STG1_CLERK.fixtureVersion}:${alias}`;
}

export function expectedStg1PrivateMetadata(alias) {
  assertAlias(alias);
  return {
    stg1: {
      deploymentName: STG1_CLERK.deploymentName,
      fixtureVersion: STG1_CLERK.fixtureVersion,
      alias,
    },
  };
}

export function assertAlias(alias) {
  if (!STG1_CLERK.aliases.includes(alias)) {
    throw new Error("STG1_CLERK:UNKNOWN_ALIAS");
  }
  return alias;
}

export function assertDevelopmentClerkKeys(values) {
  const secretKey = values.get("CLERK_SECRET_KEY");
  const publishableKey = values.get("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY");
  if (!secretKey || !secretKey.startsWith("sk_test_")) {
    throw new Error("STG1_CLERK:DEVELOPMENT_SECRET_KEY_REQUIRED");
  }
  if (!publishableKey || !publishableKey.startsWith("pk_test_")) {
    throw new Error("STG1_CLERK:DEVELOPMENT_PUBLISHABLE_KEY_REQUIRED");
  }
  return Object.freeze({
    secretKey,
    publishableKey,
    developmentSecretVerified: true,
    developmentPublishableKeyVerified: true,
  });
}

export function validateLocalStg1Path(projectRoot, candidate) {
  const root = path.resolve(projectRoot, ".stg1");
  const resolved = path.resolve(projectRoot, candidate);
  const relative = path.relative(root, resolved);
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error("STG1_CLERK:LOCAL_FILE_MUST_BE_UNDER_IGNORED_STG1_DIRECTORY");
  }
  return resolved;
}

export function validateStg1PreviewUrl(value) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error("STG1_E07:INVALID_PREVIEW_URL");
  }
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    url.pathname !== "/" ||
    url.hostname !== STG1_CLERK.allowedPreviewHost
  ) {
    throw new Error("STG1_E07:PREVIEW_URL_NOT_ALLOWLISTED");
  }
  return url.toString().replace(/\/$/u, "");
}

export function makeEmptyAccountMap() {
  return {
    manifestVersion: STG1_CLERK.manifestVersion,
    fixtureVersion: STG1_CLERK.fixtureVersion,
    deploymentName: STG1_CLERK.deploymentName,
    dataClassification: "synthetic-non-pii",
    provider: "clerk-development",
    accounts: {},
  };
}

export function validateAccountMap(value, { allowPartial = false } = {}) {
  if (
    value?.manifestVersion !== STG1_CLERK.manifestVersion ||
    value?.fixtureVersion !== STG1_CLERK.fixtureVersion ||
    value?.deploymentName !== STG1_CLERK.deploymentName ||
    value?.dataClassification !== "synthetic-non-pii" ||
    value?.provider !== "clerk-development" ||
    !value.accounts ||
    typeof value.accounts !== "object" ||
    Array.isArray(value.accounts)
  ) {
    throw new Error("STG1_CLERK:ACCOUNT_MAP_HEADER_INVALID");
  }

  const keys = Object.keys(value.accounts).sort();
  const allowed = [...STG1_CLERK.aliases].sort();
  if (
    keys.some((key) => !allowed.includes(key)) ||
    (!allowPartial && JSON.stringify(keys) !== JSON.stringify(allowed))
  ) {
    throw new Error("STG1_CLERK:ACCOUNT_MAP_ALIASES_INVALID");
  }

  const ids = [];
  for (const alias of keys) {
    const row = value.accounts[alias];
    if (
      !row ||
      typeof row !== "object" ||
      !USER_ID_PATTERN.test(row.providerId) ||
      row.email !== expectedStg1Email(alias) ||
      row.externalId !== expectedStg1ExternalId(alias)
    ) {
      throw new Error("STG1_CLERK:ACCOUNT_MAP_ROW_INVALID");
    }
    ids.push(row.providerId);
  }
  if (new Set(ids).size !== ids.length) {
    throw new Error("STG1_CLERK:ACCOUNT_MAP_PROVIDER_ID_DUPLICATE");
  }
  return value;
}

export function identityMapFromAccountMap(accountMap) {
  validateAccountMap(accountMap);
  return {
    manifestVersion: STG1_CLERK.manifestVersion,
    fixtureVersion: STG1_CLERK.fixtureVersion,
    deploymentName: STG1_CLERK.deploymentName,
    identities: Object.fromEntries(
      STG1_CLERK.aliases.map((alias) => [
        alias,
        accountMap.accounts[alias].providerId,
      ]),
    ),
  };
}

function primaryEmail(user) {
  const addresses = Array.isArray(user?.email_addresses)
    ? user.email_addresses
    : [];
  const primary = addresses.find(
    (address) => address?.id === user?.primary_email_address_id,
  );
  return primary?.email_address ?? addresses[0]?.email_address ?? null;
}

export function accountMatchesAlias(user, alias) {
  const marker = user?.private_metadata?.stg1;
  return (
    USER_ID_PATTERN.test(user?.id ?? "") &&
    user?.external_id === expectedStg1ExternalId(alias) &&
    primaryEmail(user) === expectedStg1Email(alias) &&
    marker?.deploymentName === STG1_CLERK.deploymentName &&
    marker?.fixtureVersion === STG1_CLERK.fixtureVersion &&
    marker?.alias === alias
  );
}

export function classifyUsers(users) {
  const matches = {};
  const collisions = [];
  for (const alias of STG1_CLERK.aliases) {
    const expectedEmail = expectedStg1Email(alias);
    const expectedExternalId = expectedStg1ExternalId(alias);
    const candidates = users.filter(
      (user) =>
        user?.external_id === expectedExternalId ||
        primaryEmail(user) === expectedEmail,
    );
    if (candidates.length === 1 && accountMatchesAlias(candidates[0], alias)) {
      matches[alias] = candidates[0];
    } else if (candidates.length > 0) {
      collisions.push(alias);
    }
  }
  return {
    matches,
    collisionCount: collisions.length,
    matchedCount: Object.keys(matches).length,
    nonFixtureCount: Math.max(0, users.length - Object.keys(matches).length),
  };
}

function sanitizeClerkCodes(payload) {
  const codes = Array.isArray(payload?.errors)
    ? payload.errors
        .map((entry) => entry?.code)
        .filter((code) => typeof code === "string")
        .slice(0, 5)
    : [];
  return codes.length > 0 ? codes.join(",") : "UNSPECIFIED";
}

export async function clerkApiRequest({
  secretKey,
  pathname,
  method = "GET",
  body,
  fetchImpl = fetch,
}) {
  if (!secretKey?.startsWith("sk_test_")) {
    throw new Error("STG1_CLERK:DEVELOPMENT_SECRET_KEY_REQUIRED");
  }
  if (typeof pathname !== "string" || !pathname.startsWith("/")) {
    throw new Error("STG1_CLERK:INVALID_API_PATH");
  }
  let response;
  try {
    response = await fetchImpl(`${STG1_CLERK.apiBaseUrl}${pathname}`, {
      method,
      headers: {
        Authorization: `Bearer ${secretKey}`,
        Accept: "application/json",
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
  } catch {
    throw new Error("STG1_CLERK:NETWORK_ERROR");
  }

  let payload;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }
  if (!response.ok) {
    throw new Error(
      `STG1_CLERK:API_ERROR:${response.status}:${sanitizeClerkCodes(payload)}`,
    );
  }
  return payload;
}

export async function listAllClerkUsers(secretKey, fetchImpl = fetch) {
  const users = [];
  const pageSize = 500;
  for (let offset = 0; ; offset += pageSize) {
    const page = await clerkApiRequest({
      secretKey,
      pathname: `/users?limit=${pageSize}&offset=${offset}`,
      fetchImpl,
    });
    if (!Array.isArray(page)) {
      throw new Error("STG1_CLERK:USERS_RESPONSE_INVALID");
    }
    users.push(...page);
    if (page.length < pageSize) break;
  }
  return users;
}

export function createUserPayload(alias) {
  return {
    email_address: [expectedStg1Email(alias)],
    email_address_identification_status: ["reserved"],
    external_id: expectedStg1ExternalId(alias),
    private_metadata: expectedStg1PrivateMetadata(alias),
    skip_password_requirement: true,
  };
}

export async function createClerkUser(secretKey, alias, fetchImpl = fetch) {
  const user = await clerkApiRequest({
    secretKey,
    pathname: "/users",
    method: "POST",
    body: createUserPayload(alias),
    fetchImpl,
  });
  if (!accountMatchesAlias(user, alias)) {
    throw new Error("STG1_CLERK:CREATE_READBACK_MISMATCH");
  }
  return user;
}

export async function getClerkUser(secretKey, providerId, fetchImpl = fetch) {
  if (!USER_ID_PATTERN.test(providerId)) {
    throw new Error("STG1_CLERK:PROVIDER_ID_INVALID");
  }
  return await clerkApiRequest({
    secretKey,
    pathname: `/users/${encodeURIComponent(providerId)}`,
    fetchImpl,
  });
}

export async function setClerkUserBanned({
  secretKey,
  providerId,
  banned,
  fetchImpl = fetch,
}) {
  const user = await clerkApiRequest({
    secretKey,
    pathname: `/users/${encodeURIComponent(providerId)}/${banned ? "ban" : "unban"}`,
    method: "POST",
    fetchImpl,
  });
  if (user?.banned !== banned) {
    throw new Error("STG1_CLERK:BAN_STATE_READBACK_MISMATCH");
  }
  return user;
}

export async function createShortLivedSignInToken(
  secretKey,
  providerId,
  fetchImpl = fetch,
) {
  if (!USER_ID_PATTERN.test(providerId)) {
    throw new Error("STG1_CLERK:PROVIDER_ID_INVALID");
  }
  const result = await clerkApiRequest({
    secretKey,
    pathname: "/sign_in_tokens",
    method: "POST",
    body: { user_id: providerId, expires_in_seconds: 120 },
    fetchImpl,
  });
  if (
    typeof result?.token !== "string" ||
    typeof result?.id !== "string" ||
    result?.user_id !== providerId
  ) {
    throw new Error("STG1_CLERK:SIGN_IN_TOKEN_RESPONSE_INVALID");
  }
  return result.token;
}
