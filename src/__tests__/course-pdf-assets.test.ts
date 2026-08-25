import { createElement } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import manifest from "../../scripts/course-pdf-manifest.json";
import { LessonPdfResource } from "@/components/lesson/lesson-pdf-resource";
import {
  getCoursePdfHref,
  getCoursePdfResource,
} from "@/lib/course-pdf-assets";

afterEach(cleanup);

describe("course PDF asset URLs", () => {
  it("builds a same-origin encoded URL for every shipped course PDF", () => {
    expect(manifest.files).toHaveLength(8);

    for (const file of manifest.files) {
      const href = getCoursePdfHref(file.fileName, "course-id", "lesson-id");
      expect(href).toBe(
        `/api/course-pdfs/course-id/lesson-id/${encodeURIComponent(file.fileName)}`,
      );
      expect(decodeURIComponent(href!.split("/").at(-1)!)).toBe(file.fileName);
      expect(getCoursePdfResource(file.fileName)).toEqual({
        fileName: file.fileName,
        displayTitle: file.displayTitle,
        scriptIndex: file.scriptIndex,
      });
    }
  });

  it.each([
    undefined,
    null,
    "",
    "../secret.pdf",
    "..\\secret.pdf",
    "/absolute.pdf",
    "https://example.com/file.pdf",
    "file.pdf?download=1",
    "file.pdf#page=1",
    "file%2fpayload.pdf",
    "file.PDF",
    ".pdf",
    "manifest.json",
    "מסמך_מחושב_מהשם.pdf",
    // Retired public name: it remains only as a fail-closed negative control.
    "חוזה_מחויבות_אישי.pdf",
    `decomposed-${"שׁ".normalize("NFD")}.pdf`,
  ])("rejects unsafe or ambiguous pdfUrl input: %s", (input) => {
    expect(getCoursePdfHref(input, "course-id", "lesson-id")).toBeNull();
  });

  it("rejects a missing course or lesson identifier", () => {
    const fileName = manifest.files[0].fileName;
    expect(getCoursePdfHref(fileName, "", "lesson-id")).toBeNull();
    expect(getCoursePdfHref(fileName, "course-id", "")).toBeNull();
  });

  it("renders an accessible same-origin download only for a safe pdfUrl", () => {
    const file = manifest.files[0];
    const fileName = file.fileName;
    render(
      createElement(LessonPdfResource, {
        pdfUrl: fileName,
        lessonTitle: "תרגול מסכם",
        courseId: "course-id",
        lessonId: "lesson-id",
      }),
    );

    const link = screen.getByRole("link", {
      name: `הורדת ${file.displayTitle} לשיעור תרגול מסכם, קובץ PDF`,
    });
    expect(link).toHaveAttribute(
      "href",
      `/api/course-pdfs/course-id/lesson-id/${encodeURIComponent(fileName)}`,
    );
    expect(link).toHaveAttribute("download", fileName);
    expect(link).toHaveAttribute("type", "application/pdf");
    expect(
      screen.getByRole("heading", { level: 2, name: file.displayTitle }),
    ).toBeInTheDocument();
  });

  it("renders nothing when pdfUrl is missing or unsafe", () => {
    const { rerender } = render(
      createElement(LessonPdfResource, {
        pdfUrl: undefined,
        lessonTitle: "שיעור",
        courseId: "course-id",
        lessonId: "lesson-id",
      }),
    );
    expect(screen.queryByRole("link")).not.toBeInTheDocument();

    rerender(
      createElement(LessonPdfResource, {
        pdfUrl: "../private.pdf",
        lessonTitle: "שיעור",
        courseId: "course-id",
        lessonId: "lesson-id",
      }),
    );
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
