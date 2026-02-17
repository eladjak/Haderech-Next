/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type { Id } from "./dataModel.js";

import type * as admin from "../admin.js";
import type * as analytics from "../analytics.js";
import type * as certificates from "../certificates.js";
import type * as courses from "../courses.js";
import type * as enrollments from "../enrollments.js";
import type * as lessons from "../lessons.js";
import type * as progress from "../progress.js";
import type * as quizResults from "../quizResults.js";
import type * as quizzes from "../quizzes.js";
import type * as seed from "../seed.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  analytics: typeof analytics;
  certificates: typeof certificates;
  courses: typeof courses;
  enrollments: typeof enrollments;
  lessons: typeof lessons;
  progress: typeof progress;
  quizResults: typeof quizResults;
  quizzes: typeof quizzes;
  seed: typeof seed;
  users: typeof users;
}>;

export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
