import "server-only";

import { auth } from "@clerk/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { makeFunctionReference } from "convex/server";
import { AUTHORIZATION_ERRORS } from "@/../convex/lib/authorizationPolicy";
import {
  getCoursePdfManifestEntry,
  readVerifiedCoursePdf,
} from "@/lib/course-pdf-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const authorizeCoursePdf = makeFunctionReference<
  "query",
  { courseId: string; lessonId: string; fileName: string },
  boolean
>("coursePdfDownloads:authorize");

const knownAuthorizationErrors = new Set(Object.values(AUTHORIZATION_ERRORS));

function isKnownAuthorizationError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return [...knownAuthorizationErrors].some((code) => message.includes(code));
}

function emptyResponse(status: number): Response {
  return new Response(null, {
    status,
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export async function GET(
  _request: Request,
  context: {
    params: Promise<{ courseId: string; lessonId: string; fileName: string }>;
  },
): Promise<Response> {
  const session = await auth();
  if (!session.userId) return emptyResponse(401);

  const token = await session.getToken({ template: "convex" });
  if (!token) return emptyResponse(503);

  const { courseId, lessonId, fileName } = await context.params;
  const entry = getCoursePdfManifestEntry(fileName);
  if (!entry) return emptyResponse(404);

  let authorized: boolean;
  try {
    authorized = await fetchQuery(
      authorizeCoursePdf,
      { courseId, lessonId, fileName },
      { token },
    );
  } catch (error) {
    return emptyResponse(isKnownAuthorizationError(error) ? 404 : 503);
  }
  if (!authorized) return emptyResponse(404);

  try {
    const body = await readVerifiedCoursePdf(entry);
    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Length": String(body.byteLength),
        "Content-Disposition": `attachment; filename="course-resource.pdf"; filename*=UTF-8''${encodeURIComponent(entry.fileName)}`,
        "Cache-Control": "private, no-store, max-age=0",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return emptyResponse(503);
  }
}
