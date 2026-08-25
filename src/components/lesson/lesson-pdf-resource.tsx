import {
  getCoursePdfHref,
  getCoursePdfResource,
} from "@/lib/course-pdf-assets";

interface LessonPdfResourceProps {
  pdfUrl?: string | null;
  lessonTitle: string;
  courseId: string;
  lessonId: string;
}

export function LessonPdfResource({
  pdfUrl,
  lessonTitle,
  courseId,
  lessonId,
}: LessonPdfResourceProps) {
  const resource = getCoursePdfResource(pdfUrl);
  const href = getCoursePdfHref(pdfUrl, courseId, lessonId);
  if (!href || !resource) return null;

  return (
    <section
      className="mb-8 rounded-2xl border border-brand-200 bg-brand-50 p-5 dark:border-brand-700 dark:bg-zinc-900/50"
      aria-label="חומר נלווה לשיעור"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-brand-700 shadow-sm dark:bg-zinc-900 dark:text-brand-300"
            aria-hidden="true"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.75}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5A3.375 3.375 0 0010.125 2.25H8.25m0 12.75h7.5m-7.5 3h7.5M10.5 2.25H5.625A1.125 1.125 0 004.5 3.375v17.25a1.125 1.125 0 001.125 1.125h12.75a1.125 1.125 0 001.125-1.125V11.625A9.375 9.375 0 0010.5 2.25z"
              />
            </svg>
          </span>
          <div>
            <h2 className="font-semibold text-zinc-950 dark:text-white">
              {resource.displayTitle}
            </h2>
            <p className="mt-1 text-sm leading-6 text-zinc-700 dark:text-zinc-300">
              קובץ PDF נלווה שאפשר להוריד, לשמור או להדפיס.
            </p>
          </div>
        </div>

        <a
          href={href}
          download={resource.fileName}
          type="application/pdf"
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-brand-600 dark:bg-brand-500 dark:hover:bg-brand-400 dark:focus-visible:outline-brand-300"
          aria-label={`הורדת ${resource.displayTitle} לשיעור ${lessonTitle}, קובץ PDF`}
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-4.5-6L12 15m0 0l-4.5-4.5M12 15V3"
            />
          </svg>
          <span>הורדת הקובץ</span>
          <span className="text-xs font-normal text-white" aria-hidden="true">
            PDF
          </span>
        </a>
      </div>
    </section>
  );
}
