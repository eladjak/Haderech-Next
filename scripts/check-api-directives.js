/**
 * Script to check for unnecessary "use client" directives in API route files
 * and incorrect placement of "use client" directives in component files
 *
 * Run with: node scripts/check-api-directives.js [--fix] [--check-components]
 *
 * Options:
 *   --fix                Attempt to fix issues automatically
 *   --check-components   Also check client component files for directive issues
 */

const { execSync } = require("child_process");
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
const FIX_ISSUES = args.includes("--fix");
const CHECK_COMPONENTS = args.includes("--check-components");

// Path to API files
const API_DIR = path.join(process.cwd(), "src", "app", "api");
const APP_DIR = path.join(process.cwd(), "src", "app");

// Function to check the placement of "use client" directive
function checkUseClientPlacement(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    const lines = content.split("\n");

    // Check for different variations of the "use client" directive
    const hasUseClient =
      content.includes('"use client"') || content.includes("'use client'");

    const hasParenthesizedUseClient =
      content.includes('("use client")') || content.includes("('use client')");

    let firstNonEmptyLineIndex = lines.findIndex(
      (line) =>
        line.trim() !== "" &&
        !line.trim().startsWith("//") &&
        !line.trim().startsWith("/*")
    );

    // If no non-empty lines, there's nothing to check
    if (firstNonEmptyLineIndex === -1) {
      return { hasIssue: false };
    }

    const firstNonEmptyLine = lines[firstNonEmptyLineIndex].trim();

    // Check if the first non-empty line is "use client"
    const isUseClientFirst =
      firstNonEmptyLine === '"use client"' ||
      firstNonEmptyLine === "'use client'";

    let issue = null;
    let fixedContent = null;

    // API files should not have "use client" directive
    if (
      filePath.includes("/api/") &&
      (hasUseClient || hasParenthesizedUseClient)
    ) {
      issue = 'API route file with "use client" directive';

      if (FIX_ISSUES) {
        // Remove the "use client" directive
        fixedContent = content
          .replace(/(['"]use client['"])\s*;?\r?\n/g, "")
          .replace(/\((['"]use client['"])\)\s*;?\r?\n/g, "");
      }
    }
    // Component files with parenthesized "use client"
    else if (hasParenthesizedUseClient) {
      issue = 'Parenthesized "use client" directive';

      if (FIX_ISSUES) {
        // Replace parenthesized "use client" with correct directive
        fixedContent = content.replace(/\((['"]use client['"])\)\s*;?/g, "$1");
      }
    }
    // Component files where "use client" is not the first line
    else if (hasUseClient && !isUseClientFirst && CHECK_COMPONENTS) {
      issue = '"use client" is not the first non-comment line';

      if (FIX_ISSUES) {
        // Remove the existing "use client" directive
        let tempContent = content.replace(
          /(['"]use client['"])\s*;?\r?\n/g,
          ""
        );

        // Add it at the beginning of the file
        fixedContent = '"use client";\n\n' + tempContent;
      }
    }

    return {
      hasIssue: !!issue,
      issue,
      fixedContent,
    };
  } catch (error) {
    console.error(
      `${colors.red}Error reading file ${filePath}:${colors.reset}`,
      error
    );
    return { hasIssue: false };
  }
}

// Function to recursively search for route files
function findRouteFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      findRouteFiles(filePath, fileList);
    } else if (
      (file === "route.ts" ||
        file === "route.js" ||
        file.includes("route.tsx") ||
        file.includes("route.jsx")) &&
      !filePath.includes("node_modules")
    ) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

// Function to recursively search for component files
function findComponentFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory() && !filePath.includes("/api/")) {
      findComponentFiles(filePath, fileList);
    } else if (
      (file.endsWith(".tsx") ||
        file.endsWith(".jsx") ||
        file.endsWith(".js") ||
        file.endsWith(".ts")) &&
      !file.includes("route.") &&
      !filePath.includes("node_modules") &&
      !filePath.includes("/api/")
    ) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

// Function to check files for "use client" directive issues
function checkFiles(files) {
  let foundIssues = false;
  let fixedFiles = 0;

  console.log(`${colors.blue}Checking ${files.length} files...${colors.reset}`);

  files.forEach((file) => {
    const { hasIssue, issue, fixedContent } = checkUseClientPlacement(file);

    if (hasIssue) {
      console.log(`${colors.red}❌ Found ${issue} in: ${colors.reset}${file}`);
      foundIssues = true;

      if (FIX_ISSUES && fixedContent) {
        // Write the fixed content back to the file
        fs.writeFileSync(file, fixedContent, "utf8");
        console.log(`${colors.green}  ✓ Fixed issue in file${colors.reset}`);
        fixedFiles++;
      }
    }
  });

  if (!foundIssues) {
    console.log(
      `${colors.green}✅ No "use client" directive issues found${colors.reset}`
    );
  } else {
    console.log(
      `\n${colors.yellow}⚠️ Found ${colors.reset}${files.length - fixedFiles}${colors.yellow} files with directive issues${colors.reset}`
    );

    if (FIX_ISSUES) {
      console.log(
        `${colors.green}✓ Fixed ${colors.reset}${fixedFiles}${colors.green} files automatically${colors.reset}`
      );
    } else {
      console.log(
        `${colors.blue}ℹ️ Run with --fix flag to attempt automatic fixes${colors.reset}`
      );
    }
  }

  return foundIssues;
}

// Main function
function main() {
  console.log(
    `${colors.bold}${colors.blue}Checking for "use client" directive issues...${colors.reset}`
  );

  if (FIX_ISSUES) {
    console.log(
      `${colors.yellow}Running in FIX mode - issues will be automatically fixed${colors.reset}`
    );
  }

  if (CHECK_COMPONENTS) {
    console.log(
      `${colors.yellow}Checking both API routes and client components${colors.reset}`
    );
  }

  try {
    // Find all route files in the API directory
    const routeFiles = findRouteFiles(API_DIR);
    console.log(
      `${colors.blue}Found ${routeFiles.length} API route files to check${colors.reset}`
    );

    // Check API route files for "use client" directive
    const apiHasIssues = checkFiles(routeFiles);

    let componentHasIssues = false;

    // Check component files if requested
    if (CHECK_COMPONENTS) {
      console.log(
        `\n${colors.bold}${colors.blue}Checking client component files...${colors.reset}`
      );
      const componentFiles = findComponentFiles(APP_DIR);
      console.log(
        `${colors.blue}Found ${componentFiles.length} component files to check${colors.reset}`
      );

      componentHasIssues = checkFiles(componentFiles);
    }

    // Exit with appropriate code
    if ((apiHasIssues || componentHasIssues) && !FIX_ISSUES) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (error) {
    console.error(`${colors.red}Error checking files:${colors.reset}`, error);
    process.exit(1);
  }
}

// Run the script
main();
