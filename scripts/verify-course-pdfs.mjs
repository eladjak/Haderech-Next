#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readFile, readdir, lstat } from "node:fs/promises";
import { dirname, basename, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(scriptDirectory, "..");

function readOption(name, fallback) {
  const index = process.argv.indexOf(name);
  if (index === -1) return fallback;
  const value = process.argv[index + 1];
  if (!value || value.startsWith("--")) {
    throw new Error(`Missing value for ${name}`);
  }
  return resolve(value);
}

const manifestPath = readOption(
  "--manifest",
  join(scriptDirectory, "course-pdf-manifest.json"),
);
const assetDirectory = readOption(
  "--asset-dir",
  join(repositoryRoot, "data", "course-pdfs"),
);
const seedPath = readOption(
  "--seed",
  join(repositoryRoot, "convex", "seedCourseData.ts"),
);
const sourceRoot = readOption(
  "--source-root",
  resolve(repositoryRoot, "..", "omanut-hakesher-course"),
);

const SAFE_PDF_FILE_NAME = /^[\p{L}\p{N}_-]+\.pdf$/u;
const SAFE_SOURCE_HTML = /^new-pdfs\/[\p{L}\p{N}_-]+\.html$/u;
const SHA_256 = /^[a-f0-9]{64}$/;
const SCRIPT_INDEX = /^\d{1,2}\.\d+\.\d+$/;
const RETIRED_FILE_NAMES = [
  "32_תרגילים_מדריך_מלא.pdf",
  "חוזה_מחויבות_אישי.pdf",
  "כלי_NVC_תקשורת.pdf",
  "מכתב_הסליחה.pdf",
  "מפת_כימיה_אישית.pdf",
  "שאלון_שפות_האהבה.pdf",
  "תבנית_דיווח_דייט.pdf",
  "תסריט_השיחה_אז_מה_אנחנו.pdf",
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function sha256(data) {
  return createHash("sha256").update(data).digest("hex");
}

function sorted(values) {
  return [...values].sort((a, b) => a.localeCompare(b, "he"));
}

function assertSameNames(actual, expected, label) {
  const actualSorted = sorted(actual);
  const expectedSorted = sorted(expected);
  assert(
    JSON.stringify(actualSorted) === JSON.stringify(expectedSorted),
    `${label} mismatch. Expected ${JSON.stringify(expectedSorted)}, got ${JSON.stringify(actualSorted)}`,
  );
}

function extractField(body, fieldName) {
  const match = body.match(new RegExp(`\\b${fieldName}\\s*:\\s*"([^"]+)"`));
  assert(match, `Seed PDF lesson is missing ${fieldName}`);
  return match[1];
}

function extractInteger(body, fieldName) {
  const match = body.match(new RegExp(`\\b${fieldName}\\s*:\\s*(\\d+)`));
  assert(match, `Seed PDF lesson is missing numeric ${fieldName}`);
  return Number(match[1]);
}

function parseActiveSeed(seed) {
  const activeStart = seed.indexOf("const HADERECH_MODULES");
  const activeEnd = seed.indexOf("// Archived, unpublished drafts");
  assert(activeStart >= 0 && activeEnd > activeStart, "Could not isolate active course modules in seed");
  const activeSeed = seed.slice(activeStart, activeEnd);
  const allScriptIndexes = [...activeSeed.matchAll(/\bscriptIndex\s*:\s*"([^"]+)"/g)].map(
    (match) => match[1],
  );
  assert(allScriptIndexes.length === 75, `Expected 75 active lessons, got ${allScriptIndexes.length}`);
  assert(new Set(allScriptIndexes).size === 75, "Active lesson scriptIndex values must be unique");

  const phaseNames = new Map(
    [...seed.matchAll(/^\s*(\d):\s*\{\s*name:\s*"([^"]+)"/gm)].map((match) => [
      Number(match[1]),
      match[2],
    ]),
  );
  assert(phaseNames.size === 6, `Expected 6 phase names, got ${phaseNames.size}`);

  const lines = activeSeed.split(/\r?\n/);
  const pdfLessons = [];
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    if (!/\bpdfUrl\s*:/.test(lines[lineIndex])) continue;

    let start = lineIndex;
    while (start >= 0 && !/^\s{6}\{$/.test(lines[start])) start -= 1;
    assert(start >= 0, `Could not find lesson object start before seed line ${lineIndex + 1}`);

    let end = lineIndex;
    while (end < lines.length && !/^\s{6}\},?$/.test(lines[end])) end += 1;
    assert(end < lines.length, `Could not find lesson object end after seed line ${lineIndex + 1}`);

    const body = lines.slice(start, end + 1).join("\n");
    const phaseNumber = extractInteger(body, "phaseNumber");
    const phaseReference = body.match(/\bphaseName\s*:\s*PHASES\[(\d)]\.name/);
    assert(phaseReference, `${extractField(body, "scriptIndex")}: seed phaseName must reference PHASES`);
    assert(Number(phaseReference[1]) === phaseNumber, `${extractField(body, "scriptIndex")}: phase reference mismatch`);

    pdfLessons.push({
      fileName: extractField(body, "pdfUrl"),
      title: extractField(body, "title"),
      scriptIndex: extractField(body, "scriptIndex"),
      weekNumber: extractInteger(body, "weekNumber"),
      phaseNumber,
      phaseName: phaseNames.get(phaseNumber),
    });
  }

  assert(pdfLessons.length === 8, `Expected exactly 8 active seed PDF associations, got ${pdfLessons.length}`);
  assert(new Set(pdfLessons.map((lesson) => lesson.fileName)).size === 8, "Seed PDF file names must be unique");
  assert(new Set(pdfLessons.map((lesson) => lesson.scriptIndex)).size === 8, "Seed PDF scriptIndex values must be unique");
  return { lessonCount: allScriptIndexes.length, phaseCount: phaseNames.size, pdfLessons };
}

function assertAssociations(files, pdfLessons) {
  const byScriptIndex = new Map(pdfLessons.map((lesson) => [lesson.scriptIndex, lesson]));
  assert(byScriptIndex.size === pdfLessons.length, "Seed association map is not unique");

  for (const entry of files) {
    const lesson = byScriptIndex.get(entry.scriptIndex);
    assert(lesson, `${entry.fileName}: scriptIndex ${entry.scriptIndex} does not exist in seed PDF lessons`);
    assert(lesson.fileName === entry.fileName, `${entry.fileName}: seed maps ${entry.scriptIndex} to ${lesson.fileName}`);
    assert(lesson.title === entry.lessonTitle, `${entry.fileName}: lessonTitle does not match seed title`);
    assert(lesson.weekNumber === entry.weekNumber, `${entry.fileName}: weekNumber does not match seed`);
    assert(lesson.phaseNumber === entry.phaseNumber, `${entry.fileName}: phaseNumber does not match seed`);
    assert(lesson.phaseName === entry.phaseName, `${entry.fileName}: phaseName does not match seed`);
  }
}

function runAssociationNegativeControl(files, pdfLessons) {
  const swapped = files.map((entry) => ({ ...entry }));
  [swapped[0].scriptIndex, swapped[1].scriptIndex] = [
    swapped[1].scriptIndex,
    swapped[0].scriptIndex,
  ];

  let rejected = false;
  try {
    assertAssociations(swapped, pdfLessons);
  } catch {
    rejected = true;
  }
  assert(rejected, "Association verifier accepted a scriptIndex permutation negative control");
  return rejected;
}

async function verify() {
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  assert(manifest.version === 2, "Unsupported course PDF manifest version");
  assert(/^\d{4}-\d{2}-\d{2}\.\d+$/.test(manifest.mappingVersion), "Invalid mappingVersion");
  assert(manifest.course?.courseKey === "haderech-current", "Unexpected courseKey");
  assert(manifest.course?.lessonCount === 75, "Manifest lessonCount must be 75");
  assert(manifest.course?.phaseCount === 6, "Manifest phaseCount must be 6");
  assert(Array.isArray(manifest.publicAliases) && manifest.publicAliases.length === 0, "Public PDF aliases are forbidden");
  assert(Array.isArray(manifest.files), "Manifest files must be an array");
  assert(manifest.files.length === 8, "Manifest must contain exactly 8 PDFs");

  const manifestNames = [];
  const seenNames = new Set();
  const seenIndexes = new Set();

  for (const entry of manifest.files) {
    assert(typeof entry.fileName === "string", "Every manifest entry needs fileName");
    assert(entry.fileName === entry.fileName.normalize("NFC"), `${entry.fileName}: fileName must be NFC`);
    assert(entry.fileName.length <= 160, `${entry.fileName}: fileName is too long`);
    assert(SAFE_PDF_FILE_NAME.test(entry.fileName), `${entry.fileName}: unsafe PDF fileName`);
    assert(basename(entry.fileName) === entry.fileName, `${entry.fileName}: path traversal is forbidden`);
    assert(!seenNames.has(entry.fileName), `${entry.fileName}: duplicate manifest entry`);
    assert(!RETIRED_FILE_NAMES.includes(entry.fileName), `${entry.fileName}: retired file name may not be active`);
    assert(typeof entry.displayTitle === "string" && entry.displayTitle.trim().length > 0, `${entry.fileName}: missing displayTitle`);
    assert(typeof entry.lessonTitle === "string" && entry.lessonTitle.trim().length > 0, `${entry.fileName}: missing lessonTitle`);
    assert(SCRIPT_INDEX.test(entry.scriptIndex), `${entry.fileName}: invalid scriptIndex`);
    assert(!seenIndexes.has(entry.scriptIndex), `${entry.fileName}: duplicate scriptIndex`);
    assert(Number.isInteger(entry.weekNumber) && entry.weekNumber >= 1 && entry.weekNumber <= 12, `${entry.fileName}: invalid weekNumber`);
    assert(Number.isInteger(entry.phaseNumber) && entry.phaseNumber >= 1 && entry.phaseNumber <= 6, `${entry.fileName}: invalid phaseNumber`);
    assert(typeof entry.phaseName === "string" && entry.phaseName.length > 0, `${entry.fileName}: missing phaseName`);
    assert(SAFE_SOURCE_HTML.test(entry.sourceHtml), `${entry.fileName}: unsafe sourceHtml`);
    assert(entry.sourceHtml === `new-pdfs/${entry.fileName.slice(0, -4)}.html`, `${entry.fileName}: sourceHtml/fileName mismatch`);
    assert(Number.isSafeInteger(entry.sourceBytes) && entry.sourceBytes > 0, `${entry.fileName}: invalid source byte count`);
    assert(SHA_256.test(entry.sourceSha256), `${entry.fileName}: invalid source SHA-256`);
    assert(Number.isSafeInteger(entry.bytes) && entry.bytes > 0, `${entry.fileName}: invalid byte count`);
    assert(SHA_256.test(entry.sha256), `${entry.fileName}: invalid SHA-256`);
    seenNames.add(entry.fileName);
    seenIndexes.add(entry.scriptIndex);
    manifestNames.push(entry.fileName);
  }

  const seed = await readFile(seedPath, "utf8");
  const parsedSeed = parseActiveSeed(seed);
  assert(parsedSeed.lessonCount === manifest.course.lessonCount, "Seed/manifest lessonCount mismatch");
  assert(parsedSeed.phaseCount === manifest.course.phaseCount, "Seed/manifest phaseCount mismatch");
  assertSameNames(
    parsedSeed.pdfLessons.map((lesson) => lesson.fileName),
    manifestNames,
    "seedCourseData PDF file set",
  );
  assertAssociations(manifest.files, parsedSeed.pdfLessons);
  const swappedScriptIndexRejected = runAssociationNegativeControl(manifest.files, parsedSeed.pdfLessons);

  for (const retiredName of RETIRED_FILE_NAMES) {
    assert(!seed.includes(retiredName), `Active seed still references retired PDF ${retiredName}`);
  }

  const directoryEntries = await readdir(assetDirectory, { withFileTypes: true });
  const assetNames = directoryEntries
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".pdf"))
    .map((entry) => entry.name);
  const unsafeEntries = directoryEntries.filter(
    (entry) => entry.isSymbolicLink() || (entry.name.toLowerCase().endsWith(".pdf") && !entry.isFile()),
  );
  assert(unsafeEntries.length === 0, "Protected asset directory must not contain PDF symlinks or non-file PDF entries");
  assertSameNames(assetNames, manifestNames, "protected course PDF asset set");

  const publicPdfDirectory = join(repositoryRoot, "public", "pdfs");
  try {
    const publicEntries = await readdir(publicPdfDirectory, { withFileTypes: true });
    const exposedPdfs = publicEntries.filter((entry) => entry.name.toLowerCase().endsWith(".pdf"));
    assert(exposedPdfs.length === 0, "Paid course PDFs must not exist under public/pdfs");
  } catch (error) {
    const code = error && typeof error === "object" && "code" in error ? error.code : null;
    if (code !== "ENOENT") throw error;
  }

  const verifiedFiles = [];
  const resolvedAssetDirectory = resolve(assetDirectory);
  const resolvedSourceRoot = resolve(sourceRoot);

  for (const entry of manifest.files) {
    const sourcePath = resolve(sourceRoot, entry.sourceHtml);
    assert(sourcePath.startsWith(`${resolvedSourceRoot}${sep}`), `${entry.fileName}: source resolved outside source root`);
    const sourceStats = await lstat(sourcePath);
    assert(sourceStats.isFile() && !sourceStats.isSymbolicLink(), `${entry.fileName}: source must be a regular file`);
    const source = await readFile(sourcePath);
    const sourceText = source.toString("utf8");
    assert(source.length === entry.sourceBytes, `${entry.fileName}: expected ${entry.sourceBytes} source bytes, got ${source.length}`);
    assert(sha256(source) === entry.sourceSha256, `${entry.fileName}: source SHA-256 mismatch`);
    assert(sourceText.includes(entry.displayTitle), `${entry.fileName}: source does not contain displayTitle`);
    assert(sourceText.includes(`שיעור ${entry.scriptIndex}`), `${entry.fileName}: source does not declare lesson ${entry.scriptIndex}`);
    assert(sourceText.includes(`שבוע ${entry.weekNumber}`), `${entry.fileName}: source does not declare week ${entry.weekNumber}`);
    assert(sourceText.includes(`שלב ${entry.phaseNumber}`), `${entry.fileName}: source does not declare phase ${entry.phaseNumber}`);

    const filePath = resolve(assetDirectory, entry.fileName);
    assert(filePath.startsWith(`${resolvedAssetDirectory}${sep}`), `${entry.fileName}: resolved outside protected asset directory`);
    const fileStats = await lstat(filePath);
    assert(fileStats.isFile() && !fileStats.isSymbolicLink(), `${entry.fileName}: must be a regular file`);
    const data = await readFile(filePath);
    const digest = sha256(data);
    assert(data.length === entry.bytes, `${entry.fileName}: expected ${entry.bytes} bytes, got ${data.length}`);
    assert(digest === entry.sha256, `${entry.fileName}: SHA-256 mismatch`);
    assert(data.subarray(0, 5).toString("ascii") === "%PDF-", `${entry.fileName}: missing PDF header`);
    assert(data.subarray(Math.max(0, data.length - 1024)).includes(Buffer.from("%%EOF")), `${entry.fileName}: missing PDF EOF marker`);
    verifiedFiles.push({
      fileName: entry.fileName,
      displayTitle: entry.displayTitle,
      scriptIndex: entry.scriptIndex,
      lessonTitle: entry.lessonTitle,
      weekNumber: entry.weekNumber,
      phaseNumber: entry.phaseNumber,
      phaseName: entry.phaseName,
      bytes: data.length,
      sha256: digest,
      sourceHtml: entry.sourceHtml,
      sourceSha256: entry.sourceSha256,
    });
  }

  return {
    ok: true,
    manifestVersion: manifest.version,
    mappingVersion: manifest.mappingVersion,
    lessonCount: parsedSeed.lessonCount,
    phaseCount: parsedSeed.phaseCount,
    count: verifiedFiles.length,
    totalBytes: verifiedFiles.reduce((sum, file) => sum + file.bytes, 0),
    assetDirectory,
    sourceRoot,
    negativeControls: { swappedScriptIndexRejected },
    files: verifiedFiles,
  };
}

try {
  console.log(JSON.stringify(await verify(), null, 2));
} catch (error) {
  console.error(
    JSON.stringify(
      {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      },
      null,
      2,
    ),
  );
  process.exitCode = 1;
}
