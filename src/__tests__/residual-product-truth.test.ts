import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

function read(relativePath: string): string {
  return fs.readFileSync(path.resolve(process.cwd(), relativePath), "utf8");
}

const publicTruthSources = [
  "src/app/layout.tsx",
  "src/app/chat/layout.tsx",
  "src/app/simulator/layout.tsx",
  "src/components/layout/footer.tsx",
  "src/components/seo/json-ld.tsx",
  "src/app/help/page.tsx",
  "src/app/faq/page.tsx",
].map(read).join("\n");

describe("residual product-truth surfaces", () => {
  it("uses the canonical public course facts without invented outcome proof", () => {
    expect(publicTruthSources).toContain("12 שבועות");
    expect(publicTruthSources).toContain("6 שלבים");
    expect(publicTruthSources).toContain("75 שיעורים");
    expect(publicTruthSources).toContain("8 מסמכי PDF לתרגול");
    expect(publicTruthSources).not.toMatch(/461|למעלה מ-?450|15\+\s*שנ|ישנו לך את חיי/);
  });

  it("labels AI and simulator output as fallible practice rather than human advice", () => {
    expect(publicTruthSources).toContain("עלולים לטעות");
    expect(publicTruthSources).toContain("אינם תחליף");
    expect(publicTruthSources).toContain("דמות ותרחיש בדיוניים");
    expect(publicTruthSources).not.toMatch(/בדיוק כמו בשיחה אמיתית|זמין 24\/7/);
  });

  it("does not publish stale premium limits or lifetime-retention promises", () => {
    expect(publicTruthSources).not.toContain(
      "בחינמי - 30 הודעות לחודש, בפרימיום - הודעות ללא הגבלה"
    );
    expect(publicTruthSources).not.toContain("3 סשנים חודשיים בסימולטור");
    expect(publicTruthSources).not.toContain("נשמרת אוטומטית ולנצח");
  });
});

describe("seeded editorial content", () => {
  it("does not manufacture popularity metrics", () => {
    const blog = read("convex/blog.ts");
    const resources = read("convex/resources.ts");
    expect(blog).toContain("views: 0");
    expect(blog).not.toContain("Math.floor(Math.random() * 500)");
    expect(blog).not.toContain("(posts.length - i) * 86400000");
    expect(resources).not.toMatch(/downloadCount:\s*[1-9]\d*/);
  });

  it("does not seed text resources as paid PDFs without an entitlement system", () => {
    const resources = read("convex/resources.ts");
    expect(resources).not.toContain('isFree: false');
    expect(resources).not.toContain('type: "pdf" as const');
  });

  it("removes body-language mind-reading and compulsory disclosure", () => {
    const editorial = [
      read("convex/blog.ts"),
      read("convex/resources.ts"),
      read("convex/dailyContent.ts"),
    ].join("\n");
    expect(editorial).toContain("שפת גוף אינה");
    expect(editorial).toContain("מגע דורש הסכמה");
    expect(editorial).toContain("אין חובה");
    expect(editorial).not.toMatch(/93% מהתקשורת|שפת הגוף מעבירה 55%|דיוק של 91%/);
  });

  it("does not seed unverified attributed daily quotes", () => {
    const daily = read("convex/dailyContent.ts");
    expect(daily).not.toMatch(/author: "(?:ד\\?"ר ג'ון גוטמן|ברנה בראון|ויקטור פרנקל|ד\\?"ר גארי צ'פמן|לאו טסה)"/);
  });
});
