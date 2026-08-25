import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("shared accessibility shell", () => {
  it("moves focus to the main landmark from the skip link", () => {
    const source = read("src/components/layout/skip-link.tsx");
    expect(source).toContain('getElementById("main-content")');
    expect(source).toContain("main.focus({ preventScroll: true })");
  });

  it("gives the chat page a focusable named main target", () => {
    const source = read("src/app/chat/page.tsx");
    expect(source).toContain('<main id="main-content" tabIndex={-1}');
  });

  it("keeps footer links and chat controls at least 44px tall", () => {
    const footer = read("src/components/layout/footer.tsx");
    const chat = read("src/app/chat/page.tsx");
    expect(footer).toContain("min-h-11");
    expect(chat).toContain("h-11 w-11");
    expect(chat).toContain("min-h-11");
  });

  it.each(["sign-in", "sign-up"])(
    "gives the %s screen a focusable main landmark and private metadata",
    (route) => {
      const source = read(`src/app/(auth)/${route}/[[...${route}]]/page.tsx`);
      expect(source).toContain('<main\n      id="main-content"');
      expect(source).toContain("tabIndex={-1}");
      expect(source).toContain("robots: { index: false, follow: false }");
    }
  );
});
