import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { flattenLessons, SEED_COURSES } from "../../convex/seedCourseData";
import {
  STG1_ACCESS_EXPECTATIONS,
  STG1_AUTHENTICATED_ALIASES,
  STG1_DEPLOYMENT_NAME,
  STG1_FIXTURE_CONFIRMATION,
  STG1_FIXTURE_ENV_VALUE,
  expectedStg1IdentityEmail,
  planStg1LegacyCourseBaseline,
  validateStg1FixtureWrite,
  validateStg1IdentityMap,
} from "../../convex/lib/stg1FixturePlan";

const sourceCourse = SEED_COURSES.find(
  (course) => course.title === "הדרך - אומנות הקשר",
);
if (!sourceCourse) throw new Error("Canonical course fixture is missing");
const sourceLessons = flattenLessons(sourceCourse);

const identityMap = Object.fromEntries(
  STG1_AUTHENTICATED_ALIASES.map((alias, index) => [
    alias,
    `user_Test${index}Abc`,
  ]),
);

describe("STG-1 synthetic fixture plan", () => {
  it("derives an exact 75-lesson legacy baseline without the optional target", () => {
    const plan = planStg1LegacyCourseBaseline(sourceLessons);
    expect(plan.status).toBe("ready");
    expect(plan.lessons).toHaveLength(75);
    expect(plan.lessons.map((lesson) => lesson.order)).toEqual(
      Array.from({ length: 75 }, (_, index) => index),
    );
    expect(plan.lessons.some((lesson) => lesson.scriptIndex === "5.3.2")).toBe(
      false,
    );
    const predecessor = plan.lessons.findIndex(
      (lesson) => lesson.scriptIndex === "5.3.1",
    );
    expect(plan.lessons[predecessor + 1]?.scriptIndex).toBe("5.4.1");
  });

  it("fails closed when the reviewed source loses or duplicates target identity", () => {
    const missing = sourceLessons.filter(
      (lesson) => lesson.scriptIndex !== "5.3.2",
    );
    expect(planStg1LegacyCourseBaseline(missing)).toMatchObject({
      status: "conflict",
      conflicts: expect.arrayContaining([
        "SOURCE_LESSON_COUNT:75",
        "OPTIONAL_TARGET_COUNT:0",
      ]),
    });

    const duplicate = [...sourceLessons, sourceLessons.find((lesson) => lesson.scriptIndex === "5.3.2")!];
    expect(planStg1LegacyCourseBaseline(duplicate)).toMatchObject({
      status: "conflict",
      conflicts: expect.arrayContaining([
        "SOURCE_LESSON_COUNT:77",
        "OPTIONAL_TARGET_COUNT:2",
        "DUPLICATE_SCRIPT_INDEX:5.3.2",
      ]),
    });
  });

  it("fails closed if a required lesson stops affecting progress", () => {
    const tampered = sourceLessons.map((lesson) =>
      lesson.scriptIndex === "1.1.1"
        ? { ...lesson, completionAffectsProgress: false }
        : lesson,
    );
    expect(planStg1LegacyCourseBaseline(tampered)).toMatchObject({
      status: "conflict",
      conflicts: expect.arrayContaining([
        "REQUIRED_LESSON_EXCLUDED_FROM_PROGRESS",
      ]),
    });
  });

  it("accepts seven unique Clerk-shaped provider IDs and rejects ambiguity", () => {
    expect(validateStg1IdentityMap(identityMap)).toEqual([]);
    expect(
      validateStg1IdentityMap({ ...identityMap, B: identityMap.A }),
    ).toContain("IDENTITY_PROVIDER_ID_DUPLICATE:A|B");
    expect(
      validateStg1IdentityMap({ ...identityMap, ADMIN: "REPLACE_ME" }),
    ).toContain("IDENTITY_PROVIDER_ID_INVALID:ADMIN");
    const missing: Record<string, string> = { ...identityMap };
    delete missing.X;
    expect(validateStg1IdentityMap(missing)[0]).toContain("IDENTITY_MAP_KEYS:");
  });

  it("requires all backend and human write guards together", () => {
    const valid = {
      seedEnabled: "true",
      fixtureEnabled: STG1_FIXTURE_ENV_VALUE,
      deploymentName: STG1_DEPLOYMENT_NAME,
      confirmation: STG1_FIXTURE_CONFIRMATION,
    };
    expect(validateStg1FixtureWrite(valid)).toEqual([]);
    expect(
      validateStg1FixtureWrite({ ...valid, seedEnabled: "false" }),
    ).toContain("SEED_DISABLED");
    expect(
      validateStg1FixtureWrite({
        ...valid,
        fixtureEnabled: "other:stg1-v1",
      }),
    ).toContain("FIXTURE_ENV_TARGET_MISMATCH");
    expect(
      validateStg1FixtureWrite({ ...valid, deploymentName: "production" }),
    ).toContain("DEPLOYMENT_ENV_TARGET_MISMATCH");
    expect(
      validateStg1FixtureWrite({ ...valid, confirmation: "yes" }),
    ).toContain("CONFIRMATION_MISMATCH");
  });

  it("keeps the committed manifests free of credentials and personal data", () => {
    const targetManifest = JSON.parse(
      fs.readFileSync(
        path.resolve(process.cwd(), "docs/staging/stg1-target-manifest.json"),
        "utf8",
      ),
    );
    expect(targetManifest.deploymentName).toBe(STG1_DEPLOYMENT_NAME);
    expect(targetManifest).not.toHaveProperty("deployKey");
    expect(STG1_AUTHENTICATED_ALIASES.map(expectedStg1IdentityEmail)).toEqual(
      expect.arrayContaining([
        "stg1+u0@example.invalid",
        "stg1+admin@example.invalid",
      ]),
    );
    expect(STG1_ACCESS_EXPECTATIONS.A.kind).toBe("community");
    expect(STG1_ACCESS_EXPECTATIONS.E.kind).toBe("course");
    expect(STG1_ACCESS_EXPECTATIONS.X.status).toBe("expired");
  });
});
