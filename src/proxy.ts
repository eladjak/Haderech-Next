import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import {
  assertDemoModeConfiguration,
  isDemoModeExplicitlyEnabled,
} from "@/lib/production-config";

// נתיבים פרטיים שדורשים התחברות
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/courses/:courseId/learn(.*)",
  "/courses/:courseId/lessons(.*)",
  "/certificates(.*)",
  "/admin(.*)",
  "/quiz(.*)",
  "/student(.*)",
  // Legacy singular course player routes (/course/[id]/...).
  // NOTE: must be "/course/(.*)" and not "/course(.*)" — the latter also
  // matches "/courses" and locked the public catalog behind auth (prod 404).
  "/course/(.*)",
]);

const PRODUCTION_APP_HOSTNAME = "haderech-next.vercel.app";

export default clerkMiddleware(
  async (auth, req) => {
    // Runtime guard: a build-time check alone cannot protect a container whose
    // environment changes before `next start`.
    assertDemoModeConfiguration();
    if (isDemoModeExplicitlyEnabled()) {
      return;
    }
    // אם זה נתיב מוגן, דרוש התחברות
    if (isProtectedRoute(req)) {
      await auth.protect();
    }
  },
  {
    frontendApiProxy: {
      enabled: (url) => url.hostname === PRODUCTION_APP_HOSTNAME,
    },
  },
);

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
    // Always run for Clerk Frontend API proxy requests.
    "/__clerk/(.*)",
  ],
};
