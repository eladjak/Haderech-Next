import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const read = (relativePath: string) =>
  fs.readFileSync(path.resolve(process.cwd(), relativePath), "utf8");

describe("private progress contract", () => {
  it("never builds a social leaderboard by scanning every learner", () => {
    const source = read("convex/leaderboard.ts");
    const start = source.indexOf("export const getWeeklyLeaderboard");
    const end = source.indexOf("// Weekly Challenges");
    const progressQueries = source.slice(start, end);

    expect(start).toBeGreaterThan(-1);
    expect(end).toBeGreaterThan(start);
    expect(progressQueries).not.toContain('.query("users").collect()');
    expect(progressQueries).not.toContain("Promise.all(");
    expect(progressQueries.match(/return \[\];/g)).toHaveLength(3);
    expect(progressQueries).toContain('.withIndex("by_user"');
    expect(progressQueries).toContain('comparisonStatus: "unavailable"');

    const legacySource = read("convex/gamification.ts");
    const legacyStart = legacySource.indexOf("export const getLeaderboard");
    const legacyEnd = legacySource.indexOf("// Get all badges for a user");
    const legacyLeaderboard = legacySource.slice(legacyStart, legacyEnd);

    expect(legacyStart).toBeGreaterThan(-1);
    expect(legacyEnd).toBeGreaterThan(legacyStart);
    expect(legacyLeaderboard).not.toContain('.query("users")');
    expect(legacyLeaderboard).not.toContain("Promise.all(");
    expect(legacyLeaderboard).toContain('status: "unavailable"');
    expect(legacyLeaderboard).toContain("entries: []");
  });

  it("shows only the signed-in learner's activity and gives it human context", () => {
    const page = read("src/app/community/leaderboard/page.tsx");

    expect(page).toContain("ההתקדמות האישית שלי");
    expect(page).toContain("ה־XP אינו ציון לאיכות");
    expect(page).toContain("מה ה־XP כן אומר?");
    expect(page).toContain("לבחור צעד המשך");
    expect(page).toContain("api.leaderboard.getUserRank");
    expect(page).not.toContain("getWeeklyLeaderboard");
    expect(page).not.toContain("getMonthlyLeaderboard");
    expect(page).not.toContain("getAllTimeLeaderboard");
    expect(page).not.toContain("לוח הדירוגים");
    expect(page).not.toContain("ביחס לשאר הלומדים");
    expect(page).not.toContain("היה הראשון לצבור XP");

    const historicalStudentRoute = read(
      "src/app/student/leaderboard/page.tsx",
    );
    expect(historicalStudentRoute).toContain(
      'redirect("/community/leaderboard")',
    );
    expect(historicalStudentRoute).not.toContain("getLeaderboard");
    expect(historicalStudentRoute).not.toContain("לוח המובילים");

    const challenges = read("src/app/community/challenges/page.tsx");
    const rewards = read("src/app/community/rewards/page.tsx");
    const footer = read("src/components/layout/footer.tsx");
    const profile = read("src/app/student/profile/page.tsx");
    const pricing = read("src/lib/pricing.ts");
    for (const adjacentSurface of [
      challenges,
      rewards,
      footer,
      profile,
      pricing,
    ]) {
      expect(adjacentSurface).toContain("התקדמות אישית");
      expect(adjacentSurface).not.toContain("לוח דירוגים");
      expect(adjacentSurface).not.toContain("לוח מובילים");
      expect(adjacentSurface).not.toContain("טבלת מובילים");
    }
  });
});
