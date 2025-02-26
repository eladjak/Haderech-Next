/**
 * סקריפט לתיקון אוטומטי של סדר ייבוא בקבצי TypeScript
 * הסקריפט מסדר ייבואים לפי סדר עדיפות:
 * 1. ייבואים של ספריות Node.js כמו "util", "path" וכו'
 * 2. ייבואים React ו-Next.js
 * 3. ייבואים של ספריות צד שלישי
 * 4. ייבואים מקומיים
 * 5. ייבואי סגנון
 */

const fs = require("fs");
const path = require("path");

const glob = require("glob");

// הגדרת קבוצות עדיפות לייבואים
const IMPORT_GROUPS = {
  NODE_BUILT_IN: [
    "path",
    "fs",
    "util",
    "crypto",
    "http",
    "https",
    "os",
    "stream",
    "zlib",
    "url",
    "querystring",
    "buffer",
  ],
  REACT_NEXT: [
    "react",
    "react-dom",
    "next",
    "next/app",
    "next/document",
    "next/head",
    "next/image",
    "next/link",
    "next/navigation",
    "next/router",
    "next/server",
  ],
  TESTING: [
    "@testing-library/jest-dom",
    "@testing-library/react",
    "@testing-library/user-event",
    "vitest",
    "jest",
  ],
};

// ביטוי רגולרי לזיהוי משפטי ייבוא
const IMPORT_REGEX =
  /^import\s+(?:(?:{[^}]*}|\*\s+as\s+[^;]+)\s+from\s+)?['"]([^'"]+)['"]/;

// ביטוי רגולרי לזיהוי משפטי ייבוא סוגים
const TYPE_IMPORT_REGEX =
  /^import\s+type\s+(?:(?:{[^}]*}|\*\s+as\s+[^;]+)\s+from\s+)?['"]([^'"]+)['"]/;

// פונקציה לקביעת עדיפות של ייבוא
function getImportPriority(importPath) {
  if (IMPORT_GROUPS.NODE_BUILT_IN.some((prefix) => importPath === prefix)) {
    return 1;
  }
  if (
    IMPORT_GROUPS.REACT_NEXT.some(
      (prefix) => importPath === prefix || importPath.startsWith(`${prefix}/`)
    )
  ) {
    return 2;
  }
  if (
    IMPORT_GROUPS.TESTING.some(
      (prefix) => importPath === prefix || importPath.startsWith(`${prefix}/`)
    )
  ) {
    return 3;
  }
  if (
    importPath.startsWith("@/") ||
    importPath.startsWith("./") ||
    importPath.startsWith("../")
  ) {
    return 5;
  }
  // כל הספריות החיצוניות האחרות
  return 4;
}

// פונקציה למיון ייבואים
function sortImports(imports) {
  return imports.sort((a, b) => {
    const aIsType = a.startsWith("import type");
    const bIsType = b.startsWith("import type");

    // אם שניהם ייבואי טיפוס או שניהם לא, מיין לפי עדיפות
    if (aIsType === bIsType) {
      const aMatch = aIsType ? TYPE_IMPORT_REGEX.exec(a) : IMPORT_REGEX.exec(a);
      const bMatch = bIsType ? TYPE_IMPORT_REGEX.exec(b) : IMPORT_REGEX.exec(b);

      if (aMatch && bMatch) {
        const aPriority = getImportPriority(aMatch[1]);
        const bPriority = getImportPriority(bMatch[1]);

        if (aPriority !== bPriority) {
          return aPriority - bPriority;
        }
      }
    }

    // ייבואים רגילים לפני ייבואי טיפוס
    if (aIsType && !bIsType) {
      return 1;
    }
    if (!aIsType && bIsType) {
      return -1;
    }

    // אם הכל שווה, השאר את הסדר המקורי
    return 0;
  });
}

// פונקציה לאתר ולסדר ייבואים בקובץ
function processFile(filePath) {
  console.log(`בודק קובץ: ${filePath}`);
  let content = fs.readFileSync(filePath, "utf8");

  // זהה אזורי ייבוא
  const importBlocks = [];
  let currentBlock = [];
  let inImportBlock = false;

  const lines = content.split("\n");
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();

    // אם זה תחילת ייבוא חדש
    if (line.startsWith("import ")) {
      inImportBlock = true;
      currentBlock.push(lines[i]);
    }
    // אם זה חלק מייבוא (המשך ייבוא מרובה שורות)
    else if (inImportBlock && !line.endsWith(";") && line !== "") {
      currentBlock[currentBlock.length - 1] += " " + line;
      lines.splice(i, 1);
      continue; // דלג על קידום האינדקס כדי לא לדלג על שורות
    }
    // אם זה סוף בלוק ייבוא
    else if (inImportBlock && (line === "" || !line.startsWith("import "))) {
      if (currentBlock.length > 0) {
        importBlocks.push([...currentBlock]);
        currentBlock = [];
      }
      inImportBlock = false;
    }

    i++;
  }

  // הוסף את הבלוק האחרון אם הוא לא ריק
  if (currentBlock.length > 0) {
    importBlocks.push([...currentBlock]);
  }

  // אם יש ייבואים לטיפול
  if (importBlocks.length > 0) {
    // אחד את כל הייבואים לרשימה אחת ומיין אותה
    const allImports = importBlocks.flat();
    const sortedImports = sortImports(allImports);

    // ארגן את הייבואים הממוינים לבלוקים לפי עדיפות
    const groupedImports = [];
    let lastPriority = -1;
    let currentGroup = [];

    for (const importLine of sortedImports) {
      const match =
        IMPORT_REGEX.exec(importLine) || TYPE_IMPORT_REGEX.exec(importLine);
      const priority = match ? getImportPriority(match[1]) : lastPriority;

      if (priority !== lastPriority && lastPriority !== -1) {
        if (currentGroup.length > 0) {
          groupedImports.push([...currentGroup]);
          currentGroup = [];
        }
      }

      currentGroup.push(importLine);
      lastPriority = priority;
    }

    if (currentGroup.length > 0) {
      groupedImports.push([...currentGroup]);
    }

    // הסר את כל הייבואים מהתוכן המקורי
    let newContent = content;
    for (const importLine of allImports) {
      newContent = newContent.replace(importLine, "");
    }

    // הסר שורות ריקות מיותרות באזור הייבואים
    while (newContent.startsWith("\n")) {
      newContent = newContent.slice(1);
    }

    // בנה תוכן חדש עם הייבואים הממוינים
    let sortedContent = "";
    for (let i = 0; i < groupedImports.length; i++) {
      sortedContent += groupedImports[i].join("\n") + "\n";
      if (i < groupedImports.length - 1) {
        sortedContent += "\n"; // הוסף שורה ריקה בין קבוצות
      }
    }

    // הוסף שורה ריקה בין הייבואים לשאר הקוד אם צריך
    if (!newContent.startsWith("\n") && newContent.trim() !== "") {
      sortedContent += "\n";
    }

    // עדכן את הקובץ עם הייבואים הממוינים
    const finalContent = sortedContent + newContent;
    if (finalContent !== content) {
      fs.writeFileSync(filePath, finalContent, "utf8");
      console.log(`✅ תוקן סדר הייבוא בקובץ: ${filePath}`);
      return true;
    }
  }

  return false;
}

// פונקציה להריץ את התיקון על כל הקבצים המתאימים
function fixImportsInFiles(pattern) {
  const files = glob.sync(pattern);
  let fixedCount = 0;

  for (const file of files) {
    const fixed = processFile(file);
    if (fixed) {
      fixedCount++;
    }
  }

  console.log(`\nסיכום: תוקנו ${fixedCount} מתוך ${files.length} קבצים`);
}

// הרצת התיקון על כל קבצי TypeScript, TSX ו-JavaScript בפרויקט
const patterns = ["src/**/*.ts", "src/**/*.tsx", "src/**/*.js", "src/**/*.jsx"];

console.log("מתחיל בתיקון סדר הייבוא בקבצי הפרויקט...\n");
patterns.forEach((pattern) => fixImportsInFiles(pattern));
console.log("\nסיים את תהליך התיקון!");
