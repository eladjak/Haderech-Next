import { internalQuery, query } from "./_generated/server";
import { v } from "convex/values";

// ==========================================================
// Knowledge base (RAG) — Phase 21
// The chunks are bulk-imported by scripts/build-knowledge-index.mjs
// (npx convex import --table knowledgeChunks). The advisor action
// runs ctx.vectorSearch on the by_embedding index and then loads
// the matched documents through getChunksByIds.
// ==========================================================

/** Load the documents behind vectorSearch results (internal — advisor only). */
export const getChunksByIds = internalQuery({
  args: { ids: v.array(v.id("knowledgeChunks")) },
  handler: async (ctx, args) => {
    const docs = [];
    for (const id of args.ids) {
      const doc = await ctx.db.get(id);
      if (doc) {
        docs.push({
          ref: doc.ref,
          text: doc.text,
          source: doc.source,
          lessonOrder: doc.lessonOrder ?? null,
        });
      }
    }
    return docs;
  },
});

/** Public stats — a cheap deep-verification probe for the knowledge base. */
export const stats = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("knowledgeChunks").collect();
    const bySource: Record<string, number> = {};
    for (const c of all) {
      bySource[c.source] = (bySource[c.source] ?? 0) + 1;
    }
    return { total: all.length, bySource };
  },
});
