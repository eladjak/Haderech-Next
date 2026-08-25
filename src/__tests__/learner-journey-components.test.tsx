import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CourseJourneyGuide } from "@/components/course/course-journey-guide";
import { LessonCompleteButton } from "@/components/course/lesson-complete-button";
import { LessonNav } from "@/components/course/lesson-nav";
import { EnrollButton } from "@/components/course/enroll-button";
import { PrivateWeeklyReflection } from "@/components/dashboard/private-weekly-reflection";
import { GET as getCertificateShareImage } from "@/app/api/og/route";
import type { Id } from "@/../convex/_generated/dataModel";

afterEach(cleanup);

describe("learner journey components", () => {
  it("renders the course scope and a concrete enrolled next step", () => {
    render(
      <CourseJourneyGuide
        lessonCount={75}
        isEnrolled
        continueHref="/courses/course-1/learn?lesson=lesson-2"
      />
    );

    expect(
      screen.getByRole("heading", {
        name: "מסלול מסודר, עם מקום לבחור את הקצב",
      })
    ).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("6")).toBeInTheDocument();
    expect(screen.getByText("75")).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();
    expect(
      screen.getByRole("list", { name: "ששת שלבי הלמידה בקורס" })
    ).toBeInTheDocument();
    expect(screen.getAllByRole("img")).toHaveLength(6);
    for (const phase of [
      "גישה",
      "תקשורת",
      "מעבר ומשיכה",
      "חיבור וכימיה",
      "אינטימיות",
      "מחויבות",
    ]) {
      expect(screen.getByRole("heading", { name: phase })).toBeInTheDocument();
    }
    expect(screen.getByRole("link", { name: /לצעד הבא שלי/u })).toHaveAttribute(
      "href",
      "/courses/course-1/learn?lesson=lesson-2"
    );
  });

  it("keeps lesson completion retryable when persistence fails", async () => {
    const onMarkComplete = vi
      .fn<() => Promise<void>>()
      .mockRejectedValueOnce(new Error("offline"));

    render(
      <LessonCompleteButton
        isCompleted={false}
        onMarkComplete={onMarkComplete}
      />
    );

    const button = screen.getByRole("button", { name: "סיימתי את השיעור" });
    fireEvent.click(button);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "לא הצלחנו לשמור את ההשלמה. אפשר לנסות שוב."
    );
    expect(onMarkComplete).toHaveBeenCalledTimes(1);
    expect(button).toBeEnabled();
  });

  it("shows position and named previous/next destinations", () => {
    render(
      <LessonNav
        courseId={"course-1" as Id<"courses">}
        courseTitle="אומנות הקשר"
        currentIndex={4}
        totalLessons={75}
        prevLesson={{
          _id: "lesson-4" as Id<"lessons">,
          title: "השיעור הקודם",
        }}
        nextLesson={{
          _id: "lesson-6" as Id<"lessons">,
          title: "השיעור הבא",
        }}
      />
    );

    expect(
      screen.getByRole("progressbar", {
        name: "מיקום במסלול: שיעור 5 מתוך 75",
      })
    ).toHaveAttribute("aria-valuenow", "5");
    expect(
      screen.getByRole("link", { name: "שיעור קודם: השיעור הקודם" })
    ).toHaveAttribute(
      "href",
      "/courses/course-1/lessons/lesson-4"
    );
    expect(
      screen.getByRole("link", { name: "שיעור הבא: השיעור הבא" })
    ).toHaveAttribute(
      "href",
      "/courses/course-1/lessons/lesson-6"
    );
  });

  it("keeps the weekly reflection ephemeral and copies only on request", async () => {
    const writeText = vi.fn<(_: string) => Promise<void>>().mockResolvedValue();
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    render(<PrivateWeeklyReflection />);

    expect(
      screen.getByText(/אינה נשמרת בחשבון, אינה נשלחת ל-AI/u)
    ).toBeInTheDocument();
    const copyButton = screen.getByRole("button", { name: "להעתיק לעצמי" });
    expect(copyButton).toBeDisabled();

    fireEvent.change(screen.getByLabelText("מה הבנתי השבוע?"), {
      target: { value: "אפשר לעצור ולבדוק מה מתאים לי." },
    });
    expect(copyButton).toBeEnabled();
    fireEvent.click(copyButton);

    await waitFor(() => expect(writeText).toHaveBeenCalledTimes(1));
    expect(writeText.mock.calls[0]?.[0]).toContain(
      "אפשר לעצור ולבדוק מה מתאים לי."
    );
    expect(
      await screen.findByText(/הסיכום הועתק/u)
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "לנקות" }));
    expect(screen.getByLabelText("מה הבנתי השבוע?")).toHaveValue("");
  });

  it("explains that removing a saved course deletes progress before acting", async () => {
    const onUnenroll = vi.fn<() => Promise<void>>().mockResolvedValue();
    render(
      <EnrollButton
        isEnrolled
        onUnenroll={onUnenroll}
      />
    );

    fireEvent.click(
      screen.getByRole("button", { name: "הסר את הקורס מהחשבון" })
    );
    expect(onUnenroll).not.toHaveBeenCalled();
    expect(
      screen.getByText(/תמחק גם את ההתקדמות/u)
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "כן, להסיר ולמחוק התקדמות" })
    );
    await waitFor(() => expect(onUnenroll).toHaveBeenCalledTimes(1));
  });

  it("does not mint certificate-looking share images from query parameters", async () => {
    const response = await getCertificateShareImage();
    expect(response.status).toBe(410);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toMatchObject({
      error: "certificate_share_image_unavailable",
    });
  });
});
