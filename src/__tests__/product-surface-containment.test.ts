import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const read = (relativePath: string) =>
  fs.readFileSync(path.resolve(process.cwd(), relativePath), "utf8");

describe("unverified LMS product surfaces", () => {
  it("keeps mentoring listings and new bookings fail-closed", () => {
    const api = read("convex/mentoring.ts");
    const page = read("src/app/mentoring/page.tsx");
    expect(api).toContain("VERIFIED_MENTORING_AVAILABLE = false");
    expect(api).toMatch(/listMentors[\s\S]*if \(!VERIFIED_MENTORING_AVAILABLE\) return \[\]/u);
    expect(api).toMatch(/bookSession[\s\S]*Mentoring booking is unavailable/u);
    expect(page).toContain("לא נאסוף בקשות או הערות לפגישה");
    expect(page).not.toContain("הכוונה אישית ממאמנים מנוסים");
  });

  it("treats the dating-profile number as field completion, not performance", () => {
    const api = read("convex/datingProfile.ts");
    const page = read("src/app/tools/dating-profile/page.tsx");
    const preview = read("src/components/tools/profile-preview.tsx");
    expect(api).toContain("Dating profile is available to adults only");
    expect(api).not.toMatch(/40% לעומת|60%|פי 3 יותר|עשירייה העליונה/u);
    expect(page).toContain("מדד מילוי טיוטה");
    expect(page).toContain("הטיוטה נשמרת בחשבון");
    expect(page).toContain("לא ציון איכות ולא תחזית להתאמות");
    expect(preview).toContain("מילוי טיוטה");
    expect(preview).not.toContain("ציון פרופיל");
  });

  it("does not label AI or simulator history as a human coach or personal score", () => {
    const feed = read("convex/activityFeed.ts");
    const sidebar = read("src/components/chat/chat-sidebar.tsx");
    const chatApi = read("convex/chat.ts");
    const chatPage = read("src/app/chat/page.tsx");
    expect(feed).toContain("תרגיל עם דמות AI בדיונית");
    expect(feed).not.toContain("ציון ${sim.score}");
    expect(feed).not.toContain('coach: "מאמן אישי"');
    expect(sidebar).toContain('coach: "כלי AI לרפלקציה"');
    expect(chatApi).toContain('label: "כלי AI לרפלקציה"');
    expect(chatApi).toContain('label: "תרגול שיחה בדיוני"');
    expect(chatApi).toContain('label: "ניתוח טקסט ב-AI"');
    expect(chatApi).not.toMatch(/label: "מאמן אישי"|אתה מומחה לניתוח/u);
    expect(chatPage).not.toMatch(/label: "סימולטור דייט"|label: "ניתוח דייט"/u);
  });

  it("keeps the values tool optional and explicitly non-diagnostic", () => {
    const valuesTool = read("src/app/tools/values-quiz/page.tsx");
    expect(valuesTool).toContain("תרגיל רפלקציה על ערכים");
    expect(valuesTool).toContain("אפשר לדלג על כל שאלה");
    expect(valuesTool).toContain("לא עבר תיקוף פסיכולוגי");
    expect(valuesTool).toContain("אינו מודד התאמה");
    expect(valuesTool).toContain("handleSkip");
    expect(valuesTool).toContain("useMemo<Record<ValueKey, number>>");
    expect(valuesTool).not.toMatch(/שיחשפו לך|מה שאתה\/את באמת מחפש|הדרך\.co\.il/u);
  });

  it("replaces external-AI writing tools with useful local-only versions", () => {
    const backend = read("convex/tools.ts");
    const starters = read("src/app/tools/conversation-starters/page.tsx");
    const profile = read("src/app/tools/profile-builder/page.tsx");
    const catalog = read("src/app/tools/page.tsx");

    expect(backend).toContain("VERIFIED_AI_GENERATORS_AVAILABLE: boolean = false");
    expect(backend).toMatch(/if \(!VERIFIED_AI_GENERATORS_AVAILABLE\)[\s\S]*unavailable pending privacy and access review/u);
    expect(starters).toContain("LOCAL_STARTERS");
    expect(starters).toContain("הכלי עובד בדפדפן ואינו שולח תוכן לספק AI");
    expect(starters).not.toMatch(/useAction|generateConversationStarters/u);
    expect(profile).toContain("buildLocalBios");
    expect(profile).toContain("בלי לשלוח את הפרטים לספק AI");
    expect(profile).not.toMatch(/useAction|generateProfileBio/u);
    expect(catalog).toMatch(/id: "profile-builder"[\s\S]*available: true[\s\S]*badge: "מקומי"/u);
    expect(catalog).toMatch(/id: "conversation-starters"[\s\S]*available: true[\s\S]*badge: "מקומי"/u);
  });

  it("keeps structured choice-and-grade routes unavailable without fetching data", () => {
    for (const route of [
      read("src/app/simulator/dialogue/page.tsx"),
      read("src/app/simulator/dialogue/[scenarioId]/page.tsx"),
    ]) {
      expect(route).toContain("STRUCTURED_DIALOGUE_AVAILABLE = false");
      expect(route).toContain('STRUCTURED_DIALOGUE_AVAILABLE ?');
      expect(route).toContain(': "skip"');
      expect(route).toContain("אינו זמין");
    }
  });

  it("describes pricing as a closed status surface in metadata", () => {
    const metadata = read("src/app/pricing/layout.tsx");
    expect(metadata).toContain("רכישה ותשלום אינם זמינים");
    expect(metadata).toContain("מחירים ומסלולים ישנים אינם הצעה מאושרת");
    expect(metadata).not.toContain("השקעה קטנה לשינוי אמיתי");
  });
});
