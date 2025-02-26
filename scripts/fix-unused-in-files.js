const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// רשימת הקבצים שמכילים משתנים לא בשימוש
const filesToCheck = [
  // קבצים קודמים
  "lib/services/simulator.ts",
  "src/components/simulator/chat.tsx",
  "src/components/simulator/ChatSimulator.tsx",
  "src/components/forum/ForumStats.tsx",
  "src/app/api/bookmarks/route.ts",
  "src/app/api/courses/route.ts",
  "src/app/api/enrollments/route.ts",
  "src/components/ui/gradient.tsx",
  "src/components/auth/register-form.tsx",
  "src/components/auth/update-password-form.tsx",
  "src/components/course/course-content.tsx",
  "src/app/forum/[id]/page.tsx",

  // קבצים חדשים
  "src/app/api/courses/[id]/lessons/route.ts",
  "src/app/api/courses/[id]/lessons/[lessonId]/comments/route.ts",
  "src/app/api/courses/[id]/lessons/[lessonId]/route.ts",
  "src/app/api/courses/[id]/route.ts",
  "src/app/api/forum/categories/route.ts",
  "src/app/api/forum/comments/route.ts",
  "src/app/api/forum/notifications/route.ts",
  "src/app/api/forum/posts/route.ts",
  "src/app/api/forum/search/route.ts",
  "src/app/api/forum/tags/route.ts",
  "src/app/api/forum/users/route.ts",
  "src/app/api/forum/views/route.ts",
  "src/app/api/leaderboard/route.ts",
  "src/app/api/notifications/route.ts",
  "src/app/api/simulator/route.ts",
  "src/app/api/simulator/scenarios/route.ts",
  "src/app/api/simulator/submissions/route.ts",
  "src/app/api/users/route.ts",
  "src/app/api/users/[id]/route.ts",
  "src/app/community/new/page.tsx",
  "src/app/community/[postId]/page.tsx",
  "src/app/error.tsx",
  "src/components/course/course-comments.tsx",
  "src/components/course-card.tsx",
  "src/components/simulator/MessageItem.tsx",
  "src/components/ui/carousel-3d.tsx",
  "src/components/ui/sparkles.tsx",
  "src/components/ui/spotlight.tsx",
  "src/components/ui/use-toast.ts",
  "src/constants/users.ts",
  "src/env.mjs",
  "src/hooks/use-auth.ts",
  "src/lib/api.ts",
  "src/lib/services/bot.ts",
  "src/lib/services/recommendation-engine.ts",
  "src/test/setup.ts",
  "src/tests/test-setup.ts",
  "src/tests/utils/setup.ts",
  "src/tests/utils/test-mocks.ts",
  "src/tests/utils/test-setup.ts",
  "src/types/api.ts",
  "src/types/models.ts",
  "src/types/props.ts",
  "src/types/simulator.ts",
];

// רגולרי אקספרשן למציאת משתנים לא בשימוש
const unusedVarRegex =
  /('|")(.+) is (defined|assigned a value) but never used\. Allowed unused (vars|args) must match \/\^\\_\/u\./;

// מציאת משתנים לא בשימוש בקובץ
function findUnusedVariables(filePath) {
  try {
    // הרצת ESLint על הקובץ
    const command = `npx eslint --format json ${filePath}`;
    const result = execSync(command, { encoding: "utf8" });

    // פענוח תוצאות ה-JSON
    const lintResults = JSON.parse(result);

    // רשימת המשתנים הלא בשימוש
    const unusedVars = [];

    // עבור על כל השגיאות בקובץ
    for (const file of lintResults) {
      for (const message of file.messages) {
        if (message.ruleId === "@typescript-eslint/no-unused-vars") {
          unusedVars.push({
            name: message.message.match(/'([^']+)' is/)[1],
            line: message.line,
            column: message.column,
          });
        }
      }
    }

    return unusedVars;
  } catch (error) {
    console.error(`שגיאה בניתוח הקובץ ${filePath}:`, error.message);
    return [];
  }
}

// קריאת קובץ
function readFile(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

// כתיבה לקובץ
function writeFile(filePath, content) {
  fs.writeFileSync(filePath, content, "utf8");
}

// הוספת קו תחתון למשתנים לא בשימוש
function addUnderscoresToUnusedVars(filePath, unusedVars) {
  if (unusedVars.length === 0) {
    console.log(`לא נמצאו משתנים לא בשימוש בקובץ ${filePath}`);
    return 0;
  }

  console.log(`נמצאו ${unusedVars.length} משתנים לא בשימוש בקובץ ${filePath}:`);
  unusedVars.forEach((v) =>
    console.log(`  - ${v.name} (שורה ${v.line}, עמודה ${v.column})`)
  );

  // קריאת תוכן הקובץ
  let content = readFile(filePath);
  const lines = content.split("\n");

  // מיון המשתנים לפי מיקום בקובץ (מהסוף להתחלה כדי למנוע בעיות אינדקס)
  unusedVars.sort((a, b) => {
    if (a.line !== b.line) return b.line - a.line;
    return b.column - a.column;
  });

  // עדכון של כל משתנה
  for (const variable of unusedVars) {
    const line = lines[variable.line - 1];
    const varName = variable.name;

    // בדיקה אם המשתנה כבר מתחיל בקו תחתון
    if (varName.startsWith("_")) continue;

    // החלפת שם המשתנה בשורה הנוכחית
    const updatedLine =
      line.substring(0, variable.column - 1) +
      "_" +
      line.substring(variable.column - 1);
    lines[variable.line - 1] = updatedLine;
  }

  // שמירת התוכן המעודכן
  writeFile(filePath, lines.join("\n"));

  return unusedVars.length;
}

// פונקציה ראשית
async function main() {
  let totalUpdated = 0;
  let totalFiles = 0;

  for (const file of filesToCheck) {
    try {
      console.log(`בודק קובץ: ${file}`);
      const unusedVars = findUnusedVariables(file);
      const updated = addUnderscoresToUnusedVars(file, unusedVars);

      if (updated > 0) {
        totalUpdated += updated;
        totalFiles++;
      }
    } catch (error) {
      console.error(`שגיאה בטיפול בקובץ ${file}:`, error);
    }
  }

  console.log(`\nסיכום: ${totalUpdated} משתנים עודכנו ב-${totalFiles} קבצים.`);
}

main().catch(console.error);
main();
