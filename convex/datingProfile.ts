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

    if (
      args.age !== undefined &&
      (!Number.isInteger(args.age) || args.age < 18 || args.age > 100)
    ) {
      throw new Error("Dating profile is available to adults only");
    }
    const boundedStrings: Array<[string, string | undefined, number]> = [
      ["displayName", args.displayName, 80],
      ["location", args.location, 120],
      ["genderIdentity", args.genderIdentity, 80],
      ["bio", args.bio, 1200],
      ["idealPartner", args.idealPartner, 1200],
    ];
    for (const [field, value, max] of boundedStrings) {
      if (value !== undefined && value.length > max) {
        throw new Error(`${field} is too long`);
      }
    }
    const boundedLists: Array<[string, string[] | undefined]> = [
      ["interests", args.interests],
      ["customInterests", args.customInterests],
      ["dealBreakers", args.dealBreakers],
      ["relationshipValues", args.relationshipValues],
    ];
    for (const [field, values] of boundedLists) {
      if (values && (values.length > 20 || values.some((value) => value.length > 100))) {
        throw new Error(`${field} contains too much data`);
      }
    }
    if (
      args.completenessScore !== undefined &&
      (!Number.isInteger(args.completenessScore) ||
        args.completenessScore < 0 ||
        args.completenessScore > 100)
    ) {
      throw new Error("Invalid draft completeness value");
    }
    if (
      args.currentStep !== undefined &&
      (!Number.isInteger(args.currentStep) || args.currentStep < 1 || args.currentStep > 6)
    ) {
      throw new Error("Invalid profile step");
    }

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
          { icon: "🎯", text: "בחרו שם תצוגה שנוח לכם לפרסם; אין צורך בשם מלא" },
          { icon: "📍", text: "אם מוסיפים מיקום, הסתפקו בעיר או באזור — לא בכתובת מדויקת" },
          { icon: "❤️", text: "אפשר לציין מה מחפשים, בלי להבטיח התאמה או לחשוף מידע רגיש" },
        ],
      },
      2: {
        title: "שלוש הצעות לביו ברור",
        items: [
          { icon: "✨", text: "פתח עם משפט שפותח שיחה - שאלה, עובדה מעניינת, או אנקדוטה" },
          { icon: "🎭", text: "הראה אישיות, לא רשימת תכונות. 'אוהב לבשל' < 'מגדל אינסטגרם של שגיאות המטבח שלי'" },
          { icon: "💡", text: "אפשר לסיים בנושא שקל לפתוח עליו שיחה; אין חובה לקריאה לפעולה" },
        ],
        example: {
          good: "מהנדס שחולם על מסעדה משלו. בסופי שבוע אפשר למצוא אותי בשוק האיכרים, מחפש את הגבינה המושלמת. שאל אותי על הדיסאסטר הכי גדול שלי במטבח.",
          bad: "גבר/אישה אמיתי/ת. אוהב לצחוק ולהנות. מחפש מישהו עם חיוך יפה ומשפחה חשובה לו.",
        },
      },
      3: {
        title: "למה תחביבים חשובים בפרופיל?",
        items: [
          { icon: "🤝", text: "תחביבים יכולים לתת נושאים לשיחה; אין דרך להבטיח התאמה" },
          { icon: "💬", text: "בחרו רק פרטים שנוח לכם שיהיו ציבוריים" },
          { icon: "🎯", text: "רשימה קצרה וקונקרטית בדרך כלל קלה יותר לקריאה" },
          { icon: "⭐", text: "אין צורך להציג תחביב או אורח חיים שאינם שלכם" },
        ],
      },
      4: {
        title: "כיצד לתאר מה אתה מחפש",
        items: [
          { icon: "🌟", text: "היה ספציפי אך לא מגביל - תאר איך אתם מרגישים ביחד, לא רשימת דרישות" },
          { icon: "❤️", text: "ערכים משותפים > תכונות חיצוניות. ציין מה חשוב לך עמוק" },
          { icon: "🚫", text: "גבולות חשובים אינם משחק; אפשר לנסח אותם בכבוד ולבחור מה לפרסם" },
        ],
      },
      5: {
        title: "אסטרטגיית תמונות מנצחת",
        items: [
          { icon: "😊", text: "בחרו תמונה ברורה שנוח לכם לפרסם; חיוך אינו חובה" },
          { icon: "🏃", text: "תמונה בפעילות יכולה להוסיף הקשר, אבל אינה הוכחה לאופי" },
          { icon: "👥", text: "אל תפרסמו אנשים אחרים בלי הסכמתם, וטשטשו ילדים ופרטים מזהים" },
          { icon: "📖", text: "בדקו גם מיקום, תגיות ומטא-דאטה לפני העלאה" },
        ],
      },
      6: {
        title: "בדיקה לפני פרסום",
        items: [
          { icon: "✅", text: "מדד המילוי בודק שדות בלבד; הוא אינו חוזה התאמות או הצלחה" },
          { icon: "🔄", text: "עדכנו רק כשמשהו השתנה או כשהטיוטה כבר אינה מייצגת אתכם" },
          { icon: "💬", text: "אם מבקשים משוב מאדם מהימן, הסירו קודם מידע פרטי שלא נחוץ" },
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
      tip:
        basicPoints < 20
          ? "אפשר להשלים שדות שנחוצים לטיוטה; מיקום מדויק אינו נדרש"
          : "רוב שדות הבסיס מולאו",
    });
    totalScore += basicPoints;

    // Bio (30 points)
    let bioPoints = 0;
    const bio = args.bio ?? "";
    if (bio.length >= 50) bioPoints += 10;
    if (bio.length >= 150) bioPoints += 10;
    if (bio.length >= 250) bioPoints += 5;
    if (bio.length > 0 && bio.length <= 1200) bioPoints += 5;
    breakdown.push({
      section: "ביוגרפיה",
      points: bioPoints,
      max: 30,
      tip:
        bio.length < 50
          ? "אפשר להוסיף כמה פרטים לא רגישים שיעזרו להבין את הטיוטה"
          : bio.length < 150
            ? "אפשר להרחיב, אבל אורך אינו מנבא התאמות"
            : "הביו מכיל מספיק טקסט לבדיקה טכנית",
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
          ? "תחביבים הם שדה אופציונלי; הוסיפו רק מה שנוח לפרסם"
          : "נוספו כמה נושאים אפשריים לשיחה",
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
          ? "אפשר לתאר העדפות וגבולות בלי למסור פרטים רגישים"
          : "נוספו פרטים על העדפות וערכים",
    });
    totalScore += lookingPoints;

    // Quality tips
    const qualityTips: string[] = [];
    if (bio.length < 100)
      qualityTips.push("אפשר להוסיף לביו כמה פרטים לא רגישים; אין אורך שמבטיח ביצועים.");
    if (allInterests.length < 5)
      qualityTips.push("אפשר להוסיף תחביבים כנושאי שיחה, אבל זה שדה אופציונלי.");
    if (!args.location)
      qualityTips.push("אם מוסיפים מיקום, הסתפקו בעיר או אזור ולא בכתובת.");
    if ((args.relationshipValues ?? []).length < 2)
      qualityTips.push("אפשר לציין ערכים שחשובים לכם בלי להציג אותם כמבחן התאמה.");
    if (totalScore >= 80)
      qualityTips.push("רוב שדות הטיוטה מולאו. המדד אינו מדרג איכות ואינו מנבא התאמות.");
    else if (totalScore >= 60)
      qualityTips.push("חלק גדול משדות הטיוטה מולא; אפשר להשאיר שדות אופציונליים ריקים.");

    return {
      score: Math.min(100, totalScore),
      breakdown,
      qualityTips,
    };
  },
});
