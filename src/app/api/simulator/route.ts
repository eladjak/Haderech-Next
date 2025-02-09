import { NextResponse } from "next/server";
import { z } from "zod";

import {
  startSimulation,
  processUserMessage,
  saveSimulationResults,
} from "@/lib/services/simulator";
import type { SimulationState } from "@/types/simulator";

// Validation schemas
const startSchema = z.object({
  scenarioId: z.string().min(1),
});

const messageSchema = z.object({
  state: z.object({
    id: z.string(),
    scenario: z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
      difficulty: z.enum(["beginner", "intermediate", "advanced"]),
      category: z.string(),
      initialMessage: z.string(),
      suggestedResponses: z.array(z.string()),
      learningObjectives: z.array(z.string()),
      successCriteria: z.object({
        minScore: z.number(),
        requiredSkills: z.array(z.string()),
        minDuration: z.number(),
        maxDuration: z.number(),
      }),
    }),
    messages: z.array(
      z.object({
        id: z.string(),
        content: z.string(),
        role: z.enum(["user", "assistant", "system"]),
        timestamp: z.string(),
        sender: z.object({
          id: z.string(),
          name: z.string(),
          avatar: z.string().optional(),
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
              })
              .optional(),
          })
          .optional(),
      }),
    ),
    status: z.enum(["active", "completed", "failed"]),
    feedback: z
      .object({
        score: z.number(),
        comments: z.array(z.string()),
        suggestions: z.array(z.string()),
        details: z.object({
          empathy: z.number(),
          clarity: z.number(),
          effectiveness: z.number(),
          appropriateness: z.number(),
          strengths: z.array(z.string()),
          improvements: z.array(z.string()),
          tips: z.array(z.string()),
        }),
        overallProgress: z.object({
          empathy: z.number(),
          clarity: z.number(),
          effectiveness: z.number(),
          appropriateness: z.number(),
        }),
      })
      .optional(),
    createdAt: z.string(),
    updatedAt: z.string(),
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
    const { scenarioId } = startSchema.parse(body);

    const state = await startSimulation(scenarioId);
    return NextResponse.json(state);
  } catch (error) {
    console.error("Error starting simulation:", error);
    return NextResponse.json(
      { error: "Failed to start simulation" },
      { status: 500 },
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

    const newState = await processUserMessage(
      state as SimulationState,
      message,
    );
    return NextResponse.json(newState);
  } catch (error) {
    console.error("Error processing message:", error);
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 500 },
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
      { status: 500 },
    );
  }
}
