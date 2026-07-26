#!/bin/bash
set -e

# Seeds are fail-closed: each mutation refuses to run unless the target
# deployment has SEED_ENABLED=true (npx convex env set SEED_ENABLED true).
# Production is intentionally left without it — see convex/lib/seedGuard.ts.
#
# REMOVED — never run these against production: stories:seedStories,
# mentoring:seedMentors and seedReviews:seedReviews all inserted fabricated
# people (invented success stories, invented coaches with fake professional
# credentials on a paid booking page, and fake @example.com reviewer accounts).
# The mutations and their data have been deleted from the codebase.

echo "Seeding HaDerech production data..."
echo ""

echo "1/6 Seeding courses..."
npx convex run seed:seedCourses

echo "2/6 Seeding community & general data..."
npx convex run seed:seedAll

echo "3/6 Seeding badges..."
npx convex run gamification:seedBadges

echo "4/6 Seeding blog posts..."
npx convex run blog:seedBlogPosts

echo "5/6 Seeding simulator scenarios..."
npx convex run seedSimulatorData:seedSimulatorScenarios

echo "6/6 Seeding daily content..."
npx convex run dailyContent:seedDailyContent

echo ""
echo "All seed data loaded!"
