import fs from "node:fs";
import path from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { clerkMiddlewareMock, createRouteMatcherMock } = vi.hoisted(() => ({
  clerkMiddlewareMock: vi.fn(
    (handler: unknown, options: unknown) => ({ handler, options }),
  ),
  createRouteMatcherMock: vi.fn(() => vi.fn(() => false)),
}));

vi.mock("@clerk/nextjs/server", () => ({
  clerkMiddleware: clerkMiddlewareMock,
  createRouteMatcher: createRouteMatcherMock,
}));

function hasFrontendApiProxyContract(
  options: unknown,
  matchers: readonly string[],
) {
  const enabled =
    typeof options === "object" &&
    options !== null &&
    "frontendApiProxy" in options &&
    typeof options.frontendApiProxy === "object" &&
    options.frontendApiProxy !== null &&
    "enabled" in options.frontendApiProxy &&
    options.frontendApiProxy.enabled;

  const proxyEnabledOnlyForProduction =
    typeof enabled === "function" &&
    enabled(new URL("https://haderech-next.vercel.app")) === true &&
    enabled(new URL("http://localhost:3000")) === false &&
    enabled(new URL("https://haderech-next-git-preview.vercel.app")) === false;

  return (
    proxyEnabledOnlyForProduction && matchers.includes("/__clerk/(.*)")
  );
}

function findRemovedCore3Imports(source: string) {
  const clerkImports = source.match(
    /import\s*\{[\s\S]*?\}\s*from\s*["']@clerk\/nextjs["']/gu,
  ) ?? [];

  return clerkImports.flatMap(
    (statement) =>
      statement.match(/\b(?:SignedIn|SignedOut|Protect)\b/gu) ?? [],
  );
}

function sourceFiles(root: string): string[] {
  return fs.readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(root, entry.name);
    if (entry.isDirectory()) return sourceFiles(absolute);
    return /\.(?:ts|tsx)$/u.test(entry.name) ? [absolute] : [];
  });
}

describe("Clerk Frontend API proxy contract", () => {
  beforeEach(() => {
    vi.resetModules();
    clerkMiddlewareMock.mockClear();
    createRouteMatcherMock.mockClear();
  });

  it("wires the proxy only for the canonical production host", async () => {
    const proxyModule = await import("../proxy");
    const [, options] = clerkMiddlewareMock.mock.calls[0] ?? [];

    expect(proxyModule.default).toEqual(
      expect.objectContaining({ handler: expect.any(Function), options }),
    );
    expect(hasFrontendApiProxyContract(options, proxyModule.config.matcher)).toBe(
      true,
    );
  });

  it("fails closed when either half of the proxy wiring is removed", async () => {
    const proxyModule = await import("../proxy");
    const [, options] = clerkMiddlewareMock.mock.calls[0] ?? [];

    expect(
      hasFrontendApiProxyContract(undefined, proxyModule.config.matcher),
    ).toBe(false);
    expect(hasFrontendApiProxyContract(options, [])).toBe(false);
  });

  it("contains no Clerk Core 3 removed control-component imports", () => {
    const violations = sourceFiles(path.join(process.cwd(), "src")).flatMap(
      (file) =>
        file === __filename
          ? []
          : findRemovedCore3Imports(fs.readFileSync(file, "utf8")).map(
              (component) =>
                `${path.relative(process.cwd(), file)}:${component}`,
            ),
    );

    expect(violations).toEqual([]);
    expect(
      findRemovedCore3Imports(
        'import { SignedIn, SignedOut, Protect } from "@clerk/nextjs";',
      ),
    ).toEqual(["SignedIn", "SignedOut", "Protect"]);
  });
});
