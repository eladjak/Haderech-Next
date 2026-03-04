import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// שליפת כל המנטורים הזמינים
export const listMentors = query({
  handler: async (ctx) => {
    const mentors = await ctx.db
      .query("mentors")
      .withIndex("by_available", (q) => q.eq("available", true))
      .collect();

    // Enrich with user data
    const enriched = await Promise.all(
      mentors.map(async (mentor) => {
        const user = await ctx.db.get(mentor.userId);
        return {
          ...mentor,
          userImage: user?.imageUrl ?? null,
          userEmail: user?.email ?? null,
        };
      })
    );

    return enriched;
  },
});

// שליפת מנטור בודד עם פרטים
export const getMentor = query({
  args: { mentorId: v.id("mentors") },
  handler: async (ctx, args) => {
    const mentor = await ctx.db.get(args.mentorId);
    if (!mentor) return null;

    const user = await ctx.db.get(mentor.userId);
    return {
      ...mentor,
      userImage: user?.imageUrl ?? null,
      userEmail: user?.email ?? null,
    };
  },
});

// שליפת הסשנים של הסטודנט הנוכחי
export const getStudentSessions = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return [];

    const sessions = await ctx.db
      .query("mentoringSessions")
      .withIndex("by_student", (q) => q.eq("studentId", user._id))
      .collect();

    // Enrich with mentor data
    const enriched = await Promise.all(
      sessions.map(async (session) => {
        const mentor = await ctx.db.get(session.mentorId);
        return {
          ...session,
          mentorName: mentor?.displayName ?? "מאמן",
          mentorImage: mentor?.imageUrl ?? null,
        };
      })
    );

    // Sort by scheduledAt descending (newest first)
    return enriched.sort((a, b) => b.scheduledAt - a.scheduledAt);
  },
});

// שליפת סשנים של מנטור (רק אם זה המנטור עצמו)
export const getMentorSessions = query({
  args: { mentorId: v.id("mentors") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    // Verify user is the mentor
    const mentor = await ctx.db.get(args.mentorId);
    if (!mentor) throw new Error("Mentor not found");
    if (mentor.userId !== user._id) {
      throw new Error("Not authorized - you are not this mentor");
    }

    const sessions = await ctx.db
      .query("mentoringSessions")
      .withIndex("by_mentor", (q) => q.eq("mentorId", args.mentorId))
      .collect();

    // Enrich with student data
    const enriched = await Promise.all(
      sessions.map(async (session) => {
        const student = await ctx.db.get(session.studentId);
        return {
          ...session,
          studentName: student?.name ?? student?.email ?? "תלמיד",
          studentImage: student?.imageUrl ?? null,
        };
      })
    );

    return enriched.sort((a, b) => b.scheduledAt - a.scheduledAt);
  },
});

// הזמנת פגישה חדשה
export const bookSession = mutation({
  args: {
    mentorId: v.id("mentors"),
    scheduledAt: v.number(),
    duration: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    // Validate mentor exists and is available
    const mentor = await ctx.db.get(args.mentorId);
    if (!mentor) throw new Error("Mentor not found");
    if (!mentor.available) throw new Error("Mentor is not available");

    // Cannot book with yourself
    if (mentor.userId === user._id) {
      throw new Error("Cannot book a session with yourself");
    }

    return await ctx.db.insert("mentoringSessions", {
      mentorId: args.mentorId,
      studentId: user._id,
      status: "pending",
      scheduledAt: args.scheduledAt,
      duration: args.duration,
      notes: args.notes,
      createdAt: Date.now(),
    });
  },
});

// עדכון סטטוס פגישה (רק המנטור)
export const updateSessionStatus = mutation({
  args: {
    sessionId: v.id("mentoringSessions"),
    status: v.union(
      v.literal("confirmed"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    const session = await ctx.db.get(args.sessionId);
    if (!session) throw new Error("Session not found");

    // Verify user is the mentor
    const mentor = await ctx.db.get(session.mentorId);
    if (!mentor) throw new Error("Mentor not found");
    if (mentor.userId !== user._id) {
      throw new Error("Not authorized - only the mentor can update session status");
    }

    await ctx.db.patch(args.sessionId, {
      status: args.status,
    });

    // If completed, increment mentor's total sessions
    if (args.status === "completed") {
      await ctx.db.patch(session.mentorId, {
        totalSessions: mentor.totalSessions + 1,
      });
    }
  },
});

// דירוג פגישה (רק הסטודנט, רק אחרי שהושלמה)
export const rateSession = mutation({
  args: {
    sessionId: v.id("mentoringSessions"),
    rating: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    // Validate rating
    if (args.rating < 1 || args.rating > 5) {
      throw new Error("Rating must be between 1 and 5");
    }

    const session = await ctx.db.get(args.sessionId);
    if (!session) throw new Error("Session not found");

    // Must be the student
    if (session.studentId !== user._id) {
      throw new Error("Not authorized - only the student can rate the session");
    }

    // Must be completed
    if (session.status !== "completed") {
      throw new Error("Can only rate completed sessions");
    }

    // Update session rating
    await ctx.db.patch(args.sessionId, {
      rating: args.rating,
    });

    // Recalculate mentor average rating
    const allSessions = await ctx.db
      .query("mentoringSessions")
      .withIndex("by_mentor", (q) => q.eq("mentorId", session.mentorId))
      .collect();

    const ratedSessions = allSessions.filter(
      (s) => s.rating !== undefined && s._id !== args.sessionId
    );
    const totalRating =
      ratedSessions.reduce((sum, s) => sum + (s.rating ?? 0), 0) + args.rating;
    const avgRating = totalRating / (ratedSessions.length + 1);

    await ctx.db.patch(session.mentorId, {
      rating: Math.round(avgRating * 10) / 10,
    });
  },
});

// Seed 3 sample mentors
export const seedMentors = mutation({
  handler: async (ctx) => {
    // Check if mentors already exist
    const existing = await ctx.db.query("mentors").collect();
    if (existing.length > 0) {
      return { message: "Mentors already seeded", count: existing.length };
    }

    // Try to find admin user
    const adminUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), "admin"))
      .first();

    // If no admin, find any user
    const anyUser = adminUser ?? (await ctx.db.query("users").first());

    if (!anyUser) {
      throw new Error("No users in database. Please sign in first.");
    }

    const mentorsData = [
      {
        userId: anyUser._id,
        displayName: "דר׳ רונית כהן",
        bio: "פסיכולוגית קלינית עם 15 שנות ניסיון בייעוץ זוגי ודייטינג. מומחית בתקשורת בין-אישית, בניית ביטחון עצמי וניהול ציפיות בזוגיות. מלווה מאות רווקים ורווקות במציאת הזוגיות הנכונה.",
        specialties: ["תקשורת זוגית", "ביטחון עצמי", "ניהול ציפיות", "דייט ראשון"],
        pricePerSession: 350,
        sessionDuration: 60,
        available: true,
        rating: 4.8,
        totalSessions: 127,
        createdAt: Date.now(),
      },
      {
        userId: anyUser._id,
        displayName: "אבי לוי",
        bio: "מאמן דייטינג מוסמך וכותב תוכן בתחום הזוגיות. מתמחה בעזרה לגברים ונשים לבנות פרופיל דייטינג מנצח, לשפר את כישורי השיחה ולהפוך דייטים לזוגיות אמיתית.",
        specialties: ["פרופיל דייטינג", "שיחות ראשונות", "אפליקציות הכרויות", "משיכה"],
        pricePerSession: 250,
        sessionDuration: 45,
        available: true,
        rating: 4.6,
        totalSessions: 89,
        createdAt: Date.now(),
      },
      {
        userId: anyUser._id,
        displayName: "מיכל ברק",
        bio: "יועצת זוגיות ומאמנת אישית. בעלת תואר שני בפסיכולוגיה חברתית. מתמחית בעבודה עם אנשים שמרגישים תקועים בדייטינג ורוצים לפרוץ דרך. גישה חמה, ישירה ואפקטיבית.",
        specialties: ["פריצת דרך", "מודעות עצמית", "דפוסים חוזרים", "בחירת פרטנר"],
        pricePerSession: 300,
        sessionDuration: 50,
        available: true,
        rating: 4.9,
        totalSessions: 203,
        createdAt: Date.now(),
      },
    ];

    const ids = [];
    for (const data of mentorsData) {
      const id = await ctx.db.insert("mentors", data);
      ids.push(id);
    }

    return { message: "Seeded 3 mentors successfully", ids };
  },
});
