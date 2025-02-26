import { NextResponse } from "next/server";

import { z } from "zod";

import { getScenarioById } from "@/lib/data/scenarios";
import { processUserMessage, saveSimulationResults, startSimulation} from "@/components/ui/";\nimport type { _SimulatorScenario, SimulatorSession } from "@/types/simulator";

import {
  processUserMessage,
  saveSimulationResults,
  startSimulation,
} from "@/lib/services/simulator";


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
  tags: z.array(z.string()),
  initial_message: z.string(),
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
    user_id: z.string(),
    scenario_id: z.string(),
    scenario: simulatorScenarioSchema,
    status: z.enum(["idle", "running", "completed", "error"]),
    state: z.enum(["initial", "in_progress", "completed"]),
    messages: z.array(
      z.object({
        id: z.string(),
        role: z.enum(["user", "assistant"]),
        content: z.string(),
        timestamp: z.string(),
        sender: z.object({
          id: z.string(),
          role: z.enum(["user", "assistant"]),
          name: z.string(),
          avatar_url: z.string().optional(),
        }),
        created_at: z.string(),
        updated_at: z.string(),
        feedback: z
          .object({
            metrics: z.object({
              empathy: z.number(),
              clarity: z.number(),
              effectiveness: z.number(),
              appropriateness: z.number(),
              professionalism: z.number(),
              problem_solving: z.number(),
              overall: z.number(),
            }),
            score: z.number(),
            strengths: z.array(z.string()),
            improvements: z.array(z.string()),
            tips: z.array(z.string()),
            comments: z.string(),
            suggestions: z.array(z.string()),
            overallProgress: z.object({
              score: z.number(),
              level: z.string(),
              nextLevel: z.string(),
              requiredScore: z.number(),
            }),
          })
          .optional(),
      })
    ),
    created_at: z.string(),
    updated_at: z.string(),
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

    const session: SimulatorSession = {
      id: state.id,
      user_id: state.user_id,
      scenario_id: state.scenario.id,
      scenario: {
        ...state.scenario,
        tags: state.scenario.tags || [],
      },
      status: "running",
      state: {
        id: state.id,
        user_id: state.user_id,
        scenario_id: state.scenario.id,
        scenario: {
          ...state.scenario,
          tags: state.scenario.tags || [],
        },
        status: "running",
        state: "in_progress",
        messages: state.messages.map((msg) => ({
          ...msg,
          created_at: msg.timestamp,
          updated_at: msg.timestamp,
        })),
        created_at: state.created_at,
        updated_at: state.updated_at,
      },
      messages: state.messages.map((msg) => ({
        ...msg,
        created_at: msg.timestamp,
        updated_at: msg.timestamp,
      })),
      created_at: state.created_at,
      updated_at: state.updated_at,
    };

    const newState = await processUserMessage(session, message);
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

    const session: SimulatorSession = {
      id: state.id,
      user_id: state.user_id,
      scenario_id: state.scenario.id,
      scenario: {
        ...state.scenario,
        tags: state.scenario.tags || [],
      },
      status: "running",
      state: {
        id: state.id,
        user_id: state.user_id,
        scenario_id: state.scenario.id,
        scenario: {
          ...state.scenario,
          tags: state.scenario.tags || [],
        },
        status: "running",
        state: "in_progress",
        messages: state.messages.map((msg) => ({
          ...msg,
          created_at: msg.timestamp,
          updated_at: msg.timestamp,
        })),
        created_at: state.created_at,
        updated_at: state.updated_at,
      },
      messages: state.messages.map((msg) => ({
        ...msg,
        created_at: msg.timestamp,
        updated_at: msg.timestamp,
      })),
      created_at: state.created_at,
      updated_at: state.updated_at,
    };

    await saveSimulationResults(session);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving simulation:", error);
    return NextResponse.json(
      { error: "Failed to save simulation" },
      { status: 500 }
    );
  }
}
