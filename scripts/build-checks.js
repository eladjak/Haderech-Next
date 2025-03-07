#!/usr/bin/env node

/**
 * scripts/build-checks.js
 * סקריפט לבדיקת בעיות נפוצות לפני בנייה
 *
 * אפשרויות:
 * --soft   : מאפשר לתהליך הבנייה להמשיך גם אם יש שגיאות לא קריטיות
 * --strict : מחמיר יותר בבדיקות (הופך אזהרות לשגיאות)
 * --fix    : מנסה לתקן בעיות באופן אוטומטי כאשר אפשרי
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const chalk = require("chalk");

// פרסור ארגומנטים
const args = process.argv.slice(2);
const isSoftMode = args.includes("--soft");
const isStrictMode = args.includes("--strict");
const shouldFix = args.includes("--fix");

// ספירת בעיות
let warningCount = 0;
let errorCount = 0;
let fixedCount = 0;

// פונקציית יצירת לוג
function log(message, type = "info") {
  const prefix = {
    info: chalk.blue("ℹ"),
    warn: chalk.yellow("⚠"),
    error: chalk.red("✖"),
    success: chalk.green("✓"),
    fix: chalk.magenta("🔧"),
  }[type];

  console.log(`${prefix} ${message}`);

  if (type === "warn") warningCount++;
  if (type === "error") errorCount++;
  if (type === "fix") fixedCount++;
}

// בדיקת דירקטיבות API
function checkApiDirectives() {
  log("בודק דירקטיבות API...");
  try {
    execSync("node scripts/check-api-directives.js --check", { stdio: "pipe" });
    log("דירקטיבות API תקינות", "success");
    return true;
  } catch (error) {
    log("נמצאו בעיות בדירקטיבות API, ריצה עם פלט מפורט:", "error");
    try {
      const output = execSync(
        "node scripts/check-api-directives.js --check --verbose",
        { stdio: "pipe" }
      ).toString();
      console.log(
        output
          .split("\n")
          .map((line) => `  ${line}`)
          .join("\n")
      );

      if (shouldFix) {
        log("מנסה לתקן דירקטיבות API באופן אוטומטי...", "fix");
        execSync("node scripts/check-api-directives.js --fix", {
          stdio: "pipe",
        });
        log("הדירקטיבות תוקנו בהצלחה", "success");
        return true;
      }
    } catch (e) {
      log("שגיאה בבדיקת דירקטיבות API: " + e.message, "error");
    }
    return false;
  }
}

// בדיקת ייבואים ריקים
function checkEmptyImports() {
  log("בודק ייבואים ריקים...");

  const srcDir = path.join(process.cwd(), "src");
  let foundEmptyImports = false;

  function scanDir(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true });

    for (const file of files) {
      const fullPath = path.join(dir, file.name);

      if (file.isDirectory()) {
        scanDir(fullPath);
        continue;
      }

      if (!file.name.endsWith(".ts") && !file.name.endsWith(".tsx")) {
        continue;
      }

      const content = fs.readFileSync(fullPath, "utf8");
      const emptyImportRegex = /import\s+{\s*}\s+from\s+["'].*["'];?/g;
      const matches = content.match(emptyImportRegex);

      if (matches) {
        if (!foundEmptyImports) {
          foundEmptyImports = true;
        }

        const relativePath = path.relative(process.cwd(), fullPath);
        log(`נמצאו ייבואים ריקים ב-${relativePath}:`, "warn");
        matches.forEach((match) => {
          console.log(`  ${match}`);
        });

        if (shouldFix) {
          log(`מתקן ייבואים ריקים ב-${relativePath}...`, "fix");
          const fixedContent = content.replace(emptyImportRegex, "");
          fs.writeFileSync(fullPath, fixedContent);
        }
      }
    }
  }

  try {
    scanDir(srcDir);
    if (!foundEmptyImports) {
      log("לא נמצאו ייבואים ריקים", "success");
      return true;
    } else {
      return !isStrictMode;
    }
  } catch (error) {
    log("שגיאה בבדיקת ייבואים ריקים: " + error.message, "error");
    return false;
  }
}

// בדיקת ייבואים מעגליים
function checkCircularImports() {
  log("בודק ייבואים מעגליים...");

  try {
    execSync("npx madge --circular --extensions ts,tsx src", { stdio: "pipe" });
    log("לא נמצאו ייבואים מעגליים", "success");
    return true;
  } catch (error) {
    log("נמצאו ייבואים מעגליים:", "error");

    try {
      const output = execSync("npx madge --circular --extensions ts,tsx src", {
        stdio: "pipe",
      }).toString();
      console.log(
        output
          .split("\n")
          .map((line) => `  ${line}`)
          .join("\n")
      );
    } catch (e) {
      // Ignore error, we already logged the issue
    }

    // במצב soft, להחזיר true למרות הבעיה
    if (isSoftMode) {
      return true;
    }

    return false;
  }
}

// בדיקת TypeScript
function checkTypeScript() {
  log("בודק סוגי TypeScript...");

  try {
    execSync("tsc --noEmit", { stdio: "pipe" });
    log("בדיקת TypeScript עברה בהצלחה", "success");
    return true;
  } catch (error) {
    log("נמצאו שגיאות TypeScript:", "error");

    try {
      // מסנן רק את השורות עם השגיאות
      const output = error.stdout?.toString() || "";
      const errorLines = output
        .split("\n")
        .filter((line) => line.includes("error TS"))
        .slice(0, 10); // מציג רק את 10 השגיאות הראשונות

      if (errorLines.length > 0) {
        errorLines.forEach((line) => {
          console.log(`  ${line}`);
        });

        if (errorLines.length >= 10) {
          console.log("  ... ועוד שגיאות נוספות");
        }
      }
    } catch (e) {
      // Ignore parsing errors
    }

    return false;
  }
}

// הפעלת הבדיקות
async function runChecks() {
  console.log(chalk.bold("🔍 בדיקות לפני בנייה:"));
  console.log(
    chalk.gray(
      `מצב: ${isSoftMode ? "גמיש (soft)" : isStrictMode ? "מחמיר (strict)" : "רגיל"}`
    )
  );

  const results = {
    "דירקטיבות Use Client": checkApiDirectives(),
    "ייבואים ריקים": checkEmptyImports(),
    "ייבואים מעגליים": checkCircularImports(),
    "בדיקות TypeScript": checkTypeScript(),
  };

  // סיכום
  console.log("\n" + chalk.bold("📊 סיכום בדיקות:"));

  Object.entries(results).forEach(([name, passed]) => {
    if (passed) {
      console.log(`${chalk.green("✓")} ${name}: עבר`);
    } else {
      console.log(`${chalk.red("✖")} ${name}: נכשל`);
    }
  });

  console.log("\n" + chalk.bold("📈 סטטיסטיקה:"));
  console.log(`- שגיאות: ${errorCount}`);
  console.log(`- אזהרות: ${warningCount}`);

  if (shouldFix) {
    console.log(`- תיקונים: ${fixedCount}`);
  }

  // קביעת קוד יציאה
  const allPassed = Object.values(results).every(Boolean);

  if (allPassed) {
    console.log(chalk.green.bold("\n✅ כל הבדיקות עברו בהצלחה!"));
    process.exit(0);
  } else if (isSoftMode) {
    console.log(
      chalk.yellow.bold('\n⚠️ חלק מהבדיקות נכשלו, אך ממשיך בגלל מצב "soft"')
    );
    console.log(
      chalk.yellow("הבעיות עשויות לגרום לשגיאות בנייה או פונקציונליות לקויה.")
    );
    console.log(chalk.yellow("מומלץ לתקן את הבעיות לפני המשך."));
    process.exit(0);
  } else {
    console.log(chalk.red.bold("\n❌ חלק מהבדיקות נכשלו!"));
    console.log(chalk.red("יש לתקן את הבעיות לפני המשך."));
    console.log(
      chalk.gray("ניתן להשתמש בדגל --soft כדי להתעלם משגיאות לא קריטיות.")
    );
    process.exit(1);
  }
}

// הפעלת הבדיקות
runChecks();
