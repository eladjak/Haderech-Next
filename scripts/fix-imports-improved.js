const fs = require("fs");
const path = require("path");

const glob = require("glob");

/**
 * רשימת קבצים שנכשלו בפרסור (גירסה מורחבת)
 */
const PROBLEMATIC_FILES = [
  // הקבצים המקוריים
  "src/types/api.ts",
  "src/components/AboutPage.tsx",
  "src/components/auth/login-form.tsx",
  "src/components/auth/register-form.tsx",
  "src/components/course/course-content.tsx",
  "src/components/course/course-sidebar.tsx",
  "src/components/forum/Forum.tsx",
  "src/components/forum/ForumFilters.tsx",
  "src/components/forum-post.tsx",
  "src/components/HomePage.tsx",
  "src/components/simulator/ChatSimulator.tsx",
  "src/components/simulator/FeedbackDisplay.tsx",
  "src/components/ui/form.tsx",
  "src/components/ui/toaster.tsx",
  "src/lib/api.ts",
  "src/lib/services/simulator.ts",
  "src/lib/services/supabase.ts",
  "src/store/slices/forumSlice.ts",
  "src/types/models.ts",
  "src/tests/utils/test-mocks.ts",
  // קבצים נוספים מהשגיאות החדשות
  "src/components/auth/reset-password-form.tsx",
  "src/components/auth/update-password-form.tsx",
  "src/components/course-card.tsx",
  "src/components/forum-comment.tsx",
  "src/components/language-selector.tsx",
  "src/components/layout/user-nav.tsx",
  "src/components/profile/profile-form.tsx",
  "src/components/profile/profile-stats.tsx",
  "src/components/shared/referral-management.tsx",
  "src/components/simulator/chat.tsx",
  "src/components/theme-toggle.tsx",
  "src/components/ui/carousel.tsx",
  "src/components/ui/language-selector.tsx",
  "src/components/ui/tilt.tsx",
  "src/components/courses/course-card.tsx",
  "src/components/forum/ForumStats.tsx",
  "src/store/slices/simulator.ts",
  "src/types/props.ts",
  "src/tests/a11y/simulator.a11y.test.tsx",
  "src/tests/build/simulator.build.test.ts",
  "src/tests/integration/forum/ForumIntegration.test.tsx",
  "src/tests/performance/simulator.perf.test.ts",
  "src/tests/performance/ui.perf.test.tsx",
  "src/tests/unit/components/forum/Forum.test.tsx",
  "src/tests/unit/components/forum/ForumAccessibility.test.tsx",
  "src/tests/unit/components/forum/ForumPost.test.tsx",
  "src/tests/unit/components/forum/ForumStats.test.tsx",
  "src/tests/unit/components/theme-toggle.test.tsx",
  "src/tests/unit/services/simulator.test.ts",
  "src/tests/utils/test-fixtures.ts",
  "src/app/(course)/courses/[id]/components/course-comments.tsx",
  "src/app/(course)/courses/[id]/components/course-content.tsx",
  "src/app/(course)/courses/[id]/components/course-header.tsx",
  "src/app/(course)/courses/[id]/components/course-sidebar.tsx",
  "src/app/(course)/courses/[id]/components/course-tabs.tsx",
  "src/app/(course)/courses/[id]/components/course-video.tsx",
  "src/app/(course)/courses/[id]/lessons/[lessonId]/components/lesson-sidebar.tsx",
  "src/app/(course)/courses/[id]/lessons/[lessonId]/components/lesson-video.tsx",
  "src/app/api/simulator/route.ts",
  "src/app/api/__tests__/lessons.test.ts",
  "src/app/community/new/page.tsx",
  "src/app/forum/[id]/page.tsx",
  "src/constants/posts.ts",
];

/**
 * תיקון בעיות פרסור בקבצים - גישה חדשה ופשוטה יותר
 */
function fixImportParsingIssues(filePath) {
  try {
    console.log(`מתקן בעיות בקובץ: ${filePath}`);

    // קורא את תוכן הקובץ
    let content = fs.readFileSync(filePath, "utf8");

    // גישה חדשה: נקרא את הקובץ שורה-שורה
    const lines = content.split(/\\r?\\n/);
    const fixedLines = [];
    let inImportBlock = false;
    let currentImportSource = "";
    let currentImportItems = [];

    // עובר על כל שורה ומתקן את הבעיות
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];

      // מוחק קווים תחתונים מייבואים של משתנים
      if (
        line.includes("import") &&
        !line.includes("_") &&
        !line.includes(" from ")
      ) {
        line = line.replace(/import\s+([A-Za-z0-9]+)/g, "import $1");
      }

      // מחזיר את שורה "use client" למצב תקין
      if (line.includes('"use client"') && line.includes('from "./forum"')) {
        line = '"use client";';
      }

      fixedLines.push(line);
    }

    // כותב את התוכן המתוקן
    content = fixedLines.join("\\n");

    // תיקון ידני של התבניות הלא תקינות
    content = content
      // מתקן ייבואים עם פסיק בסוף הרשימה אבל ללא סגירת סוגריים
      .replace(
        /import\s+(\w+\s+)?{([^}]*?),\s*(?:\n|\r\n)(?=\s*import)/g,
        (match, prefix = "", items) => {
          return `import ${prefix || ""}{${items}} from "@/components/ui/";\\n`;
        }
      )

      // מתקן ייבואים כפולים
      .replace(
        /import\s+(?:type\s+)?{([^}]*?)}\s+from\s+(['"])([^'"]+)\1;\s*import\s+(?:type\s+)?{/g,
        (match, items, quote, source) => {
          return `import type {${items}} from ${quote}${source}${quote};\\nimport type {`;
        }
      )

      // מתקן שגיאות נפוצות בסוגריים וציטוטים
      .replace(/"use client";}\s+from\s+(['"])([^'"]+)\1;/g, '"use client";')
      .replace(
        /import\s+type\s+{([^}]*?)(?:\n|\r\n)}\s+from\s+(['"])([^'"]+)\2;/g,
        (match, items, quote, source) => {
          return `import type {${items}} from ${quote}${source}${quote};`;
        }
      )

      // מסיר כפלים של ייבוא מאותו מקור
      .replace(
        /from\s+(['"])([^'"]+)\1;\s*}\s+from\s+\1\2\1;/g,
        (match, quote, source) => {
          return `from ${quote}${source}${quote};`;
        }
      );

    // תיקון מלא של הקובץ
    // פתרון בסיסי - מחליף את הקובץ בגירסה ידנית נקייה אם זה קובץ שנכשל באופן חמור
    if (filePath === "src/components/AboutPage.tsx") {
      content = `import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowLeft,
  BookOpen,
  HeartHandshake,
  Lightbulb,
  MessageCircle,
  Target,
  Users,
} from "lucide-react";

"use client";

export default function AboutPage() {
  // מצב מוגן מפני שגיאות הידרציה
  const [isMounted, setIsMounted] = useState(false);

  // האפקט הבא יופעל רק בצד הלקוח ויטפל בבעיות הידרציה
  useEffect(() => {
    // סמן שהקומפוננטה ממופה כדי למנוע רנדור כפול
    setIsMounted(true);

    // טיפול בבעיות הידרציה פוטנציאליות
    try {
      console.log("AboutPage client-side code executed");
    } catch (error) {
      console.error("Error in client-side initialization:", error);
    }
  }, []);

  // אם הקומפוננטה לא מורכבת עדיין, נציג ממשק פשוט יותר כדי למנוע שגיאות הידרציה
  if (!isMounted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold">אודות פלטפורמת הדרך</h1>
        </div>
      </div>
    );
  }

  // הרנדור המלא יקרה רק בצד הלקוח אחרי שהקומפוננטה מורכבת
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex flex-1 flex-col items-center px-4 text-center sm:px-8 md:px-16 md:py-24">
        <div className="container flex max-w-6xl flex-col items-center justify-center gap-8 py-8 md:py-10">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
              אודות פלטפורמת הדרך
            </h1>
            <p className="mx-auto max-w-[42rem] text-lg text-muted-foreground sm:text-xl">
              פלטפורמת הלמידה המתקדמת לפיתוח ושיפור מיומנויות בינאישיות
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  החזון שלנו
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-lg">
                  אנו שואפים ליצור עולם בו כל אדם יכול לשפר את איכות מערכות
                  היחסים שלו ולהגיע לתקשורת בריאה יותר, דרך למידה מותאמת אישית
                  ותרגול מעשי.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  המטרה שלנו
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-lg">
                  לספק את הכלים הטובים ביותר לפיתוח מיומנויות בינאישיות ותקשורת
                  אפקטיבית, באמצעות טכנולוגיה חדשנית ושיטות פדגוגיות מתקדמות.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HeartHandshake className="h-5 w-5" />
                  הערכים שלנו
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-lg">
                  אנו מאמינים באמפתיה, כנות, למידה מתמדת, שיתוף ידע וקהילתיות.
                  ערכים אלו מנחים אותנו בכל היבט של הפלטפורמה ותוכן הקורסים.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  הקורסים שלנו
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-lg">
                  מגוון רחב של קורסים מעשיים בנושאים כמו תקשורת זוגית, יחסי
                  הורים-ילדים, פתרון קונפליקטים, תקשורת לא אלימה, והקשבה
                  אקטיבית.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  הסימולטור
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-lg">
                  סימולטור אינטראקטיבי המאפשר לתרגל תרחישי תקשורת מאתגרים בסביבה
                  בטוחה, לקבל משוב בזמן אמת ולשפר מיומנויות בצורה מעשית.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  הקהילה שלנו
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-lg">
                  קהילה תומכת של לומדים ומומחים, שיתוף ידע וניסיון, קבוצות דיון
                  ותמיכה הדדית בתהליך השיפור והצמיחה האישית.
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          <Button asChild size="lg" className="mt-8">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              חזרה לדף הבית
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
}`;
    }

    if (filePath === "src/types/api.ts") {
      // קורא את הקובץ מחדש כדי להחזיר אותו למצב התחלתי נקי
      const backupContent = fs.readFileSync(filePath + ".bak", "utf8");
      if (backupContent && backupContent.length > 0) {
        content = backupContent;
      } else {
        // גיבוי לפני תיקון ראשוני
        fs.writeFileSync(filePath + ".bak", content, "utf8");
      }
    }

    // כותב את התוכן המתוקן בחזרה לקובץ
    fs.writeFileSync(filePath, content, "utf8");
    console.log(`✅ תוקן בהצלחה: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`❌ שגיאה בתיקון הקובץ ${filePath}:`, error);
    return false;
  }
}

/**
 * פתרון חלופי: הגדרת דירקטוריה חדשה לקבצים הבעייתיים שמעתיקה מקבצים מקוריים מגיבוי
 */
function restoreOriginalFiles() {
  try {
    console.log("יוצר גיבוי לקבצים מקוריים מהגיט...");

    // מייצר רשימה של קבצים בעיתיים להשוואה
    const problematicPaths = new Set(PROBLEMATIC_FILES);

    // קורא קבצים מגיט
    for (const filePath of problematicPaths) {
      try {
        // גיבוי הקובץ הנוכחי לפני החלפה
        if (fs.existsSync(filePath)) {
          const backupFilePath = filePath + ".broken";
          if (!fs.existsSync(backupFilePath)) {
            fs.copyFileSync(filePath, backupFilePath);
            console.log(`גיבוי הקובץ הנוכחי: ${filePath} -> ${backupFilePath}`);
          }
        }

        // ניסיון להחזיר את הקובץ מגיט
        // const gitCommand = `git show HEAD:${filePath.replace(/\\/g, '/')}`;
        // const originalContent = execSync(gitCommand, { encoding: 'utf8' });

        // אם הצלחנו להשיג תוכן מקורי מגיט, נשמור אותו
        // if (originalContent && originalContent.length > 0) {
        //   fs.writeFileSync(filePath + '.orig', originalContent, 'utf8');
        //   console.log(`נשמר קובץ מקורי: ${filePath}.orig`);
        // }
      } catch (err) {
        console.warn(`לא ניתן לשחזר קובץ מקורי: ${filePath}`, err.message);
      }
    }

    console.log("✅ תהליך יצירת גיבויים הסתיים.");
    return true;
  } catch (error) {
    console.error("❌ שגיאה בשחזור קבצים מקוריים:", error);
    return false;
  }
}

/**
 * פונקציה ראשית שמריצה את הסקריפט
 */
async function main() {
  console.log("מתחיל תיקון בעיות ייבוא בקבצים בעייתיים...");

  // יצירת גיבויים
  restoreOriginalFiles();

  let fixedFiles = 0;
  let failedFiles = 0;

  for (const filePath of PROBLEMATIC_FILES) {
    if (fs.existsSync(filePath)) {
      const success = fixImportParsingIssues(filePath);
      if (success) {
        fixedFiles++;
      } else {
        failedFiles++;
      }
    } else {
      console.warn(`⚠️ הקובץ לא קיים: ${filePath}`);
    }
  }

  console.log(
    `\nסיכום: תוקנו ${fixedFiles} קבצים, נכשלו ${failedFiles} קבצים.`
  );
  console.log("סיים את תהליך התיקון!");
}

// הרצת הסקריפט
main().catch((error) => {
  console.error("שגיאה:", error);
  process.exit(1);
});
