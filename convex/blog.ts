import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./lib/authGuard";
import { assertSeedAllowed } from "./lib/seedGuard";

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
    assertSeedAllowed("seedBlogPosts");
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
        title: "10 הצעות לדייט ראשון נעים ובטוח",
        category: "dating-tips" as const,
        readTime: 5,
        excerpt:
          "רעיונות לבחירה, תקשורת ובטיחות לפני מפגש ראשון, במהלכו ואחריו",
        tags: ["דייט ראשון", "טיפים", "הכנה"],
        content: `# 10 הצעות לדייט ראשון נעים ובטוח

דייט ראשון הוא פגישת היכרות, לא מבחן ולא הבטחה לקשר. בחרו רק במה שמתאים לשניכם, ותנו מקום גם לאפשרות שלא יהיה רצון להמשך.

## 1. בחרו מקום נוח ונעים
בחרו יחד מקום ציבורי, נגיש ונוח לשיחה. ודאו שלשניכם יש דרך עצמאית להגיע ולחזור, ושתפו אדם אמין בפרטי המפגש אם זה מרגיש נכון.

## 2. הגיעו בזמן
דייקנות מראה כבוד ורצינות. הגיעו כמה דקות מוקדם כדי להירגע ולהתמקם.

## 3. היו עצמכם
אין צורך להעמיד פנים או לייצר דמות. שתפו בקצב שנוח לכם; פרטיות, שקט או בחירה לא לענות על שאלה אינם כישלון.

## 4. הקשיבו באמת
הקשבה אקטיבית היא המפתח לשיחה טובה. שאלו שאלות המשך והראו עניין אמיתי במה שהאדם שמולכם אומר.

## 5. אל תנחשו כוונות משפת גוף
קשר עין, חיוך, תנוחה ותנועתיות מושפעים מתרבות, נגישות, חרדה והקשר. אל תפרשו אותם כהסכמה או כעניין; שאלו באופן ישיר ועדין והקשיבו לתשובה.

## 6. בחרו נושאים בהסכמה
אין רשימה אחת של נושאים "אסורים". לפני שאלה אישית או רגישה אפשר לשאול אם נוח לדבר עליה, ומותר לכל אחד לדלג בלי להסביר.

## 7. שימו את הטלפון בצד
כדאי לצמצם הסחות כשאפשר, תוך שמירה על צרכי נגישות, בטיחות או אחריות דחופה.

## 8. היו אנושיים, לא "חיוביים" בכוח
אפשר לשתף דברים משמחים וגם מורכבים בלי להפוך את המפגש להצגה. אין צורך להסתיר רגש כדי להיות ראויים לקשר.

## 9. אל תלחצו על עצמכם
לא כל דייט צריך להוביל לזוגיות. אפשר להתמקד בהיכרות, וגם לסיים מוקדם אם לא נעים או לא מתאים.

## 10. המשיכו את הקשר
אם תרצו המשך, אפשר לשלוח הודעה ברורה בזמן שנוח לכם. תשובה שלילית או היעדר תשובה אינם הזמנה לשכנע; מכבדים ועוצרים.

**זכרו:** המטרה אינה "להצליח" בדייט אלא לבדוק בנחת אם יש עניין, נוחות וכבוד הדדיים.`,
      },
      {
        slug: "communication-skills",
        title: "אומנות התקשורת בזוגיות",
        category: "communication" as const,
        readTime: 7,
        excerpt:
          "עקרונות לתרגול שיחה, הקשבה ובקשות בלי הבטחה לתוצאה",
        tags: ["תקשורת", "זוגיות", "כלים"],
        content: `# אומנות התקשורת בזוגיות

תקשורת היא חלק חשוב ממערכת יחסים, אך היא אינה מסבירה לבדה את איכות הקשר ואינה מתקנת אלימות, כפייה או חוסר בטיחות.

## למה תקשורת כל כך חשובה?

הקשבה, בהירות וכבוד יכולים לעזור להבין זה את זה. הם אינם מונעים כל אי-הבנה ואינם מחייבים הסכמה. אם שיחה אינה בטוחה, עדיף לעצור ולפנות לתמיכה מתאימה.

## עקרונות התקשורת הזוגית

### הקשבה אקטיבית
הקשבה היא לא רק לשמוע מילים. זה אומר לתת תשומת לב מלאה, לשקף רגשות ולהראות שאתם באמת מבינים.

**תרגול:** כשבן/בת הזוג מדבר/ת, חזרו על מה ששמעתם במילים שלכם: "אם אני מבין נכון, את מרגישה..."

### שפת "אני" במקום "אתה"
במקום "אתה תמיד מאחר!" אפשר לנסות "כשהגענו מאוחר הרגשתי מתוסכל/ת; מתאים לחשוב יחד על הפעם הבאה?" שפת "אני" עשויה לעזור לבהירות, אך אינה מבטיחה תגובה מסוימת.

### תזמון נכון
לא כל רגע מתאים לשיחה רצינית. בחרו זמן שבו שניכם רגועים ופנויים רגשית.

### ולידציה רגשית
גם אם אתם לא מסכימים, הכירו ברגש של השני. "אני מבין למה זה מרגיש ככה" היא משפט עוצמתי.

## טעויות נפוצות בתקשורת

- **קריאת מחשבות** - לא להניח שאתם יודעים מה השני חושב
- **הכללות** - "אתה תמיד..." / "אף פעם לא..."
- **ביטול רגשות** - "אתה מגזים" / "זה לא כזה נורא"
- **שתיקה עונשית** - הימנעות מתקשורת כאמצעי לחץ

**לסיום:** אפשר לתרגל בהדרגה ולבדוק מה מתאים לכם. אין נוסחה אחת לשיחה "נכונה", ומותר לבקש הפסקה או עזרה.`,
      },
      {
        slug: "self-confidence",
        title: "איך לבנות ביטחון עצמי לפני דייט",
        category: "self-improvement" as const,
        readTime: 6,
        excerpt: "הצעות להתכוננות שמכבדות גם התרגשות, אי-ודאות וגבולות",
        tags: ["ביטחון עצמי", "צמיחה אישית", "דייטינג"],
        content: `# איך לבנות ביטחון עצמי לפני דייט

ביטחון עצמי אינו תנאי למשיכה ואינו חובה לפני דייט. אפשר להגיע גם עם התרגשות או חוסר ודאות ולבחור צעדים קטנים שמתאימים לכם.

## מה זה בעצם ביטחון עצמי?

ביטחון עצמי הוא לא להרגיש מושלם. זה לדעת שאתם מספיק טובים כפי שאתם, עם כל החוזקות והחולשות.

## 5 צעדים לבניית ביטחון

### 1. הכירו את עצמכם
רשמו 10 דברים שאתם אוהבים בעצמכם. לא רק מראה חיצוני - גם תכונות אופי, כישורים, הישגים.

### 2. בחרו תנוחה ונוכחות שנוחות לכם
- אין תנוחה אחת שמשדרת ביטחון
- קשר עין אינו חובה ואינו מדד לכנות
- חיוך הוא בחירה, לא דרישה

### 3. טפלו בעצמכם
אם אפשר, בחרו הכנה בסיסית שעוזרת לכם — מנוחה, אוכל, תנועה או זמן שקט. צרכים ויכולות משתנים בין אנשים.

### 4. תרגלו דיאלוג פנימי חיובי
שימו לב למחשבות השליליות והחליפו אותן. במקום "אני לא מספיק מעניין/ת", נסו "יש לי הרבה מה להציע".

### 5. צאו מאזור הנוחות
בחרו צעדים קטנים ורצוניים. יציאה מאזור הנוחות אינה כוללת ויתור על בטיחות, פרטיות או הסכמה.

## טכניקות מהירות לפני דייט

- **נשימה נוחה** - האטו בלי לעצור נשימה אם זה לא נעים
- **דמיינו מגוון תוצאות** - גם מפגש שלא ממשיך יכול להיות תקין
- **מוזיקה מעודדת** - מוזיקה שנותנת לכם אנרגיה
- **תזכורת** - "אני הולך/ת לבלות, לא למבחן"

**זכרו:** איננו יודעים מה האדם שמולנו מרגיש בלי לשאול. נוכחות, כנות וגבולות חשובים יותר מהצגה של ביטחון.`,
      },
      {
        slug: "reading-body-language",
        title: "שפת גוף בדייט: למה לא כדאי לקרוא מחשבות",
        category: "psychology" as const,
        readTime: 8,
        excerpt:
          "איך להבחין באי-נוחות בלי להפוך מחוות לניבוי של עניין או הסכמה",
        tags: ["שפת גוף", "תקשורת", "הסכמה"],
        content: `# שפת גוף בדייט: למה לא כדאי לקרוא מחשבות

מחוות, קשר עין, תנוחה, טון ותנועתיות מושפעים מתרבות, נוירולוגיה, נגישות, לחץ, עייפות והקשר. אין אחוז קסם שמספר כמה מהתקשורת "לא-מילולית", ואין מחווה שמוכיחה עניין רומנטי או הסכמה.

## מה כן אפשר לעשות?

### לשים לב בלי לאבחן
אפשר להבחין שמישהו התרחק, שתק או נראה לא נוח, אבל לתאר לעצמנו את מה שראינו בלי לקבוע למה זה קרה. ידיים שלובות אינן בהכרח סגירות, היעדר קשר עין אינו חוסר כנות, וחיוך אינו "כן".

### לשאול באופן פשוט
- "נוח לך כאן?"
- "רוצה להמשיך בנושא הזה או לעבור למשהו אחר?"
- "מתאים לך שאשב קרוב יותר?"

שאלה אינה לחץ לקבל תשובה חיובית. נותנים זמן, מקבלים "לא", היסוס או חוסר תגובה ועוצרים בלי ויכוח.

### לקבל הסכמה מפורשת
מגע, מעבר למקום אחר או המשך אינטימי דורשים הסכמה חופשית וספציפית. קרבה, פלרטוט או מגע קודם אינם הסכמה להמשך, ואפשר לשנות את הדעה בכל רגע.

### לכבד שונות
יש אנשים שממעטים בקשר עין, זזים הרבה, זקוקים למרחב או מתקשרים אחרת. התאמה אינה דורשת "שפת גוף נכונה".

## כשיש ספק

מאטים ושואלים. אם אין תשובה ברורה, לא מתקדמים. הדרך האמינה לדעת מה אדם רוצה היא להקשיב למה שהוא אומר ולכבד את הגבולות שהוא מציב.`,
      },
      {
        slug: "online-dating-guide",
        title: "מדריך מלא לדייטינג אונליין",
        category: "dating-tips" as const,
        readTime: 10,
        excerpt:
          "עקרונות לפרופיל, שיחה, פרטיות ובטיחות בהיכרות מקוונת",
        tags: ["דייטינג אונליין", "אפליקציות", "פרופיל"],
        content: `# מדריך מלא לדייטינג אונליין

היכרות מקוונת היא אחת הדרכים האפשריות לפגוש אנשים. אין פרופיל או תזמון שמבטיחים התאמה, תשובה או קשר.

## בניית פרופיל ברור ואמיתי

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
- פתיחה כללית אינה "כישלון", אך אפשר להוסיף פרט מהפרופיל
- הודעות ארוכות מדי בהתחלה
- מחמאות על המראה בלבד
- הודעות מועתקות שנשלחות לכולם

## מתי לעבור לפגישה

אין מספר הודעות נכון. אפשר להציע מפגש כשיש נוחות ועניין הדדיים, ולא ללחוץ אם הצד השני רוצה להמשיך להתכתב או אינו מעוניין.

## בטיחות בדייטינג אונליין

- במפגש ראשון בחרו מקום ציבורי שניתן לעזוב בקלות
- ספרו לחבר/ה לאן אתם הולכים
- אל תשתפו מידע אישי רגיש מוקדם מדי
- תחושת אי-נוחות היא סיבה מספקת להאט או לעצור, גם בלי להוכיח מה היא אומרת
- אל תעברו במהירות לערוץ שחושף מספר טלפון או מידע מזהה
- חסימה ודיווח הם אפשרויות לגיטימיות; אל תנסו לעקוף חסימה או היעדר תשובה

## טיפ אחרון

**אין חובה להתמיד.** מותר לקחת הפסקה, לשנות פלטפורמה או להפסיק. מפגש שלא המשיך אינו כישלון ואינו שיעור שחייבים להפיק ממנו.`,
      },
      {
        slug: "healthy-relationship",
        title: "מה הופך זוגיות לבריאה?",
        category: "relationship" as const,
        readTime: 6,
        excerpt:
          "שאלות ועקרונות לבחינת כבוד, בטיחות, הדדיות ותקשורת בקשר",
        tags: ["זוגיות", "תקשורת", "גבולות"],
        content: `# מה הופך זוגיות לבריאה?

אין נוסחה שמבטיחה זוגיות בריאה, ומחקר קבוצתי אינו מנבא קשר יחיד. הנה כמה עקרונות מעשיים שאפשר לבחון בהקשר שלכם.

## 7 עקרונות לשיחה ולבדיקה

### 1. מפות אהבה
הכירו את עולמו הפנימי של בן/בת הזוג. מה החלומות שלהם? מה מפחיד אותם? מה משמח אותם?

### 2. טפחו חיבה והערכה
טפחו הערכה בלי להפוך אותה לספירה או להשתמש במחווה חיובית כדי למחוק פגיעה. התנצלות, אחריות ושינוי חשובים יותר מיחס מספרי.

### 3. פנו אחד לשני
כשבן/בת הזוג מבקש/ת תשומת לב, הגיבו. המפנים הקטנים האלה בונים את בסיס האמון.

### 4. תנו לשני להשפיע
זוגיות בריאה היא שותפות. שני הצדדים צריכים להרגיש שקולם נשמע ושדעתם חשובה.

### 5. פתרו בעיות הניתנות לפתרון
חלק מהמחלוקות נפתרות וחלקן דורשות ניהול מתמשך. פער ערכים מהותי יכול גם להצדיק שינוי גבול או סיום קשר; אין חובה להכיל כל פער.

### 6. התגברו על מבוי סתום
כשאתם נתקעים בוויכוח, קחו הפסקה. חזרו כשאתם רגועים ונסו להבין את הפרספקטיבה של השני.

### 7. צרו משמעות משותפת
אפשר לבנות מטרות משותפות לצד מטרות אישיות. שותפות אינה מחייבת מיזוג, וצרכים שונים אינם בהכרח תקלה.

## דפוסים שכדאי לעצור ולבדוק

ביקורת אישית, בוז, הגנתיות וניתוק ממושך יכולים לפגוע בשיחה. עם זאת, הפסקה מוסכמת לצורך ויסות אינה "הסתגרות", והתרחקות מסכנה היא פעולה מגינה.

- **ביקורתיות** - התקפה על האופי במקום על ההתנהגות
- **הגנתיות** - "זה לא אני, זה אתה!"
- **בוז** - גלגול עיניים, לעג, ציניות
- **הסתגרות** - נתיקה רגשית, שתיקה

## הרגל יומי

בחרו מחווה קטנה ששניכם רוצים — שיחה, הודעה, זמן משותף או מגע בהסכמה. אין משך קסם ואין חובה להתנשק.

**זכרו:** בחירה בקשר צריכה להישאר חופשית. כבוד, בטיחות והסכמה חשובים יותר מהתמדה בכל מחיר, ומותר גם לסיים קשר.`,
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
        views: 0,
        // Seed time is the only publication time this source can prove.
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});
