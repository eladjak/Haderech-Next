import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const read = (relativePath: string) =>
  fs.readFileSync(path.resolve(process.cwd(), relativePath), "utf8");

describe("private progress and gamification containment", () => {
  it("hard-disables ranking, weekly point challenges and reward redemption", () => {
    const source = read("convex/leaderboard.ts");

    expect(source).toContain("publicRanking: false");
    expect(source).toContain("xpStatus: false");
    expect(source).toContain("weeklyChallenges: false");
    expect(source).toContain("rewardShop: false");
    expect(source).toContain("privateLessonProgress: true");
    expect(source).toContain("privateMasteryFeedback: true");
    expect(source).toContain("WEEKLY_XP_CHALLENGES_DISABLED");
    expect(source).toContain("XP_REWARD_REDEMPTION_DISABLED");
    expect(source).not.toContain('insert("xpEvents"');
    expect(source).not.toContain('insert("rewardRedemptions"');
  });

  it("removes coercive challenge and unapproved reward promises", () => {
    const source = read("convex/leaderboard.ts");
    for (const forbidden of [
      "share_success_story",
      "simulator_grade_a",
      "streak_7_days",
      "coach_call_15min",
      "bonus_lesson_access",
      "course_discount_10",
      "excellence_certificate",
    ]) {
      expect(source).not.toContain(forbidden);
    }
  });

  it("keeps active learner surfaces factual and private", () => {
    const surfaces = [
      read("src/app/dashboard/page.tsx"),
      read("src/app/student/dashboard/page.tsx"),
      read("src/app/student/profile/page.tsx"),
      read("src/app/community/leaderboard/page.tsx"),
      read("src/app/community/challenges/page.tsx"),
      read("src/app/community/rewards/page.tsx"),
      read("src/components/dashboard/learning-stats.tsx"),
    ];

    for (const surface of surfaces) {
      expect(surface).not.toMatch(/\bXP\b/u);
      expect(surface).not.toContain("StreakCard");
      expect(surface).not.toContain("נתח תמונות");
    }
    expect(surfaces.join("\n")).toContain("התקדמות אישית");
    expect(surfaces.join("\n")).toContain("שיעורים");
  });

  it("does not award status points for onboarding or via the legacy writer", () => {
    const onboarding = read("convex/onboarding.ts");
    const gamification = read("convex/gamification.ts");
    expect(onboarding).not.toContain('insert("xpEvents"');
    expect(onboarding).not.toContain("onboarding_complete");
    expect(gamification).toContain("XP_AWARDS_DISABLED");
    expect(gamification.match(/XP_STATUS_DISABLED/g)).toHaveLength(3);
    expect(gamification).toContain("LEARNING_STREAK_STATUS_DISABLED");
    expect(gamification.match(/GAMIFIED_BADGES_DISABLED/g)).toHaveLength(2);
  });
});
