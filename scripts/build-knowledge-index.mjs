// build-knowledge-index.mjs — Build the RAG index for the Smart Advisor.
//
// Mirrors the proven zehut-site pattern (build-book-index.mjs → bookRetrieval):
// paragraph-aware chunking + gemini-embedding-001 (768 dims, free tier).
// Here the index is imported into the Convex `knowledgeChunks` table (native
// vectorIndex) instead of a bundled JSON, because the advisor runs in a
// Convex action (ctx.vectorSearch).
//
// Corpus (~120K words of Elad's 15-year אומנות-הקשר knowledge):
//   1. The 75 course lessons  — fetched from the target Convex deployment
//   2. The book (13 chapters) — ~/projects/omanut-hakesher-book/chapters/*.md
//   3. Week summaries (12)    — OneDrive _ידע_מעובד/שבוע_*_סיכום.md
//
// Output: scripts/out/knowledge-chunks.jsonl  (one JSON doc per line)
// Import: npx convex import --table knowledgeChunks scripts/out/knowledge-chunks.jsonl --replace
//
// Run:
//   GEMINI_API_KEY=$(npx convex env get GEMINI_API_KEY) \
//     node scripts/build-knowledge-index.mjs [--url https://<deployment>.convex.cloud] [--dry-run]

import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const args = process.argv.slice(2);
const urlIdx = args.indexOf("--url");
const CONVEX_URL =
  urlIdx > -1 ? args[urlIdx + 1] : "https://colorless-guanaco-894.convex.cloud";
const DRY_RUN = args.includes("--dry-run");

const KEY = process.env.GEMINI_API_KEY;
if (!KEY && !DRY_RUN) {
  console.error("GEMINI_API_KEY missing (try: npx convex env get GEMINI_API_KEY)");
  process.exit(1);
}

const BOOK_DIR = join(process.env.USERPROFILE ?? "", "projects", "omanut-hakesher-book", "chapters");
const SUMMARIES_DIR = join(
  process.env.USERPROFILE ?? "",
  "OneDrive",
  "עסקים",
  "אומנות הקשר כאן ועכשיו",
  "מסמכי קורס דרך חדשה",
  "_ידע_מעובד"
);
const OUT_DIR = join(__dirname, "out");
const OUT = join(OUT_DIR, "knowledge-chunks.jsonl");

const CHUNK = 1100;
const OVERLAP = 150;
const DIMS = 768;
const COURSE_TITLE = "הדרך - אומנות הקשר";

// ---------------------------------------------------------------- helpers

function clean(raw) {
  return raw
    .replace(/\r\n/g, "\n") // Windows CRLF -> LF (else paragraph split fails)
    .replace(/[‎‏‪-‮⁦-⁩﻿]/g, "")
    .replace(/\f/g, "\n\n")
    .replace(/\n{3,}/g, "\n\n");
}

/** Hard-split any chunk that still exceeds the embed-friendly budget. */
function hardSplit(chunks, max = 1600) {
  const out = [];
  for (const c of chunks) {
    if (c.length <= max) {
      out.push(c);
      continue;
    }
    // split on sentence-ish boundaries
    let buf = "";
    for (const part of c.split(/(?<=[.!?׃:])\s+/)) {
      if (buf.length + part.length + 1 > max && buf.length > 200) {
        out.push(buf);
        buf = part;
      } else {
        buf = buf ? buf + " " + part : part;
      }
    }
    if (buf.trim().length > 80) out.push(buf);
  }
  return out;
}

/** Paragraph-aware chunking with overlap (zehut-proven). */
function chunkText(text) {
  const paras = text.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
  const chunks = [];
  let buf = "";
  for (const p of paras) {
    if (buf.length + p.length + 1 > CHUNK && buf.length > 300) {
      chunks.push(buf);
      buf = buf.slice(-OVERLAP) + "\n" + p;
    } else {
      buf = buf ? buf + "\n" + p : p;
    }
  }
  if (buf.trim().length > 100) chunks.push(buf);
  return chunks.map((c) => c.replace(/\n{2,}/g, "\n").trim());
}

async function embedBatch(texts) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:batchEmbedContents?key=${KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requests: texts.map((t) => ({
          model: "models/gemini-embedding-001",
          content: { parts: [{ text: t }] },
          taskType: "RETRIEVAL_DOCUMENT",
          outputDimensionality: DIMS,
        })),
      }),
    }
  );
  if (!res.ok) throw new Error(`embed ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  return data.embeddings.map((e) => e.values);
}

async function convexQuery(path, fnArgs) {
  const res = await fetch(`${CONVEX_URL}/api/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path, args: fnArgs, format: "json" }),
  });
  const body = await res.json();
  if (body.status !== "success") throw new Error(`${path}: ${JSON.stringify(body).slice(0, 200)}`);
  return body.value;
}

// ---------------------------------------------------------------- corpus

/** docs: [{ ref, source, title, weekNumber?, phaseNumber?, lessonOrder?, text }] */
const docs = [];

// 1) Course lessons — from the deployment (title/week/phase/content all live there)
console.log(`Fetching lessons from ${CONVEX_URL} ...`);
const courses = await convexQuery("courses:listPublished", {});
const course = courses.find((c) => c.title === COURSE_TITLE);
if (!course) {
  console.error(`Course "${COURSE_TITLE}" not found on ${CONVEX_URL}`);
  process.exit(1);
}
const lessons = await convexQuery("lessons:listByCourse", { courseId: course._id });
let lessonDocs = 0;
for (const lesson of lessons) {
  if (!lesson.content) continue;
  docs.push({
    ref: `שיעור ${lesson.order + 1}: ${lesson.title}`,
    source: "lesson",
    title: lesson.title,
    weekNumber: lesson.weekNumber,
    phaseNumber: lesson.phaseNumber,
    lessonOrder: lesson.order,
    text: lesson.content,
  });
  lessonDocs++;
}
console.log(`  lessons with content: ${lessonDocs}`);

// 2) The book — chapters + intro + closing + exercises appendix
const BOOK_LABEL = 'הספר "אומנות הקשר"';
if (existsSync(BOOK_DIR)) {
  const files = readdirSync(BOOK_DIR).filter(
    (f) => f.endsWith(".md") && !f.includes("table-of-contents") && !f.includes(".bak")
  );
  for (const file of files) {
    const raw = clean(readFileSync(join(BOOK_DIR, file), "utf8"));
    const heading = raw.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? file.replace(".md", "");
    docs.push({
      ref: `${BOOK_LABEL} — ${heading}`,
      source: "book",
      title: heading,
      text: raw,
    });
  }
  console.log(`  book files: ${files.length}`);
} else {
  console.warn(`  book dir missing: ${BOOK_DIR} (skipping)`);
}

// 3) Processed week summaries (distilled course knowledge)
if (existsSync(SUMMARIES_DIR)) {
  const files = readdirSync(SUMMARIES_DIR).filter((f) => /^שבוע_\d+_סיכום\.md$/.test(f));
  for (const file of files) {
    const week = Number(file.match(/\d+/)?.[0] ?? 0);
    const raw = clean(readFileSync(join(SUMMARIES_DIR, file), "utf8"));
    const heading = raw.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? `שבוע ${week}`;
    docs.push({
      ref: `סיכום ${heading}`,
      source: "summary",
      title: heading,
      weekNumber: week,
      text: raw,
    });
  }
  console.log(`  week summaries: ${files.length}`);
} else {
  console.warn(`  summaries dir missing: ${SUMMARIES_DIR} (skipping)`);
}

// ---------------------------------------------------------------- chunk + embed

const records = [];
for (const doc of docs) {
  const chunks = hardSplit(chunkText(clean(doc.text)));
  chunks.forEach((text, i) => {
    records.push({
      ref: doc.ref,
      source: doc.source,
      title: doc.title,
      ...(doc.weekNumber !== undefined ? { weekNumber: doc.weekNumber } : {}),
      ...(doc.phaseNumber !== undefined ? { phaseNumber: doc.phaseNumber } : {}),
      ...(doc.lessonOrder !== undefined ? { lessonOrder: doc.lessonOrder } : {}),
      text,
      chunkIndex: i,
    });
  });
}
console.log(`Total: ${docs.length} docs -> ${records.length} chunks`);

if (DRY_RUN) {
  console.log("Dry run — not embedding.");
  process.exit(0);
}

const BATCH = 90;
for (let i = 0; i < records.length; i += BATCH) {
  const batch = records.slice(i, i + BATCH);
  const vecs = await embedBatch(batch.map((r) => r.text));
  batch.forEach((r, j) => {
    r.embedding = vecs[j].map((v) => Math.round(v * 1e4) / 1e4);
  });
  console.log(`  embedded ${Math.min(i + BATCH, records.length)}/${records.length}`);
  await new Promise((r) => setTimeout(r, 800)); // gentle on free tier
}

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT, records.map((r) => JSON.stringify(r)).join("\n"), "utf8");
console.log(
  `WROTE ${OUT}: ${records.length} chunks (${(records.reduce((s, r) => s + JSON.stringify(r).length, 0) / 1e6).toFixed(1)}MB)`
);
console.log(`Next: npx convex import --table knowledgeChunks "${OUT}" --replace`);
