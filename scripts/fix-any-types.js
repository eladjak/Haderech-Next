/**
 * סקריפט לתיקון שימוש ב-any בקבצי d.ts
 * הסקריפט מחליף שימוש ב-any ב-unknown כברירת מחדל או בטיפוסים מתאימים יותר
 */

// ייבוא מודולים
const fs = require("fs");
const path = require("path");

// תצורה
const TYPES_DIR = path.join(__dirname, "..", "src", "types");
const D_TS_PATTERN = ".d.ts"; // דפוס לזיהוי קבצי d.ts
const IGNORE_PATTERNS = ["node_modules", "dist", ".next", "public"];

// רשימת דפוסי החלפה
const REPLACEMENT_PATTERNS = [
  // החלפת any בהגדרות של Jest matchers ל-unknown
  {
    regex:
      /\b(toHaveBeenCalledWith|toHaveReturnedWith|toHaveNthReturnedWith|toHaveLastReturnedWith|toContain|toMatchObject|toBeInstanceOf|toHaveProperty)\(([^)]*?)\bany\b([^)]*)\)/g,
    replacement: "$1($2unknown$3)",
  },
  // החלפה כללית של any[] ל-unknown[]
  {
    regex: /\bany\[\]/g,
    replacement: "unknown[]",
  },
  // החלפת any בפרמטרים גנריים ל-unknown
  {
    regex: /<([^<>]*?)\bany\b([^<>]*)>/g,
    replacement: "<$1unknown$2>",
  },
  // פרמטרים: מחליף (args: any[]) ל-(args: unknown[])
  {
    regex: /\(([^)]*?)\bany\[\]([^)]*)\)/g,
    replacement: "($1unknown[]$2)",
  },
  // טיפול ספציפי בהגדרות של מוקים ופונקציות
  {
    regex:
      /(mockReturnValue|mockResolvedValue|mockImplementation|mockRejectedValue)\(([^)]*?)\bany\b([^)]*)\)/g,
    replacement: "$1($2unknown$3)",
  },
  // החלפת any כטיפוס חזרה של פונקציות
  {
    regex: /: any;/g,
    replacement: ": unknown;",
  },
  // החלפת any[] כטיפוס חזרה
  {
    regex: /: any\[\];/g,
    replacement: ": unknown[];",
  },
  // החלפת Record<string, any> ל-Record<string, unknown>
  {
    regex: /Record<string,\s*any>/g,
    replacement: "Record<string, unknown>",
  },
  // שימור של Assertion<T = any> כי זו תבנית שכיחה שלא כדאי לשנות
  {
    regex: /(Assertion|JestMatchers)<T\s*=\s*any>/g,
    replacement: "$1<T = any>",
  },
  // השארת חלק מהגדרות any כמו שהן אם הן חלק מתבנית סטנדרטית
  {
    regex:
      /(interface\s+)(Mock|AsymmetricMatchersContaining|Expect)(<T\s*=\s*any>)/g,
    replacement: "$1$2$3",
  },
];

/**
 * מקבל את כל הקבצים רקורסיבית מתיקייה עם סיומות ספציפיות
 */
function getFiles(dir, pattern, filelist = [], ignorePatterns = []) {
  console.log(`בודק תיקייה: ${dir}`);

  if (!fs.existsSync(dir)) {
    console.error(`התיקייה ${dir} לא קיימת!`);
    return filelist;
  }

  const files = fs.readdirSync(dir);
  console.log(`נמצאו ${files.length} קבצים/תיקיות בתיקייה ${dir}`);

  files.forEach((file) => {
    const filePath = path.join(dir, file);

    // דילוג על דפוסים שיש להתעלם מהם
    if (ignorePatterns.some((pattern) => filePath.includes(pattern))) {
      return;
    }

    if (fs.statSync(filePath).isDirectory()) {
      console.log(`כניסה לתת-תיקייה: ${filePath}`);
      filelist = getFiles(filePath, pattern, filelist, ignorePatterns);
    } else {
      // בדיקה אם הקובץ מסתיים ב-.d.ts
      if (file.endsWith(pattern)) {
        console.log(`הוספת קובץ: ${filePath}`);
        filelist.push(filePath);
      } else {
        console.log(`דילוג על קובץ: ${filePath}`);
      }
    }
  });

  return filelist;
}

/**
 * מתקן את השימוש ב-any בקובץ
 */
function fixAnyTypes(filePath) {
  try {
    console.log(`מטפל בקובץ: ${filePath}`);
    let content = fs.readFileSync(filePath, "utf8");
    let originalContent = content;

    // החלפת כל הדפוסים המוגדרים
    REPLACEMENT_PATTERNS.forEach((pattern) => {
      content = content.replace(pattern.regex, pattern.replacement);
    });

    // שמירת הקובץ רק אם היו שינויים
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, "utf8");
      return true;
    }

    return false;
  } catch (error) {
    console.error(`שגיאה בתיקון הקובץ ${filePath}:`, error.message);
    return false;
  }
}

/**
 * פונקציה ראשית לתיקון any בכל קבצי d.ts
 */
function main() {
  console.log("🔍 מחפש קבצי טיפוסים עם שימוש ב-any...");

  const files = getFiles(TYPES_DIR, D_TS_PATTERN, [], IGNORE_PATTERNS);
  console.log(`נמצאו ${files.length} קבצי .d.ts לבדיקה.`);

  let fixedCount = 0;
  let failCount = 0;

  files.forEach((file) => {
    const fixed = fixAnyTypes(file);
    fixed ? fixedCount++ : failCount++;
  });

  console.log("\n✅ תיקון טיפוסי any הושלם:");
  console.log(`תוקנו בהצלחה: ${fixedCount} קבצים`);

  if (failCount > 0) {
    console.log(`לא היה צורך לתקן: ${failCount} קבצים`);
  }
}

// הרצת הסקריפט
main();
