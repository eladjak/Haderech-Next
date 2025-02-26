const fs = require("fs");
const path = require("path");

// קורא את פלט הלינט מהקובץ
function readLintOutput() {
  try {
    const content = fs.readFileSync("lint-output.txt", "utf8");

    // הדפסת מספר השורות הראשונות לבדיקת הפורמט
    const lines = content.split("\n");
    console.log("--- 10 השורות הראשונות בקובץ הפלט ---");
    for (let i = 0; i < Math.min(10, lines.length); i++) {
      console.log(`[${i}] "${lines[i]}"`);
    }
    console.log("-----------------------------------");

    return content;
  } catch (error) {
    console.error("שגיאה בקריאת קובץ lint-output.txt:", error);
    return "";
  }
}

// מחלץ משתנים לא בשימוש מפלט הלינט
function extractUnusedVariables(lintOutput) {
  const fileVarMap = new Map();

  // דוגמאות של שורות בפלט:
  // ./src/app/api/bookmarks/route.ts
  // 14:27  Warning: 'request' is defined but never used. Allowed unused args must match /^_/u.  @typescript-eslint/no-unused-vars

  // מוצא שם קובץ ואז שורות השגיאה שתחתיו
  const fileLines = lintOutput.split("\n");
  let currentFile = null;

  console.log(`סה"כ שורות לניתוח: ${fileLines.length}`);

  for (let i = 0; i < fileLines.length; i++) {
    const line = fileLines[i].trim();

    // דילוג על שורות ריקות
    if (!line) continue;

    // מדפיס כל כמה שורות לדיבוג
    if (i < 30 || i % 100 === 0) {
      console.log(`בדיקת שורה ${i}: "${line}"`);
    }

    // בדיקה אם זו שורת שם קובץ
    if (line.startsWith("./") && !line.includes("Warning:")) {
      currentFile = line;
      console.log(`זיהוי קובץ חדש: ${currentFile}`);
      continue;
    }

    // אם זו שורת שגיאה ויש לנו קובץ נוכחי
    if (
      currentFile &&
      line.includes("Warning: '") &&
      line.includes("' is defined but never used")
    ) {
      // מחלץ את שם המשתנה: 'name' is defined but never used
      const varMatch = line.match(/Warning: '(\w+)' is defined but never used/);

      if (varMatch && varMatch[1]) {
        const varName = varMatch[1];
        // מחלץ מספר שורה ועמודה
        const posMatch = line.match(/^(\d+):(\d+)/);

        if (posMatch) {
          const lineNum = parseInt(posMatch[1]);
          const colNum = parseInt(posMatch[2]);

          if (!fileVarMap.has(currentFile)) {
            fileVarMap.set(currentFile, []);
          }

          fileVarMap.get(currentFile).push({
            name: varName,
            line: lineNum,
            column: colNum,
          });

          console.log(
            `נמצא משתנה לא בשימוש: ${varName} בקובץ ${currentFile} שורה ${lineNum}:${colNum}`
          );
        }
      }
    }

    // גם לבדוק משתנים שהוקצו אך לא בשימוש
    if (
      currentFile &&
      line.includes("Warning: '") &&
      line.includes("' is assigned a value but never used")
    ) {
      const varMatch = line.match(
        /Warning: '(\w+)' is assigned a value but never used/
      );

      if (varMatch && varMatch[1]) {
        const varName = varMatch[1];
        const posMatch = line.match(/^(\d+):(\d+)/);

        if (posMatch) {
          const lineNum = parseInt(posMatch[1]);
          const colNum = parseInt(posMatch[2]);

          if (!fileVarMap.has(currentFile)) {
            fileVarMap.set(currentFile, []);
          }

          fileVarMap.get(currentFile).push({
            name: varName,
            line: lineNum,
            column: colNum,
          });

          console.log(
            `נמצא משתנה שהוקצה אך לא בשימוש: ${varName} בקובץ ${currentFile} שורה ${lineNum}:${colNum}`
          );
        }
      }
    }

    // בדיקה גם למשתנים בפרמטרים של פונקציות
    if (
      currentFile &&
      line.includes("Warning: '") &&
      line.includes(
        "' is defined but never used. Allowed unused args must match"
      )
    ) {
      const varMatch = line.match(
        /Warning: '(\w+)' is defined but never used. Allowed unused args/
      );

      if (varMatch && varMatch[1]) {
        const varName = varMatch[1];
        const posMatch = line.match(/^(\d+):(\d+)/);

        if (posMatch) {
          const lineNum = parseInt(posMatch[1]);
          const colNum = parseInt(posMatch[2]);

          if (!fileVarMap.has(currentFile)) {
            fileVarMap.set(currentFile, []);
          }

          fileVarMap.get(currentFile).push({
            name: varName,
            line: lineNum,
            column: colNum,
          });

          console.log(
            `נמצא פרמטר לא בשימוש: ${varName} בקובץ ${currentFile} שורה ${lineNum}:${colNum}`
          );
        }
      }
    }
  }

  console.log(`סה"כ קבצים שנמצאו: ${fileVarMap.size}`);
  if (fileVarMap.size > 0) {
    for (const [filePath, vars] of fileVarMap.entries()) {
      console.log(`קובץ: ${filePath} מכיל ${vars.length} משתנים לא בשימוש`);
    }
  }

  return fileVarMap;
}

// קורא את תוכן הקובץ
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch (error) {
    console.error(`שגיאה בקריאת קובץ ${filePath}:`, error);
    return null;
  }
}

// כותב תוכן מעודכן לקובץ
function writeFile(filePath, content) {
  try {
    fs.writeFileSync(filePath, content, "utf8");
    return true;
  } catch (error) {
    console.error(`שגיאה בכתיבה לקובץ ${filePath}:`, error);
    return false;
  }
}

// מוסיף קו תחתון למשתנים לא בשימוש
function addUnderscoresToUnusedVars(fullFilePath, unusedVars) {
  console.log(`מנסה לקרוא את הקובץ: ${fullFilePath}`);
  const content = readFile(fullFilePath);
  if (!content) {
    console.error(`לא ניתן לקרוא את הקובץ: ${fullFilePath}`);
    return false;
  }

  // מסדר את המשתנים מסוף הקובץ להתחלה כדי שהשינויים לא ישפיעו על מיקומים
  unusedVars.sort((a, b) => {
    if (a.line !== b.line) return b.line - a.line;
    return b.column - a.column;
  });

  let modifiedContent = content;
  let modifiedCount = 0;

  for (const variable of unusedVars) {
    // נמצא את המיקום המדויק של המשתנה
    const lines = modifiedContent.split("\n");
    if (variable.line > lines.length) {
      console.warn(
        `שורה ${variable.line} לא קיימת בקובץ ${fullFilePath} שיש בו ${lines.length} שורות`
      );
      continue;
    }

    const line = lines[variable.line - 1];

    // מחפש את המשתנה כמילה שלמה
    const varRegex = new RegExp(`\\b${variable.name}\\b`);
    const lineMatch = line.match(varRegex);

    if (lineMatch && !variable.name.startsWith("_")) {
      // מחליף את המשתנה בגרסה עם קו תחתון
      const newLine = line.replace(varRegex, `_${variable.name}`);
      lines[variable.line - 1] = newLine;
      modifiedContent = lines.join("\n");
      modifiedCount++;
      console.log(
        `עדכון משתנה: ${variable.name} -> _${variable.name} בשורה ${variable.line}`
      );
    }
  }

  if (modifiedCount > 0) {
    writeFile(fullFilePath, modifiedContent);
    console.log(`✅ עודכנו ${modifiedCount} משתנים בקובץ ${fullFilePath}`);
    return true;
  }

  return false;
}

// פונקציה ראשית
function main() {
  console.log("🔎 מנתח את תוצאות הלינט מהקובץ lint-output.txt...");

  const lintOutput = readLintOutput();
  if (!lintOutput) {
    console.error(
      "❌ לא נמצא פלט לינט. אנא הרץ קודם את הפקודה: pnpm next lint > lint-output.txt"
    );
    return;
  }

  const fileVarMap = extractUnusedVariables(lintOutput);

  let totalUpdated = 0;
  let totalFiles = 0;

  for (const [filePath, unusedVars] of fileVarMap.entries()) {
    if (unusedVars.length === 0) continue;

    // המרת נתיב יחסי לנתיב מלא
    const fullFilePath = path.resolve(
      process.cwd(),
      filePath.replace(/^\.\//, "")
    );
    console.log(`מנסה לעדכן קובץ: ${filePath} -> ${fullFilePath}`);

    console.log(
      `🔧 מטפל בקובץ ${filePath} (${unusedVars.length} משתנים לא בשימוש)`
    );

    if (addUnderscoresToUnusedVars(fullFilePath, unusedVars)) {
      totalFiles++;
      totalUpdated += unusedVars.length;
    }
  }

  console.log(`✨ סיכום: עודכנו ${totalUpdated} משתנים ב-${totalFiles} קבצים`);
}

// הרצת הסקריפט
main();
