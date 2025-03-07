import { beforeAll, describe, expect, it } from "vitest";

import { processUserMessage, saveSimulationResults, startSimulation} from "@/components/ui/";
import {
import type { SimulatorScenario, SimulatorSession } from "@/types/simulator";
import {

"use client";

 processUserMessage, saveSimulationResults,
export {}




  processUserMessage,
  saveSimulationResults,
  startSimulation} from "@/lib/services/simulator";




const mockScenario: SimulatorScenario = {
  id: "perf-test-scenario",
  title: "תרחיש בדיקת ביצועים",
  description: "תרחיש לבדיקת ביצועי המערכת",
  difficulty: "beginner",
  category: "תקשורת",
  tags: ["תקשורת", "אמפתיה"],
  initial_message: "שלום, איך אני יכול לעזור?",
  learning_objectives: ["שיפור תקשורת", "הבנת צרכי המשתמש"],
  success_criteria: {
    minScore: 70,
    requiredSkills: ["תקשורת", "אמפתיה"],
    minDuration: 300,
    maxDuration: 900},
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()};

describe("Simulator Performance Tests", () => {
  let session: SimulatorSession;
  const mockUserId = "perf-test-user";

  beforeAll(async () => {
    session = await startSimulation(mockScenario, mockUserId);
  });

  it("should start simulation within 100ms", async () => {
    const start = performance.now();
    await startSimulation(mockScenario, mockUserId);
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(100);
  });

  it("should process message within 500ms", async () => {
    const start = performance.now();
    await processUserMessage(session, "הודעת בדיקת ביצועים");
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(500);
  });

  it("should handle multiple concurrent messages", async () => {
    const messages = Array(10).fill("הודעת בדיקת ביצועים");
    const start = performance.now();
    await Promise.all(messages.map((msg) => processUserMessage(session, msg)));
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(2000); // 200ms per message on average
  });

  it("should save results within 200ms", async () => {
    const start = performance.now();
    await saveSimulationResults(session);
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(200);
  });

  it("should maintain performance with large message history", async () => {
    // Add 50 messages to the session
    for (let i = 0; i < 50; i++) {
      await processUserMessage(session, `הודעת בדיקה ${i}`);
    }

    const start = performance.now();
    await processUserMessage(session, "הודעה נוספת");
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(500);
  });

  it("should handle memory usage efficiently", async () => {
    const initialMemory = process.memoryUsage().heapUsed;

    // Simulate intensive usage
    for (let i = 0; i < 100; i++) {
      await processUserMessage(session, `הודעת בדיקת זיכרון ${i}`);
    }

    const finalMemory = process.memoryUsage().heapUsed;
    const memoryIncrease = (finalMemory - initialMemory) / 1024 / 1024; // MB

    expect(memoryIncrease).toBeLessThan(50); // Less than 50MB increase
  });

  it("should handle concurrent simulations efficiently", async () => {
    const numSessions = 5;
    const sessions = await Promise.all(
      Array(numSessions)
        .fill(null)
        .map((_, i) => startSimulation(mockScenario, `user-${i}`))
    );

    const start = performance.now();
    await Promise.all(
      sessions.map((s) => processUserMessage(s, "הודעת בדיקה מקבילית"))
    );
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(1000); // Less than 200ms per session
  });
});
