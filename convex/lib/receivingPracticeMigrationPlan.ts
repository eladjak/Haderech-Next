export type MigrationLesson = {
  id: string;
  order: number;
  scriptIndex?: string;
  contentKey?: string;
};

export type ReceivingPracticePlanInput = {
  lessons: MigrationLesson[];
  requiredLessonCount: number;
  optionalLessonCount: number;
  existingMarkerState?: "applied" | "rolled_back";
  targetProgressRows: number;
  targetQuizRows: number;
  targetAttemptRows: number;
  predecessorScriptIndex: string;
  successorScriptIndex: string;
  targetScriptIndex: string;
  targetContentKey: string;
};

export type ReceivingPracticePlan = {
  status: "ready" | "already_applied" | "conflict";
  conflicts: string[];
  targetLessonId?: string;
  insertTarget: boolean;
  desiredOrder?: number;
  shiftedLessonIds: string[];
  protectedProgressRows: number;
  /** Backward-compatible alias for contentWrites. */
  writes: number;
  contentWrites: number;
  markerWrites: number;
  totalWrites: number;
  expectedRequiredLessonCount: number;
  expectedOptionalLessonCount: number;
  expectedTotalLessonCount: number;
};

export function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }
  const record = value as Record<string, unknown>;
  const entries = Object.keys(record)
    .filter((key) => record[key] !== undefined)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`);
  return `{${entries.join(",")}}`;
}

export async function sha256Stable(value: unknown): Promise<string> {
  const bytes = new TextEncoder().encode(stableStringify(value));
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return `sha256:${Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")}`;
}

export function planReceivingPracticeMigration(
  input: ReceivingPracticePlanInput,
): ReceivingPracticePlan {
  const conflicts: string[] = [];
  const duplicateOrders = [...new Set(input.lessons.map((lesson) => lesson.order))]
    .filter(
      (order) => input.lessons.filter((lesson) => lesson.order === order).length > 1,
    )
    .sort((left, right) => left - right);
  if (duplicateOrders.length > 0) {
    conflicts.push(`DUPLICATE_LESSON_ORDERS:${duplicateOrders.join("|")}`);
  }
  const byScriptIndex = input.lessons.filter(
    (lesson) => lesson.scriptIndex === input.targetScriptIndex,
  );
  const byContentKey = input.lessons.filter(
    (lesson) => lesson.contentKey === input.targetContentKey,
  );
  const targetIds = new Set(
    [...byScriptIndex, ...byContentKey].map((lesson) => lesson.id),
  );

  if (byScriptIndex.length > 1) {
    conflicts.push(`DUPLICATE_SCRIPT_INDEX:${byScriptIndex.length}`);
  }
  if (byContentKey.length > 1) {
    conflicts.push(`DUPLICATE_CONTENT_KEY:${byContentKey.length}`);
  }
  if (targetIds.size > 1) {
    conflicts.push("TARGET_IDENTITIES_RESOLVE_TO_DIFFERENT_LESSONS");
  }

  const predecessor = input.lessons.filter(
    (lesson) => lesson.scriptIndex === input.predecessorScriptIndex,
  );
  const successor = input.lessons.filter(
    (lesson) => lesson.scriptIndex === input.successorScriptIndex,
  );
  if (predecessor.length !== 1) {
    conflicts.push(`PREDECESSOR_COUNT:${predecessor.length}`);
  }
  if (successor.length !== 1) {
    conflicts.push(`SUCCESSOR_COUNT:${successor.length}`);
  }

  const target = input.lessons.find((lesson) => targetIds.has(lesson.id));
  const expectedPreOptional = target ? 1 : 0;
  const expectedPreTotal = target ? 76 : 75;
  if (input.requiredLessonCount !== 75) {
    conflicts.push(`REQUIRED_LESSON_COUNT:${input.requiredLessonCount}`);
  }
  if (input.optionalLessonCount !== expectedPreOptional) {
    conflicts.push(`OPTIONAL_LESSON_COUNT:${input.optionalLessonCount}`);
  }
  if (input.lessons.length !== expectedPreTotal) {
    conflicts.push(`TOTAL_LESSON_COUNT:${input.lessons.length}`);
  }
  if (target && input.targetQuizRows > 0) {
    conflicts.push(`OPTIONAL_PRACTICE_HAS_QUIZZES:${input.targetQuizRows}`);
  }
  if (target && input.targetAttemptRows > 0) {
    conflicts.push(`OPTIONAL_PRACTICE_HAS_ATTEMPTS:${input.targetAttemptRows}`);
  }
  if (input.existingMarkerState === "rolled_back") {
    conflicts.push("MIGRATION_VERSION_ALREADY_ROLLED_BACK");
  }

  const desiredOrder = predecessor.length === 1 ? predecessor[0].order + 1 : undefined;
  if (
    predecessor.length === 1 &&
    successor.length === 1 &&
    predecessor[0].order >= successor[0].order
  ) {
    conflicts.push("INVALID_ANCHOR_ORDER");
  }
  if (
    target &&
    desiredOrder !== undefined &&
    (target.order !== desiredOrder ||
      (successor.length === 1 && successor[0].order <= target.order))
  ) {
    conflicts.push("EXISTING_TARGET_ORDER_DRIFT");
  }

  if (conflicts.length > 0) {
    return {
      status: "conflict",
      conflicts,
      targetLessonId: target?.id,
      insertTarget: !target,
      desiredOrder,
      shiftedLessonIds: [],
      protectedProgressRows: input.targetProgressRows,
      writes: 0,
      contentWrites: 0,
      markerWrites: 0,
      totalWrites: 0,
      expectedRequiredLessonCount: 75,
      expectedOptionalLessonCount: 1,
      expectedTotalLessonCount: 76,
    };
  }

  if (input.existingMarkerState === "applied") {
    if (!target || target.order !== desiredOrder) {
      return {
        status: "conflict",
        conflicts: ["APPLIED_MARKER_STATE_DRIFT"],
        targetLessonId: target?.id,
        insertTarget: !target,
        desiredOrder,
        shiftedLessonIds: [],
        protectedProgressRows: input.targetProgressRows,
        writes: 0,
        contentWrites: 0,
        markerWrites: 0,
        totalWrites: 0,
        expectedRequiredLessonCount: 75,
        expectedOptionalLessonCount: 1,
        expectedTotalLessonCount: 76,
      };
    }
    return {
      status: "already_applied",
      conflicts: [],
      targetLessonId: target.id,
      insertTarget: false,
      desiredOrder,
      shiftedLessonIds: [],
      protectedProgressRows: input.targetProgressRows,
      writes: 0,
      contentWrites: 0,
      markerWrites: 0,
      totalWrites: 0,
      expectedRequiredLessonCount: 75,
      expectedOptionalLessonCount: 1,
      expectedTotalLessonCount: 76,
    };
  }

  const insertTarget = !target;
  const shiftedLessonIds = insertTarget
    ? input.lessons
        .filter((lesson) => lesson.order >= (desiredOrder as number))
        .sort((left, right) => right.order - left.order)
        .map((lesson) => lesson.id)
    : [];
  const contentWrites = shiftedLessonIds.length + 1;
  const markerWrites = 1;

  return {
    status: "ready",
    conflicts: [],
    targetLessonId: target?.id,
    insertTarget,
    desiredOrder,
    shiftedLessonIds,
    protectedProgressRows: input.targetProgressRows,
    writes: contentWrites,
    contentWrites,
    markerWrites,
    totalWrites: contentWrites + markerWrites,
    expectedRequiredLessonCount: 75,
    expectedOptionalLessonCount: 1,
    expectedTotalLessonCount: 76,
  };
}
