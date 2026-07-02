import { query, action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import {
  buildAdvisorSystemPrompt,
  buildTemplateReply,
  getPhaseProfile,
  type LessonContext,
} from "./lib/advisorTemplates";
import { generateChat } from "./lib/llm";

// ============================================================
// Smart Advisor — Phase 18
// A context-aware, lesson-synced advisor with FREE-DEGRADATION.
//   • No API key  -> deterministic template engine (Elad voice)
//   • API key set -> live Claude, scaffolded by the same prompt
// Shared lesson context links advisor <-> simulator <-> course.
// ============================================================

// ------------------------------------------------------------
// Lesson context resolver — the single source of truth that the
// advisor, the simulator link, and the lesson page all read.
// ------------------------------------------------------------
export const getLessonContext = query({
  args: {
    lessonId: v.id("lessons"),
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const lesson = await ctx.db.get(args.lessonId);
    if (!lesson) return null;

    // Course lessons for progress denominator
    const allLessons = await ctx.db
      .query("lessons")
      .withIndex("by_course", (q) => q.eq("courseId", lesson.courseId))
      .collect();
    const publishedLessons = allLessons.filter((l) => l.published);

    // Progress (optional — advisor still works for signed-out preview)
    let completedLessons = 0;
    let isLessonComplete = false;
    if (args.userId) {
      const progress = await ctx.db
        .query("progress")
        .withIndex("by_user_course", (q) =>
          q.eq("userId", args.userId!).eq("courseId", lesson.courseId)
        )
        .collect();
      completedLessons = progress.filter((p) => p.completed).length;
      isLessonComplete =
        progress.find((p) => p.lessonId === args.lessonId)?.completed === true;
    }

    const profile = getPhaseProfile(lesson.phaseNumber);

    const lessonContext: LessonContext = {
      lessonTitle: lesson.title,
      lessonDescription: lesson.description,
      weekNumber: lesson.weekNumber,
      phaseNumber: lesson.phaseNumber,
      phaseName: lesson.phaseName,
      completedLessons,
      totalLessons: publishedLessons.length,
      isLessonComplete,
    };

    return {
      courseId: lesson.courseId,
      context: lessonContext,
      // Surfaced to the UI so it can render the phase + a simulator CTA
      profile: {
        phaseNumber: profile.phaseNumber,
        name: profile.name,
        weeks: profile.weeks,
        essence: profile.essence,
        concepts: profile.concepts,
        skill: profile.skill,
        opener: profile.opener,
        applyPrompts: profile.applyPrompts,
        simulatorCategory: profile.simulatorCategory,
      },
    };
  },
});

// ------------------------------------------------------------
// Find the best-matching simulator scenario for a lesson's phase
// (the SYNC bridge: advisor/lesson -> simulator).
// ------------------------------------------------------------
export const getRecommendedScenario = query({
  args: { lessonId: v.id("lessons") },
  handler: async (ctx, args) => {
    const lesson = await ctx.db.get(args.lessonId);
    if (!lesson) return null;

    const profile = getPhaseProfile(lesson.phaseNumber);

    // Prefer the richer structured-dialogue scenarios.
    const dialogues = await ctx.db
      .query("dialogueScenarios")
      .withIndex("by_published", (q) => q.eq("published", true))
      .collect();

    if (dialogues.length > 0) {
      const byCategory = dialogues.find(
        (d) => d.category === profile.simulatorCategory
      );
      const byDifficulty = dialogues
        .slice()
        .sort((a, b) => a.order - b.order)
        .find((d) =>
          profile.phaseNumber <= 2
            ? d.difficulty === "easy"
            : profile.phaseNumber === 3
              ? d.difficulty === "medium"
              : d.difficulty === "hard"
        );
      const chosen = byCategory ?? byDifficulty ?? dialogues[0];
      return {
        type: "dialogue" as const,
        scenarioId: chosen._id,
        title: chosen.title,
        personaName: chosen.personaName,
        personaEmoji: chosen.personaEmoji,
        difficulty: chosen.difficulty,
        skill: profile.skill,
      };
    }

    // Fallback to free-chat scenarios.
    const scenarios = await ctx.db
      .query("simulatorScenarios")
      .withIndex("by_published", (q) => q.eq("published", true))
      .collect();
    if (scenarios.length === 0) return null;
    const sorted = scenarios.slice().sort((a, b) => a.order - b.order);
    const chosen =
      sorted.find((s) => s.category === profile.simulatorCategory) ?? sorted[0];
    return {
      type: "freechat" as const,
      scenarioId: chosen._id,
      title: chosen.title,
      personaName: chosen.personaName,
      personaEmoji: "💬",
      difficulty: chosen.difficulty,
      skill: profile.skill,
    };
  },
});

// ------------------------------------------------------------
// ask — stateless, free-degrading advisor turn. Returns a reply
// plus a `usedAi` flag so the UI/demo can prove the degradation
// path. No mutation: this is a lightweight inline advisor used on
// the lesson page (the full /chat history flow lives in chat.ts).
// ------------------------------------------------------------
export const ask = action({
  args: {
    message: v.string(),
    lessonId: v.optional(v.id("lessons")),
    userId: v.optional(v.id("users")),
    // recent turns for continuity (excludes system)
    history: v.optional(
      v.array(
        v.object({
          role: v.union(v.literal("user"), v.literal("assistant")),
          content: v.string(),
        })
      )
    ),
  },
  handler: async (
    ctx,
    args
  ): Promise<{
    reply: string;
    usedAi: boolean;
    suggestSimulator: boolean;
  }> => {
    const trimmed = args.message.trim();
    if (!trimmed) throw new Error("Message cannot be empty");
    if (trimmed.length > 2000) throw new Error("Message too long");

    // Resolve lesson context (shared with simulator + course).
    let lessonContext: LessonContext | null = null;
    if (args.lessonId) {
      const resolved = await ctx.runQuery(api.advisor.getLessonContext, {
        lessonId: args.lessonId,
        userId: args.userId,
      });
      lessonContext = resolved?.context ?? null;
    }

    // Always compute the template reply — it is both the no-key
    // answer and the graceful fallback if the AI call fails.
    const template = buildTemplateReply(trimmed, lessonContext);

    // Upgrade path: live AI (Gemini free-tier preferred, then Claude),
    // scaffolded by the lesson-aware system prompt. `generateChat` returns
    // null when no token is set OR the call fails — so we always land on the
    // good template. This is why the advisor works with zero credentials.
    const ai = await generateChat({
      system: buildAdvisorSystemPrompt(lessonContext),
      messages: [
        ...(args.history ?? []),
        { role: "user" as const, content: trimmed },
      ],
      maxTokens: 700,
    });

    return {
      reply: ai?.text ?? template.text,
      usedAi: ai !== null,
      suggestSimulator: template.suggestSimulator,
    };
  },
});
