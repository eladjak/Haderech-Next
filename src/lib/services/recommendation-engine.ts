import type { Course } from "@/types/courses";
import type { ForumPost, ForumPostWithAuthor } from "@/types/forum";
import type { SimulatorScenario } from "@/types/simulator";

("use client");

export {};

interface UserPreferences {
  interests?: string[];
  difficulty?: string;
  recommendationFrequency?: "daily" | "weekly" | "custom";
}

interface RecommendationItem {
  id: string;
  title: string;
  description: string;
}

interface TaggedItem {
  tags: string[];
}

interface Book extends RecommendationItem, TaggedItem {
  author: string;
}

interface Podcast extends RecommendationItem, TaggedItem {
  host: string;
}

interface Article extends RecommendationItem, TaggedItem {
  author: string;
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

interface CourseWithTags extends Course, TaggedItem {}

interface ScoredCourse extends CourseWithTags, ScoredItem {}
interface ScoredForumPost extends ForumPost, ScoredItem {}
interface ScoredScenario extends SimulatorScenario, ScoredItem {}

const calculateRelevanceScore = (
  item: Book | Podcast | Article | CourseWithTags | SimulatorScenario,
  userPreferences: UserPreferences
): number => {
  let score = 0;

  if (userPreferences.interests && "tags" in item && item.tags) {
    const matchingTags = item.tags.filter((tag) =>
      userPreferences.interests?.includes(tag)
    );
    score += matchingTags.length * 10;
  }

  if ("difficulty" in item && userPreferences.difficulty) {
    if (item.difficulty === userPreferences.difficulty) {
      score += 20;
    }
  } else if ("level" in item && userPreferences.difficulty) {
    if (item.level.toLowerCase() === userPreferences.difficulty) {
      score += 20;
    }
  }

  return score;
};

export const getRecommendations = async (
  _userId: string
): Promise<Recommendations> => {
  const userPreferences: UserPreferences = {
    interests: ["javascript", "react", "typescript"],
    difficulty: "intermediate",
    recommendationFrequency: "weekly",
  };

  const userHistory: UserHistory = {
    viewed_courses: [],
    completed_courses: [],
    viewed_articles: [],
    forum_activity: [],
  };

  const courses = await fetch("/api/courses").then((res) => res.json());
  const coursesWithTags = courses.map((course: Course) => ({
    ...course,
    tags: ["javascript", "web", "programming"],
  }));

  const scoredCourses = coursesWithTags.map((course: CourseWithTags) => ({
    ...course,
    score: calculateRelevanceScore(course, userPreferences),
  })) as ScoredCourse[];

  const forumPosts = await fetch("/api/forum/posts").then((res) => res.json());
  const scoredPosts = forumPosts.map((post: ForumPost) => ({
    ...post,
    score: 0,
  })) as ScoredForumPost[];

  const scenarios = await fetch("/api/simulator/scenarios").then((res) =>
    res.json()
  );
  const scoredScenarios = scenarios.map((scenario: SimulatorScenario) => ({
    ...scenario,
    score: calculateRelevanceScore(scenario, userPreferences),
  })) as ScoredScenario[];

  return {
    courses: scoredCourses
      .sort((a: ScoredCourse, b: ScoredCourse) => b.score - a.score)
      .slice(0, 5),
    books: [],
    podcasts: [],
    articles: [],
    forumPosts: scoredPosts
      .sort((a: ScoredForumPost, b: ScoredForumPost) => b.score - a.score)
      .slice(0, 5),
    simulationScenarios: scoredScenarios
      .sort((a: ScoredScenario, b: ScoredScenario) => b.score - a.score)
      .slice(0, 3),
  };
};
