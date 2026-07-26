// This script seeds initial production data for HaDerech.
//
// Seeds are fail-closed: every seed mutation refuses to run unless the target
// deployment has `SEED_ENABLED=true` set (npx convex env set SEED_ENABLED true).
// Production is intentionally left without it — see convex/lib/seedGuard.ts.
//
// Run each seed mutation in order:
// 1. npx convex run seed:seedCourses
// 2. npx convex run seed:seedAll
// 3. npx convex run gamification:seedBadges
// 4. npx convex run blog:seedBlogPosts
// 5. npx convex run seedSimulatorData:seedSimulatorScenarios
// 6. npx convex run dailyContent:seedDailyContent
//
// REMOVED — never run these against production:
//   stories:seedStories    (deleted) inserted six invented people as "real"
//                          public success stories.
//   mentoring:seedMentors  (deleted) inserted three invented coaches with
//                          fabricated professional credentials and fake
//                          ratings onto a page that takes bookings and money.
//   seedReviews:seedReviews (file deleted) created fake @example.com user
//                          accounts, enrollments and course reviews.
// All three fabricated real-seeming humans. Testimonials, stories and mentors
// must come from real people only.
//
// Or use the shell script: bash scripts/seed-production.sh
