/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as activityFeed from "../activityFeed.js";
import type * as admin from "../admin.js";
import type * as adminAnalytics from "../adminAnalytics.js";
import type * as adminComments from "../adminComments.js";
import type * as adminCommunity from "../adminCommunity.js";
import type * as adminLessons from "../adminLessons.js";
import type * as adminQuizzes from "../adminQuizzes.js";
import type * as adminUsers from "../adminUsers.js";
import type * as aiSimulator from "../aiSimulator.js";
import type * as analytics from "../analytics.js";
import type * as blog from "../blog.js";
import type * as bookmarks from "../bookmarks.js";
import type * as certificates from "../certificates.js";
import type * as chat from "../chat.js";
import type * as comments from "../comments.js";
import type * as community from "../community.js";
import type * as contact from "../contact.js";
import type * as courses from "../courses.js";
import type * as crons from "../crons.js";
import type * as dailyContent from "../dailyContent.js";
import type * as datingProfile from "../datingProfile.js";
import type * as email from "../email.js";
import type * as emailTemplates from "../emailTemplates.js";
import type * as enrollments from "../enrollments.js";
import type * as forum from "../forum.js";
import type * as gamification from "../gamification.js";
import type * as health from "../health.js";
import type * as leaderboard from "../leaderboard.js";
import type * as lessons from "../lessons.js";
import type * as lib_authGuard from "../lib/authGuard.js";
import type * as mentoring from "../mentoring.js";
import type * as notes from "../notes.js";
import type * as notificationHelpers from "../notificationHelpers.js";
import type * as notifications from "../notifications.js";
import type * as onboarding from "../onboarding.js";
import type * as preferences from "../preferences.js";
import type * as progress from "../progress.js";
import type * as pushNotifications from "../pushNotifications.js";
import type * as quizResults from "../quizResults.js";
import type * as quizzes from "../quizzes.js";
import type * as resources from "../resources.js";
import type * as reviews from "../reviews.js";
import type * as scheduledTasks from "../scheduledTasks.js";
import type * as search from "../search.js";
import type * as seed from "../seed.js";
import type * as seedContent from "../seedContent.js";
import type * as seedCourseData from "../seedCourseData.js";
import type * as seedQuizzes from "../seedQuizzes.js";
import type * as seedReviews from "../seedReviews.js";
import type * as seedScenarios from "../seedScenarios.js";
import type * as seedSimulatorData from "../seedSimulatorData.js";
import type * as simulator from "../simulator.js";
import type * as stories from "../stories.js";
import type * as stripe from "../stripe.js";
import type * as studentAnalytics from "../studentAnalytics.js";
import type * as studentProgress from "../studentProgress.js";
import type * as subscriptions from "../subscriptions.js";
import type * as tools from "../tools.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  activityFeed: typeof activityFeed;
  admin: typeof admin;
  adminAnalytics: typeof adminAnalytics;
  adminComments: typeof adminComments;
  adminCommunity: typeof adminCommunity;
  adminLessons: typeof adminLessons;
  adminQuizzes: typeof adminQuizzes;
  adminUsers: typeof adminUsers;
  aiSimulator: typeof aiSimulator;
  analytics: typeof analytics;
  blog: typeof blog;
  bookmarks: typeof bookmarks;
  certificates: typeof certificates;
  chat: typeof chat;
  comments: typeof comments;
  community: typeof community;
  contact: typeof contact;
  courses: typeof courses;
  crons: typeof crons;
  dailyContent: typeof dailyContent;
  datingProfile: typeof datingProfile;
  email: typeof email;
  emailTemplates: typeof emailTemplates;
  enrollments: typeof enrollments;
  forum: typeof forum;
  gamification: typeof gamification;
  health: typeof health;
  leaderboard: typeof leaderboard;
  lessons: typeof lessons;
  "lib/authGuard": typeof lib_authGuard;
  mentoring: typeof mentoring;
  notes: typeof notes;
  notificationHelpers: typeof notificationHelpers;
  notifications: typeof notifications;
  onboarding: typeof onboarding;
  preferences: typeof preferences;
  progress: typeof progress;
  pushNotifications: typeof pushNotifications;
  quizResults: typeof quizResults;
  quizzes: typeof quizzes;
  resources: typeof resources;
  reviews: typeof reviews;
  scheduledTasks: typeof scheduledTasks;
  search: typeof search;
  seed: typeof seed;
  seedContent: typeof seedContent;
  seedCourseData: typeof seedCourseData;
  seedQuizzes: typeof seedQuizzes;
  seedReviews: typeof seedReviews;
  seedScenarios: typeof seedScenarios;
  seedSimulatorData: typeof seedSimulatorData;
  simulator: typeof simulator;
  stories: typeof stories;
  stripe: typeof stripe;
  studentAnalytics: typeof studentAnalytics;
  studentProgress: typeof studentProgress;
  subscriptions: typeof subscriptions;
  tools: typeof tools;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
