/**
 * Build learner-facing LMS lesson content from the canonical Git corpus.
 *
 * Source of truth:
 *   ../omanut-hakesher-course/content/course-content-manifest.json
 *   ../omanut-hakesher-course/teleprompter/<week>/<lesson>.txt
 *
 * The manifest alone owns LMS placement. This generator never derives an
 * index from a filename and never forces excluded-current items into the LMS.
 * Transformations are mechanical only: remove the six-line teleprompter file
 * header and standalone [הפסקה] production cues; preserve all spoken content.
 *
 * Usage:
 *   node scripts/build-lesson-content.mjs
 *   node scripts/build-lesson-content.mjs --check
 *   node scripts/build-lesson-content.mjs --course-repo <path>
 *   node scripts/build-lesson-content.mjs --self-test
 */

import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const EXPECTED_MANIFEST_VERSION = 1;
const EXPECTED_CURRICULUM_VERSION = "haderech-current";
const EXPECTED_COURSE_KEY = "haderech-main";
const EXPECTED_CANONICAL_COUNT = 77;
const EXPECTED_MAPPED_COUNT = 75;
const EXPECTED_EXCLUDED_COUNT = 2;
const SAFETY_CONTENT_KEY = "oh.course.safety.disclosure-and-agency";
const HASH_PREFIX = "sha256:";
const PAUSE_ANNOTATION = "[הפסקה]";
const TELEPROMPTER_METADATA_PATTERN =
  /^~\d+(?:\.\d+)? (?:דקות|דקה|שניות|שנייה) \| \d+(?:,\d{3})* מילים$/;
const GENERATED_OUTPUT = path.join(
  import.meta.dirname,
  "..",
  "convex",
  "lessonContentData.ts",
);
const GENERATED_SAFETY_OUTPUT = path.join(
  import.meta.dirname,
  "..",
  "src",
  "generated",
  "course-safety-preface.ts",
);

function parseArgs(argv) {
  const options = {
    check: false,
    selfTest: false,
    courseRepo: path.resolve(import.meta.dirname, "..", "..", "omanut-hakesher-course"),
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--check") options.check = true;
    else if (arg === "--self-test") options.selfTest = true;
    else if (arg === "--course-repo") {
      const value = argv[i + 1];
      if (!value) throw new Error("--course-repo requires a path");
      options.courseRepo = path.resolve(value);
      i += 1;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

function fail(message) {
  throw new Error(message);
}

function sha256(bytes) {
  return HASH_PREFIX + crypto.createHash("sha256").update(bytes).digest("hex");
}

function normalizeRepoPath(repoPath) {
  if (typeof repoPath !== "string" || !repoPath) fail("Manifest source path is missing");
  if (repoPath.includes("\\")) fail(`Manifest path must use POSIX separators: ${repoPath}`);
  if (path.posix.isAbsolute(repoPath)) fail(`Manifest path must be relative: ${repoPath}`);
  const normalized = path.posix.normalize(repoPath);
  if (normalized !== repoPath || normalized === ".." || normalized.startsWith("../")) {
    fail(`Manifest path escapes or is not normalized: ${repoPath}`);
  }
  return normalized;
}

function resolveSourcePath(courseRepo, repoPath) {
  const normalized = normalizeRepoPath(repoPath);
  const root = path.resolve(courseRepo);
  const absolute = path.resolve(root, ...normalized.split("/"));
  const relative = path.relative(root, absolute);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    fail(`Manifest source escapes course repository: ${repoPath}`);
  }
  return absolute;
}

function numericReviewKey(value) {
  if (typeof value !== "string" || !/^\d+\.\d+\.\d+$/.test(value)) {
    fail(`Invalid courseReviewId: ${String(value)}`);
  }
  return value.split(".").map(Number);
}

function compareReviewItems(a, b) {
  const left = numericReviewKey(a.placements.courseReview.courseReviewId);
  const right = numericReviewKey(b.placements.courseReview.courseReviewId);
  return left[0] - right[0] || left[1] - right[1] || left[2] - right[2];
}

/** Reproduce the manifest's canonical aggregate over all canonical sources. */
function calculateSourceAggregate(items) {
  const payload = [...items].sort(compareReviewItems).map((item) => ({
    path: normalizeRepoPath(item.canonicalSource.path),
    sourceHash: item.canonicalSource.sourceHash,
  }));
  return sha256(Buffer.from(JSON.stringify(payload), "utf8"));
}

function validateManifestShape(manifest) {
  if (manifest.manifestVersion !== EXPECTED_MANIFEST_VERSION) {
    fail(
      `Unsupported manifestVersion ${String(manifest.manifestVersion)}; expected ${EXPECTED_MANIFEST_VERSION}`,
    );
  }
  if (!Array.isArray(manifest.items)) fail("Manifest items must be an array");
  if (manifest.curriculumVersion !== EXPECTED_CURRICULUM_VERSION) {
    fail(`Unexpected curriculumVersion: ${String(manifest.curriculumVersion)}`);
  }
  if (manifest.courseKey !== EXPECTED_COURSE_KEY) {
    fail(`Unexpected courseKey: ${String(manifest.courseKey)}`);
  }
  if (manifest.items.length !== EXPECTED_CANONICAL_COUNT) {
    fail(`Canonical item count drift: expected ${EXPECTED_CANONICAL_COUNT}, got ${manifest.items.length}`);
  }
  if (manifest.counts?.canonicalSources !== EXPECTED_CANONICAL_COUNT) {
    fail(`Manifest counts.canonicalSources must be ${EXPECTED_CANONICAL_COUNT}`);
  }
  if (manifest.counts?.lmsMappedCurrent !== EXPECTED_MAPPED_COUNT) {
    fail(`Manifest counts.lmsMappedCurrent must be ${EXPECTED_MAPPED_COUNT}`);
  }
  if (manifest.counts?.lmsExcludedCurrentPending !== EXPECTED_EXCLUDED_COUNT) {
    fail(`Manifest counts.lmsExcludedCurrentPending must be ${EXPECTED_EXCLUDED_COUNT}`);
  }
  if (manifest.lmsEvidence?.mappingCount !== EXPECTED_MAPPED_COUNT) {
    fail(`Manifest lmsEvidence.mappingCount must be ${EXPECTED_MAPPED_COUNT}`);
  }
  if (!/^sha256:[0-9a-f]{64}$/.test(manifest.sourceAggregateHash ?? "")) {
    fail("Manifest sourceAggregateHash is missing or malformed");
  }

  const calculatedAggregate = calculateSourceAggregate(manifest.items);
  if (calculatedAggregate !== manifest.sourceAggregateHash) {
    fail(
      `Manifest aggregate drift: expected ${manifest.sourceAggregateHash}, calculated ${calculatedAggregate}`,
    );
  }
}

function validateSourceInventory(courseRepo, manifest) {
  const teleprompterRoot = path.join(courseRepo, "teleprompter");
  if (!fs.existsSync(teleprompterRoot)) fail(`Teleprompter directory not found: ${teleprompterRoot}`);

  const expectedPaths = new Set(
    manifest.items.map((item) => normalizeRepoPath(item.canonicalSource.path)),
  );
  const actualPaths = [];
  const stack = [teleprompterRoot];
  while (stack.length) {
    const directory = stack.pop();
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) stack.push(absolute);
      else if (entry.isFile() && entry.name.toLowerCase().endsWith(".txt")) {
        actualPaths.push(path.relative(courseRepo, absolute).split(path.sep).join("/"));
      }
    }
  }

  const actualSet = new Set(actualPaths);
  if (actualSet.size !== actualPaths.length) fail("Duplicate canonical TXT paths detected on disk");
  const missing = [...expectedPaths].filter((sourcePath) => !actualSet.has(sourcePath)).sort();
  const unexpected = [...actualSet].filter((sourcePath) => !expectedPaths.has(sourcePath)).sort();
  if (missing.length || unexpected.length) {
    fail(
      `Canonical source inventory drift.${missing.length ? ` Missing: ${missing.join(", ")}.` : ""}${unexpected.length ? ` Unexpected: ${unexpected.join(", ")}.` : ""}`,
    );
  }
}

function validateAndLoadSources(courseRepo, manifest) {
  validateSourceInventory(courseRepo, manifest);
  const seenContentKeys = new Set();
  const seenSourcePaths = new Set();
  const seenReviewIds = new Set();
  const seenIndexes = new Map();
  const mapped = [];
  const excluded = [];

  for (const item of manifest.items) {
    const sourcePath = normalizeRepoPath(item.canonicalSource?.path);
    const contentKey = item.contentKey;
    const reviewId = item.placements?.courseReview?.courseReviewId;
    const placement = item.placements?.lms;

    if (seenContentKeys.has(contentKey)) fail(`Duplicate contentKey: ${contentKey}`);
    if (seenSourcePaths.has(sourcePath)) fail(`Duplicate canonical source path: ${sourcePath}`);
    if (seenReviewIds.has(reviewId)) fail(`Duplicate courseReviewId: ${reviewId}`);
    seenContentKeys.add(contentKey);
    seenSourcePaths.add(sourcePath);
    seenReviewIds.add(reviewId);
    numericReviewKey(reviewId);

    if (item.status !== "active") fail(`Canonical item is not active: ${contentKey}`);
    if (item.canonicalSource.repoKey !== "omanut-hakesher-course") {
      fail(`Unexpected canonical repoKey for ${contentKey}: ${item.canonicalSource.repoKey}`);
    }
    if (item.canonicalSource.format !== "teleprompter-txt") {
      fail(`Unexpected canonical format for ${contentKey}: ${item.canonicalSource.format}`);
    }
    if (item.canonicalSource.sourceHashMethod !== "sha256-raw-bytes-v1") {
      fail(`Unsupported source hash method for ${contentKey}`);
    }
    if (!/^sha256:[0-9a-f]{64}$/.test(item.canonicalSource.sourceHash ?? "")) {
      fail(`Malformed sourceHash for ${contentKey}`);
    }

    const absolute = resolveSourcePath(courseRepo, sourcePath);
    if (!fs.existsSync(absolute)) fail(`Canonical source is missing: ${sourcePath}`);
    const bytes = fs.readFileSync(absolute);
    const actualHash = sha256(bytes);
    if (actualHash !== item.canonicalSource.sourceHash) {
      fail(
        `Source hash drift for ${sourcePath}: expected ${item.canonicalSource.sourceHash}, got ${actualHash}`,
      );
    }

    if (placement?.disposition === "mapped-current") {
      if (placement.decisionStatus !== "verified-current") {
        fail(`Mapped LMS item is not verified-current: ${contentKey}`);
      }
      const index = placement.lmsScriptIndex;
      if (typeof index !== "string" || !/^\d+\.\d+\.\d+$/.test(index)) {
        fail(`Mapped LMS item has invalid lmsScriptIndex: ${contentKey}`);
      }
      if (seenIndexes.has(index)) {
        fail(`Duplicate lmsScriptIndex ${index}: ${seenIndexes.get(index)} + ${contentKey}`);
      }
      seenIndexes.set(index, contentKey);
      mapped.push({ item, index, sourcePath, bytes });
    } else if (placement?.disposition === "excluded-current") {
      if (placement.decisionStatus !== "pending") {
        fail(`Excluded LMS item must remain pending: ${contentKey}`);
      }
      if (placement.lmsScriptIndex !== null) {
        fail(`Excluded LMS item must not have lmsScriptIndex: ${contentKey}`);
      }
      if (!placement.reason) fail(`Excluded LMS item must include a reason: ${contentKey}`);
      excluded.push({ item, sourcePath, bytes });
    } else {
      fail(`Unexpected LMS disposition for ${contentKey}: ${String(placement?.disposition)}`);
    }
  }

  if (mapped.length !== EXPECTED_MAPPED_COUNT) {
    fail(`Mapped-current count drift: expected ${EXPECTED_MAPPED_COUNT}, got ${mapped.length}`);
  }
  if (excluded.length !== EXPECTED_EXCLUDED_COUNT) {
    fail(`Excluded-current count drift: expected ${EXPECTED_EXCLUDED_COUNT}, got ${excluded.length}`);
  }

  return { mapped, excluded };
}

/** Remove only the canonical teleprompter wrapper and standalone pause cues. */
function transformTeleprompter(bytes, sourcePath) {
  const text = bytes.toString("utf8");
  const lines = text.split(/\r?\n/);
  if (lines.length < 7) fail(`Teleprompter source is too short: ${sourcePath}`);
  if (!lines[0].trim()) fail(`Teleprompter title is missing: ${sourcePath}`);
  if (lines[1] !== "" || lines[3] !== "" || lines[5] !== "") {
    fail(`Unexpected teleprompter header spacing: ${sourcePath}`);
  }
  if (!TELEPROMPTER_METADATA_PATTERN.test(lines[2])) {
    fail(`Unexpected teleprompter duration/word metadata: ${sourcePath}`);
  }
  if (!/^={10,}$/.test(lines[4])) fail(`Unexpected teleprompter divider: ${sourcePath}`);

  const body = lines.slice(6);
  const unsupportedAnnotations = new Set();
  const contentLines = [];
  for (const line of body) {
    const trimmed = line.trim();
    if (trimmed === PAUSE_ANNOTATION) continue;
    if (/^\[[^\]\r\n]+\]$/.test(trimmed)) unsupportedAnnotations.add(trimmed);
    contentLines.push(line.replace(/[ \t]+$/g, ""));
  }
  if (unsupportedAnnotations.size) {
    fail(
      `Unsupported bracket annotation(s) in ${sourcePath}: ${[...unsupportedAnnotations].join(", ")}`,
    );
  }

  const content = contentLines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
  if (!content) fail(`Learner content is empty after mechanical stripping: ${sourcePath}`);
  if (content.includes(PAUSE_ANNOTATION)) fail(`Pause annotation leaked from ${sourcePath}`);
  if (content.includes(lines[2]) || content.includes(lines[4])) {
    fail(`Learner-visible teleprompter metadata leaked from ${sourcePath}`);
  }
  return content;
}

/** Extract spoken learner content from the canonical week-00 safety source. */
function transformSafetyPreface(bytes, sourcePath) {
  const text = bytes.toString("utf8");
  const lines = text.split(/\r?\n/);
  if (lines.length < 12) fail(`Safety preface source is too short: ${sourcePath}`);
  if (!lines[0].startsWith("שיעור 0")) fail(`Unexpected safety preface title: ${sourcePath}`);
  if (!lines[1].startsWith("זמן:")) fail(`Unexpected safety duration metadata: ${sourcePath}`);
  if (!lines[2].startsWith("מטרה:")) fail(`Unexpected safety purpose metadata: ${sourcePath}`);
  if (lines[3] !== "" || lines[4] !== "---" || lines[5] !== "") {
    fail(`Unexpected safety preface header structure: ${sourcePath}`);
  }

  const metadataIndex = lines.findIndex(
    (line) => line.trim() === "[מטא-מידע לטלפרומפטר]",
  );
  if (metadataIndex < 0) fail(`Safety teleprompter metadata boundary is missing: ${sourcePath}`);

  const contentLines = [];
  for (const line of lines.slice(6, metadataIndex)) {
    const trimmed = line.trim();
    if (/^\[[^\]\r\n]+\]$/.test(trimmed)) continue;
    if (trimmed === "---") {
      contentLines.push("");
      continue;
    }
    contentLines.push(line.replace(/[ \t]+$/g, ""));
  }

  const content = contentLines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
  if (!content) fail(`Safety preface is empty after mechanical stripping: ${sourcePath}`);
  if (/\[[^\]\r\n]+\]/.test(content)) {
    fail(`Learner-visible safety teleprompter annotation leaked from ${sourcePath}`);
  }
  for (const required of ["1201", "sahar.org.il", "118", "050-2270118", "100", "101"]) {
    if (!content.includes(required)) fail(`Safety preface is missing required resource ${required}`);
  }
  return content;
}

function compareScriptIndex(left, right) {
  const a = left.split(".").map(Number);
  const b = right.split(".").map(Number);
  return a[0] - b[0] || a[1] - b[1] || a[2] - b[2];
}

function renderOutput(manifest, mapped, excluded) {
  const entries = mapped
    .map(({ item, index, sourcePath, bytes }) => {
      const content = transformTeleprompter(bytes, sourcePath);
      const words = content.split(/\s+/).filter(Boolean).length;
      return { contentKey: item.contentKey, index, sourcePath, content, words };
    })
    .sort((a, b) => compareScriptIndex(a.index, b.index));

  const totalWords = entries.reduce((sum, entry) => sum + entry.words, 0);
  const excludedKeys = excluded
    .map(({ item }) => item.contentKey)
    .sort()
    .join(", ");
  const banner = `/**
 * lessonContentData.ts — GENERATED FILE, do not edit by hand.
 *
 * Canonical source: omanut-hakesher-course/content/course-content-manifest.json
 * Curriculum: ${manifest.curriculumVersion} / ${manifest.courseKey}
 * Source aggregate: ${manifest.sourceAggregateHash}
 *
 * ${entries.length} mapped-current lessons, ~${totalWords.toLocaleString("en-US")} words.
 * ${excluded.length} excluded-current items intentionally omitted: ${excludedKeys}.
 * Keyed by placements.lms.lmsScriptIndex from the canonical manifest.
 */

export const LESSON_CONTENT: Record<string, string> = {
`;

  let body = "";
  for (const entry of entries) {
    body += `  // ${entry.index} | ${entry.contentKey} | ${entry.sourcePath} (${entry.words} words)\n`;
    body += `  ${JSON.stringify(entry.index)}: ${JSON.stringify(entry.content)},\n\n`;
  }

  const safety = excluded.find(({ item }) => item.contentKey === SAFETY_CONTENT_KEY);
  if (!safety) fail(`Canonical safety item is missing from excluded-current sources`);
  const safetyContent = transformSafetyPreface(safety.bytes, safety.sourcePath);
  const safetyOutput = `/**
 * course-safety-preface.ts — GENERATED FILE, do not edit by hand.
 * Canonical source: ${safety.sourcePath}
 * Source hash: ${safety.item.canonicalSource.sourceHash}
 */

export const COURSE_SAFETY_PREFACE_SOURCE_HASH = ${JSON.stringify(safety.item.canonicalSource.sourceHash)};
export const COURSE_SAFETY_PREFACE = ${JSON.stringify(safetyContent)};
`;

  return {
    output: banner + body + "};\n",
    safetyOutput,
    safetyContent,
    safetySourceHash: safety.item.canonicalSource.sourceHash,
    entries,
    totalWords,
  };
}

function build(courseRepo) {
  const manifestPath = path.join(courseRepo, "content", "course-content-manifest.json");
  if (!fs.existsSync(manifestPath)) fail(`Canonical manifest not found: ${manifestPath}`);
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  validateManifestShape(manifest);
  const { mapped, excluded } = validateAndLoadSources(courseRepo, manifest);
  const rendered = renderOutput(manifest, mapped, excluded);
  return { manifestPath, manifest, mapped, excluded, ...rendered };
}

function writeOrCheck(result, check) {
  if (check) {
    if (!fs.existsSync(GENERATED_OUTPUT)) fail(`Generated output is missing: ${GENERATED_OUTPUT}`);
    const current = fs.readFileSync(GENERATED_OUTPUT, "utf8");
    if (current !== result.output) {
      fail(
        `Generated output drift: ${GENERATED_OUTPUT}. Run node scripts/build-lesson-content.mjs`,
      );
    }
    if (!fs.existsSync(GENERATED_SAFETY_OUTPUT)) {
      fail(`Generated safety preface is missing: ${GENERATED_SAFETY_OUTPUT}`);
    }
    const currentSafety = fs.readFileSync(GENERATED_SAFETY_OUTPUT, "utf8");
    if (currentSafety !== result.safetyOutput) {
      fail(
        `Generated safety preface drift: ${GENERATED_SAFETY_OUTPUT}. Run node scripts/build-lesson-content.mjs`,
      );
    }
    console.log(`CHECK OK: ${GENERATED_OUTPUT}`);
    console.log(`CHECK OK: ${GENERATED_SAFETY_OUTPUT}`);
  } else {
    fs.writeFileSync(GENERATED_OUTPUT, result.output, "utf8");
    fs.mkdirSync(path.dirname(GENERATED_SAFETY_OUTPUT), { recursive: true });
    fs.writeFileSync(GENERATED_SAFETY_OUTPUT, result.safetyOutput, "utf8");
    console.log(`Wrote ${GENERATED_OUTPUT}`);
    console.log(`Wrote ${GENERATED_SAFETY_OUTPUT}`);
  }

  console.log(`Canonical manifest: ${result.manifestPath}`);
  console.log(`Source aggregate: ${result.manifest.sourceAggregateHash}`);
  console.log(
    `Lessons: ${result.entries.length} mapped-current | Excluded: ${result.excluded.length} | Total words: ${result.totalWords}`,
  );
  console.log(`Safety preface: generated separately from ${SAFETY_CONTENT_KEY}`);
}

function writeJson(file, value) {
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + "\n", "utf8");
}

function runSelfTest(courseRepo) {
  const base = build(courseRepo);
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "haderech-canonical-test-"));
  const tempCourse = path.join(tempRoot, "omanut-hakesher-course");
  fs.cpSync(path.join(courseRepo, "content"), path.join(tempCourse, "content"), {
    recursive: true,
  });
  fs.cpSync(path.join(courseRepo, "teleprompter"), path.join(tempCourse, "teleprompter"), {
    recursive: true,
  });

  const manifestPath = path.join(tempCourse, "content", "course-content-manifest.json");
  const originalManifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const firstMapped = originalManifest.items.find(
    (item) => item.placements.lms.disposition === "mapped-current",
  );

  const expectFailure = (label, mutate, pattern) => {
    fs.rmSync(tempCourse, { recursive: true, force: true });
    fs.cpSync(path.join(courseRepo, "content"), path.join(tempCourse, "content"), {
      recursive: true,
    });
    fs.cpSync(path.join(courseRepo, "teleprompter"), path.join(tempCourse, "teleprompter"), {
      recursive: true,
    });
    mutate(tempCourse);
    assert.throws(() => build(tempCourse), pattern, label);
  };

  expectFailure(
    "source hash drift must fail",
    (root) => {
      const file = resolveSourcePath(root, firstMapped.canonicalSource.path);
      fs.appendFileSync(file, "DRIFT", "utf8");
    },
    /Source hash drift/,
  );

  expectFailure(
    "missing canonical source must fail",
    (root) => fs.unlinkSync(resolveSourcePath(root, firstMapped.canonicalSource.path)),
    /Missing:|Canonical source is missing/,
  );

  expectFailure(
    "unexpected canonical source must fail",
    (root) => fs.writeFileSync(path.join(root, "teleprompter", "unexpected.txt"), "unexpected"),
    /Unexpected:/,
  );

  expectFailure(
    "duplicate lms mapping must fail",
    (root) => {
      const file = path.join(root, "content", "course-content-manifest.json");
      const manifest = JSON.parse(fs.readFileSync(file, "utf8"));
      const mapped = manifest.items.filter(
        (item) => item.placements.lms.disposition === "mapped-current",
      );
      mapped[1].placements.lms.lmsScriptIndex = mapped[0].placements.lms.lmsScriptIndex;
      writeJson(file, manifest);
    },
    /Duplicate lmsScriptIndex/,
  );

  expectFailure(
    "manifest aggregate drift must fail",
    (root) => {
      const file = path.join(root, "content", "course-content-manifest.json");
      const manifest = JSON.parse(fs.readFileSync(file, "utf8"));
      manifest.items[0].canonicalSource.path = manifest.items[0].canonicalSource.path.replace(
        ".txt",
        "-drift.txt",
      );
      writeJson(file, manifest);
    },
    /Manifest aggregate drift/,
  );

  const regenerated = build(courseRepo);
  assert.equal(regenerated.output, base.output, "canonical generation must be deterministic");
  assert.equal(
    regenerated.safetyOutput,
    base.safetyOutput,
    "canonical safety generation must be deterministic",
  );
  assert.equal(regenerated.entries.length, EXPECTED_MAPPED_COUNT);
  assert.equal(regenerated.excluded.length, EXPECTED_EXCLUDED_COUNT);
  assert.doesNotMatch(regenerated.output, /\[הפסקה\]/);
  assert.doesNotMatch(
    regenerated.output,
    /~\d+(?:\.\d+)? (?:דקות|דקה|שניות|שנייה) \| \d+(?:,\d{3})* מילים/,
  );
  assert.doesNotMatch(regenerated.output, /^={10,}$/m);
  assert.match(regenerated.safetyContent, /1201/);
  assert.match(regenerated.safetyContent, /sahar\.org\.il/);
  assert.match(regenerated.safetyContent, /050-2270118/);
  assert.doesNotMatch(regenerated.safetyContent, /מטא-מידע לטלפרומפטר/);
  assert.doesNotMatch(regenerated.safetyContent, /^\[[^\]]+\]$/m);

  fs.rmSync(tempRoot, { recursive: true, force: true });
  console.log("SELF-TEST OK: hash drift, missing, unexpected, duplicate mapping, aggregate drift");
}

try {
  const options = parseArgs(process.argv.slice(2));
  if (options.selfTest) runSelfTest(options.courseRepo);
  else writeOrCheck(build(options.courseRepo), options.check);
} catch (error) {
  console.error(`ERROR: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}
