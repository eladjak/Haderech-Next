const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const glob = require("glob");

// פונקציה להפעלת פקודת לינט וקבלת תוצאות ההתראות
function runLintAndGetWarnings() {
  try {
    const output = execSync("pnpm next lint", { encoding: "utf8" });
    return output;
  } catch (error) {
    // במקרה של שגיאת לינט, הפלט יוחזר בשדה stdout
    if (error.stdout) {
      return error.stdout;
    }
    console.error("שגיאה בהפעלת הלינט:", error);
    return "";
  }
}

// פונקציה לניתוח פלט הלינט וחילוץ המשתנים שאינם בשימוש
function extractUnusedVariables(lintOutput) {
  const results = {};

  // דפוסים לזיהוי משתנים שאינם בשימוש בפלט הלינט - מעודכן לפי הפורמט האמיתי
  const patterns = [
    // דפוס עבור הודעות "X is defined but never used. Allowed unused vars must match /^_/u."
    /(\.\/.*?):(\d+):(\d+)\s+Warning: '(\w+)' is defined but never used\. Allowed unused vars must match \/\^_\/u\./g,
    // דפוס עבור הודעות "X is assigned a value but never used. Allowed unused vars must match /^_/u."
    /(\.\/.*?):(\d+):(\d+)\s+Warning: '(\w+)' is assigned a value but never used\. Allowed unused vars must match \/\^_\/u\./g,
    // דפוס עבור הודעות "X is defined but never used. Allowed unused args must match /^_/u."
    /(\.\/.*?):(\d+):(\d+)\s+Warning: '(\w+)' is defined but never used\. Allowed unused args must match \/\^_\/u\./g,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(lintOutput)) !== null) {
      const [_, filePath, line, column, varName] = match;

      if (!results[filePath]) {
        results[filePath] = [];
      }

      // נוסיף רק אם המשתנה לא מתחיל כבר בקו תחתון
      if (!varName.startsWith("_")) {
        results[filePath].push({
          line: parseInt(line, 10),
          column: parseInt(column, 10),
          varName,
        });
      }
    }
  }

  // מדפיס דוגמאות מתוצאות המציאה לצורך ניפוי באגים
  console.log(`נמצאו דפוסים ב-${Object.keys(results).length} קבצים`);
  if (Object.keys(results).length > 0) {
    const sampleFile = Object.keys(results)[0];
    console.log(`דוגמה מקובץ ${sampleFile}:`, results[sampleFile]);
  }

  return results;
}

// פונקציה לקריאת קובץ
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch (error) {
    console.error(`שגיאה בקריאת הקובץ ${filePath}:`, error);
    return null;
  }
}

// פונקציה לכתיבת קובץ
function writeFile(filePath, content) {
  try {
    fs.writeFileSync(filePath, content, "utf8");
    return true;
  } catch (error) {
    console.error(`שגיאה בכתיבת הקובץ ${filePath}:`, error);
    return false;
  }
}

// פונקציה להוספת קו תחתון לשמות משתנים בקובץ
function addUnderscoresToUnusedVars(filePath, unusedVars) {
  // מיון המשתנים בסדר יורד לפי מספר שורה ועמודה
  // כך שנטפל קודם במשתנים שמופיעים מאוחר יותר בקובץ
  // ונמנע מלשנות את המיקומים של משתנים שעדיין לא טיפלנו בהם
  unusedVars.sort((a, b) => {
    if (a.line !== b.line) return b.line - a.line;
    return b.column - a.column;
  });

  const fullPath = path.resolve(process.cwd(), filePath);
  const content = readFile(fullPath);
  if (!content) return false;

  let modifiedContent = content;
  let modificationCount = 0;

  for (const { line, column, varName } of unusedVars) {
    // חילוץ השורה הרלוונטית
    const lines = modifiedContent.split("\n");
    if (line > lines.length) continue;

    const lineContent = lines[line - 1];

    // הוספת קו תחתון לפני שם המשתנה בעמודה המדויקת
    const beforeVar = lineContent.substring(0, column - 1);
    const afterVar = lineContent.substring(column - 1);

    // וידוא שאנחנו מחליפים רק את המשתנה ולא חלק ממילה אחרת
    const updatedAfterVar = afterVar.replace(
      new RegExp(`^(${varName})\\b`),
      `_$1`
    );

    // עדכון השורה רק אם היה שינוי
    if (updatedAfterVar !== afterVar) {
      lines[line - 1] = beforeVar + updatedAfterVar;
      modifiedContent = lines.join("\n");
      modificationCount++;
    }
  }

  if (modificationCount > 0) {
    if (writeFile(fullPath, modifiedContent)) {
      console.log(`✅ עודכנו ${modificationCount} משתנים בקובץ ${filePath}`);
      return true;
    }
  }

  return false;
}

// הפונקציה הראשית
async function main() {
  console.log("🔍 מריץ בדיקת לינט ומחלץ אזהרות...");
  const lintOutput = runLintAndGetWarnings();

  console.log("🔎 מנתח את תוצאות הלינט...");
  const unusedVarsMap = extractUnusedVariables(lintOutput);

  console.log(
    `🧩 נמצאו משתנים לא בשימוש ב-${Object.keys(unusedVarsMap).length} קבצים`
  );

  let totalFixed = 0;
  let totalFiles = 0;

  for (const [filePath, unusedVars] of Object.entries(unusedVarsMap)) {
    if (unusedVars.length > 0) {
      console.log(
        `📝 מטפל בקובץ ${filePath} (${unusedVars.length} משתנים לא בשימוש)`
      );
      if (addUnderscoresToUnusedVars(filePath, unusedVars)) {
        totalFixed += unusedVars.length;
        totalFiles++;
      }
    }
  }

  console.log(`\n✨ סיכום: עודכנו ${totalFixed} משתנים ב-${totalFiles} קבצים`);

  if (totalFixed > 0) {
    console.log(
      "🚀 כדאי להריץ שוב את פקודת lint:fix כדי לבדוק שכל הבעיות נפתרו"
    );
  } else {
    console.log(
      "⚠️ לא נמצאו משתנים לתיקון או שהיו בעיות בזיהוי הדפוסים. בדוק את קובץ הפלט."
    );
  }
}

main().catch((error) => {
  console.error("שגיאה:", error);
  process.exit(1);
});
