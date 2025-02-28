#!/usr/bin/env node

/**
 * Monitor Build Script
 * -------------------
 * מאפשר להריץ ולנטר בילד בצורה מבוקרת
 */

/* eslint-disable @typescript-eslint/no-var-requires */
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
/* eslint-enable @typescript-eslint/no-var-requires */

// צבעים לפלט בטרמינל
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
};

// הגדרות
const BUILD_LOG_FILE = path.join(process.cwd(), "build-log.txt");
const ERROR_LOG_FILE = path.join(process.cwd(), "build-errors.txt");

// פונקציה להריץ פקודה ולכתוב את הפלט לקובץ לוג
function runCommand(command, args, logFile) {
  console.log(
    `${colors.bold}${colors.blue}Running: ${command} ${args.join(" ")}${colors.reset}\n`
  );

  // מחיקת קובץ הלוג הקודם אם קיים
  if (fs.existsSync(logFile)) {
    fs.unlinkSync(logFile);
  }

  // יצירת קובץ לוג חדש
  fs.writeFileSync(logFile, `Running: ${command} ${args.join(" ")}\n`, "utf8");

  // הרצת הפקודה
  const child = spawn(command, args, { stdio: "pipe" });

  // כתיבת הפלט לקובץ הלוג
  child.stdout.on("data", (data) => {
    const output = data.toString();
    fs.appendFileSync(logFile, output, "utf8");
    process.stdout.write(output);
  });

  // כתיבת שגיאות לקובץ לוג נפרד
  child.stderr.on("data", (data) => {
    const output = data.toString();
    fs.appendFileSync(ERROR_LOG_FILE, output, "utf8");
    process.stderr.write(`${colors.red}${output}${colors.reset}`);
  });

  // כאשר הפקודה מסתיימת
  child.on("close", (code) => {
    const result =
      code === 0
        ? `${colors.green}✓ Build completed successfully${colors.reset}`
        : `${colors.red}✗ Build failed with code ${code}${colors.reset}`;

    console.log(`\n${colors.bold}${result}${colors.reset}`);
    fs.appendFileSync(logFile, `\nExit code: ${code}`, "utf8");

    if (code === 0) {
      console.log(
        `\n${colors.green}Build logs saved to: ${logFile}${colors.reset}`
      );
    } else {
      console.log(
        `\n${colors.yellow}Build logs saved to: ${logFile}${colors.reset}`
      );
      console.log(
        `${colors.yellow}Error logs saved to: ${ERROR_LOG_FILE}${colors.reset}`
      );
    }
  });

  // הרצה בעת שגיאה
  child.on("error", (error) => {
    console.error(
      `${colors.red}Failed to start process: ${error}${colors.reset}`
    );
    fs.appendFileSync(
      ERROR_LOG_FILE,
      `Failed to start process: ${error}\n`,
      "utf8"
    );
  });
}

// פונקציה להריץ את הבילד עם הבדיקות
function runBuild() {
  console.log(
    `${colors.bold}${colors.magenta}Starting build process with checks...${colors.reset}\n`
  );

  // ניתן להחליף את הפקודה בהתאם לצורך
  runCommand("pnpm", ["run", "build"], BUILD_LOG_FILE);
}

// בדיקה אם הסקריפט הורץ ישירות
if (require.main === module) {
  runBuild();
}

module.exports = {
  runBuild,
};
