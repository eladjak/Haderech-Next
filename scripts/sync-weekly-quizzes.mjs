/**
 * Deterministically project the canonical course assessments into the LMS.
 *
 * The source of truth lives in the sibling `omanut-hakesher-course/quizzes`
 * directory. Reflection prompts stay canonical but are deliberately excluded
 * from the scored LMS quiz until the product has a private, ungraded response
 * flow.
 *
 * Usage:
 *   node scripts/sync-weekly-quizzes.mjs --check
 *   node scripts/sync-weekly-quizzes.mjs --write
 *   node scripts/sync-weekly-quizzes.mjs --self-test
 *   node scripts/sync-weekly-quizzes.mjs --course-root C:\path\to\course --check
 */

import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const LMS_ROOT = path.resolve(SCRIPT_DIR, "..");
const GENERATED_PATH = path.join(LMS_ROOT, "convex", "weeklyQuizData.generated.json");
const SUPPORTED_GRADED_TYPES = new Set(["multiple_choice", "true_false"]);

export class AssessmentContractError extends Error {
  constructor(errors) {
    super(`Assessment contract is invalid:\n- ${errors.join("\n- ")}`);
    this.name = "AssessmentContractError";
    this.errors = errors;
  }
}

function parseArgs(argv) {
  const args = new Set(argv);
  const courseRootIndex = argv.indexOf("--course-root");
  const courseRoot =
    courseRootIndex >= 0
      ? argv[courseRootIndex + 1]
      : process.env.OMANUT_HAKESHER_COURSE_ROOT ||
        path.resolve(LMS_ROOT, "..", "omanut-hakesher-course");

  if (courseRootIndex >= 0 && !courseRoot) {
    throw new Error("--course-root requires a path");
  }
  if (args.has("--write") && args.has("--check")) {
    throw new Error("Choose either --write or --check, not both");
  }

  return {
    courseRoot: path.resolve(courseRoot),
    write: args.has("--write"),
    check: args.has("--check") || (!args.has("--write") && !args.has("--self-test")),
    selfTest: args.has("--self-test"),
  };
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function stableStringify(value) {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }
  if (isPlainObject(value)) {
    const keys = Object.keys(value).sort();
    return `{${keys
      .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function sha256(value) {
  return `sha256:${crypto.createHash("sha256").update(stableStringify(value)).digest("hex")}`;
}

function normalizeText(value) {
  return value.normalize("NFKC").replace(/\s+/gu, " ").trim();
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

export function loadCanonicalAssessment(courseRoot) {
  const quizzesDir = path.join(courseRoot, "quizzes");
  const contractPath = path.join(quizzesDir, "assessment-contract.json");
  if (!fs.existsSync(contractPath)) {
    throw new Error(`Canonical assessment contract not found: ${contractPath}`);
  }

  const contract = readJson(contractPath);
  const weekFiles = fs
    .readdirSync(quizzesDir)
    .filter((name) => /^week-\d{2}\.json$/u.test(name))
    .sort();
  const weeks = weekFiles.map((name) => ({
    sourceFile: name,
    value: readJson(path.join(quizzesDir, name)),
  }));

  return { contract, weeks };
}

export function validateCanonicalAssessment(input) {
  const { contract, weeks } = input;
  const errors = [];
  const allIds = new Set();
  const normalizedQuestions = new Map();

  if (contract?.schemaVersion !== 1) errors.push("schemaVersion must be 1");
  if (contract?.contractId !== "oh.assessment.weekly.v1") {
    errors.push("contractId must be oh.assessment.weekly.v1");
  }
  if (typeof contract?.courseTitle !== "string" || !contract.courseTitle.trim()) {
    errors.push("courseTitle must be a non-empty string");
  }

  const idPattern = contract?.itemIdentity?.pattern;
  let idRegex;
  try {
    idRegex = new RegExp(idPattern, "u");
  } catch {
    errors.push("itemIdentity.pattern must be a valid regular expression");
  }

  const projection = contract?.lmsProjection;
  const mappings = Array.isArray(projection?.weeks) ? projection.weeks : [];
  const gradedTypes = Array.isArray(projection?.gradedTypes) ? projection.gradedTypes : [];
  const trueFalseOptions = projection?.trueFalseOptions;

  if (weeks.length !== 12) errors.push(`expected 12 week files, found ${weeks.length}`);
  if (mappings.length !== 12) errors.push(`expected 12 LMS week mappings, found ${mappings.length}`);
  if (!Number.isInteger(projection?.passingScore) || projection.passingScore < 0 || projection.passingScore > 100) {
    errors.push("lmsProjection.passingScore must be an integer from 0 through 100");
  }
  if (
    !Array.isArray(trueFalseOptions) ||
    trueFalseOptions.length !== 2 ||
    trueFalseOptions.some((option) => typeof option !== "string" || !option.trim()) ||
    new Set(trueFalseOptions.map(normalizeText)).size !== 2
  ) {
    errors.push("lmsProjection.trueFalseOptions must contain two distinct, non-empty labels");
  }
  for (const type of gradedTypes) {
    if (!SUPPORTED_GRADED_TYPES.has(type)) {
      errors.push(`unsupported graded type: ${String(type)}`);
    }
  }
  for (const required of SUPPORTED_GRADED_TYPES) {
    if (!gradedTypes.includes(required)) errors.push(`gradedTypes is missing ${required}`);
  }
  if (!projection?.excludedTypes?.reflection) {
    errors.push("reflection must have an explicit exclusion reason");
  }
  if (projection?.answerOptionOrdering?.policy !== "stable_hash_target_position") {
    errors.push("answerOptionOrdering.policy must be stable_hash_target_position");
  }
  if (projection?.answerOptionOrdering?.stripAuthorLabels !== true) {
    errors.push("answerOptionOrdering.stripAuthorLabels must be true");
  }

  const mappingByWeek = new Map();
  const lessonIndexes = new Set();
  for (const mapping of mappings) {
    if (!Number.isInteger(mapping?.weekNumber) || mapping.weekNumber < 1 || mapping.weekNumber > 12) {
      errors.push(`invalid mapped weekNumber: ${String(mapping?.weekNumber)}`);
      continue;
    }
    if (mappingByWeek.has(mapping.weekNumber)) {
      errors.push(`duplicate LMS mapping for week ${mapping.weekNumber}`);
    }
    if (typeof mapping.lessonScriptIndex !== "string" || !mapping.lessonScriptIndex.trim()) {
      errors.push(`week ${mapping.weekNumber} has no lessonScriptIndex`);
    } else if (lessonIndexes.has(mapping.lessonScriptIndex)) {
      errors.push(`duplicate lessonScriptIndex: ${mapping.lessonScriptIndex}`);
    }
    mappingByWeek.set(mapping.weekNumber, mapping);
    lessonIndexes.add(mapping.lessonScriptIndex);
  }

  for (const entry of weeks) {
    const week = entry.value;
    const fileWeekMatch = /^week-(\d{2})\.json$/u.exec(entry.sourceFile);
    const fileWeek = fileWeekMatch ? Number(fileWeekMatch[1]) : NaN;
    if (!Number.isInteger(week?.weekNumber) || week.weekNumber !== fileWeek) {
      errors.push(`${entry.sourceFile}: weekNumber must equal ${fileWeek}`);
    }
    if (!mappingByWeek.has(week?.weekNumber)) {
      errors.push(`${entry.sourceFile}: no LMS lesson mapping for week ${String(week?.weekNumber)}`);
    }
    if (typeof week?.title !== "string" || !week.title.trim()) {
      errors.push(`${entry.sourceFile}: title must be non-empty`);
    }
    if (!Array.isArray(week?.questions) || week.questions.length === 0) {
      errors.push(`${entry.sourceFile}: questions must be a non-empty array`);
      continue;
    }

    for (const [questionIndex, question] of week.questions.entries()) {
      const label = `${entry.sourceFile} question ${questionIndex + 1}`;
      if (typeof question?.id !== "string" || !idRegex?.test(question.id)) {
        errors.push(`${label}: invalid stable id ${String(question?.id)}`);
      } else {
        const expectedPrefix = `w${week.weekNumber}q`;
        if (!question.id.startsWith(expectedPrefix)) {
          errors.push(`${label}: id ${question.id} belongs to a different week`);
        }
        if (allIds.has(question.id)) errors.push(`${label}: duplicate stable id ${question.id}`);
        allIds.add(question.id);
      }

      if (typeof question?.question !== "string" || !question.question.trim()) {
        errors.push(`${label}: question text must be non-empty`);
      } else {
        const normalized = normalizeText(question.question);
        const previous = normalizedQuestions.get(normalized);
        if (previous) errors.push(`${label}: duplicates question text from ${previous}`);
        normalizedQuestions.set(normalized, question.id || label);
      }

      if (question?.type === "multiple_choice") {
        if (!Array.isArray(question.options) || question.options.length < 2) {
          errors.push(`${label}: multiple_choice needs at least two options`);
        } else {
          const normalizedOptions = question.options.map((option) =>
            typeof option === "string" ? normalizeText(option) : ""
          );
          if (normalizedOptions.some((option) => !option)) {
            errors.push(`${label}: options must be non-empty strings`);
          }
          if (new Set(normalizedOptions).size !== normalizedOptions.length) {
            errors.push(`${label}: options must be distinct`);
          }
          if (
            !Number.isInteger(question.correctAnswer) ||
            question.correctAnswer < 0 ||
            question.correctAnswer >= question.options.length
          ) {
            errors.push(`${label}: correctAnswer is outside the options array`);
          }
        }
        if (typeof question.explanation !== "string" || !question.explanation.trim()) {
          errors.push(`${label}: graded question needs an explanation`);
        }
      } else if (question?.type === "true_false") {
        if (typeof question.correctAnswer !== "boolean") {
          errors.push(`${label}: true_false correctAnswer must be boolean`);
        }
        if (typeof question.explanation !== "string" || !question.explanation.trim()) {
          errors.push(`${label}: graded question needs an explanation`);
        }
      } else if (question?.type === "reflection") {
        if (Object.hasOwn(question, "correctAnswer")) {
          errors.push(`${label}: reflection must not have a correctAnswer`);
        }
        if (Object.hasOwn(question, "options")) {
          errors.push(`${label}: reflection must not have answer options`);
        }
      } else {
        errors.push(`${label}: unsupported question type ${String(question?.type)}`);
      }
    }
  }

  if (errors.length) throw new AssessmentContractError(errors);
  return { mappingByWeek, allIds };
}

function projectOptionOrder(sourceId, options, correctIndex) {
  const targetIndex =
    crypto.createHash("sha256").update(sourceId, "utf8").digest()[0] % options.length;
  const correctOption = options[correctIndex];
  const reordered = options.filter((_, index) => index !== correctIndex);
  reordered.splice(targetIndex, 0, correctOption);
  return { options: reordered, correctIndex: targetIndex };
}

function stripAuthorOptionLabel(option) {
  return option.replace(/^\s*(?:[א-ת]|[A-Da-d])[.)]\s*/u, "").trim();
}

function maximumShare(counts) {
  const values = Object.values(counts);
  const total = values.reduce((sum, value) => sum + value, 0);
  return total === 0 ? 0 : Math.max(...values) / total;
}

function answerQualitySignals(projectedQuestions, canonicalWeeks) {
  const multipleChoice = projectedQuestions.filter((item) => item.questionType === "multiple_choice");
  const trueFalse = projectedQuestions.filter((item) => item.questionType === "true_false");
  const mcPositions = {};
  const tfPositions = {};
  const tfAnswers = { true: 0, false: 0 };
  for (const item of multipleChoice) {
    mcPositions[item.correctIndex] = (mcPositions[item.correctIndex] || 0) + 1;
  }
  for (const item of trueFalse) {
    tfPositions[item.correctIndex] = (tfPositions[item.correctIndex] || 0) + 1;
  }
  for (const item of canonicalWeeks.flatMap((entry) => entry.value.questions)) {
    if (item.type === "true_false") tfAnswers[String(item.correctAnswer)] += 1;
  }
  const warnings = [];
  if (maximumShare(mcPositions) > 0.4) {
    warnings.push("Multiple-choice correct-option positions remain materially imbalanced.");
  }
  if (maximumShare(tfPositions) > 0.65) {
    warnings.push("True/false correct-option positions remain materially imbalanced.");
  }
  if (maximumShare(tfAnswers) > 0.65) {
    warnings.push("True/false statement semantics remain materially skewed toward one answer.");
  }
  return {
    multipleChoiceCorrectIndexDistribution: mcPositions,
    trueFalseCorrectIndexDistribution: tfPositions,
    trueFalseAnswerDistribution: tfAnswers,
    warnings,
  };
}

export function buildGeneratedAssessment(input) {
  const { mappingByWeek } = validateCanonicalAssessment(input);
  const { contract, weeks } = input;
  const gradedTypes = new Set(contract.lmsProjection.gradedTypes);
  const projectedQuizzes = [];
  const excludedItems = [];

  for (const entry of weeks) {
    const week = entry.value;
    const mapping = mappingByWeek.get(week.weekNumber);
    const questions = [];

    for (const item of week.questions) {
      if (!gradedTypes.has(item.type)) {
        excludedItems.push({
          sourceId: item.id,
          weekNumber: week.weekNumber,
          type: item.type,
          reason: contract.lmsProjection.excludedTypes[item.type],
        });
        continue;
      }

      const baseOptions =
        item.type === "true_false"
          ? [...contract.lmsProjection.trueFalseOptions]
          : item.options.map(stripAuthorOptionLabel);
      const baseCorrectIndex =
        item.type === "true_false"
          ? item.correctAnswer
            ? 0
            : 1
          : item.correctAnswer;
      const ordered = projectOptionOrder(item.id, baseOptions, baseCorrectIndex);
      const transformed = {
        sourceId: item.id,
        questionType: item.type,
        question: item.question,
        options: ordered.options,
        correctIndex: ordered.correctIndex,
        explanation: item.explanation,
      };
      questions.push(transformed);
    }

    const quizWithoutHash = {
      weekNumber: week.weekNumber,
      sourceKey: `oh.assessment.week-${String(week.weekNumber).padStart(2, "0")}`,
      sourceFile: entry.sourceFile,
      lessonScriptIndex: mapping.lessonScriptIndex,
      title: week.title,
      passingScore: contract.lmsProjection.passingScore,
      questions,
    };
    projectedQuizzes.push({
      ...quizWithoutHash,
      contentHash: sha256(quizWithoutHash),
    });
  }

  const projectedQuestions = projectedQuizzes.flatMap((quiz) => quiz.questions);
  const canonicalItems = weeks.reduce((sum, entry) => sum + entry.value.questions.length, 0);
  const generated = {
    schemaVersion: 1,
    contractId: contract.contractId,
    courseTitle: contract.courseTitle,
    sourceDigest: sha256({ contract, weeks }),
    totals: {
      weeks: projectedQuizzes.length,
      canonicalItems,
      gradedItems: projectedQuestions.length,
      excludedItems: excludedItems.length,
      exactCanonicalProjectionOverlap: projectedQuestions.length,
    },
    qualitySignals: answerQualitySignals(projectedQuestions, weeks),
    excludedItems,
    quizzes: projectedQuizzes,
  };

  assert.equal(
    generated.totals.canonicalItems,
    generated.totals.gradedItems + generated.totals.excludedItems,
    "Every canonical item must be either projected or explicitly excluded"
  );
  return generated;
}

function serializeGenerated(generated) {
  return `${JSON.stringify(generated, null, 2)}\n`;
}

export function assertGeneratedMatches(generated, existingText) {
  const expected = serializeGenerated(generated);
  if (existingText !== expected) {
    throw new Error(
      `Generated weekly quiz data is stale: ${GENERATED_PATH}\n` +
        "Run: node scripts/sync-weekly-quizzes.mjs --write"
    );
  }
}

export function runSelfTests(validInput) {
  const validGenerated = buildGeneratedAssessment(validInput);

  const duplicate = structuredClone(validInput);
  duplicate.weeks[0].value.questions[1].id = duplicate.weeks[0].value.questions[0].id;
  assert.throws(() => validateCanonicalAssessment(duplicate), /duplicate stable id/u);

  const badAnswer = structuredClone(validInput);
  const multipleChoice = badAnswer.weeks
    .flatMap((entry) => entry.value.questions)
    .find((item) => item.type === "multiple_choice");
  multipleChoice.correctAnswer = multipleChoice.options.length;
  assert.throws(() => validateCanonicalAssessment(badAnswer), /outside the options array/u);

  const reflectionLeak = structuredClone(validInput);
  reflectionLeak.contract.lmsProjection.gradedTypes.push("reflection");
  assert.throws(() => validateCanonicalAssessment(reflectionLeak), /unsupported graded type/u);

  const unsafeOrdering = structuredClone(validInput);
  unsafeOrdering.contract.lmsProjection.answerOptionOrdering.policy = "author_position";
  assert.throws(
    () => validateCanonicalAssessment(unsafeOrdering),
    /answerOptionOrdering\.policy/u
  );

  const wrongWeekId = structuredClone(validInput);
  wrongWeekId.weeks[0].value.questions[0].id = "w2q99";
  assert.throws(() => validateCanonicalAssessment(wrongWeekId), /different week/u);

  assert.throws(
    () => assertGeneratedMatches(validGenerated, `${serializeGenerated(validGenerated)} `),
    /is stale/u
  );

  const sourceIds = validGenerated.quizzes.flatMap((quiz) =>
    quiz.questions.map((question) => question.sourceId)
  );
  assert.equal(new Set(sourceIds).size, sourceIds.length);
  const generatedById = new Map(
    validGenerated.quizzes.flatMap((quiz) =>
      quiz.questions.map((question) => [question.sourceId, question])
    )
  );
  for (const canonical of validInput.weeks.flatMap((entry) => entry.value.questions)) {
    if (canonical.type === "reflection") continue;
    const projected = generatedById.get(canonical.id);
    assert.ok(projected, `missing projection for ${canonical.id}`);
    const expectedCorrectOption =
      canonical.type === "true_false"
        ? validInput.contract.lmsProjection.trueFalseOptions[canonical.correctAnswer ? 0 : 1]
        : stripAuthorOptionLabel(canonical.options[canonical.correctAnswer]);
    assert.equal(projected.options[projected.correctIndex], expectedCorrectOption);
  }
  assert.equal(
    validGenerated.excludedItems.every((item) => item.type === "reflection"),
    true
  );
  assert.deepEqual(validGenerated.qualitySignals.warnings, []);
  return { negativeControls: 6, status: "passed" };
}

function printSummary(generated, mode) {
  const summary = {
    mode,
    sourceDigest: generated.sourceDigest,
    ...generated.totals,
    generatedPath: GENERATED_PATH,
    qualityWarnings: generated.qualitySignals.warnings.length,
  };
  process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const input = loadCanonicalAssessment(options.courseRoot);
  const generated = buildGeneratedAssessment(input);

  if (options.selfTest) {
    const result = runSelfTests(input);
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    return;
  }

  if (options.write) {
    fs.writeFileSync(GENERATED_PATH, serializeGenerated(generated), "utf8");
    printSummary(generated, "write");
    return;
  }

  if (!fs.existsSync(GENERATED_PATH)) {
    throw new Error(
      `Generated weekly quiz data does not exist: ${GENERATED_PATH}\n` +
        "Run: node scripts/sync-weekly-quizzes.mjs --write"
    );
  }
  assertGeneratedMatches(generated, fs.readFileSync(GENERATED_PATH, "utf8"));
  printSummary(generated, "check");
}

if (path.resolve(process.argv[1] || "") === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.stack || error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}
