import { createClient } from "@supabase/supabase-js";
import { OpenAI } from "openai";
import { v4 as uuidv4 } from "uuid";

import { FEEDBACK_CRITERIA, SCENARIO_TYPES } from "@/constants/simulator";
import { config } from "@/lib/config";
import type {
  FeedbackDetails,
  FeedbackMetrics,
  Message,
  MessageFeedback,
  SimulatorScenario,
  SimulatorSession,
  SimulatorState,
} from "@/types/simulator";

// Use environment variables from config
const supabaseUrl = config.supabaseUrl;
const supabaseKey = process.env["SUPABASE_SERVICE_ROLE_KEY"];

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing required environment variables");
}

const supabase = createClient(supabaseUrl, supabaseKey);
const openai = new OpenAI({ apiKey: config.openaiApiKey });

// Default values for feedback components
const DEFAULT_COMMENTS = "No special comments";
const DEFAULT_SUGGESTIONS = ["No improvement suggestions"];
const DEFAULT_TIPS = ["No additional tips"];
const DEFAULT_STRENGTHS = ["No special strengths"];
const DEFAULT_IMPROVEMENTS = ["No improvement points"];

/**
 * Start a new simulation session with the given scenario
 * @param scenario The scenario to simulate
 * @param userId The ID of the user starting the simulation
 * @returns A new simulation session
 */
export async function startSimulation(
  scenario: SimulatorScenario,
  userId: string
): Promise<SimulatorSession> {
  const timestamp = new Date().toISOString();
  const initialMessage: Message = {
    id: uuidv4(),
    role: "assistant",
    content: scenario.initial_message,
    timestamp,
    created_at: timestamp,
    updated_at: timestamp,
    sender: {
      id: uuidv4(),
      role: "assistant",
      name: "System",
    },
  };

  const state: SimulatorState = {
    id: uuidv4(),
    user_id: userId,
    scenario_id: scenario.id,
    scenario,
    status: "idle",
    messages: [initialMessage],
    state: "initial",
    created_at: timestamp,
    updated_at: timestamp,
  };

  const session: SimulatorSession = {
    id: uuidv4(),
    user_id: userId,
    scenario_id: scenario.id,
    scenario,
    status: "idle",
    state,
    messages: [initialMessage],
    created_at: timestamp,
    updated_at: timestamp,
  };

  await saveSimulationState(session);
  return session;
}

/**
 * Generate feedback for a set of messages in a simulation
 * @param messages The messages to analyze for feedback
 * @returns Detailed feedback with metrics and suggestions
 */
async function generateFeedback(
  messages: readonly Message[]
): Promise<FeedbackDetails> {
  const metrics: FeedbackMetrics = {
    empathy: 0,
    clarity: 0,
    effectiveness: 0,
    appropriateness: 0,
    professionalism: 0,
    problem_solving: 0,
    overall: 0,
  };

  // Analyze messages and calculate scores
  for (const message of messages) {
    if (message.role === "user") {
      metrics.empathy = calculateEmpathyScore(message.content);
      metrics.clarity = calculateClarityScore(message.content);
      metrics.effectiveness = calculateEffectivenessScore(message.content);
      metrics.appropriateness = calculateAppropriatenessScore(message.content);
      metrics.professionalism = calculateProfessionalismScore(message.content);
      metrics.problem_solving = calculateProblemSolvingScore(message.content);
    }
  }

  const score = calculateMetricsScore(metrics);
  metrics.overall = score;

  return {
    metrics,
    score,
    strengths: [...DEFAULT_STRENGTHS],
    improvements: [...DEFAULT_IMPROVEMENTS],
    tips: [...DEFAULT_TIPS],
    comments: DEFAULT_COMMENTS,
    suggestions: [...DEFAULT_SUGGESTIONS],
    overallProgress: {
      score,
      level: "Beginner",
      nextLevel: "Advanced",
      requiredScore: 80,
    },
  };
}

function calculateScore(content: string, criteria: string[]): number {
  let score = 0;
  criteria.forEach((criterion) => {
    if (content.toLowerCase().includes(criterion.toLowerCase())) {
      score += 20;
    }
  });
  return Math.min(100, score);
}

function calculateEmpathyScore(content: string): number {
  const empathyCriteria = [
    "אני מבין",
    "אני מרגיש",
    "אני שומע",
    "זה נשמע",
    "אני מצטער",
  ];
  return calculateScore(content, empathyCriteria);
}

function calculateClarityScore(content: string): number {
  const clarityCriteria = [
    "האם זה ברור",
    "אני אסביר",
    "לדוגמה",
    "כלומר",
    "במילים אחרות",
  ];
  return calculateScore(content, clarityCriteria);
}

function calculateEffectivenessScore(content: string): number {
  const effectivenessCriteria = [
    "אני מציע",
    "אפשר לנסות",
    "הפתרון",
    "הדרך הטובה",
    "יעזור לך",
  ];
  return calculateScore(content, effectivenessCriteria);
}

function calculateAppropriatenessScore(content: string): number {
  const appropriatenessCriteria = [
    "בהתאם ל",
    "מתאים ל",
    "בהקשר",
    "לפי המצב",
    "בשלב זה",
  ];
  return calculateScore(content, appropriatenessCriteria);
}

function calculateProfessionalismScore(content: string): number {
  const professionalismCriteria = ["מקצועי", "מיומן", "מנוסה", "מומחה", "בקיא"];
  return calculateScore(content, professionalismCriteria);
}

function calculateProblemSolvingScore(content: string): number {
  const problemSolvingCriteria = ["פתרון", "דרך", "אפשרות", "חלופה", "הצעה"];
  return calculateScore(content, problemSolvingCriteria);
}

function calculateMetricsScore(metrics: FeedbackMetrics): number {
  return Math.round(
    (metrics.empathy +
      metrics.clarity +
      metrics.effectiveness +
      metrics.appropriateness +
      metrics.professionalism +
      metrics.problem_solving) /
      6
  );
}

async function saveSimulationState(session: SimulatorSession): Promise<void> {
  const { error } = await supabase
    .from("simulator_sessions")
    .update({
      messages: session.messages,
      feedback: session.feedback,
      updated_at: session.updated_at,
    })
    .eq("id", session.id);

  if (error) {
    console.error("Error updating session:", error);
    throw new Error("Failed to update session");
  }
}

export function evaluateEmpathy(_content: string): number {
  return Math.random() * 10;
}

export function evaluateClarity(_content: string): number {
  return Math.random() * 10;
}

export function evaluateEffectiveness(_content: string): number {
  return Math.random() * 10;
}

export function evaluateAppropriateness(_content: string): number {
  return Math.random() * 10;
}

export function evaluateProfessionalism(_content: string): number {
  return Math.random() * 10;
}

export function evaluateProblemSolving(_content: string): number {
  return Math.random() * 10;
}
