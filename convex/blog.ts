import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./lib/authGuard";

// ─── Category Type ──────────────────────────────────────────────────────────

const blogCategory = v.union(
  v.literal("dating-tips"),
  v.literal("relationship"),
  v.literal("self-improvement"),
  v.literal("communication"),
  v.literal("psychology")
);

// ─── Public Queries ─────────────────────────────────────────────────────────

/** רשימת מאמרים מפורסמים - עם אפשרות סינון לפי קטגוריה */
export const listPublished = query({
  args: {
    category: v.optional(blogCategory),
  },
  handler: async (ctx, args) => {
    const posts = args.category
      ? await ctx.db
          .query("blogPosts")
          .withIndex("by_category", (q) => q.eq("category", args.category!))
          .order("desc")
          .collect()
      : await ctx.db
          .query("blogPosts")
          .withIndex("by_created")
          .order("desc")
          .collect();

    // Filter to published only
    const published = posts.filter((p) => p.published);

    // Enrich with author data
    const enriched = await Promise.all(
      published.map(async (post) => {
        const author = await ctx.db.get(post.authorId);
        const u = author as {
          name?: string;
          email?: string;
          imageUrl?: string;
        } | null;
        return {
          ...post,
          authorName: u?.name ?? u?.email ?? "צוות הדרך",
          authorImage: u?.imageUrl ?? null,
        };
      })
    );

    return enriched;
  },
});

/** מאמר לפי slug (ציבורי) */
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const post = await ctx.db
      .query("blogPosts")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (!post || !post.published) return null;

    const author = await ctx.db.get(post.authorId);
    const u = author as {
      name?: string;
      email?: string;
      imageUrl?: string;
    } | null;

    return {
      ...post,
      authorName: u?.name ?? u?.email ?? "צוות הדרך",
      authorImage: u?.imageUrl ?? null,
    };
  },
});

/** 3 מאמרים אחרונים (לדף הבית / סיידבר) */
export const listRecent = query({
  args: {},
  handler: async (ctx) => {
    const posts = await ctx.db
      .query("blogPosts")
      .withIndex("by_created")
      .order("desc")
      .take(20);

    const published = posts.filter((p) => p.published).slice(0, 3);

    const enriched = await Promise.all(
      published.map(async (post) => {
        const author = await ctx.db.get(post.authorId);
        const u = author as {
          name?: string;
          email?: string;
          imageUrl?: string;
        } | null;
        return {
          ...post,
          authorName: u?.name ?? u?.email ?? "צוות הדרך",
          authorImage: u?.imageUrl ?? null,
        };
      })
    );

    return enriched;
  },
});

/** רשימת כל המאמרים כולל טיוטות (אדמין) */
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const posts = await ctx.db
      .query("blogPosts")
      .withIndex("by_created")
      .order("desc")
      .collect();

    const enriched = await Promise.all(
      posts.map(async (post) => {
        const author = await ctx.db.get(post.authorId);
        const u = author as {
          name?: string;
          email?: string;
          imageUrl?: string;
        } | null;
        return {
          ...post,
          authorName: u?.name ?? u?.email ?? "צוות הדרך",
          authorImage: u?.imageUrl ?? null,
        };
      })
    );

    return enriched;
  },
});

/** סטטיסטיקות בלוג (אדמין) */
export const getStats = query({
  args: {},
  handler: async (ctx) => {
    try {
      await requireAdmin(ctx);
    } catch {
      return null;
    }

    const posts = await ctx.db.query("blogPosts").collect();

    const published = posts.filter((p) => p.published);
    const drafts = posts.filter((p) => !p.published);
    const totalViews = posts.reduce((sum, p) => sum + p.views, 0);

    return {
      totalPosts: posts.length,
      published: published.length,
      drafts: drafts.length,
      totalViews,
    };
  },
});

/** הגדלת צפיות */
export const incrementViews = mutation({
  args: { postId: v.id("blogPosts") },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) return;
    await ctx.db.patch(args.postId, { views: post.views + 1 });
  },
});

// ─── Admin Mutations ────────────────────────────────────────────────────────

/** יצירת מאמר חדש */
export const createPost = mutation({
  args: {
    title: v.string(),
    slug: v.string(),
    excerpt: v.string(),
    content: v.string(),
    category: blogCategory,
    tags: v.array(v.string()),
    coverImage: v.optional(v.string()),
    readTime: v.number(),
    published: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await requireAdmin(ctx);

    const trimmedTitle = args.title.trim();
    if (trimmedTitle.length === 0)
      throw new Error("כותרת לא יכולה להיות ריקה");
    if (trimmedTitle.length > 200)
      throw new Error("כותרת ארוכה מדי (מקסימום 200 תווים)");

    const trimmedSlug = args.slug
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\u0590-\u05FF-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    if (trimmedSlug.length === 0) throw new Error("Slug לא יכול להיות ריק");

    // Check slug uniqueness
    const existing = await ctx.db
      .query("blogPosts")
      .withIndex("by_slug", (q) => q.eq("slug", trimmedSlug))
      .unique();
    if (existing) throw new Error("Slug כבר קיים, בחר אחר");

    const trimmedExcerpt = args.excerpt.trim();
    if (trimmedExcerpt.length === 0)
      throw new Error("תקציר לא יכול להיות ריק");

    const now = Date.now();

    return await ctx.db.insert("blogPosts", {
      authorId: user._id,
      title: trimmedTitle,
      slug: trimmedSlug,
      excerpt: trimmedExcerpt,
      content: args.content,
      category: args.category,
      tags: args.tags.map((t) => t.trim()).filter((t) => t.length > 0),
      coverImage: args.coverImage,
      readTime: Math.max(1, Math.round(args.readTime)),
      published: args.published,
      views: 0,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/** עדכון מאמר */
export const updatePost = mutation({
  args: {
    postId: v.id("blogPosts"),
    title: v.optional(v.string()),
    slug: v.optional(v.string()),
    excerpt: v.optional(v.string()),
    content: v.optional(v.string()),
    category: v.optional(blogCategory),
    tags: v.optional(v.array(v.string())),
    coverImage: v.optional(v.string()),
    readTime: v.optional(v.number()),
    published: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");

    const updates: Record<string, unknown> = { updatedAt: Date.now() };

    if (args.title !== undefined) {
      const trimmed = args.title.trim();
      if (trimmed.length === 0) throw new Error("כותרת לא יכולה להיות ריקה");
      updates.title = trimmed;
    }

    if (args.slug !== undefined) {
      const trimmedSlug = args.slug
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\u0590-\u05FF-]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
      if (trimmedSlug.length === 0) throw new Error("Slug לא יכול להיות ריק");

      const existing = await ctx.db
        .query("blogPosts")
        .withIndex("by_slug", (q) => q.eq("slug", trimmedSlug))
        .unique();
      if (existing && existing._id !== args.postId) {
        throw new Error("Slug כבר קיים, בחר אחר");
      }

      updates.slug = trimmedSlug;
    }

    if (args.excerpt !== undefined) {
      const trimmed = args.excerpt.trim();
      if (trimmed.length === 0) throw new Error("תקציר לא יכול להיות ריק");
      updates.excerpt = trimmed;
    }

    if (args.content !== undefined) updates.content = args.content;
    if (args.category !== undefined) updates.category = args.category;
    if (args.tags !== undefined) {
      updates.tags = args.tags
        .map((t) => t.trim())
        .filter((t) => t.length > 0);
    }
    if (args.coverImage !== undefined) updates.coverImage = args.coverImage;
    if (args.readTime !== undefined) {
      updates.readTime = Math.max(1, Math.round(args.readTime));
    }
    if (args.published !== undefined) updates.published = args.published;

    await ctx.db.patch(args.postId, updates);
  },
});

/** מחיקת מאמר */
export const deletePost = mutation({
  args: { postId: v.id("blogPosts") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");

    await ctx.db.delete(args.postId);
  },
});

// ─── Seed ─────────────────────────────────────────────────────────────────────

/** נתוני דוגמה לבלוג - 6 מאמרים בעברית */
export const seedBlogPosts = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await requireAdmin(ctx);

    // Check if posts already exist
    const existing = await ctx.db
      .query("blogPosts")
      .withIndex("by_created")
      .take(1);
    if (existing.length > 0) {
      throw new Error("Blog posts already seeded");
    }

    const now = Date.now();

    const posts = [
      {
        slug: "first-date-tips",
        title: "10 טיפים לדייט ראשון מושלם",
        category: "dating-tips" as const,
        readTime: 5,
        excerpt:
          "דייט ראשון יכול להיות מלחיץ, אבל עם ההכנה הנכונה הוא יכול להפוך לחוויה נפלאה",
        tags: ["דייט ראשון", "טיפים", "הכנה"],
        content: `# 10 טיפים לדייט ראשון מושלם

דייט ראשון הוא הזדמנות מרגשת להכיר מישהו חדש. הנה 10 טיפים שיעזרו לכם להפוך אותו לחוויה בלתי נשכחת:

## 1. בחרו מקום נוח ונעים
בחרו מקום שאתם מכירים ומרגישים בו בנוח. בית קפה שקט או מסעדה נעימה הם אופציות מצוינות. הקפידו שהמקום לא יהיה רועש מדי כדי שתוכלו לשמוע אחד את השני.

## 2. הגיעו בזמן
דייקנות מראה כבוד ורצינות. הגיעו כמה דקות מוקדם כדי להירגע ולהתמקם.

## 3. היו עצמכם
אין צורך להעמיד פנים או לנסות להרשים. האותנטיות שלכם היא הדבר הכי מושך שיש. אנשים מרגישים כשמישהו לא אמיתי.

## 4. הקשיבו באמת
הקשבה אקטיבית היא המפתח לשיחה טובה. שאלו שאלות המשך והראו עניין אמיתי במה שהאדם שמולכם אומר.

## 5. שמרו על שפת גוף פתוחה
חיוך, קשר עין, ישיבה פתוחה - כל אלה מעבירים מסר חיובי ומראים שאתם נוכחים ומתעניינים.

## 6. הימנעו מנושאים כבדים
הדייט הראשון הוא לא הזמן לדבר על אקסים, בעיות כספיות, או טראומות. שמרו את זה קליל ומהנה.

## 7. שימו את הטלפון בצד
תנו לאדם שמולכם את מלוא תשומת הלב. הטלפון יכול לחכות.

## 8. היו חיוביים
אנרגיה חיובית מושכת אנשים. שתפו דברים שאתם אוהבים, חלומות ושאיפות.

## 9. אל תלחצו על עצמכם
לא כל דייט חייב להוביל לזוגיות. פשוט תהנו מהרגע ומהחברה.

## 10. המשיכו את הקשר
אם נהניתם, שלחו הודעה אחרי הדייט. אל תחכו שלושה ימים - זה כבר לא רלוונטי.

**זכרו:** דייט ראשון מושלם הוא לא על שלמות - אלא על חיבור אמיתי בין שני אנשים.`,
      },
      {
        slug: "communication-skills",
        title: "אומנות התקשורת בזוגיות",
        category: "communication" as const,
        readTime: 7,
        excerpt:
          "תקשורת טובה היא הבסיס לכל זוגיות מוצלחת. הנה הכלים שתצטרכו",
        tags: ["תקשורת", "זוגיות", "כלים"],
        content: `# אומנות התקשורת בזוגיות

תקשורת היא הדלק של כל מערכת יחסים. בלי תקשורת טובה, גם הזוגיות הכי חזקה עלולה להיסדק.

## למה תקשורת כל כך חשובה?

מחקרים מראים שזוגות שמתקשרים ביעילות מדווחים על שביעות רצון גבוהה יותר ב-87% מהמקרים. תקשורת טובה מונעת אי-הבנות, בונה אמון ומחזקת את הקשר הרגשי.

## עקרונות התקשורת הזוגית

### הקשבה אקטיבית
הקשבה היא לא רק לשמוע מילים. זה אומר לתת תשומת לב מלאה, לשקף רגשות ולהראות שאתם באמת מבינים.

**תרגול:** כשבן/בת הזוג מדבר/ת, חזרו על מה ששמעתם במילים שלכם: "אם אני מבין נכון, את מרגישה..."

### שפת "אני" במקום "אתה"
במקום "אתה תמיד מאחר!" נסו "אני מרגיש/ה מתוסכל/ת כשאנחנו לא מגיעים בזמן". זה מפחית הגנתיות ופותח דיאלוג.

### תזמון נכון
לא כל רגע מתאים לשיחה רצינית. בחרו זמן שבו שניכם רגועים ופנויים רגשית.

### ולידציה רגשית
גם אם אתם לא מסכימים, הכירו ברגש של השני. "אני מבין למה זה מרגיש ככה" היא משפט עוצמתי.

## טעויות נפוצות בתקשורת

- **קריאת מחשבות** - לא להניח שאתם יודעים מה השני חושב
- **הכללות** - "אתה תמיד..." / "אף פעם לא..."
- **ביטול רגשות** - "אתה מגזים" / "זה לא כזה נורא"
- **שתיקה עונשית** - הימנעות מתקשורת כאמצעי לחץ

**מפתח ההצלחה:** תרגול יומיומי. תקשורת טובה היא מיומנות שמשתפרת עם הזמן.`,
      },
      {
        slug: "self-confidence",
        title: "איך לבנות ביטחון עצמי לפני דייט",
        category: "self-improvement" as const,
        readTime: 6,
        excerpt: "ביטחון עצמי הוא המפתח למשיכה. למדו איך לפתח אותו",
        tags: ["ביטחון עצמי", "צמיחה אישית", "דייטינג"],
        content: `# איך לבנות ביטחון עצמי לפני דייט

ביטחון עצמי הוא אחד הדברים הכי מושכים שיש. החדשות הטובות? זה לא משהו שנולדים איתו - זה משהו שבונים.

## מה זה בעצם ביטחון עצמי?

ביטחון עצמי הוא לא להרגיש מושלם. זה לדעת שאתם מספיק טובים כפי שאתם, עם כל החוזקות והחולשות.

## 5 צעדים לבניית ביטחון

### 1. הכירו את עצמכם
רשמו 10 דברים שאתם אוהבים בעצמכם. לא רק מראה חיצוני - גם תכונות אופי, כישורים, הישגים.

### 2. עבדו על שפת הגוף
- עמדו ישר עם כתפיים פתוחות
- שמרו על קשר עין
- חייכו - זה משפר את מצב הרוח של כולם

### 3. טפלו בעצמכם
דאגו לשינה טובה, תזונה בריאה ופעילות גופנית. כשהגוף מרגיש טוב, גם הנפש מרגישה טוב.

### 4. תרגלו דיאלוג פנימי חיובי
שימו לב למחשבות השליליות והחליפו אותן. במקום "אני לא מספיק מעניין/ת", נסו "יש לי הרבה מה להציע".

### 5. צאו מאזור הנוחות
כל פעם שאתם עושים משהו שמפחיד אתכם, הביטחון גדל. התחילו בצעדים קטנים.

## טכניקות מהירות לפני דייט

- **נשימות עמוקות** - 4 שניות שאיפה, 7 החזקה, 8 נשיפה
- **דמיינו הצלחה** - תארו לעצמכם איך הדייט עובר מצוין
- **מוזיקה מעודדת** - מוזיקה שנותנת לכם אנרגיה
- **תזכורת** - "אני הולך/ת לבלות, לא למבחן"

**זכרו:** האדם שמולכם גם מתרגש/ת. ביטחון עצמי מושך כי הוא מאפשר לכם להיות נוכחים ואמיתיים.`,
      },
      {
        slug: "reading-body-language",
        title: "שפת גוף: איך לקרוא את השותף לדייט",
        category: "psychology" as const,
        readTime: 8,
        excerpt:
          "למדו לפענח את הסימנים הלא-מילוליים ולהבין מה באמת קורה בדייט",
        tags: ["שפת גוף", "פסיכולוגיה", "סימנים"],
        content: `# שפת גוף: איך לקרוא את השותף לדייט

93% מהתקשורת שלנו היא לא-מילולית. כשאתם בדייט, המילים הן רק חלק קטן מהסיפור.

## סימנים חיוביים - הוא/היא מתעניין/ת

### קשר עין
- מחזיק/ה קשר עין ממושך
- מביט/ה בעיניים ואז בשפתיים (המשולש של המשיכה)
- עיניים "מחייכות" - קמטים קלים בצד

### שפת גוף פתוחה
- ישיבה מוטית קדימה, לכיוונכם
- ידיים פתוחות (לא שלובות)
- מראה/ת את חלק הגוף הפנימי (פרקי ידיים, צוואר)

### מגע
- נגיעות "מקריות" בזרוע או בכתף
- משחק/ת עם שיער
- מיקום קרוב יותר ממה שנדרש

### שיקוף
- מחקה את תנועות הגוף שלכם
- משנה קצב דיבור להתאים שלכם
- משתמש/ת בביטויים דומים

## סימנים שליליים - פחות עניין

### ריחוק פיזי
- נוטה/ת אחורה
- ידיים שלובות על החזה
- מסתובב/ת לכיוון הדלת

### חוסר מעורבות
- מסתכל/ת בטלפון
- מביט/ת סביב החדר
- תשובות קצרות

### אי נוחות
- משפשף/ת צוואר
- מעביר/ה משקל מרגל לרגל
- חוסר שקט כללי

## איך להגיב?

**אם הסימנים חיוביים:** המשיכו להיות עצמכם, אפשר להעמיק את השיחה ולהראות יותר עניין.

**אם הסימנים שליליים:** אל תיקחו אישית. אולי הם פשוט עצבניים, או שהכימיה לא שם - וזה בסדר גמור.

**חשוב:** שפת גוף היא לא מדע מדויק. אל תקפצו למסקנות - חפשו קבוצות של סימנים, לא סימן בודד.`,
      },
      {
        slug: "online-dating-guide",
        title: "מדריך מלא לדייטינג אונליין",
        category: "dating-tips" as const,
        readTime: 10,
        excerpt:
          "כל מה שצריך לדעת כדי להצליח בעולם הדייטינג הדיגיטלי",
        tags: ["דייטינג אונליין", "אפליקציות", "פרופיל"],
        content: `# מדריך מלא לדייטינג אונליין

דייטינג אונליין הפך לדרך הנפוצה ביותר להכיר בני זוג בישראל ובעולם. הנה המדריך המלא שלכם להצלחה.

## בניית פרופיל מנצח

### תמונות
- **תמונה ראשית:** חיוך טבעי, תאורה טובה, רקע נקי
- **מגוון:** הראו את עצמכם בפעילויות שונות
- **אותנטיות:** אל תשתמשו בפילטרים כבדים
- **עדכניות:** תמונות מהשנה האחרונה

### ביוגרפיה
- כתבו משהו ייחודי - לא רק "אוהב לטייל ולאכול"
- הוסיפו הומור אמיתי
- היו ספציפיים: "קורא היסטוריה יפנית" עדיף על "אוהב לקרוא"
- שאלו שאלה שמזמינה תגובה

## אומנות השיחה הראשונה

### פתיחה טובה
- התייחסו למשהו ספציפי מהפרופיל שלהם
- שאלה פתוחה שמזמינה שיחה
- הומור קליל אבל לא בדיחות מוכנות

### מה לא לעשות
- "היי מה נשמע?" - משעמם מדי
- הודעות ארוכות מדי בהתחלה
- מחמאות על המראה בלבד
- הודעות מועתקות שנשלחות לכולם

## מתי לעבור לפגישה

**הכלל:** אחרי 5-10 הודעות טובות, הציעו להיפגש. יותר מדי שיחות טקסט יכולות ליצור ציפיות לא ריאליסטיות.

## בטיחות בדייטינג אונליין

- היפגשו במקום ציבורי תמיד
- ספרו לחבר/ה לאן אתם הולכים
- אל תשתפו מידע אישי רגיש מוקדם מדי
- סמכו על האינסטינקט שלכם - אם משהו מרגיש לא בסדר, זה כנראה לא בסדר

## טיפ אחרון

**דייטינג אונליין הוא מרתון, לא ספרינט.** אל תתייאשו אחרי כמה ניסיונות כושלים. כל פגישה היא הזדמנות ללמוד ולגדול. המפתח הוא להישאר אופטימיים ואותנטיים.`,
      },
      {
        slug: "healthy-relationship",
        title: "מה הופך זוגיות לבריאה?",
        category: "relationship" as const,
        readTime: 6,
        excerpt:
          "הסודות של זוגיות בריאה ומאושרת - מבוססים על מחקר",
        tags: ["זוגיות", "מחקר", "בריאות"],
        content: `# מה הופך זוגיות לבריאה?

ד"ר ג'ון גוטמן, אחד החוקרים המובילים בעולם בתחום הזוגיות, חקר אלפי זוגות במשך עשרות שנים. הנה מה שהוא גילה.

## 7 עקרונות לזוגיות מוצלחת

### 1. מפות אהבה
הכירו את עולמו הפנימי של בן/בת הזוג. מה החלומות שלהם? מה מפחיד אותם? מה משמח אותם?

### 2. טפחו חיבה והערכה
יחס של 5:1 - על כל אינטראקציה שלילית, צריכות להיות 5 חיוביות. אמרו "תודה", "אני מעריך/ה", "אני אוהב/ת".

### 3. פנו אחד לשני
כשבן/בת הזוג מבקש/ת תשומת לב, הגיבו. המפנים הקטנים האלה בונים את בסיס האמון.

### 4. תנו לשני להשפיע
זוגיות בריאה היא שותפות. שני הצדדים צריכים להרגיש שקולם נשמע ושדעתם חשובה.

### 5. פתרו בעיות הניתנות לפתרון
69% מהקונפליקטים בזוגיות הם תמידיים. למדו לנהל אותם, לא לפתור אותם.

### 6. התגברו על מבוי סתום
כשאתם נתקעים בוויכוח, קחו הפסקה. חזרו כשאתם רגועים ונסו להבין את הפרספקטיבה של השני.

### 7. צרו משמעות משותפת
בנו חלומות, מטרות וערכים משותפים. זוגות שיש להם "מיזם משותף" מדווחים על אושר גבוה יותר.

## ארבעת הפרשים של גוטמן

ארבעה דפוסי תקשורת הרסניים שצריך להימנע מהם:

- **ביקורתיות** - התקפה על האופי במקום על ההתנהגות
- **הגנתיות** - "זה לא אני, זה אתה!"
- **בוז** - גלגול עיניים, לעג, ציניות
- **הסתגרות** - נתיקה רגשית, שתיקה

## הרגל יומי

**6 שניות ביום** - נשיקה ארוכה של 6 שניות כל יום. מחקר מראה שזה משפר משמעותית את הקשר הרגשי.

**זכרו:** זוגיות בריאה היא לא זוגיות מושלמת. היא זוגיות שבה שני אנשים בוחרים זה בזה, יום אחרי יום.`,
      },
    ];

    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      await ctx.db.insert("blogPosts", {
        authorId: user._id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        category: post.category,
        tags: post.tags,
        readTime: post.readTime,
        published: true,
        views: Math.floor(Math.random() * 500) + 50,
        createdAt: now - (posts.length - i) * 86400000, // stagger dates
        updatedAt: now - (posts.length - i) * 86400000,
      });
    }
  },
});
