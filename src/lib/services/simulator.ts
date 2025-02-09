import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";
import { OpenAI } from "openai";

import { SimulationState, Message, FeedbackDetails } from "@/types/simulator";
import { getScenarioById } from "@/lib/data/scenarios";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const openaiKey = process.env.OPENAI_API_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);
const openai = new OpenAI({ apiKey: openaiKey });

/**
 * Starts a new simulation session
 */
export async function startSimulation(
  scenarioId: string,
): Promise<SimulationState> {
  const scenario = await getScenarioById(scenarioId);
  if (!scenario) {
    throw new Error(`Scenario ${scenarioId} not found`);
  }

  const sessionId = uuidv4();
  const initialMessage: Message = {
    id: uuidv4(),
    content: scenario.initialMessage,
    role: "assistant",
    timestamp: new Date().toISOString(),
    sender: {
      id: "assistant",
      name: "המערכת",
    },
  };

  const state: SimulationState = {
    id: sessionId,
    scenario,
    messages: [initialMessage],
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Save initial state to database
  const { error } = await supabase.from("simulator_sessions").insert({
    id: sessionId,
    scenario_id: scenarioId,
    status: "active",
    messages: [initialMessage],
  });

  if (error) {
    console.error("Error saving session:", error);
    throw new Error("Failed to save session");
  }

  return state;
}

/**
 * Processes a user message and returns the updated simulation state
 */
export async function processUserMessage(
  state: SimulationState,
  content: string,
): Promise<SimulationState> {
  const userMessage: Message = {
    id: uuidv4(),
    content,
    role: "user",
    timestamp: new Date().toISOString(),
    sender: {
      id: "user",
      name: "משתמש",
    },
  };

  // Add user message to state
  state.messages.push(userMessage);
  state.updatedAt = new Date().toISOString();

  // Generate feedback for user message
  const feedback = await generateFeedback(state, userMessage);
  userMessage.feedback = feedback;

  // Generate assistant response
  const assistantMessage = await generateResponse(state);
  state.messages.push(assistantMessage);

  // Update session in database
  const { error } = await supabase
    .from("simulator_sessions")
    .update({
      messages: state.messages,
      feedback: state.feedback,
      updated_at: state.updatedAt,
    })
    .eq("id", state.id);

  if (error) {
    console.error("Error updating session:", error);
    throw new Error("Failed to update session");
  }

  return state;
}

/**
 * Saves the final simulation results
 */
export async function saveSimulationResults(
  state: SimulationState,
): Promise<void> {
  const finalFeedback = await generateFinalFeedback(state);
  state.feedback = finalFeedback;
  state.status = "completed";
  state.updatedAt = new Date().toISOString();

  // Update session status and feedback
  const sessionUpdate = await supabase
    .from("simulator_sessions")
    .update({
      status: state.status,
      feedback: state.feedback,
      updated_at: state.updatedAt,
      completed_at: state.updatedAt,
    })
    .eq("id", state.id);

  if (sessionUpdate.error) {
    console.error("Error updating session:", sessionUpdate.error);
    throw new Error("Failed to update session");
  }

  // Save results
  const { error: resultsError } = await supabase
    .from("simulator_results")
    .insert({
      session_id: state.id,
      scenario_id: state.scenario.id,
      score: state.feedback?.score || 0,
      feedback: state.feedback,
      duration: getDuration(state.createdAt, state.updatedAt),
      details: {
        messages_count: state.messages.length,
        scenario_difficulty: state.scenario.difficulty,
        scenario_category: state.scenario.category,
      },
    });

  if (resultsError) {
    console.error("Error saving results:", resultsError);
    throw new Error("Failed to save results");
  }
}

/**
 * Generates feedback for a user message using OpenAI
 */
async function generateFeedback(
  state: SimulationState,
  message: Message,
): Promise<Message["feedback"]> {
  const prompt = `
    הערך את ההודעה הבאה בהקשר של תרחיש שיחה:
    
    תרחיש: ${state.scenario.description}
    מטרות למידה: ${state.scenario.learningObjectives.join(", ")}
    קריטריוני הצלחה: מינימום ${state.scenario.successCriteria.minScore} נקודות
    
    הודעת המשתמש: "${message.content}"
    
    הערך את התגובה במדדים הבאים (0-100):
    - אמפתיה: היכולת להבין ולהגיב לרגשות האחר
    - בהירות: עד כמה המסר ברור ומובן
    - אפקטיביות: מידת ההשפעה על השיחה והשגת המטרות
    - התאמה: התאמת הטון והסגנון למצב
    
    ספק גם:
    - חוזקות: מה נעשה טוב
    - נקודות לשיפור: מה ניתן לשפר
    - טיפים: המלצות ספציפיות לשיפור
  `;

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  const content = response.choices[0].message?.content;
  if (!content) {
    throw new Error("No feedback generated");
  }

  // Parse feedback from response
  const feedback = parseFeedback(content);
  return {
    score: calculateScore(feedback),
    message: generateFeedbackMessage(feedback),
    details: feedback,
  };
}

/**
 * Generates a response from the assistant using OpenAI
 */
async function generateResponse(state: SimulationState): Promise<Message> {
  const prompt = `
    אתה משתתף בסימולציה של שיחה. התפקיד שלך הוא להגיב בצורה טבעית ואותנטית.
    
    תרחיש: ${state.scenario.description}
    
    היסטוריית השיחה:
    ${state.messages.map((m) => `${m.sender.name}: ${m.content}`).join("\n")}
    
    הגב בצורה טבעית והמשך את השיחה.
  `;

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.9,
  });

  const content = response.choices[0].message?.content;
  if (!content) {
    throw new Error("No response generated");
  }

  return {
    id: uuidv4(),
    content,
    role: "assistant",
    timestamp: new Date().toISOString(),
    sender: {
      id: "assistant",
      name: "המערכת",
    },
  };
}

/**
 * Generates final feedback for the entire simulation
 */
async function generateFinalFeedback(
  state: SimulationState,
): Promise<SimulationState["feedback"]> {
  const prompt = `
    הערך את הסימולציה הבאה:
    
    תרחיש: ${state.scenario.description}
    מטרות למידה: ${state.scenario.learningObjectives.join(", ")}
    קריטריוני הצלחה: מינימום ${state.scenario.successCriteria.minScore} נקודות
    
    היסטוריית השיחה:
    ${state.messages.map((m) => `${m.sender.name}: ${m.content}`).join("\n")}
    
    ספק משוב מסכם הכולל:
    - ציון כולל (0-100)
    - הערות כלליות
    - המלצות לשיפור
    - פירוט מדדים: אמפתיה, בהירות, אפקטיביות, התאמה
    - חוזקות
    - נקודות לשיפור
    - טיפים לשיפור
  `;

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  const content = response.choices[0].message?.content;
  if (!content) {
    throw new Error("No feedback generated");
  }

  // Parse final feedback
  const feedback = parseFinalFeedback(content);
  return feedback;
}

// Helper functions

function parseFeedback(content: string): FeedbackDetails {
  // Implementation for parsing feedback from OpenAI response
  // This is a placeholder - you'll need to implement the actual parsing logic
  return {
    empathy: 0,
    clarity: 0,
    effectiveness: 0,
    appropriateness: 0,
    strengths: [],
    improvements: [],
    tips: [],
  };
}

function calculateScore(feedback: FeedbackDetails): number {
  return Math.round(
    (feedback.empathy +
      feedback.clarity +
      feedback.effectiveness +
      feedback.appropriateness) /
      4,
  );
}

function generateFeedbackMessage(feedback: FeedbackDetails): string {
  // Implementation for generating feedback message
  // This is a placeholder - you'll need to implement the actual message generation logic
  return "משוב יופק בקרוב";
}

function parseFinalFeedback(content: string): SimulationState["feedback"] {
  // Implementation for parsing final feedback
  // This is a placeholder - you'll need to implement the actual parsing logic
  return {
    score: 0,
    comments: [],
    suggestions: [],
    details: {
      empathy: 0,
      clarity: 0,
      effectiveness: 0,
      appropriateness: 0,
      strengths: [],
      improvements: [],
      tips: [],
    },
    overallProgress: {
      empathy: 0,
      clarity: 0,
      effectiveness: 0,
      appropriateness: 0,
    },
  };
}

function getDuration(startTime: string, endTime: string): number {
  return Math.round(
    (new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000,
  );
}
