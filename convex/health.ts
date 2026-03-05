import { query } from "./_generated/server";

export const check = query({
  args: {},
  handler: async (ctx) => {
    // Check DB connectivity by querying courses
    const courses = await ctx.db.query("courses").first();
    return {
      status: "ok",
      timestamp: Date.now(),
      hasData: !!courses,
    };
  },
});
