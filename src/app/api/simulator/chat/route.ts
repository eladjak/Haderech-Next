import { NextResponse } from "next/server";
import type {
  SimulationResponse,
  FeedbackDetails,
  SimulationState,
  Message,
} from "@/types/simulator";
import {
  openai,
  SIMULATOR_MODEL,
  SIMULATOR_TEMPERATURE,
  SIMULATOR_MAX_TOKENS,
  createSystemPrompt,
} from "@/config/openai";
import { EXAMPLE_SCENARIOS } from "@/constants/simulator";
import type { ChatCompletionMessageParam } from "openai/resources/chat";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Database } from "@/types/database";
import { v4 as uuidv4 } from "uuid";

interface AnalysisResult {
  mood: "positive" | "neutral" | "negative";
  interest: number;
  comfort: number;
  feedback: FeedbackDetails;
}

// Helper functions
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
  const score = calculateScore(feedback);
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

function convertToMessage(
  content: string,
  role: "user" | "assistant" | "system",
  functionCall?: object,
): Message {
  return {
    id: uuidv4(),
    content,
    role,
    timestamp: new Date().toISOString(),
    sender: {
      id: role,
      name:
        role === "user" ? "משתמש" : role === "assistant" ? "מערכת" : "מערכת",
    },
    ...(functionCall && { function_call: functionCall }),
  };
}

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: "יש להתחבר כדי להשתמש בסימולטור" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { scenarioId, message } = body;

    if (!scenarioId || !message) {
      return NextResponse.json({ error: "חסרים פרטים בבקשה" }, { status: 400 });
    }

    // מציאת התרחיש המתאים
    const scenario = EXAMPLE_SCENARIOS.find((s) => s.id === scenarioId);
    if (!scenario) {
      return NextResponse.json({ error: "תרחיש לא נמצא" }, { status: 404 });
    }

    // יצירת הנחיות מערכת מותאמות אישית
    const systemPrompt = createSystemPrompt(
      scenario.title,
      scenario.difficulty,
      scenario.description,
    );

    const messages: ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: message },
    ];

    // שליחת הבקשה ל-OpenAI
    const completion = await openai.chat.completions.create({
      model: SIMULATOR_MODEL,
      temperature: SIMULATOR_TEMPERATURE,
      max_tokens: SIMULATOR_MAX_TOKENS,
      messages,
      functions: [
        {
          name: "analyze_response",
          description:
            "Analyze the response and provide detailed feedback about the communication",
          parameters: {
            type: "object",
            properties: {
              mood: {
                type: "string",
                enum: ["positive", "neutral", "negative"],
                description: "The overall mood of the conversation",
              },
              interest: {
                type: "number",
                minimum: 0,
                maximum: 100,
                description: "Level of engagement/interest (0-100)",
              },
              comfort: {
                type: "number",
                minimum: 0,
                maximum: 100,
                description:
                  "Level of comfort/ease in the conversation (0-100)",
              },
              feedback: {
                type: "object",
                properties: {
                  empathy: {
                    type: "number",
                    minimum: 0,
                    maximum: 100,
                    description: "Level of empathy shown in the response",
                  },
                  clarity: {
                    type: "number",
                    minimum: 0,
                    maximum: 100,
                    description: "Clarity of the message",
                  },
                  effectiveness: {
                    type: "number",
                    minimum: 0,
                    maximum: 100,
                    description: "Overall effectiveness of the communication",
                  },
                  appropriateness: {
                    type: "number",
                    minimum: 0,
                    maximum: 100,
                    description: "Appropriateness to the context",
                  },
                  strengths: {
                    type: "array",
                    items: { type: "string" },
                    description: "Key strengths in the response",
                  },
                  improvements: {
                    type: "array",
                    items: { type: "string" },
                    description: "Areas for improvement",
                  },
                  tips: {
                    type: "array",
                    items: { type: "string" },
                    description: "Practical tips for improvement",
                  },
                },
                required: [
                  "empathy",
                  "clarity",
                  "effectiveness",
                  "appropriateness",
                  "strengths",
                  "improvements",
                  "tips",
                ],
              },
            },
            required: ["mood", "interest", "comfort", "feedback"],
          },
        },
      ],
      function_call: { name: "analyze_response" },
    });

    const assistantMessage = completion.choices[0]?.message;
    if (!assistantMessage || !assistantMessage.function_call) {
      throw new Error("לא התקבלה תשובה תקינה מהמודל");
    }

    const analysis: AnalysisResult = JSON.parse(
      assistantMessage.function_call.arguments,
    );

    const currentState: SimulationState = {
      id: uuidv4(),
      scenario,
      messages: [
        convertToMessage(message, "user"),
        convertToMessage(
          assistantMessage.content || "",
          "assistant",
          assistantMessage.function_call,
        ),
      ],
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const response: SimulationResponse = {
      state: currentState,
      message: assistantMessage.content || "אין לי תגובה כרגע, אנא נסה שוב",
      feedback: {
        score: calculateScore(analysis.feedback),
        message: generateFeedbackMessage(analysis.feedback),
        details: analysis.feedback,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in chat endpoint:", error);
    return NextResponse.json(
      { error: "אירעה שגיאה בעיבוד הבקשה" },
      { status: 500 },
    );
  }
}
