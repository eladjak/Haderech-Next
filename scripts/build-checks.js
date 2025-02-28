#!/usr/bin/env node

/**
 * Build Checks Script
 * ------------------
 * בודק שהקוד עומד בסטנדרטים לפני בילד
 *
 * הסקריפט בודק:
 * 1. דירקטיבות "use client" - מיקום, פורמט
 * 2. ייבואים חסרים או שגויים
 * 3. התאמה בטיפוסים
 *
 * אפשרויות:
 * --soft: מצב "רך" שיאפשר בילד גם אם יש שגיאות לא קריטיות
 * --skip-type-check: דילוג על בדיקות טיפוסים
 */

// @ts-check
/* eslint-disable @typescript-eslint/no-var-requires */
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
/* eslint-enable @typescript-eslint/no-var-requires */

// קריאת ארגומנטים מהקומנד ליין
const args = process.argv.slice(2);
const SOFT_MODE = args.includes("--soft");
const SKIP_TYPE_CHECK =
  args.includes("--skip-type-check") || process.env.SKIP_TYPE_CHECK === "1";

// צבעים לפלט בטרמינל
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  bold: "\x1b[1m",
};

// הודעת פתיחה
console.log(
  `${colors.bold}${colors.blue}Running build checks for HaDerech Project${colors.reset}${SOFT_MODE ? ` ${colors.yellow}(soft mode)${colors.reset}` : ""}\n`
);

// דרך להגדיר שגיאה אבל לא להפסיק את הבילד במצב רך
function handleError(description, isCritical = false) {
  console.error(`${colors.red}✗ ${description}${colors.reset}`);
  if (!SOFT_MODE || isCritical) {
    process.exitCode = 1;
    return false;
  }
  console.warn(
    `${colors.yellow}⚠ Warning: continuing despite errors (soft mode)${colors.reset}`
  );
  return true; // מחזיר true כדי לציין שניתן להמשיך
}

// בדיקת מיקום "use client"
function checkUseClientDirectives() {
  console.log(
    `${colors.bold}Checking "use client" directives...${colors.reset}`
  );

  try {
    // מריץ את סקריפט בדיקת דירקטיבות use client
    execSync("node scripts/check-api-directives.js", { stdio: "inherit" });
    console.log(`${colors.green}✓ API routes check passed${colors.reset}`);
  } catch (error) {
    // שגיאה קריטית - use client בקבצי API הוא בעיה רצינית
    return handleError("API routes check failed", true);
  }

  // בדיקת דירקטיבות use client שגויות (בתוך סוגריים)
  const clientComponentsDir = path.join(process.cwd(), "src", "app");
  let foundParenthesized = false;

  function checkDirForParenthesizedUseClient(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        checkDirForParenthesizedUseClient(filePath);
      } else if (
        file.endsWith(".tsx") ||
        file.endsWith(".jsx") ||
        file.endsWith(".ts") ||
        file.endsWith(".js")
      ) {
        const content = fs.readFileSync(filePath, "utf8");
        if (
          content.includes('("use client")') ||
          content.includes("('use client')")
        ) {
          console.error(
            `${colors.red}✗ Found parenthesized "use client" in: ${filePath}${colors.reset}`
          );
          foundParenthesized = true;
        }
      }
    }
  }

  checkDirForParenthesizedUseClient(clientComponentsDir);

  if (!foundParenthesized) {
    console.log(
      `${colors.green}✓ No parenthesized "use client" directives found${colors.reset}`
    );
  } else {
    // שגיאה לא קריטית - סוגריים סביב use client הם בעיה אבל לא מונעים בילד
    return handleError('Found parenthesized "use client" directives', false);
  }

  return true;
}

// בדיקת אם יש ייבואים ריקים
function checkEmptyImports() {
  console.log(`\n${colors.bold}Checking for empty imports...${colors.reset}`);

  const srcDir = path.join(process.cwd(), "src");
  let foundEmptyImports = false;

  function checkDirForEmptyImports(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        checkDirForEmptyImports(filePath);
      } else if (
        file.endsWith(".tsx") ||
        file.endsWith(".jsx") ||
        file.endsWith(".ts") ||
        file.endsWith(".js")
      ) {
        const content = fs.readFileSync(filePath, "utf8");
        const lines = content.split("\n");

        for (let i = 0; i < lines.length; i++) {
          // בדיקה אם יש ייבוא ריק כמו import "@/lib/utils"
          if (
            lines[i].match(/import\s+['"][^'"]+['"]\s*;?$/) ||
            lines[i].match(/import\s+['"][^'"]+['"]\s*\/\//) ||
            (lines[i].match(/import\s+['"][^'"]+['"]\s*$/) &&
              !lines[i].includes(" from "))
          ) {
            console.error(
              `${colors.red}✗ Found empty import in ${filePath}:${i + 1}: ${lines[i].trim()}${colors.reset}`
            );
            foundEmptyImports = true;
          }
        }
      }
    }
  }

  checkDirForEmptyImports(srcDir);

  if (!foundEmptyImports) {
    console.log(`${colors.green}✓ No empty imports found${colors.reset}`);
  } else {
    // שגיאה לא קריטית - ייבואים ריקים הם לא יעילים אבל לא מונעים בילד
    return handleError("Found empty imports", false);
  }

  return true;
}

// הפעלת TypeScript לבדיקת בעיות
function typeCheck() {
  if (SKIP_TYPE_CHECK) {
    console.log(
      `\n${colors.yellow}⚠ Skipping TypeScript checks (--skip-type-check flag)${colors.reset}`
    );
    return true;
  }

  console.log(`\n${colors.bold}Running TypeScript checks...${colors.reset}`);

  try {
    execSync("npx tsc --noEmit", { stdio: "inherit" });
    console.log(`${colors.green}✓ TypeScript checks passed${colors.reset}`);
    return true;
  } catch (error) {
    // שגיאה קריטית בפונקציונליות הליבה, אבל לא קריטית בקבצי הבדיקות
    return handleError("TypeScript checks failed", false);
  }
}

// בדיקת ייבואים עגולים
function checkCircularImports() {
  console.log(
    `\n${colors.bold}Checking for circular imports...${colors.reset}`
  );

  try {
    execSync("npx madge --circular --extensions ts,tsx src", {
      stdio: "pipe",
    }).toString();
    console.log(`${colors.green}✓ No circular imports found${colors.reset}`);
    return true;
  } catch (error) {
    const output = error.stdout ? error.stdout.toString() : "";
    console.error(
      `${colors.red}✗ Circular imports found:${colors.reset}\n${output}`
    );

    // שגיאה לא קריטית - ייבואים מעגליים לרוב לא מונעים בילד
    return handleError("Circular imports found", false);
  }
}

// סיכום התוצאות
function showSummary(results) {
  console.log(
    `\n${colors.bold}${colors.blue}Build Checks Summary:${colors.reset}`
  );

  let allPassed = true;
  for (const [check, passed] of Object.entries(results)) {
    if (passed) {
      console.log(`${colors.green}✓ ${check} - Passed${colors.reset}`);
    } else {
      console.log(`${colors.red}✗ ${check} - Failed${colors.reset}`);
      allPassed = false;
    }
  }

  if (allPassed) {
    console.log(
      `\n${colors.bold}${colors.green}All checks passed! Ready to build.${colors.reset}`
    );
  } else if (SOFT_MODE && process.exitCode !== 1) {
    console.log(
      `\n${colors.bold}${colors.yellow}Some checks failed, but continuing in soft mode.${colors.reset}`
    );
    process.exitCode = 0; // וידוא שהסקריפט לא נכשל
  } else {
    console.log(
      `\n${colors.bold}${colors.red}Some checks failed. Please fix the issues before building.${colors.reset}`
    );
    process.exitCode = 1;
  }
}

// הפעלת כל הבדיקות
const results = {
  "Use Client Directives": checkUseClientDirectives(),
  "Empty Imports": checkEmptyImports(),
};

// בדיקות נוספות שתלויות בחבילות התלות (אם מותקנות)
try {
  execSync("npx madge --version", { stdio: "ignore" });
  results["Circular Imports"] = checkCircularImports();
} catch {
  console.log(
    `${colors.yellow}⚠ madge is not installed, skipping circular imports check${colors.reset}`
  );
}

// בדיקת טיפוסים (אם לא מדלגים)
if (!SKIP_TYPE_CHECK) {
  results["TypeScript Checks"] = typeCheck();
}

showSummary(results);
