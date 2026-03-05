/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as adminAnalytics from "../adminAnalytics.js";
import type * as adminComments from "../adminComments.js";
import type * as adminCommunity from "../adminCommunity.js";
import type * as adminLessons from "../adminLessons.js";
import type * as adminQuizzes from "../adminQuizzes.js";
import type * as aiSimulator from "../aiSimulator.js";
import type * as analytics from "../analytics.js";
import type * as blog from "../blog.js";
import type * as certificates from "../certificates.js";
import type * as chat from "../chat.js";
import type * as comments from "../comments.js";
import type * as community from "../community.js";
import type * as contact from "../contact.js";
import type * as courses from "../courses.js";
import type * as crons from "../crons.js";
import type * as dailyContent from "../dailyContent.js";
import type * as emailTemplates from "../emailTemplates.js";
import type * as enrollments from "../enrollments.js";
import type * as gamification from "../gamification.js";
import type * as health from "../health.js";
import type * as lessons from "../lessons.js";
import type * as lib_authGuard from "../lib/authGuard.js";
import type * as mentoring from "../mentoring.js";
import type * as notes from "../notes.js";
import type * as notificationHelpers from "../notificationHelpers.js";
import type * as notifications from "../notifications.js";
import type * as onboarding from "../onboarding.js";
import type * as progress from "../progress.js";
import type * as quizResults from "../quizResults.js";
import type * as quizzes from "../quizzes.js";
import type * as reviews from "../reviews.js";
import type * as scheduledTasks from "../scheduledTasks.js";
import type * as search from "../search.js";
import type * as seed from "../seed.js";
import type * as seedCourseData from "../seedCourseData.js";
import type * as seedSimulatorData from "../seedSimulatorData.js";
import type * as simulator from "../simulator.js";
import type * as stories from "../stories.js";
import type * as studentAnalytics from "../studentAnalytics.js";
import type * as subscriptions from "../subscriptions.js";
import type * as tools from "../tools.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  adminAnalytics: typeof adminAnalytics;
  adminComments: typeof adminComments;
  adminCommunity: typeof adminCommunity;
  adminLessons: typeof adminLessons;
  adminQuizzes: typeof adminQuizzes;
  aiSimulator: typeof aiSimulator;
  analytics: typeof analytics;
  blog: typeof blog;
  certificates: typeof certificates;
  chat: typeof chat;
  comments: typeof comments;
  community: typeof community;
  contact: typeof contact;
  courses: typeof courses;
  crons: typeof crons;
  dailyContent: typeof dailyContent;
  emailTemplates: typeof emailTemplates;
  enrollments: typeof enrollments;
  gamification: typeof gamification;
  health: typeof health;
  lessons: typeof lessons;
  "lib/authGuard": typeof lib_authGuard;
  mentoring: typeof mentoring;
  notes: typeof notes;
  notificationHelpers: typeof notificationHelpers;
  notifications: typeof notifications;
  onboarding: typeof onboarding;
  progress: typeof progress;
  quizResults: typeof quizResults;
  quizzes: typeof quizzes;
  reviews: typeof reviews;
  scheduledTasks: typeof scheduledTasks;
  search: typeof search;
  seed: typeof seed;
  seedCourseData: typeof seedCourseData;
  seedSimulatorData: typeof seedSimulatorData;
  simulator: typeof simulator;
  stories: typeof stories;
  studentAnalytics: typeof studentAnalytics;
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
