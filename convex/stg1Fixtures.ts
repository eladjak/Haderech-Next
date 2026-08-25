/**
 * Internal-only synthetic fixtures for the isolated STG-1 rehearsal.
 *
 * Writes require three deployment-scoped environment predicates, an exact
 * literal confirmation and a fresh plan hash. The public application never
 * references this module. No real names, email addresses or user content are
 * stored by these fixtures.
 */

import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { internalMutation, internalQuery } from "./_generated/server";
import { flattenLessons, SEED_COURSES } from "./seedCourseData";
import {
  STG1_ACCESS_EXPECTATIONS,
  STG1_AUTHENTICATED_ALIASES,
  STG1_CANONICAL_COURSE_TITLE,
  STG1_DEPLOYMENT_NAME,
  STG1_FIXTURE_CONFIRMATION,
  STG1_FIXTURE_VERSION,
  STG1_RECEIVING_PRACTICE_SCRIPT_INDEX,
  expectedStg1IdentityEmail,
  expectedStg1IdentityName,
  planStg1LegacyCourseBaseline,
  validateStg1FixtureWrite,
  validateStg1IdentityMap,
  type Stg1AuthenticatedAlias,
  type Stg1IdentityMap,
} from "./lib/stg1FixturePlan";
import {
  sha256Stable,
  stableStringify,
} from "./lib/receivingPracticeMigrationPlan";

type ReadCtx = QueryCtx | MutationCtx;

const identityMapValidator = v.object({
  U0: v.string(),
  A: v.string(),
  B: v.string(),
  E: v.string(),
  X: v.string(),
  ADMIN: v.string(),
  IMPOSTOR: v.string(),
});

const writeConfirmationValidator = v.literal(STG1_FIXTURE_CONFIRMATION);

export function assertStg1FixtureWrite(confirmation: string): void {
  const conflicts = validateStg1FixtureWrite({
    seedEnabled: process.env.SEED_ENABLED,
    fixtureEnabled: process.env.STG1_FIXTURES_ENABLED,
    deploymentName: process.env.STG1_DEPLOYMENT_NAME,
    confirmation,
  });
  if (conflicts.length > 0) {
    throw new Error(`STG1_FIXTURE_GUARD:${conflicts.join(",")}`);
  }
}

function canonicalSeedCourse() {
  const matches = SEED_COURSES.filter(
    (course) => course.title === STG1_CANONICAL_COURSE_TITLE,
  );
  if (matches.length !== 1) {
    throw new Error(`STG1_FIXTURE_SOURCE:COURSE_COUNT:${matches.length}`);
  }
  return matches[0];
}

function legacySourcePlan() {
  const plan = planStg1LegacyCourseBaseline(
    flattenLessons(canonicalSeedCourse()),
  );
  if (plan.status !== "ready") {
    throw new Error(`STG1_FIXTURE_SOURCE:${plan.conflicts.join(",")}`);
  }
  return plan;
}

function expectedCourseSemantic() {
  const course = canonicalSeedCourse();
  return {
    title: course.title,
    description: course.description,
    imageUrl: undefined,
    category: course.category,
    level: course.level,
    estimatedHours: course.estimatedHours,
    published: course.published,
    order: course.order,
  };
}

function storedCourseSemantic(course: Doc<"courses">) {
  return {
    title: course.title,
    description: course.description,
    imageUrl: course.imageUrl,
    category: course.category,
    level: course.level,
    estimatedHours: course.estimatedHours,
    published: course.published,
    order: course.order,
  };
}

function expectedLessonSemantic(
  lesson: ReturnType<typeof legacySourcePlan>["lessons"][number],
) {
  return {
    title: lesson.title,
    description: lesson.description,
    content: undefined,
    videoUrl: undefined,
    duration: lesson.duration,
    order: lesson.order,
    published: canonicalSeedCourse().published,
    weekNumber: lesson.weekNumber,
    phaseNumber: lesson.phaseNumber,
    phaseName: lesson.phaseName,
    scriptIndex: lesson.scriptIndex,
    contentKey: lesson.contentKey,
    learnerAvailability: lesson.learnerAvailability ?? "required",
    completionAffectsProgress: lesson.completionAffectsProgress ?? true,
    assessmentOrScoring: lesson.assessmentOrScoring,
    personalDisclosureRequired: lesson.personalDisclosureRequired ?? false,
    relationshipOrPartnerRequired:
      lesson.relationshipOrPartnerRequired ?? false,
    learnerAlternatives: lesson.learnerAlternatives,
    pdfUrl: lesson.pdfUrl,
  };
}

function storedLessonSemantic(lesson: Doc<"lessons">) {
  return {
    title: lesson.title,
    description: lesson.description,
    content: lesson.content,
    videoUrl: lesson.videoUrl,
    duration: lesson.duration,
    order: lesson.order,
    published: lesson.published,
    weekNumber: lesson.weekNumber,
    phaseNumber: lesson.phaseNumber,
    phaseName: lesson.phaseName,
    scriptIndex: lesson.scriptIndex,
    contentKey: lesson.contentKey,
    learnerAvailability: lesson.learnerAvailability,
    completionAffectsProgress: lesson.completionAffectsProgress,
    assessmentOrScoring: lesson.assessmentOrScoring,
    personalDisclosureRequired: lesson.personalDisclosureRequired,
    relationshipOrPartnerRequired: lesson.relationshipOrPartnerRequired,
    learnerAlternatives: lesson.learnerAlternatives,
    pdfUrl: lesson.pdfUrl,
  };
}

async function inspectLegacyCourseBaseline(ctx: ReadCtx) {
  const sourcePlan = legacySourcePlan();
  const expectedCourse = expectedCourseSemantic();
  const expectedLessons = sourcePlan.lessons.map(expectedLessonSemantic);
  const sourceDigest = await sha256Stable({
    fixtureVersion: STG1_FIXTURE_VERSION,
    course: expectedCourse,
    lessons: expectedLessons,
  });
  const [courses, allLessons, migrationMarkers] = await Promise.all([
    ctx.db.query("courses").collect(),
    ctx.db.query("lessons").collect(),
    ctx.db.query("courseContentMigrations").collect(),
  ]);
  const canonicalCourses = courses.filter(
    (course) => course.title === STG1_CANONICAL_COURSE_TITLE,
  );
  const conflicts: string[] = [];
  let status: "ready" | "already_seeded" | "conflict" = "conflict";
  let writes = 0;
  let semanticMatch = false;
  let courseId: Id<"courses"> | undefined;

  if (
    courses.length === 0 &&
    allLessons.length === 0 &&
    migrationMarkers.length === 0
  ) {
    status = "ready";
    writes = 76;
  } else {
    if (courses.length !== 1) conflicts.push(`TOTAL_COURSE_COUNT:${courses.length}`);
    if (canonicalCourses.length !== 1) {
      conflicts.push(`CANONICAL_COURSE_COUNT:${canonicalCourses.length}`);
    }
    if (migrationMarkers.length !== 0) {
      conflicts.push(`MIGRATION_MARKER_COUNT:${migrationMarkers.length}`);
    }
    const course = canonicalCourses[0];
    if (course) {
      courseId = course._id;
      const courseLessons = allLessons
        .filter((lesson) => lesson.courseId === course._id)
        .sort((left, right) => left.order - right.order);
      if (allLessons.length !== courseLessons.length) {
        conflicts.push(
          `LESSONS_OUTSIDE_CANONICAL_COURSE:${allLessons.length - courseLessons.length}`,
        );
      }
      if (courseLessons.length !== 75) {
        conflicts.push(`LEGACY_LESSON_COUNT:${courseLessons.length}`);
      }
      if (
        courseLessons.some(
          (lesson) =>
            lesson.scriptIndex === STG1_RECEIVING_PRACTICE_SCRIPT_INDEX,
        )
      ) {
        conflicts.push("OPTIONAL_TARGET_ALREADY_PRESENT");
      }
      semanticMatch =
        stableStringify(storedCourseSemantic(course)) ===
          stableStringify(expectedCourse) &&
        stableStringify(courseLessons.map(storedLessonSemantic)) ===
          stableStringify(expectedLessons);
      if (!semanticMatch) conflicts.push("LEGACY_BASELINE_SEMANTIC_DRIFT");
    }
    if (conflicts.length === 0 && semanticMatch) status = "already_seeded";
  }

  const currentStateHash = await sha256Stable({
    courseIds: courses.map((course) => String(course._id)).sort(),
    courseSemantics: courses.map(storedCourseSemantic),
    lessonIds: allLessons.map((lesson) => String(lesson._id)).sort(),
    lessonSemantics: allLessons.map(storedLessonSemantic),
    migrationMarkers: migrationMarkers.map((marker) => ({
      id: String(marker._id),
      key: marker.migrationKey,
      version: marker.migrationVersion,
      state: marker.state,
    })),
  });
  const planHash = await sha256Stable({
    operation: "stg1-seed-legacy-course",
    deploymentName: STG1_DEPLOYMENT_NAME,
    fixtureVersion: STG1_FIXTURE_VERSION,
    sourceDigest,
    currentStateHash,
    status,
    writes,
  });
  return {
    status,
    conflicts,
    deploymentName: STG1_DEPLOYMENT_NAME,
    fixtureVersion: STG1_FIXTURE_VERSION,
    backendInspected: true,
    sourceDigest,
    currentStateHash,
    planHash,
    courseId: courseId ?? null,
    counts: {
      courses: courses.length,
      canonicalCourses: canonicalCourses.length,
      lessons: allLessons.length,
      migrationMarkers: migrationMarkers.length,
    },
    expectedPostCounts: {
      courses: 1,
      requiredLessons: 75,
      optionalLessons: 0,
      migrationMarkers: 0,
    },
    writes,
  };
}

function asIdentityMap(input: Stg1IdentityMap): Stg1IdentityMap {
  const conflicts = validateStg1IdentityMap(input);
  if (conflicts.length > 0) {
    throw new Error(`STG1_IDENTITY_MAP:${conflicts.join(",")}`);
  }
  return input;
}

function expectedIdentitySemantic(
  alias: Stg1AuthenticatedAlias,
  clerkId: string,
) {
  return {
    clerkId,
    email: expectedStg1IdentityEmail(alias),
    name: expectedStg1IdentityName(alias),
    imageUrl: undefined,
  };
}

function identityOwnershipMatches(
  alias: Stg1AuthenticatedAlias,
  clerkId: string,
  user: Doc<"users">,
): boolean {
  return (
    stableStringify({
      clerkId: user.clerkId,
      email: user.email,
      name: user.name,
      imageUrl: user.imageUrl,
    }) === stableStringify(expectedIdentitySemantic(alias, clerkId)) &&
    (alias === "ADMIN" || user.role === "student")
  );
}

async function loadIdentityContext(ctx: ReadCtx, identities: Stg1IdentityMap) {
  const identityMap = asIdentityMap(identities);
  const users = await ctx.db.query("users").collect();
  const byClerkId = new Map(users.map((user) => [user.clerkId, user]));
  const mapped = new Map<Stg1AuthenticatedAlias, Doc<"users">>();
  const conflicts: string[] = [];
  for (const alias of STG1_AUTHENTICATED_ALIASES) {
    const user = byClerkId.get(identityMap[alias]);
    if (!user) {
      conflicts.push(`IDENTITY_ROW_MISSING:${alias}`);
      continue;
    }
    if (!identityOwnershipMatches(alias, identityMap[alias], user)) {
      conflicts.push(`IDENTITY_ROW_DRIFT:${alias}`);
      continue;
    }
    mapped.set(alias, user);
  }
  if (users.length !== STG1_AUTHENTICATED_ALIASES.length) {
    conflicts.push(`TOTAL_USER_COUNT:${users.length}`);
  }
  return { identityMap, users, mapped, conflicts };
}

async function inspectIdentityRows(ctx: ReadCtx, identities: Stg1IdentityMap) {
  const identityMap = asIdentityMap(identities);
  const users = await ctx.db.query("users").collect();
  const byClerkId = new Map(users.map((user) => [user.clerkId, user]));
  const conflicts: string[] = [];
  const aliases = STG1_AUTHENTICATED_ALIASES.map((alias) => {
    const user = byClerkId.get(identityMap[alias]);
    const exact = user
      ? identityOwnershipMatches(alias, identityMap[alias], user)
      : false;
    if (user && !exact) conflicts.push(`IDENTITY_ROW_DRIFT:${alias}`);
    return { alias, present: user !== undefined, exact, role: user?.role ?? null };
  });
  const present = aliases.filter((row) => row.present).length;
  let status: "ready" | "already_seeded" | "conflict" = "conflict";
  let writes = 0;
  if (users.length === 0) {
    status = "ready";
    writes = STG1_AUTHENTICATED_ALIASES.length;
  } else {
    if (users.length !== STG1_AUTHENTICATED_ALIASES.length) {
      conflicts.push(`TOTAL_USER_COUNT:${users.length}`);
    }
    if (present !== STG1_AUTHENTICATED_ALIASES.length) {
      conflicts.push(`MAPPED_USER_COUNT:${present}`);
    }
    if (conflicts.length === 0 && aliases.every((row) => row.exact)) {
      status = "already_seeded";
    }
  }
  const sourceDigest = await sha256Stable(
    STG1_AUTHENTICATED_ALIASES.map((alias) => ({
      alias,
      email: expectedStg1IdentityEmail(alias),
      name: expectedStg1IdentityName(alias),
      initialRole: "student",
    })),
  );
  const currentStateHash = await sha256Stable({
    identityMap,
    users: users.map((user) => ({
      id: String(user._id),
      clerkId: user.clerkId,
      email: user.email,
      name: user.name,
      imageUrl: user.imageUrl,
      role: user.role,
    })),
  });
  const planHash = await sha256Stable({
    operation: "stg1-seed-identities",
    deploymentName: STG1_DEPLOYMENT_NAME,
    fixtureVersion: STG1_FIXTURE_VERSION,
    sourceDigest,
    currentStateHash,
    status,
    writes,
  });
  return {
    status,
    conflicts,
    deploymentName: STG1_DEPLOYMENT_NAME,
    fixtureVersion: STG1_FIXTURE_VERSION,
    backendInspected: true,
    sourceDigest,
    currentStateHash,
    planHash,
    aliases,
    counts: { users: users.length, mapped: present },
    expectedPostCounts: {
      users: 7,
      adminsBeforeAccessGrant: 0,
    },
    providerIdsIncludedInResult: false,
    personalDataIncludedInResult: false,
    writes,
  };
}

type ExpectedAccessRow =
  | {
      alias: "A" | "B";
      kind: "community";
      userId: Id<"users">;
      accessBasis: "book" | "guidance";
      status: "active";
      source: "admin_grant";
      sourceReference: string;
      grantedBy: Id<"users">;
      validUntil: undefined;
      revokedAt: undefined;
    }
  | {
      alias: "E" | "X";
      kind: "course";
      userId: Id<"users">;
      courseId: Id<"courses">;
      status: "active" | "expired";
      source: "admin_grant";
      sourceReference: string;
      grantedBy: Id<"users">;
      validUntil: number | undefined;
      revokedAt: undefined;
    };

export async function loadAccessContext(
  ctx: ReadCtx,
  identities: Stg1IdentityMap,
) {
  const identity = await loadIdentityContext(ctx, identities);
  const courses = await ctx.db.query("courses").collect();
  const canonicalCourses = courses.filter(
    (course) => course.title === STG1_CANONICAL_COURSE_TITLE,
  );
  const conflicts = [...identity.conflicts];
  if (courses.length !== 1) conflicts.push(`TOTAL_COURSE_COUNT:${courses.length}`);
  if (canonicalCourses.length !== 1) {
    conflicts.push(`CANONICAL_COURSE_COUNT:${canonicalCourses.length}`);
  }
  const course = canonicalCourses[0];
  const admin = identity.mapped.get("ADMIN");
  const expected: ExpectedAccessRow[] = [];
  if (course && admin) {
    const a = identity.mapped.get("A");
    const b = identity.mapped.get("B");
    const e = identity.mapped.get("E");
    const x = identity.mapped.get("X");
    if (a) {
      expected.push({
        alias: "A",
        kind: "community",
        userId: a._id,
        accessBasis: STG1_ACCESS_EXPECTATIONS.A.accessBasis,
        status: "active",
        source: "admin_grant",
        sourceReference: STG1_ACCESS_EXPECTATIONS.A.sourceReference,
        grantedBy: admin._id,
        validUntil: undefined,
        revokedAt: undefined,
      });
    }
    if (b) {
      expected.push({
        alias: "B",
        kind: "community",
        userId: b._id,
        accessBasis: STG1_ACCESS_EXPECTATIONS.B.accessBasis,
        status: "active",
        source: "admin_grant",
        sourceReference: STG1_ACCESS_EXPECTATIONS.B.sourceReference,
        grantedBy: admin._id,
        validUntil: undefined,
        revokedAt: undefined,
      });
    }
    if (e) {
      expected.push({
        alias: "E",
        kind: "course",
        userId: e._id,
        courseId: course._id,
        status: "active",
        source: "admin_grant",
        sourceReference: STG1_ACCESS_EXPECTATIONS.E.sourceReference,
        grantedBy: admin._id,
        validUntil: undefined,
        revokedAt: undefined,
      });
    }
    if (x) {
      expected.push({
        alias: "X",
        kind: "course",
        userId: x._id,
        courseId: course._id,
        status: "expired",
        source: "admin_grant",
        sourceReference: STG1_ACCESS_EXPECTATIONS.X.sourceReference,
        grantedBy: admin._id,
        validUntil: STG1_ACCESS_EXPECTATIONS.X.validUntil,
        revokedAt: undefined,
      });
    }
  }

  const [communityRows, courseRows] = await Promise.all([
    ctx.db.query("communityEntitlements").collect(),
    ctx.db.query("courseEntitlements").collect(),
  ]);
  const byReference = new Map<
    string,
    | { kind: "community"; row: Doc<"communityEntitlements"> }
    | { kind: "course"; row: Doc<"courseEntitlements"> }
  >();
  for (const row of communityRows) {
    if (!row.sourceReference) {
      conflicts.push("COMMUNITY_ENTITLEMENT_WITHOUT_SOURCE_REFERENCE");
      continue;
    }
    if (byReference.has(row.sourceReference)) {
      conflicts.push(`DUPLICATE_SOURCE_REFERENCE:${row.sourceReference}`);
      continue;
    }
    byReference.set(row.sourceReference, { kind: "community", row });
  }
  for (const row of courseRows) {
    if (!row.sourceReference) {
      conflicts.push("COURSE_ENTITLEMENT_WITHOUT_SOURCE_REFERENCE");
      continue;
    }
    if (byReference.has(row.sourceReference)) {
      conflicts.push(`DUPLICATE_SOURCE_REFERENCE:${row.sourceReference}`);
      continue;
    }
    byReference.set(row.sourceReference, { kind: "course", row });
  }
  const expectedReferences = new Set(expected.map((row) => row.sourceReference));
  for (const reference of byReference.keys()) {
    if (!expectedReferences.has(reference)) {
      conflicts.push("NON_FIXTURE_ENTITLEMENT_PRESENT");
    }
  }

  const rows = expected.map((expectedRow) => {
    const existing = byReference.get(expectedRow.sourceReference);
    let ownershipExact = false;
    let valueExact = false;
    if (existing?.kind === expectedRow.kind) {
      if (expectedRow.kind === "community" && existing.kind === "community") {
        ownershipExact =
          existing.row.userId === expectedRow.userId &&
          existing.row.accessBasis === expectedRow.accessBasis &&
          existing.row.source === expectedRow.source &&
          existing.row.sourceReference === expectedRow.sourceReference &&
          existing.row.grantedBy === expectedRow.grantedBy;
        valueExact =
          ownershipExact &&
          existing.row.status === expectedRow.status &&
          existing.row.validUntil === expectedRow.validUntil &&
          existing.row.revokedAt === expectedRow.revokedAt;
      } else if (expectedRow.kind === "course" && existing.kind === "course") {
        ownershipExact =
          existing.row.userId === expectedRow.userId &&
          existing.row.courseId === expectedRow.courseId &&
          existing.row.source === expectedRow.source &&
          existing.row.sourceReference === expectedRow.sourceReference &&
          existing.row.grantedBy === expectedRow.grantedBy;
        valueExact =
          ownershipExact &&
          existing.row.status === expectedRow.status &&
          existing.row.validUntil === expectedRow.validUntil &&
          existing.row.revokedAt === expectedRow.revokedAt;
      }
    }
    if (existing && !ownershipExact) {
      conflicts.push(`ENTITLEMENT_OWNERSHIP_DRIFT:${expectedRow.alias}`);
    }
    return { expected: expectedRow, existing, ownershipExact, valueExact };
  });
  return {
    identity,
    course,
    admin,
    expected,
    rows,
    communityRows,
    courseRows,
    conflicts: [...new Set(conflicts)],
  };
}

export async function inspectAccessPlan(
  ctx: ReadCtx,
  identities: Stg1IdentityMap,
) {
  const context = await loadAccessContext(ctx, identities);
  const adminNeedsPromotion = context.admin?.role !== "admin";
  const writes =
    context.rows.filter((row) => !row.valueExact).length +
    (adminNeedsPromotion ? 1 : 0);
  const status =
    context.conflicts.length > 0
      ? ("conflict" as const)
      : writes === 0
        ? ("already_applied" as const)
        : ("ready" as const);
  const currentStateHash = await sha256Stable({
    identityMap: context.identity.identityMap,
    adminRole: context.admin?.role ?? null,
    courseId: context.course ? String(context.course._id) : null,
    communityRows: context.communityRows.map((row) => ({
      id: String(row._id),
      userId: String(row.userId),
      accessBasis: row.accessBasis,
      status: row.status,
      source: row.source,
      sourceReference: row.sourceReference,
      grantedBy: row.grantedBy ? String(row.grantedBy) : null,
      validUntil: row.validUntil,
      revokedAt: row.revokedAt,
    })),
    courseRows: context.courseRows.map((row) => ({
      id: String(row._id),
      userId: String(row.userId),
      courseId: String(row.courseId),
      status: row.status,
      source: row.source,
      sourceReference: row.sourceReference,
      grantedBy: row.grantedBy ? String(row.grantedBy) : null,
      validUntil: row.validUntil,
      revokedAt: row.revokedAt,
    })),
  });
  const planHash = await sha256Stable({
    operation: "stg1-apply-access",
    deploymentName: STG1_DEPLOYMENT_NAME,
    fixtureVersion: STG1_FIXTURE_VERSION,
    currentStateHash,
    status,
    writes,
  });
  return {
    status,
    conflicts: context.conflicts,
    deploymentName: STG1_DEPLOYMENT_NAME,
    fixtureVersion: STG1_FIXTURE_VERSION,
    backendInspected: true,
    currentStateHash,
    planHash,
    identities: context.rows.map((row) => ({
      alias: row.expected.alias,
      kind: row.expected.kind,
      present: row.existing !== undefined,
      ownershipExact: row.ownershipExact,
      expectedAccessActive: row.expected.status === "active",
      currentStatus: row.existing?.row.status ?? null,
      valueExact: row.valueExact,
    })),
    expectedPostCounts: {
      admins: 1,
      communityEntitlements: 2,
      activeCommunityEntitlements: 2,
      courseEntitlements: 2,
      activeCourseEntitlements: 1,
      expiredCourseEntitlements: 1,
    },
    providerIdsIncludedInResult: false,
    personalDataIncludedInResult: false,
    writes,
  };
}

export async function inspectContainmentPlan(
  ctx: ReadCtx,
  identities: Stg1IdentityMap,
) {
  const context = await loadAccessContext(ctx, identities);
  const activeRows = context.rows.filter(
    (item) => item.existing?.row.status === "active" && item.ownershipExact,
  );
  const adminNeedsDemotion = context.admin?.role === "admin";
  const writes = activeRows.length + (adminNeedsDemotion ? 1 : 0);
  const status =
    context.conflicts.length > 0
      ? ("conflict" as const)
      : writes === 0
        ? ("already_contained" as const)
        : ("ready" as const);
  const currentStateHash = await sha256Stable({
    identityMap: context.identity.identityMap,
    adminRole: context.admin?.role ?? null,
    ownedRows: context.rows.map((item) => ({
      alias: item.expected.alias,
      id: item.existing ? String(item.existing.row._id) : null,
      status: item.existing?.row.status ?? null,
      validUntil: item.existing?.row.validUntil,
      revokedAt: item.existing?.row.revokedAt,
      ownershipExact: item.ownershipExact,
    })),
  });
  const planHash = await sha256Stable({
    operation: "stg1-contain-access",
    deploymentName: STG1_DEPLOYMENT_NAME,
    fixtureVersion: STG1_FIXTURE_VERSION,
    currentStateHash,
    status,
    writes,
  });
  return {
    status,
    conflicts: context.conflicts,
    deploymentName: STG1_DEPLOYMENT_NAME,
    fixtureVersion: STG1_FIXTURE_VERSION,
    backendInspected: true,
    currentStateHash,
    planHash,
    activeFixtureGrants: activeRows.length,
    adminRoleActive: context.admin?.role === "admin",
    expectedPostCounts: {
      activeFixtureGrants: 0,
      syntheticAdmins: 0,
      rowsRetainedForAudit: context.rows.filter((row) => row.existing).length,
      usersRetainedAsSyntheticNonPii: context.identity.users.length,
    },
    deletes: 0,
    providerIdsIncludedInResult: false,
    personalDataIncludedInResult: false,
    writes,
  };
}

export const inspectStg1FixtureState = internalQuery({
  args: {},
  handler: async (ctx) => {
    const [
      courses,
      lessons,
      markers,
      users,
      courseEntitlements,
      communityEntitlements,
      simulatorTrialUsage,
      communityTopics,
      communityReplies,
      communityReports,
      communityBlocks,
      communityModerationEvents,
      communityAppeals,
      payments,
      subscriptions,
    ] = await Promise.all([
      ctx.db.query("courses").collect(),
      ctx.db.query("lessons").collect(),
      ctx.db.query("courseContentMigrations").collect(),
      ctx.db.query("users").collect(),
      ctx.db.query("courseEntitlements").collect(),
      ctx.db.query("communityEntitlements").collect(),
      ctx.db.query("simulatorTrialUsage").collect(),
      ctx.db.query("communityTopics").collect(),
      ctx.db.query("communityReplies").collect(),
      ctx.db.query("communityReports").collect(),
      ctx.db.query("communityBlocks").collect(),
      ctx.db.query("communityModerationEvents").collect(),
      ctx.db.query("communityAppeals").collect(),
      ctx.db.query("payments").collect(),
      ctx.db.query("subscriptions").collect(),
    ]);
    return {
      deploymentName: STG1_DEPLOYMENT_NAME,
      fixtureVersion: STG1_FIXTURE_VERSION,
      backendInspected: true,
      counts: {
        courses: courses.length,
        canonicalCourses: courses.filter(
          (course) => course.title === STG1_CANONICAL_COURSE_TITLE,
        ).length,
        lessons: lessons.length,
        requiredLessons: lessons.filter(
          (lesson) => lesson.completionAffectsProgress !== false,
        ).length,
        optionalLessons: lessons.filter(
          (lesson) => lesson.completionAffectsProgress === false,
        ).length,
        migrationMarkers: markers.length,
        appliedMigrationMarkers: markers.filter(
          (marker) => marker.state === "applied",
        ).length,
        rolledBackMigrationMarkers: markers.filter(
          (marker) => marker.state === "rolled_back",
        ).length,
        users: users.length,
        admins: users.filter((user) => user.role === "admin").length,
        courseEntitlements: courseEntitlements.length,
        activeCourseEntitlements: courseEntitlements.filter(
          (row) => row.status === "active",
        ).length,
        revokedCourseEntitlements: courseEntitlements.filter(
          (row) => row.status === "revoked",
        ).length,
        communityEntitlements: communityEntitlements.length,
        activeCommunityEntitlements: communityEntitlements.filter(
          (row) => row.status === "active",
        ).length,
        revokedCommunityEntitlements: communityEntitlements.filter(
          (row) => row.status === "revoked",
        ).length,
        simulatorTrialUsage: simulatorTrialUsage.length,
        communityTopics: communityTopics.length,
        communityReplies: communityReplies.length,
        communityReports: communityReports.length,
        communityBlocks: communityBlocks.length,
        communityModerationEvents: communityModerationEvents.length,
        communityAppeals: communityAppeals.length,
        payments: payments.length,
        subscriptions: subscriptions.length,
      },
      contentIncludedInResult: false,
      personalDataIncludedInResult: false,
    };
  },
});

export const previewLegacyCourseBaseline = internalQuery({
  args: {},
  handler: async (ctx) => inspectLegacyCourseBaseline(ctx),
});

export const seedLegacyCourseBaseline = internalMutation({
  args: {
    confirmFixture: writeConfirmationValidator,
    confirmPlanHash: v.string(),
  },
  handler: async (ctx, args) => {
    assertStg1FixtureWrite(args.confirmFixture);
    const plan = await inspectLegacyCourseBaseline(ctx);
    if (args.confirmPlanHash !== plan.planHash) {
      throw new Error("STG1_LEGACY_COURSE:STALE_PLAN_HASH");
    }
    if (plan.status === "already_seeded") return plan;
    if (plan.status !== "ready") {
      throw new Error(
        `STG1_LEGACY_COURSE:PREVIEW_NOT_READY:${plan.conflicts.join(",")}`,
      );
    }

    const sourcePlan = legacySourcePlan();
    const now = Date.now();
    const courseId = await ctx.db.insert("courses", {
      ...expectedCourseSemantic(),
      createdAt: now,
      updatedAt: now,
    });
    for (const lesson of sourcePlan.lessons) {
      await ctx.db.insert("lessons", {
        courseId,
        ...expectedLessonSemantic(lesson),
        createdAt: now,
        updatedAt: now,
      });
    }
    const postcheck = await inspectLegacyCourseBaseline(ctx);
    if (postcheck.status !== "already_seeded") {
      throw new Error("STG1_LEGACY_COURSE:POSTCHECK_FAILED");
    }
    return {
      success: true,
      status: "seeded" as const,
      fixtureVersion: STG1_FIXTURE_VERSION,
      insertedCourses: 1,
      insertedRequiredLessons: 75,
      insertedOptionalLessons: 0,
      postcheck: {
        status: postcheck.status,
        counts: postcheck.counts,
      },
    };
  },
});

export const previewSyntheticIdentityRows = internalQuery({
  args: { identities: identityMapValidator },
  handler: async (ctx, args) =>
    inspectIdentityRows(ctx, args.identities as Stg1IdentityMap),
});

export const seedSyntheticIdentityRows = internalMutation({
  args: {
    identities: identityMapValidator,
    confirmFixture: writeConfirmationValidator,
    confirmPlanHash: v.string(),
  },
  handler: async (ctx, args) => {
    assertStg1FixtureWrite(args.confirmFixture);
    const identities = asIdentityMap(args.identities as Stg1IdentityMap);
    const plan = await inspectIdentityRows(ctx, identities);
    if (args.confirmPlanHash !== plan.planHash) {
      throw new Error("STG1_IDENTITIES:STALE_PLAN_HASH");
    }
    if (plan.status === "already_seeded") return plan;
    if (plan.status !== "ready") {
      throw new Error(
        `STG1_IDENTITIES:PREVIEW_NOT_READY:${plan.conflicts.join(",")}`,
      );
    }
    const now = Date.now();
    for (const alias of STG1_AUTHENTICATED_ALIASES) {
      await ctx.db.insert("users", {
        ...expectedIdentitySemantic(alias, identities[alias]),
        role: "student",
        createdAt: now,
        updatedAt: now,
      });
    }
    const postcheck = await inspectIdentityRows(ctx, identities);
    if (postcheck.status !== "already_seeded") {
      throw new Error("STG1_IDENTITIES:POSTCHECK_FAILED");
    }
    return {
      success: true,
      status: "seeded" as const,
      insertedUsers: 7,
      providerIdsIncludedInResult: false,
      personalDataIncludedInResult: false,
      postcheck: { status: postcheck.status, counts: postcheck.counts },
    };
  },
});

export const previewSyntheticAccessFixtures = internalQuery({
  args: { identities: identityMapValidator },
  handler: async (ctx, args) =>
    inspectAccessPlan(ctx, args.identities as Stg1IdentityMap),
});

export const previewSyntheticAccessContainment = internalQuery({
  args: { identities: identityMapValidator },
  handler: async (ctx, args) =>
    inspectContainmentPlan(ctx, args.identities as Stg1IdentityMap),
});
