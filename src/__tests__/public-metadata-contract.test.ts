import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (path: string) => readFileSync(resolve(root, path), "utf8");

describe("public metadata contract", () => {
  const routes = [
    "about",
    "courses",
    "pricing",
    "faq",
    "help",
    "contact",
    "blog",
    "chat",
    "simulator",
    "community",
    "mentoring",
    "tools",
    "stories",
    "resources",
  ];

  it.each(routes)("declares a route-specific canonical for /%s", (route) => {
    const source = read(`src/app/${route}/layout.tsx`);
    expect(source).toContain(`alternates: { canonical: "/${route}" }`);
  });

  it.each(["privacy", "terms", "accessibility"])(
    "keeps the /%s legal draft out of search until approval",
    (route) => {
      const source = read(`src/app/${route}/page.tsx`);
      expect(source).toContain(`alternates: { canonical: "/${route}" }`);
      expect(source).toContain("robots: { index: false, follow: false }");
      expect(source).toContain("טיוטה");
    }
  );

  it("links all legal drafts from the footer", () => {
    const source = read("src/components/layout/footer.tsx");
    expect(source).toContain('href="/privacy"');
    expect(source).toContain('href="/terms"');
    expect(source).toContain('href="/accessibility"');
  });

  it("lists all approved public information routes in the sitemap", () => {
    const source = read("src/app/sitemap.ts");
    for (const route of ["/about", "/help", "/course-safety"]) {
      expect(source).toContain(`"${route}"`);
    }
    for (const draft of ["/privacy", "/terms", "/accessibility"]) {
      expect(source).not.toContain(`"${draft}"`);
    }
  });
});
