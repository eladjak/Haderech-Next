/**
 * Automatically fixes linting issues:
 * 1. Adds underscore prefix to unused variables
 * 2. Fixes import order issues (experimental)
 *
 * Usage:
 * node scripts/fix-linting.js
 */

const fs = require("fs");
const path = require("path");

const glob = require("glob");

// מציאת כל קבצי TS/TSX בפרויקט
const findTsFiles = () => {
  return glob.sync("src/**/*.{ts,tsx}", {
    ignore: ["src/**/*.d.ts", "node_modules/**"],
  });
};

// קריאת תוכן הקובץ
const readFile = (filePath) => {
  return fs.readFileSync(filePath, "utf8");
};

// כתיבת תוכן מעודכן לקובץ
const writeFile = (filePath, content) => {
  fs.writeFileSync(filePath, content, "utf8");
};

// מציאת משתנים לא בשימוש בהתבסס על אזהרות
const detectUnusedVars = (fileContent) => {
  // חיפוש דפוסים של אזהרות אפשריות לגבי משתנים לא בשימוש
  const varsPattern = /(\w+)' is defined but never used/g;
  const argsPattern = /(\w+)' is defined but never used/g;
  const assignedPattern = /(\w+)' is assigned a value but never used/g;

  const unusedVars = new Set();

  let match;

  // מציאת כל המשתנים הלא בשימוש שמוגדרים
  while ((match = varsPattern.exec(fileContent)) !== null) {
    unusedVars.add(match[1]);
  }

  // מציאת כל הפרמטרים הלא בשימוש
  while ((match = argsPattern.exec(fileContent)) !== null) {
    unusedVars.add(match[1]);
  }

  // מציאת כל המשתנים המוקצים אך לא בשימוש
  while ((match = assignedPattern.exec(fileContent)) !== null) {
    unusedVars.add(match[1]);
  }

  return Array.from(unusedVars);
};

// הוספת קידומת _ למשתנים לא בשימוש
const addUnderscoresToUnusedVars = (fileContent, unusedVars) => {
  let updatedContent = fileContent;

  unusedVars.forEach((varName) => {
    // וידוא שאין כבר _ בהתחלה
    if (varName[0] !== "_") {
      // הכנסת _ לפני הגדרת משתנה
      const varPattern = new RegExp(
        `(\\b|^)(${varName})(\\b|$|:|,|\\s*\\=|\\)|\\}|;)`,
        "g"
      );
      updatedContent = updatedContent.replace(varPattern, `$1_${varName}$3`);
    }
  });

  return updatedContent;
};

// הפעלת התיקון
const main = () => {
  const files = findTsFiles();
  console.log(`נמצאו ${files.length} קבצי TypeScript/React.`);

  files.forEach((filePath) => {
    try {
      const content = readFile(filePath);

      // זיהוי משתנים לא בשימוש (זו גרסה בסיסית, צריך כלי חכם יותר)
      // במימוש מלא, נרצה להשתמש ב-ESLint API במקום להסתמך על זה
      const unusedVars = detectUnusedVars(content);

      if (unusedVars.length > 0) {
        const updatedContent = addUnderscoresToUnusedVars(content, unusedVars);
        writeFile(filePath, updatedContent);
        console.log(
          `תוקן: ${filePath} - נוספה קידומת _ ל-${unusedVars.length} משתנים.`
        );
      }
    } catch (error) {
      console.error(`שגיאה בקובץ ${filePath}:`, error);
    }
  });

  console.log("הושלם תיקון קידומות _ למשתנים לא בשימוש.");
};

main();
