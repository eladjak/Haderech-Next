#!/usr/bin/env node

/**
 * Build Monitor Tool
 * -----------------
 * כלי לניטור תהליך הבנייה והצגת מידע מפורט על שגיאות
 *
 * הסקריפט:
 * 1. מריץ את תהליך הבנייה עם לוגים מפורטים
 * 2. מזהה סוגי שגיאות נפוצים ומציג הסברים
 * 3. מאפשר שמירת לוגים לקובץ לניתוח מאוחר יותר
 *
 * שימוש:
 *   node scripts/monitor-build.js [options]
 *
 * אפשרויות:
 *   --debug         הצגת מידע נוסף לצורכי דיבאג
 *   --log=<path>    שמירת הלוגים לקובץ (ברירת מחדל: build-logs.txt)
 */

const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

// צבעים לפלט בטרמינל
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  bold: "\x1b[1m",
};

// ניתוח פרמטרים מהקומנד ליין
const args = process.argv.slice(2);
const DEBUG = args.includes("--debug");
const LOG_FILE =
  args.find((arg) => arg.startsWith("--log="))?.split("=")[1] ||
  "build-logs.txt";

// שגיאות נפוצות וההסברים שלהן
const commonErrors = {
  'The "use client" directive must be placed before other expressions':
    'דירקטיבת "use client" צריכה להיות בתחילת הקובץ, לפני כל ביטוי אחר כולל ייבואים',

  "You're importing a component that needs useEffect":
    'אתה מייבא קומפוננטה שמשתמשת ב-useEffect בתוך קומפוננטת שרת. הוסף "use client" בתחילת הקובץ או ארגן מחדש את הקוד',

  "You're importing a component that needs useState":
    'אתה מייבא קומפוננטה שמשתמשת ב-useState בתוך קומפוננטת שרת. הוסף "use client" בתחילת הקובץ או ארגן מחדש את הקוד',

  "Cannot use import statement outside a module":
    "לא ניתן להשתמש בהצהרת ייבוא מחוץ למודול. בדוק את הגדרות הקימפול",

  "Expected ';' but found":
    "נמצאה שגיאת תחביר ב-TypeScript. צפוי להיות נקודה-פסיק במקום אחר",

  createServerClient:
    "יש להחליף createServerClient ב-createRouteHandlerClient בקבצי API",
};

// פונקציה לזיהוי שגיאות נפוצות וניתוח שלהן
function analyzeError(error) {
  for (const [pattern, explanation] of Object.entries(commonErrors)) {
    if (error.includes(pattern)) {
      return `${colors.yellow}⚠️ זוהתה שגיאה מוכרת: ${colors.reset}
${colors.blue}  סוג: ${colors.reset}${pattern}
${colors.blue}  הסבר: ${colors.reset}${explanation}`;
    }
  }
  return null;
}

// יצירת קובץ לוג
if (DEBUG) {
  console.log(`${colors.blue}הלוגים יישמרו בקובץ: ${colors.reset}${LOG_FILE}`);
}

// פתיחת זרם כתיבה לקובץ הלוג
const logStream = fs.createWriteStream(path.join(process.cwd(), LOG_FILE), {
  flags: "w",
});

// פונקציה להוספת מידע ללוג
function log(message) {
  // הסרת קודי צבע מההודעה לקובץ הלוג
  const cleanMessage = message.replace(/\x1b\[\d+m/g, "");
  logStream.write(cleanMessage + "\n");
  console.log(message);
}

// הצגת כותרת
log(`${colors.bold}${colors.blue}=== מוניטור בנייה לפרויקט HaDerech ===
${colors.reset}${colors.yellow}הרצה בתאריך: ${colors.reset}${new Date().toLocaleString("he-IL")}
${colors.yellow}מצב דיבאג: ${colors.reset}${DEBUG ? "פעיל" : "לא פעיל"}
${colors.reset}`);

// ניטור ביצועים
const startTime = Date.now();
let errorCount = 0;
let warningCount = 0;

// הרצת פקודת הבנייה
log(`${colors.blue}מריץ פקודת בנייה: ${colors.reset}pnpm run build`);

const buildProcess = spawn("pnpm", ["run", "build"], {
  shell: true,
  stdio: "pipe",
});

// קליטה ועיבוד פלט רגיל
buildProcess.stdout.on("data", (data) => {
  const output = data.toString();
  log(output);

  if (output.includes("warning")) {
    warningCount++;
  }
});

// קליטה ועיבוד פלט שגיאה
buildProcess.stderr.on("data", (data) => {
  const error = data.toString();
  errorCount++;

  // ניתוח השגיאה
  const analysis = analyzeError(error);

  if (analysis) {
    log(`${colors.red}${error}${colors.reset}`);
    log(analysis);
  } else {
    log(`${colors.red}${error}${colors.reset}`);
  }
});

// טיפול בסיום התהליך
buildProcess.on("close", (code) => {
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  if (code === 0) {
    log(
      `\n${colors.green}${colors.bold}✓ הבנייה הושלמה בהצלחה!${colors.reset}`
    );
  } else {
    log(
      `\n${colors.red}${colors.bold}✗ הבנייה נכשלה עם קוד שגיאה: ${code}${colors.reset}`
    );
  }

  // סיכום
  log(`\n${colors.bold}${colors.blue}=== סיכום ===
${colors.reset}${colors.yellow}משך זמן: ${colors.reset}${duration} שניות
${colors.yellow}שגיאות: ${colors.reset}${errorCount}
${colors.yellow}אזהרות: ${colors.reset}${warningCount}
${colors.yellow}קובץ לוג: ${colors.reset}${LOG_FILE}
`);

  // סגירת קובץ הלוג
  logStream.end();

  process.exit(code);
});

// טיפול בשגיאות אחרות
buildProcess.on("error", (error) => {
  log(
    `\n${colors.red}${colors.bold}✗ שגיאה בהרצת תהליך הבנייה: ${error.message}${colors.reset}`
  );
  logStream.end();
  process.exit(1);
});
