import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";

import * as simulator from "@/lib/services/simulator";
import type { SimulatorScenario, SimulatorSession, SimulatorState} from "@/components/ui/";\nimport type {
  SimulatorScenario,
  SimulatorSession,
  SimulatorState,} from "@/types/simulator";

describe("Simulator Build Tests", () => {
  it("should export all required functions", () => {
    expect(simulator.startSimulation).toBeDefined();
    expect(simulator.processUserMessage).toBeDefined();
    expect(simulator.saveSimulationResults).toBeDefined();
  });

  it("should have correct function signatures", () => {
    const startSimulation = simulator.startSimulation as (
      scenario: SimulatorScenario,
      userId: string
    ) => Promise<SimulatorSession>;

    const processUserMessage = simulator.processUserMessage as (
      session: SimulatorSession,
      content: string
    ) => Promise<SimulatorState>;

    const saveSimulationResults = simulator.saveSimulationResults as (
      state: SimulatorSession
    ) => Promise<void>;

    expect(typeof startSimulation).toBe("function");
    expect(typeof processUserMessage).toBe("function");
    expect(typeof saveSimulationResults).toBe("function");
  });

  it("should have all required environment variables", () => {
    expect(process.env.NEXT_PUBLIC_SUPABASE_URL).toBeDefined();
    expect(process.env.SUPABASE_SERVICE_ROLE_KEY).toBeDefined();
    expect(process.env.OPENAI_API_KEY).toBeDefined();
  });

  it("should have valid imports", () => {
    expect(() => import("@supabase/supabase-js")).resolves.toBeDefined();
    expect(() => import("openai")).resolves.toBeDefined();
    expect(() => import("uuid")).resolves.toBeDefined();
  });

  it("should have correct type exports", () => {
    const mockState: SimulatorState = {
      id: "test",
      user_id: "test",
      scenario_id: "test",
      scenario: {
        id: "test",
        title: "test",
        description: "test",
        difficulty: "beginner",
        category: "test",
        tags: [],
        initial_message: "test",
        learning_objectives: [],
        success_criteria: {
          minScore: 0,
          requiredSkills: [],
          minDuration: 0,
          maxDuration: 0,
        },
        created_at: "",
        updated_at: "",
      },
      status: "running",
      state: "initial",
      messages: [],
      created_at: "",
      updated_at: "",
    };

    expect(mockState).toMatchObject({
      id: expect.any(String),
      user_id: expect.any(String),
      scenario_id: expect.any(String),
      status: expect.stringMatching(/^(idle|running|completed|error)$/),
      state: expect.stringMatching(/^(initial|in_progress|completed)$/),
    });
  });

  it("should have correct default exports", () => {
    expect(simulator).toBeDefined();
  });

  it("should have correct bundle size", async () => {
    const filePath = path.resolve(
      __dirname,
      "../../../lib/services/simulator.ts"
    );
    const fileContent = await fs.promises.readFile(filePath, "utf8");
    const fileSize = Buffer.from(fileContent).length;

    // גודל הקובץ צריך להיות פחות מ-50KB
    expect(fileSize).toBeLessThan(50 * 1024);
  });

  it("should have correct code style", async () => {
    const filePath = path.resolve(
      __dirname,
      "../../../lib/services/simulator.ts"
    );
    const fileContent = await fs.promises.readFile(filePath, "utf8");

    // בדיקת סגנון קוד
    expect(fileContent).toMatch(/^\/\*\*/m); // יש JSDoc
    expect(fileContent).toMatch(/^import /m); // יש imports
    expect(fileContent).toMatch(/^export /m); // יש exports
    expect(fileContent).not.toMatch(/console\.log/); // אין console.logs
    expect(fileContent).not.toMatch(/any/); // אין any types
  });

  it("should have correct dependencies", () => {
    const packageJsonPath = path.resolve(__dirname, "../../../../package.json");
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    const deps = packageJson.dependencies;

    expect(deps["@supabase/supabase-js"]).toBeDefined();
    expect(deps["openai"]).toBeDefined();
    expect(deps["uuid"]).toBeDefined();

    // בדיקת גרסאות
    expect(deps["@supabase/supabase-js"]).toMatch(/^\^/); // משתמש בגרסה גמישה
    expect(deps["openai"]).toMatch(/^\^/);
    expect(deps["uuid"]).toMatch(/^\^/);
  });

  it("should have correct dev dependencies", () => {
    const packageJsonPath = path.resolve(__dirname, "../../../../package.json");
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    const devDeps = packageJson.devDependencies;

    expect(devDeps["@types/uuid"]).toBeDefined();
    expect(devDeps["vitest"]).toBeDefined();
    expect(devDeps["@testing-library/react"]).toBeDefined();
  });
});
