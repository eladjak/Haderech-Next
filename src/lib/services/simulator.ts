/**
 * @file simulator.ts
 * @description שירות לניהול סימולציות שיחה, כולל הערכה ומשוב
 */

import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import { v4 as uuidv4 } from "uuid";

import { getScenarioById } from "@/lib/data/scenarios";
import type {
  ChatCompletionMessage,
  FeedbackDetails,
  FeedbackMetrics,
  FeedbackResponse,
  Message,
  MessageFeedback,
  SimulatorResponse,
  SimulatorScenario,
  SimulatorSession,
  SimulatorState,
} from "@/types/simulator";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env["SUPABASE_SERVICE_ROLE_KEY"];
const openaiKey = process.env.OPENAI_API_KEY;

if (!supabaseUrl || !supabaseKey || !openaiKey) {
  throw new Error("Missing required environment variables");
}

const supabase = createClient(supabaseUrl, supabaseKey);
const openai = new OpenAI({ apiKey: openaiKey });

const DEFAULT_STRENGTHS = ["אין חוזקות מיוחדות שזוהו"] as const;
const DEFAULT_IMPROVEMENTS = ["אין נקודות לשיפור מיוחדות שזוהו"] as const;
const DEFAULT_TIPS = ["המשך לתרגל ולשפר את המיומנויות הבסיסיות"] as const;
const DEFAULT_SUGGESTIONS = [
  "המשך לתרגל ולשפר את המיומנויות הבסיסיות",
] as const;
const DEFAULT_COMMENTS = ["אין הערות מיוחדות"] as const;

/**
 * מתחיל סימולציה חדשה
 */
export async function startSimulation(
  scenario: SimulatorScenario,
  userId: string
): Promise<SimulatorSession> {
  const initialMessage: Message = {
    id: uuidv4(),
    role: "assistant",
    content: scenario.initial_message,
    timestamp: new Date().toISOString(),
    sender: {
      id: uuidv4(),
      role: "assistant",
      name: "המערכת",
    },
  };

  const session: SimulatorSession = {
    id: uuidv4(),
    user_id: userId,
    scenario_id: scenario.id,
    scenario,
    status: "active",
    messages: [initialMessage],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  await saveSimulationState(session);
  return session;
}

/**
 * מעבד הודעת משתמש ומחזיר את מצב הסימולציה המעודכן
 */
export async function processUserMessage(
  session: SimulatorSession,
  message: string
): Promise<SimulatorResponse> {
  try {
    const userMessage = convertToMessage(message, "user");
    const assistantResponse = await generateAssistantResponse(session);

    const messages = [...session.messages, userMessage, assistantResponse];

    const updatedSession: SimulatorSession = {
      ...session,
      messages,
      updated_at: new Date().toISOString(),
    };

    const feedback = await generateFeedback(updatedSession.messages);

    const messageFeedback: MessageFeedback = {
      score: feedback.score,
      message: generateFeedbackSummary(feedback),
      details: feedback,
      comments: feedback.comments,
      suggestions: feedback.suggestions,
    };

    return {
      success: true,
      message: assistantResponse.content,
      state: {
        scenario: session.scenario,
        messages: updatedSession.messages,
        status: updatedSession.status,
        feedback: {
          score: feedback.score,
          message: generateFeedbackSummary(feedback),
          details: {
            metrics: feedback.metrics,
            strengths: feedback.strengths,
            improvements: feedback.improvements,
            tips: feedback.tips,
            comments: feedback.comments.join(", "),
            suggestions: feedback.suggestions,
            overallProgress: {
              score: feedback.score,
              level: feedback.overallProgress.level,
              nextLevel: feedback.overallProgress.nextLevel,
              requiredScore: feedback.overallProgress.requiredScore,
            },
          },
          comments: feedback.comments,
          suggestions: feedback.suggestions,
        },
        settings: {
          difficulty: "intermediate",
          language: "he",
          feedback_frequency: "always",
          auto_suggestions: true,
        },
        stats: {
          total_scenarios: 1,
          completed_scenarios: 0,
          average_score: feedback.score,
          total_messages: updatedSession.messages.length,
          practice_time: 0,
          strengths: feedback.strengths,
          areas_for_improvement: feedback.improvements,
        },
      },
    };
  } catch (error) {
    console.error("Error processing user message:", error);
    throw new Error("Failed to process user message");
  }
}

/**
 * שומר את תוצאות הסימולציה הסופיות
 */
export async function saveSimulationResults(
  state: SimulatorSession
): Promise<void> {
  const finalFeedback = await generateFinalFeedback(state);

  if (!finalFeedback) {
    return;
  }

  const updatedState: SimulatorSession = {
    ...state,
    status: "completed",
    updated_at: new Date().toISOString(),
  };

  const sessionUpdate = await supabase
    .from("simulator_sessions")
    .update({
      status: updatedState.status,
      feedback: updatedState.feedback,
      updated_at: updatedState.updated_at,
      completed_at: updatedState.updated_at,
    })
    .eq("id", updatedState.id);

  if (sessionUpdate.error) {
    console.error("Error updating session:", sessionUpdate.error);
    throw new Error("Failed to update session");
  }

  const scenario = await getScenarioById(updatedState.scenario_id);
  if (!scenario) {
    throw new Error("Scenario not found");
  }

  const { error: resultsError } = await supabase
    .from("simulator_results")
    .insert({
      session_id: updatedState.id,
      scenario_id: updatedState.scenario_id,
      score: updatedState.feedback?.score ?? 0,
      feedback: updatedState.feedback,
      duration: getDuration(updatedState.created_at, updatedState.updated_at),
      details: {
        messages_count: updatedState.messages.length,
        scenario_difficulty: scenario.difficulty,
        scenario_category: scenario.category,
      },
    });

  if (resultsError) {
    console.error("Error saving results:", resultsError);
    throw new Error("Failed to save results");
  }
}

/**
 * מייצר משוב להודעת משתמש באמצעות OpenAI
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
  };

  // ניתוח ההודעות וחישוב הציונים
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

  return {
    metrics,
    score,
    empathy: metrics.empathy,
    clarity: metrics.clarity,
    effectiveness: metrics.effectiveness,
    appropriateness: metrics.appropriateness,
    professionalism: metrics.professionalism,
    problem_solving: metrics.problem_solving,
    strengths: [...DEFAULT_STRENGTHS],
    improvements: [...DEFAULT_IMPROVEMENTS],
    tips: [...DEFAULT_TIPS],
    comments: [...DEFAULT_COMMENTS],
    suggestions: [...DEFAULT_SUGGESTIONS],
    overallProgress: {
      score,
      level: "מתחיל",
      nextLevel: "מתקדם",
      requiredScore: 80,
      progress: 0,
    },
  };
}

/**
 * מייצר תגובה מהמערכת באמצעות OpenAI
 */
async function generateAssistantResponse(
  session: SimulatorSession
): Promise<Message> {
  const prompt = await generatePrompt(session);

  const messages: ChatCompletionMessage[] = [
    { role: "system", content: prompt },
  ];

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages,
    temperature: 0.9,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response generated");
  }

  return {
    id: uuidv4(),
    role: "assistant",
    content,
    timestamp: new Date().toISOString(),
    sender: {
      id: uuidv4(),
      role: "assistant",
      name: "המערכת",
    },
  };
}

/**
 * מייצר משוב סופי לכל הסימולציה
 */
async function generateFinalFeedback(
  state: SimulatorSession
): Promise<FeedbackDetails | null> {
  try {
    const messageHistory = state.messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    const prompt = `
      אתה מעריך מומחה. אנא הערך את השיחה בהתבסס על המטרות וקריטריוני ההצלחה הבאים:
      
      מטרות למידה: ${state.scenario.learning_objectives.join(", ")}
      קריטריוני הצלחה:
      - ציון מינימלי: ${state.scenario.success_criteria.minScore}
      - מיומנויות נדרשות: ${state.scenario.success_criteria.requiredSkills.join(", ")}
      - משך מינימלי: ${state.scenario.success_criteria.minDuration} שניות
      - משך מקסימלי: ${state.scenario.success_criteria.maxDuration} שניות
      
      היסטוריית השיחה:
      ${messageHistory.map((msg) => `${msg.role}: ${msg.content}`).join("\n")}
      
      ספק משוב בפורמט JSON הבא:
      {
        "score": מספר בין 0-100,
        "empathy": מספר בין 0-100,
        "clarity": מספר בין 0-100,
        "effectiveness": מספר בין 0-100,
        "appropriateness": מספר בין 0-100,
        "professionalism": מספר בין 0-100,
        "problem_solving": מספר בין 0-100,
        "strengths": מערך של חוזקות שהודגמו,
        "improvements": מערך של תחומים לשיפור,
        "tips": מערך של טיפים לשיפור,
        "comments": מערך של הערות,
        "suggestions": מערך של הצעות לשיפור
      }`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "system", content: prompt }],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      console.error("No content in OpenAI response");
      return null;
    }

    try {
      const parsedFeedback = JSON.parse(content);
      return {
        metrics: {
          empathy: parsedFeedback.empathy,
          clarity: parsedFeedback.clarity,
          effectiveness: parsedFeedback.effectiveness,
          appropriateness: parsedFeedback.appropriateness,
          professionalism: parsedFeedback.professionalism,
          problem_solving: parsedFeedback.problem_solving,
        },
        score: parsedFeedback.score,
        empathy: parsedFeedback.empathy,
        clarity: parsedFeedback.clarity,
        effectiveness: parsedFeedback.effectiveness,
        appropriateness: parsedFeedback.appropriateness,
        professionalism: parsedFeedback.professionalism,
        problem_solving: parsedFeedback.problem_solving,
        strengths: parsedFeedback.strengths || [...DEFAULT_STRENGTHS],
        improvements: parsedFeedback.improvements || [...DEFAULT_IMPROVEMENTS],
        tips: parsedFeedback.tips || [...DEFAULT_TIPS],
        comments: parsedFeedback.comments || [...DEFAULT_COMMENTS],
        suggestions: parsedFeedback.suggestions || [...DEFAULT_SUGGESTIONS],
        overallProgress: {
          score: parsedFeedback.score,
          level: "מתחיל",
          nextLevel: "מתקדם",
          requiredScore: 80,
          progress: 0,
        },
      };
    } catch (error) {
      console.error("Error parsing feedback JSON:", error);
      return null;
    }
  } catch (error) {
    console.error("Error generating final feedback:", error);
    return null;
  }
}

// פונקציות עזר

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

function identifyStrengths(messages: Message[]): readonly string[] {
  const strengths = new Set<string>();

  messages.forEach((message) => {
    if (message.role === "user") {
      if (calculateEmpathyScore(message.content) > 70) {
        strengths.add("הפגנת אמפתיה גבוהה");
      }
      if (calculateClarityScore(message.content) > 70) {
        strengths.add("תקשורת ברורה ומובנת");
      }
      if (calculateEffectivenessScore(message.content) > 70) {
        strengths.add("מתן פתרונות אפקטיביים");
      }
      if (calculateAppropriatenessScore(message.content) > 70) {
        strengths.add("תגובות מותאמות להקשר");
      }
    }
  });

  const strengthsArray = Array.from(strengths);
  return strengthsArray.length > 0 ? strengthsArray : DEFAULT_STRENGTHS;
}

function identifyAreasForImprovement(messages: Message[]): readonly string[] {
  const improvements = new Set<string>();

  messages.forEach((message) => {
    if (message.role === "user") {
      if (calculateEmpathyScore(message.content) < 30) {
        improvements.add("שיפור הבעת אמפתיה");
      }
      if (calculateClarityScore(message.content) < 30) {
        improvements.add("שיפור בהירות המסרים");
      }
      if (calculateEffectivenessScore(message.content) < 30) {
        improvements.add("שיפור אפקטיביות הפתרונות");
      }
      if (calculateAppropriatenessScore(message.content) < 30) {
        improvements.add("שיפור התאמת התגובות להקשר");
      }
    }
  });

  const improvementsArray = Array.from(improvements);
  return improvementsArray.length > 0
    ? improvementsArray
    : DEFAULT_IMPROVEMENTS;
}

function generateTips(improvements: readonly string[]): readonly string[] {
  if (
    improvements.length === 0 ||
    improvements[0] === DEFAULT_IMPROVEMENTS[0]
  ) {
    return DEFAULT_TIPS;
  }

  const tipMap: Record<string, string> = {
    "שיפור הבעת אמפתיה": "נסה להשתמש במשפטים כמו 'אני מבין את התחושה שלך'",
    "שיפור בהירות המסרים": "השתמש בדוגמאות והסברים פשוטים",
    "שיפור אפקטיביות הפתרונות": "הצע פתרונות מעשיים וברי-ביצוע",
    "שיפור התאמת התגובות להקשר": "התייחס לנסיבות הספציפיות של המצב",
  };

  const validTips = improvements
    .map((improvement) => tipMap[improvement])
    .filter((tip): tip is string => typeof tip === "string");

  return validTips.length > 0 ? validTips : DEFAULT_TIPS;
}

function generateOverallComments(feedback: FeedbackDetails): string {
  const avgScore = calculateMetricsScore(feedback.metrics);

  if (avgScore >= 80) {
    return "עבודה מצוינת! אתה מפגין רמה גבוהה של כישורי תקשורת";
  } else if (avgScore >= 60) {
    return "התקדמות טובה. המשך לתרגל ולשפר את המיומנויות שלך";
  } else {
    return "יש מקום לשיפור. התמקד בטיפים שניתנו כדי להתקדם";
  }
}

function generateSuggestions(feedback: FeedbackDetails): readonly string[] {
  const suggestions: string[] = [];
  if (feedback.improvements.length > 0) {
    suggestions.push("תרגל את המיומנויות שזוהו כטעונות שיפור");
  }
  if (feedback.strengths.length > 0) {
    suggestions.push("המשך לחזק את היכולות הטובות שלך");
  }
  suggestions.push("צפה בדוגמאות של תקשורת מוצלחת");
  return suggestions;
}

function getDuration(startTime: string, endTime: string): number {
  return Math.round(
    (new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000
  );
}

function convertToMessage(
  content: string,
  role: "user" | "assistant",
  functionCall?: OpenAI.Chat.ChatCompletionMessage.FunctionCall
): Message {
  return {
    id: uuidv4(),
    role,
    content,
    timestamp: new Date().toISOString(),
    sender: {
      id: uuidv4(),
      role,
      name: role === "assistant" ? "המערכת" : "משתמש",
    },
    ...(functionCall && {
      function_call: {
        name: functionCall.name,
        arguments: functionCall.arguments,
      },
    }),
  };
}

async function saveSimulationState(state: SimulatorSession) {
  const { error } = await supabase
    .from("simulator_sessions")
    .update({
      messages: state.messages,
      feedback: state.feedback,
      updated_at: state.updated_at,
    })
    .eq("id", state.id);

  if (error) {
    console.error("Error updating session:", error);
    throw new Error("Failed to update session");
  }
}

async function generatePrompt(session: SimulatorSession): Promise<string> {
  return `
    אתה משתתף בסימולציה של שיחה. התפקיד שלך הוא להגיב בצורה טבעית ואותנטית.
    
    תרחיש: ${session.scenario.description}
    
    היסטוריית השיחה:
    ${session.messages.map((m) => `${m.role === "user" ? "משתמש" : "מערכת"}: ${m.content}`).join("\n")}
    
    הגב בצורה טבעית והמשך את השיחה.
  `;
}

function calculateMetricsScore(metrics: FeedbackMetrics): number {
  return (
    (metrics.empathy +
      metrics.clarity +
      metrics.effectiveness +
      metrics.appropriateness +
      metrics.professionalism +
      metrics.problem_solving) /
    6
  );
}

function generateFeedbackSummary(feedback: FeedbackDetails): string {
  const score = feedback.score;
  let message = "";

  if (score >= 80) {
    message = "תגובה מצוינת! ";
  } else if (score >= 60) {
    message = "תגובה טובה, עם מקום לשיפור. ";
  } else {
    message = "יש מקום לשיפור משמעותי. ";
  }

  if (feedback.strengths.length > 0) {
    message += `חוזקות: ${feedback.strengths[0]}. `;
  }

  if (feedback.improvements.length > 0) {
    message += `נקודה לשיפור: ${feedback.improvements[0]}`;
  }

  return message;
}

export type { SimulatorState };
