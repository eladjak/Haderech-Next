import manifest from "../../scripts/course-pdf-manifest.json";

const SAFE_COURSE_PDF_FILE_NAME = /^[\p{L}\p{N}_-]+\.pdf$/u;

export interface CoursePdfResource {
  fileName: string;
  displayTitle: string;
  scriptIndex: string;
}

const resources = new Map<string, CoursePdfResource>(
  manifest.files.map((entry) => [
    entry.fileName,
    {
      fileName: entry.fileName,
      displayTitle: entry.displayTitle,
      scriptIndex: entry.scriptIndex,
    },
  ]),
);

/**
 * Resolve learner-facing PDF metadata from the versioned association contract.
 * Display titles are never inferred from file names.
 */
export function getCoursePdfResource(
  pdfUrl: string | null | undefined,
): CoursePdfResource | null {
  if (!pdfUrl || pdfUrl.length > 160) return null;
  if (pdfUrl !== pdfUrl.normalize("NFC")) return null;
  if (!SAFE_COURSE_PDF_FILE_NAME.test(pdfUrl)) return null;
  return resources.get(pdfUrl) ?? null;
}

/**
 * Convert a database pdfUrl file name to a same-origin static asset URL.
 *
 * pdfUrl is data, not a trusted URL. Only an NFC-normalized basename present in
 * the versioned manifest is accepted. Slashes, percent escapes, query strings,
 * fragments, protocols, dot segments and unknown/retired names fail closed.
 */
export function getCoursePdfHref(
  pdfUrl: string | null | undefined,
  courseId: string,
  lessonId: string,
): string | null {
  if (!courseId || !lessonId) return null;
  const resource = getCoursePdfResource(pdfUrl);
  if (!resource) return null;

  return `/api/course-pdfs/${encodeURIComponent(courseId)}/${encodeURIComponent(lessonId)}/${encodeURIComponent(resource.fileName)}`;
}
