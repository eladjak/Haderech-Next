import { NextResponse } from "next/server";

import { z } from "zod";

import { getScenarioById } from "@/lib/data/scenarios";
import {
  completeSimulation,
  saveSimulationResults,
  startSimulation,
} from "@/lib/services/simulator";
import type { SimulationState, SimulatorScenario } from "@/types/simulator";

// Validation schemas
const startSchema = z.object({
  scenarioId: z.string().min(1),
  userId: z.string().min(1),
});

const simulatorScenarioSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  category: z.string(),
  initial_message: z.string(),
  suggested_responses: z.array(z.string()),
  learning_objectives: z.array(z.string()),
  success_criteria: z.object({
    minScore: z.number(),
    requiredSkills: z.array(z.string()),
    minDuration: z.number(),
    maxDuration: z.number(),
  }),
  created_at: z.string(),
  updated_at: z.string(),
});

const messageSchema = z.object({
  state: z.object({
    id: z.string(),
    scenario: simulatorScenarioSchema,
    messages: z.array(
      z.object({
        id: z.string(),
        content: z.string(),
        role: z.enum(["user", "assistant", "system"]),
        timestamp: z.string(),
        sender: z.object({
          role: z.enum(["user", "assistant", "system"]),
          name: z.string().optional(),
          avatar_url: z.string().optional(),
        }),
        feedback: z
          .object({
            score: z.number(),
            message: z.string(),
            details: z
              .object({
                empathy: z.number(),
                clarity: z.number(),
                effectiveness: z.number(),
                appropriateness: z.number(),
                strengths: z.array(z.string()),
                improvements: z.array(z.string()),
                tips: z.array(z.string()),
                comments: z.string(),
                suggestions: z.array(z.string()),
                overallProgress: z.object({
                  empathy: z.number(),
                  clarity: z.number(),
                  effectiveness: z.number(),
                  appropriateness: z.number(),
                }),
              })
              .optional(),
          })
          .optional(),
      })
    ),
    status: z.enum(["active", "completed", "failed"]),
    feedback: z
      .object({
        empathy: z.number(),
        clarity: z.number(),
        effectiveness: z.number(),
        appropriateness: z.number(),
        strengths: z.array(z.string()),
        improvements: z.array(z.string()),
        tips: z.array(z.string()),
        comments: z.string(),
        suggestions: z.array(z.string()),
        overallProgress: z.object({
          empathy: z.number(),
          clarity: z.number(),
          effectiveness: z.number(),
          appropriateness: z.number(),
        }),
      })
      .optional(),
    created_at: z.string(),
    updated_at: z.string(),
    completed_at: z.string().optional(),
  }),
  message: z.string().min(1).max(1000),
});

/**
 * POST /api/simulator/start
 *
 * Starts a new dating simulation
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { scenarioId, userId } = startSchema.parse(body);

    const scenario = await getScenarioById(scenarioId);
    if (!scenario) {
      return NextResponse.json(
        { error: "Scenario not found" },
        { status: 404 }
      );
    }

    const state = await startSimulation(scenario, userId);
    return NextResponse.json(state);
  } catch (error) {
    console.error("Error starting simulation:", error);
    return NextResponse.json(
      { error: "Failed to start simulation" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/simulator/message
 *
 * Processes a user message in the simulation
 */
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { state, message } = messageSchema.parse(body);

    const newState = await completeSimulation(state as SimulationState);
    return NextResponse.json(newState);
  } catch (error) {
    console.error("Error processing message:", error);
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/simulator/save
 *
 * Saves the simulation results
 */
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { state } = messageSchema.parse(body);

    await saveSimulationResults(state as SimulationState);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving simulation:", error);
    return NextResponse.json(
      { error: "Failed to save simulation" },
      { status: 500 }
    );
  }
}
