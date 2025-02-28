/**
 * Script to check for unnecessary "use client" directives in API route files
 * Run with: node scripts/check-api-directives.js
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Path to API files
const API_DIR = path.join(process.cwd(), "src", "app", "api");

// Function to check if a file contains "use client" directive
function checkForUseClient(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    // Check for different variations of the "use client" directive
    return (
      content.includes('"use client"') ||
      content.includes("'use client'") ||
      content.includes('("use client")') ||
      content.includes("('use client')")
    );
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return false;
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

// Function to check a list of files for "use client" directive
function checkFilesForUseClient(files) {
  let foundUseClient = false;

  files.forEach((file) => {
    const hasUseClient = checkForUseClient(file);
    if (hasUseClient) {
      console.log(`❌ Found "use client" directive in API file: ${file}`);
      foundUseClient = true;
    }
  });

  if (!foundUseClient) {
    console.log('✅ No "use client" directives found in API route files');
  } else {
    console.log(
      '\n⚠️ API route files should not contain "use client" directives'
    );
    console.log(
      "Please remove these directives as they are unnecessary in server components"
    );
  }

  return foundUseClient;
}

// Main function
function main() {
  console.log('Checking for "use client" directives in API route files...');

  try {
    // Find all route files in the API directory
    const routeFiles = findRouteFiles(API_DIR);
    console.log(`Found ${routeFiles.length} API route files to check`);

    // Check files for "use client" directive
    const hasUseClient = checkFilesForUseClient(routeFiles);

    // Exit with appropriate code
    if (hasUseClient) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (error) {
    console.error("Error checking files:", error);
    process.exit(1);
  }
}

// Run the script
main();
