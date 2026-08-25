import "server-only";

import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve, sep } from "node:path";
import manifest from "../../scripts/course-pdf-manifest.json";

type CoursePdfManifestEntry = (typeof manifest.files)[number];

const entries = new Map(
  manifest.files.map((entry) => [entry.fileName, entry] as const),
);
const assetDirectory = resolve(process.cwd(), "data", "course-pdfs");

export function getCoursePdfManifestEntry(
  fileName: string,
): CoursePdfManifestEntry | null {
  if (fileName !== fileName.normalize("NFC")) return null;
  return entries.get(fileName) ?? null;
}

export async function readVerifiedCoursePdf(
  entry: CoursePdfManifestEntry,
): Promise<ArrayBuffer> {
  const filePath = resolve(assetDirectory, entry.fileName);
  if (!filePath.startsWith(`${assetDirectory}${sep}`)) {
    throw new Error("COURSE_PDF_PATH_INVALID");
  }

  const data = await readFile(filePath);
  const sha256 = createHash("sha256").update(data).digest("hex");
  if (data.length !== entry.bytes || sha256 !== entry.sha256) {
    throw new Error("COURSE_PDF_INTEGRITY_FAILED");
  }
  if (
    data.subarray(0, 5).toString("ascii") !== "%PDF-" ||
    !data.subarray(Math.max(0, data.length - 1024)).includes(Buffer.from("%%EOF"))
  ) {
    throw new Error("COURSE_PDF_FORMAT_INVALID");
  }

  return Uint8Array.from(data).buffer;
}
