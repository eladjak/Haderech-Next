import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const read = (relativePath: string) =>
  fs.readFileSync(path.resolve(process.cwd(), relativePath), "utf8");

const storiesApi = read("convex/stories.ts");
const reviewsApi = read("convex/reviews.ts");
const storiesPage = read("src/app/stories/page.tsx");
const storiesMetadata = read("src/app/stories/layout.tsx");
const testimonialsPage = read("src/app/testimonials/page.tsx");
const testimonialsMetadata = read("src/app/testimonials/layout.tsx");

describe("public proof containment", () => {
  it("keeps stories private until provenance and publication consent exist", () => {
    expect(storiesApi).toContain("VERIFIED_PUBLIC_STORIES_AVAILABLE = false");
    expect(storiesApi).toContain("STORY_SUBMISSION_AVAILABLE = false");
    expect(storiesApi).toMatch(
      /listApproved[\s\S]*if \(!VERIFIED_PUBLIC_STORIES_AVAILABLE\) return \[\]/u
    );
    expect(storiesApi).toMatch(
      /submitStory[\s\S]*if \(!STORY_SUBMISSION_AVAILABLE\)[\s\S]*publication-consent/u
    );
    expect(storiesApi).toContain("return stories.map(toPublicStory)");
    expect(storiesApi).not.toContain("return stories;\n  },\n});");
  });

  it("does not publish course reviews as marketing testimonials", () => {
    expect(reviewsApi).toContain("VERIFIED_PUBLIC_TESTIMONIALS_AVAILABLE = false");
    expect(reviewsApi).toMatch(
      /getFeaturedTestimonials[\s\S]*if \(!VERIFIED_PUBLIC_TESTIMONIALS_AVAILABLE\) return \[\]/u
    );
    expect(reviewsApi).toMatch(
      /getGlobalStats[\s\S]*totalReviews: 0, averageRating: 0, wouldRecommendPercent: 0/u
    );
  });

  it("states the public status without invented completion or outcome claims", () => {
    expect(storiesPage).toContain("לא נאסוף סיפורים חדשים");
    expect(storiesMetadata).toContain("אימות מקור");
    expect(testimonialsPage).toContain("משלימים מנגנון אימות והסכמה");
    expect(testimonialsMetadata).toContain("index: false");
    expect(testimonialsPage).not.toMatch(
      /כל ביקורת כאן נכתבה בידי תלמיד שסיים|הצטרף לאלפי הסטודנטים המרוצים|זמינים לצפייה מיידית/u
    );
  });
});
