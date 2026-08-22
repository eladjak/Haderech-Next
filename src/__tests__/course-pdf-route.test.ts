import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import manifest from "../../scripts/course-pdf-manifest.json";

const { authMock, fetchQueryMock } = vi.hoisted(() => ({
  authMock: vi.fn(),
  fetchQueryMock: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@clerk/nextjs/server", () => ({ auth: authMock }));
vi.mock("convex/nextjs", () => ({ fetchQuery: fetchQueryMock }));

import { GET } from "@/app/api/course-pdfs/[courseId]/[lessonId]/[fileName]/route";

const file = manifest.files[0];

function context(fileName = file.fileName) {
  return {
    params: Promise.resolve({
      courseId: "course-a",
      lessonId: "lesson-a",
      fileName,
    }),
  };
}

function signedIn(token: string | null = "convex-token") {
  authMock.mockResolvedValue({
    userId: "user-a",
    getToken: vi.fn().mockResolvedValue(token),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  signedIn();
  fetchQueryMock.mockResolvedValue(true);
});

describe("protected course PDF route", () => {
  it("denies an anonymous request before authorization or file access", async () => {
    authMock.mockResolvedValue({
      userId: null,
      getToken: vi.fn().mockResolvedValue(null),
    });

    const response = await GET(new Request("http://localhost/test"), context());
    expect(response.status).toBe(401);
    expect(fetchQueryMock).not.toHaveBeenCalled();
  });

  it("fails closed when Clerk cannot issue a Convex token", async () => {
    signedIn(null);
    const response = await GET(new Request("http://localhost/test"), context());
    expect(response.status).toBe(503);
    expect(fetchQueryMock).not.toHaveBeenCalled();
  });

  it("hides a student enrollment that is not a trusted entitlement", async () => {
    fetchQueryMock.mockRejectedValue(new Error("COURSE_ENTITLEMENT_UNTRUSTED"));
    const response = await GET(new Request("http://localhost/test"), context());
    expect(response.status).toBe(404);
  });

  it("prevents user A from downloading a lesson/PDF mapping from course B", async () => {
    fetchQueryMock.mockResolvedValue(false);
    const response = await GET(new Request("http://localhost/test"), context());
    expect(response.status).toBe(404);
  });

  it("serves the exact verified PDF only after the backend authorizes it", async () => {
    const response = await GET(new Request("http://localhost/test"), context());
    const body = Buffer.from(await response.arrayBuffer());
    const expected = await readFile(
      resolve(process.cwd(), "data", "course-pdfs", file.fileName),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("application/pdf");
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(response.headers.get("content-disposition")).toContain("attachment");
    expect(body).toEqual(expected);
    expect(createHash("sha256").update(body).digest("hex")).toBe(file.sha256);
    expect(fetchQueryMock).toHaveBeenCalledWith(
      expect.anything(),
      {
        courseId: "course-a",
        lessonId: "lesson-a",
        fileName: file.fileName,
      },
      { token: "convex-token" },
    );
  });

  it("rejects traversal and unknown file names before the backend query", async () => {
    const response = await GET(
      new Request("http://localhost/test"),
      context("../package.json"),
    );
    expect(response.status).toBe(404);
    expect(fetchQueryMock).not.toHaveBeenCalled();
  });

  it("returns 503 rather than serving a file when authorization is unavailable", async () => {
    fetchQueryMock.mockRejectedValue(new Error("backend unavailable"));
    const response = await GET(new Request("http://localhost/test"), context());
    expect(response.status).toBe(503);
  });
});
