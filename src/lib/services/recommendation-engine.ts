import { createClient } from "@supabase/supabase-js";

import type {
  DatabaseCourse,
  DatabaseForumPost,
  DatabaseUser,
} from "@/types/database";

interface UserPreferences {
  interests?: string[];
  difficulty?: string;
  recommendationFrequency?: "daily" | "weekly" | "custom";
}

interface Author extends Pick<DatabaseUser, "id" | "name" | "avatar_url"> {}

interface CourseWithScore extends DatabaseCourse {
  author: Author;
  score: number;
  popularity?: number;
  tags?: string[];
}

interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  tags: string[];
  coverUrl: string;
  price: number;
}

interface Podcast {
  id: string;
  title: string;
  host: string;
  description: string;
  tags: string[];
  imageUrl: string;
  duration: number;
}

interface Article {
  id: string;
  title: string;
  author: string;
  content: string;
  tags: string[];
  readTime: number;
}

interface ForumPostWithAuthor extends DatabaseForumPost {
  author: Author;
  replies_count: number;
}

interface SimulationScenario {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  tags: string[];
  duration: number;
}

interface UserHistory {
  viewed_courses: string[];
  completed_courses: string[];
  viewed_articles: string[];
  forum_activity: string[];
}

interface Recommendations {
  courses: CourseWithScore[];
  books: Book[];
  podcasts: Podcast[];
  articles: Article[];
  forumPosts: ForumPostWithAuthor[];
  simulationScenarios: SimulationScenario[];
}

const calculateRelevanceScore = (
  item: CourseWithScore | Book | Article | Podcast,
  userPreferences: UserPreferences,
  userHistory: UserHistory
): number => {
  let score = 0;

  if ("popularity" in item && typeof item.popularity === "number") {
    score = item.popularity;
  }

  if (userPreferences.interests && "tags" in item && Array.isArray(item.tags)) {
    const matchingTags = item.tags.filter((tag) =>
      userPreferences.interests?.includes(tag)
    );
    score += matchingTags.length * 10;
  }

  if ("difficulty" in item && userPreferences.difficulty === item.difficulty) {
    score += 20;
  }

  if ("tags" in item && "id" in item) {
    const hasViewedItem = userHistory.viewed_courses.includes(item.id);
    if (hasViewedItem) score += 15;
  }

  return score;
};

export const getRecommendations = async (
  userId: string
): Promise<Recommendations> => {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Get user preferences and history
  const { data: user } = await supabase
    .from("users")
    .select(
      `
      id,
      preferences,
      next_recommendation_time
    `
    )
    .eq("id", userId)
    .single();

  if (!user) throw new Error("User not found");

  const userPreferences = user.preferences as UserPreferences;

  // Check if it's time for new recommendations
  if (
    user.next_recommendation_time &&
    new Date() < new Date(user.next_recommendation_time)
  ) {
    throw new Error("Too early for new recommendations");
  }

  // Get user history
  const { data: userHistory } = await supabase
    .from("user_history")
    .select(
      `
      viewed_courses,
      completed_courses,
      viewed_articles,
      forum_activity
    `
    )
    .eq("user_id", userId)
    .single();

  const history: UserHistory = userHistory || {
    viewed_courses: [],
    completed_courses: [],
    viewed_articles: [],
    forum_activity: [],
  };

  // Get courses
  const { data: coursesData } = await supabase.from("courses").select(`
      id,
      title,
      description,
      image_url,
      price,
      level,
      duration,
      status,
      author_id,
      created_at,
      updated_at,
      tags,
      difficulty,
      popularity,
      author:users!author_id(id, name, avatar_url)
    `);

  const courses = coursesData?.map((course) => ({
    ...course,
    author: course.author[0],
    score: 0, // Will be calculated later
  })) as CourseWithScore[];

  // Get books
  const { data: books } = await supabase.from("books").select("*");

  // Get podcasts
  const { data: podcasts } = await supabase.from("podcasts").select("*");

  // Get articles
  const { data: articles } = await supabase.from("articles").select("*");

  // Get forum posts
  const { data: forumPostsData } = await supabase
    .from("forum_posts")
    .select(
      `
    id,
    title,
    content,
    author_id,
    category,
    tags,
    pinned,
    solved,
    likes,
    views,
    last_activity,
    created_at,
    updated_at,
    author:users!author_id(id, name, avatar_url),
    replies_count:forum_replies(count)
  `
    )
    .order("created_at", { ascending: false })
    .limit(5);

  const forumPosts = forumPostsData?.map((post) => ({
    ...post,
    author: post.author[0],
    replies_count: post.replies_count[0]?.count || 0,
  })) as ForumPostWithAuthor[];

  // Get simulation scenarios
  const { data: scenarios } = await supabase
    .from("simulation_scenarios")
    .select("*");

  // Calculate scores and sort
  const recommendedCourses =
    courses
      ?.filter((course) => !history.completed_courses.includes(course.id))
      .map((course) => ({
        ...course,
        score: calculateRelevanceScore(course, userPreferences, history),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5) || [];

  // Schedule next recommendations
  const nextRecommendationTime = new Date();
  switch (userPreferences.recommendationFrequency) {
    case "daily":
      nextRecommendationTime.setDate(nextRecommendationTime.getDate() + 1);
      break;
    case "weekly":
      nextRecommendationTime.setDate(nextRecommendationTime.getDate() + 7);
      break;
    default:
      nextRecommendationTime.setDate(nextRecommendationTime.getDate() + 3);
  }

  await supabase
    .from("users")
    .update({
      next_recommendation_time: nextRecommendationTime.toISOString(),
    })
    .eq("id", userId);

  // Save recommendation history
  await supabase.from("recommendation_history").insert({
    user_id: userId,
    recommendations: {
      courses: recommendedCourses.map((c) => c.id),
      books: books?.slice(0, 3).map((b) => b.id),
      podcasts: podcasts?.slice(0, 3).map((p) => p.id),
      articles: articles?.slice(0, 3).map((a) => a.id),
      forum_posts: forumPosts?.slice(0, 3).map((p) => p.id),
      simulation_scenarios: scenarios?.slice(0, 1).map((s) => s.id),
    },
    created_at: new Date().toISOString(),
  });

  return {
    courses: recommendedCourses,
    books: (books || []) as Book[],
    podcasts: (podcasts || []) as Podcast[],
    articles: (articles || []) as Article[],
    forumPosts: forumPosts || [],
    simulationScenarios: (scenarios || []) as SimulationScenario[],
  };
};
