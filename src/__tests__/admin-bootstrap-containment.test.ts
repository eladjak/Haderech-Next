import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(process.cwd());
const usersSource = readFileSync(resolve(root, "convex/users.ts"), "utf8");
const setupSource = readFileSync(resolve(root, "src/app/admin/setup/page.tsx"), "utf8");

describe("admin bootstrap containment", () => {
  it("does not expose public first-user admin discovery or promotion", () => {
    expect(usersSource).not.toContain("export const hasAnyAdmin = query");
    expect(usersSource).not.toContain("export const promoteSelfToAdmin = mutation");
    expect(setupSource).not.toContain("api.users.promoteSelfToAdmin");
    expect(setupSource).not.toContain("api.users.hasAnyAdmin");
  });

  it("does not auto-promote an account from a hard-coded email allowlist", () => {
    expect(usersSource).not.toContain("ADMIN_EMAILS");
    expect(usersSource).not.toContain("isAutoAdmin");
    expect(usersSource).toContain('role: "student"');
  });

  it("keeps first-admin creation internal and the public page fail-closed", () => {
    expect(usersSource).toContain("export const seedAdmin = internalMutation");
    expect(setupSource).toContain("אי אפשר להעניק הרשאות מנהל מתוך עמוד ציבורי");
    expect(setupSource).not.toContain("הגדר אותי כמנהל");
  });
});
