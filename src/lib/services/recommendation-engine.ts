import type { Course } from "@/types/api";
import type { ForumPost, ForumPostWithAuthor } from "@/types/forum";
import type { SimulatorScenario } from "@/types/simulator";

interface UserPreferences {
  interests?: string[];
  difficulty?: string;
  recommendationFrequency?: "daily" | "weekly" | "custom";
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

interface UserHistory {
  viewed_courses: string[];
  completed_courses: string[];
  viewed_articles: string[];
  forum_activity: string[];
}

interface Recommendations {
  courses: Course[];
  books: Book[];
  podcasts: Podcast[];
  articles: Article[];
  forumPosts: ForumPostWithAuthor[];
  simulationScenarios: SimulatorScenario[];
}

interface ScoredItem {
  score: number;
}

interface ScoredCourse extends Course, ScoredItem {}
interface ScoredForumPost extends ForumPost, ScoredItem {}
interface ScoredScenario extends SimulatorScenario, ScoredItem {}

const calculateRelevanceScore = (
  item: Course | Book | Article | Podcast | SimulatorScenario,
  userPreferences: UserPreferences,
  userHistory: UserHistory
): number => {
  let score = 0;

  // Check if tags match user interests
  if (userPreferences.interests && item.tags) {
    const matchingTags = item.tags.filter((tag) =>
      userPreferences.interests?.includes(tag)
    );
    score += matchingTags.length * 10;
  }

  // Check difficulty level
  if ("difficulty" in item) {
    // SimulatorScenario
    if (item.difficulty === userPreferences.difficulty) {
      score += 20;
    }
  } else if ("level" in item) {
    // Course
    if (item.level.toLowerCase() === userPreferences.difficulty) {
      score += 20;
    }
  }

  // Check if user has viewed similar items
  if ("id" in item) {
    if (userHistory.viewed_courses.includes(item.id)) {
      score -= 30; // Reduce score for already viewed items
    }
  }

  return score;
};

export const getRecommendations = async (
  userId: string
): Promise<Recommendations> => {
  // Fetch user preferences and history
  const userPreferences: UserPreferences = {
    interests: ["javascript", "react", "typescript"],
    difficulty: "intermediate",
    recommendationFrequency: "daily",
  };

  const userHistory: UserHistory = {
    viewed_courses: [],
    completed_courses: [],
    viewed_articles: [],
    forum_activity: [],
  };

  // Fetch courses
  const courses = await fetch("/api/courses").then((res) => res.json());
  const scoredCourses = courses.map((course: Course) => ({
    ...course,
    score: calculateRelevanceScore(course, userPreferences, userHistory),
  })) as ScoredCourse[];

  // Fetch forum posts
  const forumPosts = await fetch("/api/forum/posts").then((res) => res.json());
  const scoredPosts = forumPosts.map((post: ForumPost) => ({
    ...post,
    score: post.views + post.likes,
  })) as ScoredForumPost[];

  // Fetch simulation scenarios
  const scenarios = await fetch("/api/simulator/scenarios").then((res) =>
    res.json()
  );
  const scoredScenarios = scenarios.map((scenario: SimulatorScenario) => ({
    ...scenario,
    score: calculateRelevanceScore(scenario, userPreferences, userHistory),
  })) as ScoredScenario[];

  return {
    courses: scoredCourses
      .sort((a: ScoredCourse, b: ScoredCourse) => b.score - a.score)
      .slice(0, 5),
    books: [], // TODO: Implement book recommendations
    podcasts: [], // TODO: Implement podcast recommendations
    articles: [], // TODO: Implement article recommendations
    forumPosts: scoredPosts
      .sort((a: ScoredForumPost, b: ScoredForumPost) => b.score - a.score)
      .slice(0, 5),
    simulationScenarios: scoredScenarios
      .sort((a: ScoredScenario, b: ScoredScenario) => b.score - a.score)
      .slice(0, 3),
  };
};
