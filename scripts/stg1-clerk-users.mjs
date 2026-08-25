/**
 * Exact-account lifecycle runner for the seven synthetic STG-1 Clerk users.
 *
 * The runner accepts Development keys only, never prints provider IDs, email
 * addresses, tokens or secrets, and never implements account deletion.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseDotEnvForTargetGuard } from "./lib/stg1-target-guard.mjs";
import {
  STG1_CLERK,
  accountMatchesAlias,
  assertDevelopmentClerkKeys,
  classifyUsers,
  createClerkUser,
  expectedStg1Email,
  expectedStg1ExternalId,
  getClerkUser,
  identityMapFromAccountMap,
  listAllClerkUsers,
  makeEmptyAccountMap,
  setClerkUserBanned,
  validateAccountMap,
  validateLocalStg1Path,
} from "./lib/stg1-clerk-plan.mjs";

const moduleDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(moduleDir, "..");
const argv = process.argv.slice(2);

function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}

function valueAfter(flag) {
  const at = argv.indexOf(flag);
  if (at >= 0) return argv[at + 1];
  const inline = argv.find((value) => value.startsWith(`${flag}=`));
  return inline?.slice(flag.length + 1);
}

function writeJsonAtomic(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const temporary = `${filePath}.tmp`;
  fs.writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, {
    encoding: "utf8",
    mode: 0o600,
  });
  fs.renameSync(temporary, filePath);
}

function readJsonIfPresent(filePath) {
  return fs.existsSync(filePath)
    ? JSON.parse(fs.readFileSync(filePath, "utf8"))
    : null;
}

function printSafe(value) {
  const serialized = JSON.stringify(value, null, 2);
  if (
    /sk_(?:test|live)_/u.test(serialized) ||
    /pk_(?:test|live)_/u.test(serialized) ||
    /user_[A-Za-z0-9]+/u.test(serialized) ||
    /@/u.test(serialized)
  ) {
    fail("STG1_CLERK:SAFE_OUTPUT_GUARD_REJECTED_RESULT");
  }
  process.stdout.write(`${serialized}\n`);
}

if (argv.includes("--prod") || argv.includes("--production")) {
  fail("STG1_CLERK:PRODUCTION_FORBIDDEN");
}
if (argv.some((value) => /delete/iu.test(value))) {
  fail("STG1_CLERK:ACCOUNT_DELETION_NOT_IMPLEMENTED");
}

const modes = ["inspect", "create", "ban", "unban", "verify"].filter((mode) =>
  argv.includes(`--${mode}`),
);
if (modes.length !== 1) {
  fail("STG1_CLERK:CHOOSE_EXACTLY_ONE_MODE");
}
const mode = modes[0];

const envInput = valueAfter("--env-file");
if (!envInput) fail("STG1_CLERK:ENV_FILE_REQUIRED");
const envFile = path.resolve(projectRoot, envInput);
const envValues = parseDotEnvForTargetGuard(fs.readFileSync(envFile, "utf8"));
const { secretKey } = assertDevelopmentClerkKeys(envValues);

const accountMapPath = validateLocalStg1Path(
  projectRoot,
  valueAfter("--account-map") ?? ".stg1/clerk-accounts.local.json",
);
const partialMapPath = validateLocalStg1Path(
  projectRoot,
  valueAfter("--partial-map") ?? ".stg1/clerk-accounts.partial.local.json",
);
const identityMapPath = validateLocalStg1Path(
  projectRoot,
  valueAfter("--identity-map") ?? ".stg1/identities.local.json",
);

const users = await listAllClerkUsers(secretKey);
const classification = classifyUsers(users);
if (classification.collisionCount > 0) {
  fail("STG1_CLERK:EXACT_IDENTITY_COLLISION");
}

if (mode === "inspect") {
  printSafe({
    mode,
    deploymentName: STG1_CLERK.deploymentName,
    fixtureVersion: STG1_CLERK.fixtureVersion,
    clerkEnvironment: "development",
    totalUsers: users.length,
    fixtureAccounts: classification.matchedCount,
    nonFixtureAccounts: classification.nonFixtureCount,
    collisions: classification.collisionCount,
    providerIdsReturned: false,
    personalDataReturned: false,
    writes: 0,
  });
  process.exit(0);
}

if (mode === "create") {
  if (valueAfter("--confirm") !== STG1_CLERK.createConfirmation) {
    fail(`STG1_CLERK:CREATE_CONFIRMATION_REQUIRED:${STG1_CLERK.createConfirmation}`);
  }
  if (fs.existsSync(accountMapPath) || fs.existsSync(identityMapPath)) {
    fail("STG1_CLERK:COMPLETE_BINDING_ALREADY_EXISTS");
  }

  const partial = readJsonIfPresent(partialMapPath) ?? makeEmptyAccountMap();
  validateAccountMap(partial, { allowPartial: true });
  for (const [alias, local] of Object.entries(partial.accounts)) {
    const live = classification.matches[alias];
    if (!live || live.id !== local.providerId || !accountMatchesAlias(live, alias)) {
      fail("STG1_CLERK:PARTIAL_BINDING_LIVE_READBACK_FAILED");
    }
  }
  for (const [alias, user] of Object.entries(classification.matches)) {
    const local = partial.accounts[alias];
    if (!local || local.providerId !== user.id || !accountMatchesAlias(user, alias)) {
      fail("STG1_CLERK:UNOWNED_EXISTING_FIXTURE_ACCOUNT");
    }
  }

  let created = 0;
  for (const alias of STG1_CLERK.aliases) {
    if (partial.accounts[alias]) continue;
    const user = await createClerkUser(secretKey, alias);
    partial.accounts[alias] = {
      providerId: user.id,
      email: expectedStg1Email(alias),
      externalId: expectedStg1ExternalId(alias),
    };
    writeJsonAtomic(partialMapPath, partial);
    created += 1;
  }

  validateAccountMap(partial);
  writeJsonAtomic(accountMapPath, partial);
  writeJsonAtomic(identityMapPath, identityMapFromAccountMap(partial));
  fs.unlinkSync(partialMapPath);
  printSafe({
    mode,
    deploymentName: STG1_CLERK.deploymentName,
    fixtureVersion: STG1_CLERK.fixtureVersion,
    clerkEnvironment: "development",
    created,
    totalFixtureAccounts: STG1_CLERK.aliases.length,
    bindingFilesWritten: 2,
    credentialsStored: false,
    providerIdsReturned: false,
    personalDataReturned: false,
    deletionImplemented: false,
  });
  process.exit(0);
}

const accountMap = validateAccountMap(
  JSON.parse(fs.readFileSync(accountMapPath, "utf8")),
);

if (mode === "ban" || mode === "unban") {
  const expectedConfirmation =
    mode === "ban"
      ? STG1_CLERK.banConfirmation
      : STG1_CLERK.unbanConfirmation;
  if (valueAfter("--confirm") !== expectedConfirmation) {
    fail(`STG1_CLERK:${mode.toUpperCase()}_CONFIRMATION_REQUIRED:${expectedConfirmation}`);
  }
  const desiredBanned = mode === "ban";
  let changed = 0;
  let unchanged = 0;
  for (const alias of STG1_CLERK.aliases) {
    const row = accountMap.accounts[alias];
    let user = await getClerkUser(secretKey, row.providerId);
    if (!accountMatchesAlias(user, alias)) {
      fail("STG1_CLERK:ACCOUNT_OWNERSHIP_READBACK_FAILED");
    }
    if (user.banned === desiredBanned) {
      unchanged += 1;
      continue;
    }
    user = await setClerkUserBanned({
      secretKey,
      providerId: row.providerId,
      banned: desiredBanned,
    });
    if (!accountMatchesAlias(user, alias)) {
      fail("STG1_CLERK:ACCOUNT_OWNERSHIP_CHANGED_DURING_BAN_OPERATION");
    }
    changed += 1;
  }
  printSafe({
    mode,
    deploymentName: STG1_CLERK.deploymentName,
    fixtureVersion: STG1_CLERK.fixtureVersion,
    clerkEnvironment: "development",
    accountsChecked: STG1_CLERK.aliases.length,
    changed,
    unchanged,
    finalState: desiredBanned ? "banned" : "active",
    providerIdsReturned: false,
    personalDataReturned: false,
    deletes: 0,
  });
  process.exit(0);
}

let banned = 0;
let active = 0;
for (const alias of STG1_CLERK.aliases) {
  const row = accountMap.accounts[alias];
  const user = await getClerkUser(secretKey, row.providerId);
  if (!accountMatchesAlias(user, alias)) {
    fail("STG1_CLERK:ACCOUNT_OWNERSHIP_READBACK_FAILED");
  }
  if (user.banned) banned += 1;
  else active += 1;
}
printSafe({
  mode,
  deploymentName: STG1_CLERK.deploymentName,
  fixtureVersion: STG1_CLERK.fixtureVersion,
  clerkEnvironment: "development",
  accountsChecked: STG1_CLERK.aliases.length,
  active,
  banned,
  nonFixtureAccountsUnchanged: classification.nonFixtureCount,
  providerIdsReturned: false,
  personalDataReturned: false,
  writes: 0,
});
