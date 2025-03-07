/**
 * Script to fix import order issues across the codebase
 * Run with: node scripts/fix-import-order.js
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Configuration
const SRC_DIR = path.join(__dirname, "..", "src");
const EXTENSIONS = [".ts", ".tsx", ".js", ".jsx"];
const IGNORE_PATTERNS = ["node_modules", "dist", ".next", "public"];

/**
 * Get all files recursively from a directory with specific extensions
 */
function getFiles(dir, extensions, filelist = [], ignorePatterns = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);

    // Skip ignored patterns
    if (ignorePatterns.some((pattern) => filePath.includes(pattern))) {
      return;
    }

    if (fs.statSync(filePath).isDirectory()) {
      filelist = getFiles(filePath, extensions, filelist, ignorePatterns);
    } else {
      const ext = path.extname(file);
      if (extensions.includes(ext)) {
        filelist.push(filePath);
      }
    }
  });

  return filelist;
}

/**
 * Fix import order in a file
 */
function fixImportOrder(filePath) {
  try {
    console.log(`Fixing import order in: ${filePath}`);
    execSync(`npx eslint --fix "${filePath}" --rule "import/order: error"`, {
      stdio: "ignore",
    });
    return true;
  } catch (error) {
    console.error(`Error fixing import order in ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Main function to fix import order across the codebase
 */
function main() {
  console.log("🔍 Finding files with potential import order issues...");

  const files = getFiles(SRC_DIR, EXTENSIONS, [], IGNORE_PATTERNS);
  console.log(`Found ${files.length} files to process.`);

  let successCount = 0;
  let failCount = 0;

  files.forEach((file) => {
    const success = fixImportOrder(file);
    success ? successCount++ : failCount++;
  });

  console.log("\n✅ Import order fix completed:");
  console.log(`Successfully processed: ${successCount} files`);

  if (failCount > 0) {
    console.log(`Failed to process: ${failCount} files`);
  }
}

// Run the script
main();
