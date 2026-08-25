export const STG1_DEPLOYMENT_NAME = "content-dog-757" as const;
export const STG1_FIXTURE_VERSION = "stg1-v1" as const;
export const STG1_FIXTURE_CONFIRMATION =
  "STG1_CONTENT_DOG_757_V1" as const;
export const STG1_FIXTURE_ENV_VALUE =
  `${STG1_DEPLOYMENT_NAME}:${STG1_FIXTURE_VERSION}` as const;
export const STG1_CANONICAL_COURSE_TITLE =
  "הדרך - אומנות הקשר" as const;
export const STG1_RECEIVING_PRACTICE_SCRIPT_INDEX = "5.3.2" as const;
export const STG1_RECEIVING_PRACTICE_CONTENT_KEY =
  "oh.course.lesson.receiving-practice" as const;

export const STG1_AUTHENTICATED_ALIASES = [
  "U0",
  "A",
  "B",
  "E",
  "X",
  "ADMIN",
  "IMPOSTOR",
] as const;

export type Stg1AuthenticatedAlias =
  (typeof STG1_AUTHENTICATED_ALIASES)[number];
export type Stg1IdentityMap = Record<Stg1AuthenticatedAlias, string>;

export type Stg1SourceLesson = {
  title: string;
  description: string;
  order: number;
  weekNumber: number;
  phaseNumber: number;
  phaseName: string;
  duration: number;
  scriptIndex: string;
  contentKey?: string;
  learnerAvailability?: "required" | "optional";
  completionAffectsProgress?: boolean;
  assessmentOrScoring?: boolean;
  personalDisclosureRequired?: boolean;
  relationshipOrPartnerRequired?: boolean;
  learnerAlternatives?: string[];
  pdfUrl?: string;
};

export type Stg1LegacyCoursePlan<T extends Stg1SourceLesson> =
  | {
      status: "ready";
      conflicts: [];
      lessons: Array<T & { order: number }>;
      expectedRequiredLessonCount: 75;
      expectedOptionalLessonCount: 0;
    }
  | {
      status: "conflict";
      conflicts: string[];
      lessons: [];
      expectedRequiredLessonCount: 75;
      expectedOptionalLessonCount: 0;
    };

function duplicateValues(values: string[]): string[] {
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts.entries()]
    .filter(([, count]) => count > 1)
    .map(([value]) => value)
    .sort();
}

/**
 * Builds the exact 75-lesson pre-migration baseline from the reviewed 76-item
 * source. The optional receiving practice is deliberately omitted so the
 * staging rehearsal exercises the insertion path instead of a no-op path.
 */
export function planStg1LegacyCourseBaseline<T extends Stg1SourceLesson>(
  sourceLessons: readonly T[],
): Stg1LegacyCoursePlan<T> {
  const conflicts: string[] = [];
  if (sourceLessons.length !== 76) {
    conflicts.push(`SOURCE_LESSON_COUNT:${sourceLessons.length}`);
  }

  const targetRows = sourceLessons.filter(
    (lesson) =>
      lesson.scriptIndex === STG1_RECEIVING_PRACTICE_SCRIPT_INDEX ||
      lesson.contentKey === STG1_RECEIVING_PRACTICE_CONTENT_KEY,
  );
  if (targetRows.length !== 1) {
    conflicts.push(`OPTIONAL_TARGET_COUNT:${targetRows.length}`);
  }
  const target = targetRows[0];
  if (target) {
    if (target.scriptIndex !== STG1_RECEIVING_PRACTICE_SCRIPT_INDEX) {
      conflicts.push("OPTIONAL_TARGET_SCRIPT_INDEX_DRIFT");
    }
    if (target.contentKey !== STG1_RECEIVING_PRACTICE_CONTENT_KEY) {
      conflicts.push("OPTIONAL_TARGET_CONTENT_KEY_DRIFT");
    }
    if (target.learnerAvailability !== "optional") {
      conflicts.push("OPTIONAL_TARGET_AVAILABILITY_DRIFT");
    }
    if (target.completionAffectsProgress !== false) {
      conflicts.push("OPTIONAL_TARGET_PROGRESS_DRIFT");
    }
    if (target.assessmentOrScoring !== false) {
      conflicts.push("OPTIONAL_TARGET_SCORING_DRIFT");
    }
    if (target.personalDisclosureRequired !== false) {
      conflicts.push("OPTIONAL_TARGET_DISCLOSURE_DRIFT");
    }
    if (target.relationshipOrPartnerRequired !== false) {
      conflicts.push("OPTIONAL_TARGET_PARTNER_DRIFT");
    }
  }

  const required = sourceLessons.filter(
    (lesson) =>
      lesson.scriptIndex !== STG1_RECEIVING_PRACTICE_SCRIPT_INDEX &&
      lesson.contentKey !== STG1_RECEIVING_PRACTICE_CONTENT_KEY,
  );
  if (required.length !== 75) {
    conflicts.push(`REQUIRED_LESSON_COUNT:${required.length}`);
  }
  if (required.some((lesson) => lesson.completionAffectsProgress === false)) {
    conflicts.push("REQUIRED_LESSON_EXCLUDED_FROM_PROGRESS");
  }
  if (required.some((lesson) => lesson.learnerAvailability === "optional")) {
    conflicts.push("REQUIRED_LESSON_MARKED_OPTIONAL");
  }

  const scriptIndexes = sourceLessons.map((lesson) => lesson.scriptIndex);
  for (const duplicate of duplicateValues(scriptIndexes)) {
    conflicts.push(`DUPLICATE_SCRIPT_INDEX:${duplicate}`);
  }
  const contentKeys = sourceLessons
    .map((lesson) => lesson.contentKey)
    .filter((value): value is string => value !== undefined);
  for (const duplicate of duplicateValues(contentKeys)) {
    conflicts.push(`DUPLICATE_CONTENT_KEY:${duplicate}`);
  }

  const predecessor = required.findIndex(
    (lesson) => lesson.scriptIndex === "5.3.1",
  );
  const successor = required.findIndex(
    (lesson) => lesson.scriptIndex === "5.4.1",
  );
  if (predecessor < 0) conflicts.push("PREDECESSOR_MISSING");
  if (successor < 0) conflicts.push("SUCCESSOR_MISSING");
  if (predecessor >= 0 && successor !== predecessor + 1) {
    conflicts.push("LEGACY_ANCHOR_ORDER_DRIFT");
  }

  if (conflicts.length > 0) {
    return {
      status: "conflict",
      conflicts,
      lessons: [],
      expectedRequiredLessonCount: 75,
      expectedOptionalLessonCount: 0,
    };
  }

  return {
    status: "ready",
    conflicts: [],
    lessons: required.map((lesson, order) => ({ ...lesson, order })),
    expectedRequiredLessonCount: 75,
    expectedOptionalLessonCount: 0,
  };
}

export function expectedStg1IdentityName(
  alias: Stg1AuthenticatedAlias,
): string {
  return `STG1 ${alias} — ${STG1_DEPLOYMENT_NAME}`;
}

export function expectedStg1IdentityEmail(
  alias: Stg1AuthenticatedAlias,
): string {
  return `stg1+${alias.toLowerCase()}@example.invalid`;
}

export function stg1FixtureSourceReference(
  alias: "A" | "B" | "E" | "X",
  kind: "community" | "course",
): string {
  return `stg1:${STG1_DEPLOYMENT_NAME}:${STG1_FIXTURE_VERSION}:${alias}:${kind}`;
}

export const STG1_ACCESS_EXPECTATIONS = Object.freeze({
  A: Object.freeze({
    kind: "community" as const,
    accessBasis: "book" as const,
    status: "active" as const,
    sourceReference: stg1FixtureSourceReference("A", "community"),
  }),
  B: Object.freeze({
    kind: "community" as const,
    accessBasis: "guidance" as const,
    status: "active" as const,
    sourceReference: stg1FixtureSourceReference("B", "community"),
  }),
  E: Object.freeze({
    kind: "course" as const,
    status: "active" as const,
    sourceReference: stg1FixtureSourceReference("E", "course"),
  }),
  X: Object.freeze({
    kind: "course" as const,
    status: "expired" as const,
    validUntil: 1,
    sourceReference: stg1FixtureSourceReference("X", "course"),
  }),
});

export function validateStg1IdentityMap(input: unknown): string[] {
  if (input === null || typeof input !== "object" || Array.isArray(input)) {
    return ["IDENTITY_MAP_NOT_OBJECT"];
  }
  const record = input as Record<string, unknown>;
  const expectedKeys = [...STG1_AUTHENTICATED_ALIASES].sort();
  const actualKeys = Object.keys(record).sort();
  const conflicts: string[] = [];
  if (JSON.stringify(actualKeys) !== JSON.stringify(expectedKeys)) {
    conflicts.push(`IDENTITY_MAP_KEYS:${actualKeys.join("|")}`);
  }

  const ids: string[] = [];
  for (const alias of STG1_AUTHENTICATED_ALIASES) {
    const value = record[alias];
    if (typeof value !== "string" || !/^user_[A-Za-z0-9]+$/u.test(value)) {
      conflicts.push(`IDENTITY_PROVIDER_ID_INVALID:${alias}`);
      continue;
    }
    ids.push(value);
  }
  for (const duplicate of duplicateValues(ids)) {
    const aliases = STG1_AUTHENTICATED_ALIASES.filter(
      (alias) => record[alias] === duplicate,
    );
    conflicts.push(`IDENTITY_PROVIDER_ID_DUPLICATE:${aliases.join("|")}`);
  }
  return conflicts;
}

export function validateStg1FixtureWrite(input: {
  seedEnabled: string | undefined;
  fixtureEnabled: string | undefined;
  deploymentName: string | undefined;
  confirmation: string;
}): string[] {
  const conflicts: string[] = [];
  if (input.seedEnabled !== "true") conflicts.push("SEED_DISABLED");
  if (input.fixtureEnabled !== STG1_FIXTURE_ENV_VALUE) {
    conflicts.push("FIXTURE_ENV_TARGET_MISMATCH");
  }
  if (input.deploymentName !== STG1_DEPLOYMENT_NAME) {
    conflicts.push("DEPLOYMENT_ENV_TARGET_MISMATCH");
  }
  if (input.confirmation !== STG1_FIXTURE_CONFIRMATION) {
    conflicts.push("CONFIRMATION_MISMATCH");
  }
  return conflicts;
}
