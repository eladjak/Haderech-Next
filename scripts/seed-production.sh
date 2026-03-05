#!/bin/bash
set -e

echo "Seeding HaDerech production data..."
echo ""

echo "1/8 Seeding courses..."
npx convex run seed:seedCourses

echo "2/8 Seeding community & general data..."
npx convex run seed:seedAll

echo "3/8 Seeding badges..."
npx convex run gamification:seedBadges

echo "4/8 Seeding blog posts..."
npx convex run blog:seedBlogPosts

echo "5/8 Seeding success stories..."
npx convex run stories:seedStories

echo "6/8 Seeding simulator scenarios..."
npx convex run seedSimulatorData:seedSimulatorScenarios

echo "7/8 Seeding daily content..."
npx convex run dailyContent:seedDailyContent

echo "8/8 Seeding mentors..."
npx convex run mentoring:seedMentors

echo ""
echo "All seed data loaded!"
