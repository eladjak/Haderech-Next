import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// נתיבים פרטיים שדורשים התחברות
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/courses/:courseId/learn(.*)",
  "/certificates(.*)",
  "/admin(.*)",
  "/quiz(.*)",
  "/student(.*)",
  // Legacy singular course player routes (/course/[id]/...).
  // NOTE: must be "/course/(.*)" and not "/course(.*)" — the latter also
  // matches "/courses" and locked the public catalog behind auth (prod 404).
  "/course/(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  // Demo mode - skip auth protection
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
    return;
  }
  // אם זה נתיב מוגן, דרוש התחברות
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
