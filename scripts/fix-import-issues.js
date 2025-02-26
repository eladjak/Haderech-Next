const fs = require("fs");
const path = require("path");

const glob = require("glob");

/**
 * רשימת קבצים שנכשלו בפרסור
 */
const PROBLEMATIC_FILES = [
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
];

/**
 * תיקון בעיות פרסור בקבצים שנכשלו
 */
function fixImportParsingIssues(filePath) {
  try {
    console.log(`מתקן בעיות בקובץ: ${filePath}`);

    // קורא את תוכן הקובץ
    let content = fs.readFileSync(filePath, "utf8");

    // מתקן ייבואים לא תקינים כמו שורה שמתחילה ב-import והשורה הבאה גם מתחילה ב-import
    const importRegex = /import\s+(?:type\s+)?{[^}]*?(?:\n|\r\n)(?=\s*import)/g;
    content = content.replace(importRegex, (match) => {
      // מוסיף סגירת סוגריים לייבוא הלא שלם
      return match.trim() + '} from "./forum";\n';
    });

    // מתקן ייבואים עם פסיק בסוף הרשימה אבל ללא סגירת סוגריים
    const incompleteImportRegex =
      /import\s+(?:type\s+)?{[^}]*?,\s*(?:\n|\r\n)/g;
    content = content.replace(incompleteImportRegex, (match) => {
      // מסיר את הפסיק האחרון ומוסיף סגירת סוגריים
      return match.replace(/,\s*(?:\n|\r\n)$/, '\n} from "./forum";\n');
    });

    // מתקן בעיות נוספות הקשורות לייבואים
    content = content
      // מתקן כפילויות של ייבואים מאותו מקור
      .replace(
        /import\s+(?:type\s+)?{[^}]*?}\s+from\s+(['"])([^'"]+)\1;\s*import\s+(?:type\s+)?{/g,
        "import type {"
      )
      // מוודא שיש רווח אחרי השם של הייבוא
      .replace(/import([A-Za-z])/g, "import $1")
      // מוודא שיש רווח לפני הסוגריים המסולסלים
      .replace(/import([A-Za-z]+){/g, "import $1 {");

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
 * פונקציה ראשית שמריצה את הסקריפט
 */
async function main() {
  console.log("מתחיל תיקון בעיות ייבוא בקבצים בעייתיים...");

  let fixedFiles = 0;
  let failedFiles = 0;

  for (const filePath of PROBLEMATIC_FILES) {
    const success = fixImportParsingIssues(filePath);
    if (success) {
      fixedFiles++;
    } else {
      failedFiles++;
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
