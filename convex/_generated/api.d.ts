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
import type * as adminComments from "../adminComments.js";
import type * as adminLessons from "../adminLessons.js";
import type * as adminQuizzes from "../adminQuizzes.js";
import type * as aiSimulator from "../aiSimulator.js";
import type * as analytics from "../analytics.js";
import type * as certificates from "../certificates.js";
import type * as chat from "../chat.js";
import type * as comments from "../comments.js";
import type * as community from "../community.js";
import type * as courses from "../courses.js";
import type * as enrollments from "../enrollments.js";
import type * as gamification from "../gamification.js";
import type * as lessons from "../lessons.js";
import type * as lib_authGuard from "../lib/authGuard.js";
import type * as notes from "../notes.js";
import type * as notifications from "../notifications.js";
import type * as progress from "../progress.js";
import type * as quizResults from "../quizResults.js";
import type * as quizzes from "../quizzes.js";
import type * as seed from "../seed.js";
import type * as seedCourseData from "../seedCourseData.js";
import type * as seedSimulatorData from "../seedSimulatorData.js";
import type * as simulator from "../simulator.js";
import type * as tools from "../tools.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  adminComments: typeof adminComments;
  adminLessons: typeof adminLessons;
  adminQuizzes: typeof adminQuizzes;
  aiSimulator: typeof aiSimulator;
  analytics: typeof analytics;
  certificates: typeof certificates;
  chat: typeof chat;
  comments: typeof comments;
  community: typeof community;
  courses: typeof courses;
  enrollments: typeof enrollments;
  gamification: typeof gamification;
  lessons: typeof lessons;
  "lib/authGuard": typeof lib_authGuard;
  notes: typeof notes;
  notifications: typeof notifications;
  progress: typeof progress;
  quizResults: typeof quizResults;
  quizzes: typeof quizzes;
  seed: typeof seed;
  seedCourseData: typeof seedCourseData;
  seedSimulatorData: typeof seedSimulatorData;
  simulator: typeof simulator;
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
