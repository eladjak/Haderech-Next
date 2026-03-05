import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// =======================================
// Dating Profile Builder - Phase 70
// בונה פרופיל דייטינג מתקדם
// =======================================

// -----------------------------------------------
// Query: Get user dating profile
// -----------------------------------------------

export const getProfile = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const profile = await ctx.db
      .query("datingProfiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    return profile ?? null;
  },
});

// -----------------------------------------------
// Mutation: Save / update profile
// -----------------------------------------------

export const saveProfile = mutation({
  args: {
    displayName: v.optional(v.string()),
    age: v.optional(v.number()),
    location: v.optional(v.string()),
    lookingFor: v.optional(
      v.union(
        v.literal("relationship"),
        v.literal("casual"),
        v.literal("friendship"),
        v.literal("not-sure")
      )
    ),
    genderIdentity: v.optional(v.string()),
    bio: v.optional(v.string()),
    interests: v.optional(v.array(v.string())),
    customInterests: v.optional(v.array(v.string())),
    idealPartner: v.optional(v.string()),
    dealBreakers: v.optional(v.array(v.string())),
    relationshipValues: v.optional(v.array(v.string())),
    completenessScore: v.optional(v.number()),
    currentStep: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("datingProfiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...args,
        updatedAt: now,
      });
      return existing._id;
    } else {
      const id = await ctx.db.insert("datingProfiles", {
        clerkId: identity.subject,
        ...args,
        createdAt: now,
        updatedAt: now,
      });
      return id;
    }
  },
});

// -----------------------------------------------
// Query: Tips for each profile section
// -----------------------------------------------

export const getProfileTips = query({
  args: {
    step: v.number(),
  },
  handler: async (_ctx, args) => {
    const tips: Record<number, { title: string; items: { icon: string; text: string }[]; example?: { good: string; bad: string } }> = {
      1: {
        title: "טיפים למידע הבסיסי",
        items: [
          { icon: "🎯", text: "שם תצוגה אמיתי מגביר אמון ב-40% לעומת כינויים" },
          { icon: "📍", text: "הוסף עיר (לא כתובת מדויקת) - זה עוזר למציאת התאמות קרובות" },
          { icon: "❤️", text: "הגדר בבירור מה אתה מחפש - זה חוסך אי הבנות" },
        ],
      },
      2: {
        title: "3 סודות לביו מושלם",
        items: [
          { icon: "✨", text: "פתח עם משפט שפותח שיחה - שאלה, עובדה מעניינת, או אנקדוטה" },
          { icon: "🎭", text: "הראה אישיות, לא רשימת תכונות. 'אוהב לבשל' < 'מגדל אינסטגרם של שגיאות המטבח שלי'" },
          { icon: "💡", text: "סיים עם קריאה לפעולה עדינה - 'שאל אותי על...' או 'בוא נגלה מה משותף לנו'" },
        ],
        example: {
          good: "מהנדס שחולם על מסעדה משלו. בסופי שבוע אפשר למצוא אותי בשוק האיכרים, מחפש את הגבינה המושלמת. שאל אותי על הדיסאסטר הכי גדול שלי במטבח.",
          bad: "גבר/אישה אמיתי/ת. אוהב לצחוק ולהנות. מחפש מישהו עם חיוך יפה ומשפחה חשובה לו.",
        },
      },
      3: {
        title: "למה תחביבים חשובים בפרופיל?",
        items: [
          { icon: "🤝", text: "תחביבים משותפים מגדילים סיכוי להתאמה ב-60%" },
          { icon: "💬", text: "הם פותחי שיחה מצוינים - אנשים יכתבו לך על תחביבים" },
          { icon: "🎯", text: "מקסימום 8-10 תחביבים - יותר מדי נראה לא אמין" },
          { icon: "⭐", text: "בחר תחביבים שאתה באמת עושה, לא שרוצה לעשות" },
        ],
      },
      4: {
        title: "כיצד לתאר מה אתה מחפש",
        items: [
          { icon: "🌟", text: "היה ספציפי אך לא מגביל - תאר איך אתם מרגישים ביחד, לא רשימת דרישות" },
          { icon: "❤️", text: "ערכים משותפים > תכונות חיצוניות. ציין מה חשוב לך עמוק" },
          { icon: "🚫", text: "הגבלות ודיל-ברייקרים עדיף לשמור בינך לבין עצמך בשלב הראשון" },
        ],
      },
      5: {
        title: "אסטרטגיית תמונות מנצחת",
        items: [
          { icon: "😊", text: "תמונת פנים ברורה עם חיוך - חייבת להיות תמונה ראשונה" },
          { icon: "🏃", text: "תמונה בפעילות שאוהב - מראה שיש לך חיים מלאים" },
          { icon: "👥", text: "תמונה חברתית (עם חברים) - מוכיחה שיש לך מעגל חברתי" },
          { icon: "📖", text: "תמונה 'שמספרת סיפור' - בטיול, בישול, עם חיית מחמד" },
        ],
      },
      6: {
        title: "טיפים לפרופיל מושלם",
        items: [
          { icon: "✅", text: "פרופיל מלא מקבל פי 3 יותר התאמות" },
          { icon: "🔄", text: "עדכן את הפרופיל כל חודש-חודשיים עם תוכן טרי" },
          { icon: "💬", text: "שתף עם מאמן - נקודת מבט חיצונית תמיד עוזרת" },
        ],
      },
    };

    return tips[args.step] ?? tips[1];
  },
});

// -----------------------------------------------
// Mutation: Analyze profile completeness
// -----------------------------------------------

export const analyzeProfile = mutation({
  args: {
    displayName: v.optional(v.string()),
    age: v.optional(v.number()),
    location: v.optional(v.string()),
    lookingFor: v.optional(v.string()),
    genderIdentity: v.optional(v.string()),
    bio: v.optional(v.string()),
    interests: v.optional(v.array(v.string())),
    customInterests: v.optional(v.array(v.string())),
    idealPartner: v.optional(v.string()),
    dealBreakers: v.optional(v.array(v.string())),
    relationshipValues: v.optional(v.array(v.string())),
  },
  handler: async (_ctx, args): Promise<{
    score: number;
    breakdown: { section: string; points: number; max: number; tip: string }[];
    qualityTips: string[];
  }> => {
    const breakdown: { section: string; points: number; max: number; tip: string }[] = [];
    let totalScore = 0;

    // Basic info (25 points)
    let basicPoints = 0;
    if (args.displayName && args.displayName.trim().length >= 2) basicPoints += 8;
    if (args.age && args.age >= 18 && args.age <= 99) basicPoints += 7;
    if (args.location && args.location.trim().length >= 2) basicPoints += 5;
    if (args.lookingFor) basicPoints += 5;
    breakdown.push({
      section: "מידע בסיסי",
      points: basicPoints,
      max: 25,
      tip: basicPoints < 20 ? "השלם את שם, גיל ומיקום לשיפור ניכר" : "מצוין!",
    });
    totalScore += basicPoints;

    // Bio (30 points)
    let bioPoints = 0;
    const bio = args.bio ?? "";
    if (bio.length >= 50) bioPoints += 10;
    if (bio.length >= 150) bioPoints += 10;
    if (bio.length >= 250) bioPoints += 5;
    if (bio.includes("?") || bio.includes("!")) bioPoints += 5; // has personality
    breakdown.push({
      section: "ביוגרפיה",
      points: bioPoints,
      max: 30,
      tip:
        bio.length < 50
          ? "כתוב לפחות 50 תווים - ביו ריק פוגע קשות בסיכויים"
          : bio.length < 150
            ? "הרחב את הביו - 150+ תווים מקבלים הרבה יותר התאמות"
            : "ביו מצוין!",
    });
    totalScore += bioPoints;

    // Interests (20 points)
    const allInterests = [...(args.interests ?? []), ...(args.customInterests ?? [])];
    let interestPoints = 0;
    if (allInterests.length >= 1) interestPoints += 5;
    if (allInterests.length >= 4) interestPoints += 8;
    if (allInterests.length >= 7) interestPoints += 7;
    breakdown.push({
      section: "תחביבים",
      points: interestPoints,
      max: 20,
      tip:
        allInterests.length < 4
          ? "הוסף לפחות 4 תחביבים לשיפור הפרופיל"
          : "כמות תחביבים מצוינת!",
    });
    totalScore += interestPoints;

    // What I'm looking for (15 points)
    let lookingPoints = 0;
    if (args.idealPartner && args.idealPartner.length >= 30) lookingPoints += 7;
    if ((args.relationshipValues ?? []).length >= 2) lookingPoints += 5;
    if ((args.dealBreakers ?? []).length >= 1) lookingPoints += 3;
    breakdown.push({
      section: "מה אני מחפש",
      points: lookingPoints,
      max: 15,
      tip:
        lookingPoints < 7
          ? "תאר מה אתה מחפש - זה עוזר למציאת התאמות אמיתיות"
          : "מצוין!",
    });
    totalScore += lookingPoints;

    // Quality tips
    const qualityTips: string[] = [];
    if (bio.length < 100)
      qualityTips.push("הביו שלך קצר מדי. כוון לפחות 150 תווים עם פרטים מעניינים.");
    if (allInterests.length < 5)
      qualityTips.push("הוסף יותר תחביבים - הם פותחי שיחה מעולים.");
    if (!args.location)
      qualityTips.push("הוסף מיקום - משפר ניכר את רלוונטיות ההתאמות.");
    if ((args.relationshipValues ?? []).length < 2)
      qualityTips.push("בחר ערכי זוגיות שחשובים לך - זה עוזר למציאת התאמה אמיתית.");
    if (totalScore >= 80)
      qualityTips.push("פרופיל מעולה! אתה בעשירייה העליונה של הפרופילים.");
    else if (totalScore >= 60)
      qualityTips.push("פרופיל טוב - עם כמה שיפורים קטנים תגיע לרמה הגבוהה.");

    return {
      score: Math.min(100, totalScore),
      breakdown,
      qualityTips,
    };
  },
});
