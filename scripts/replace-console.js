#!/usr/bin/env node

/**
 * Script to replace console.* statements with logger calls
 *
 * Usage: node scripts/replace-console.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const srcDir = path.join(__dirname, '..', 'src');
const loggerImport = `import { logger } from "@/lib/utils/logger";`;

// Files to exclude
const excludePatterns = [
  /\.test\./,
  /\.spec\./,
  /setup\.ts$/,
  /vitest-setup\.ts$/,
  /test-setup\.ts$/,
  /\.broken/,
  /node_modules/,
];

function shouldProcessFile(filePath) {
  return !excludePatterns.some(pattern => pattern.test(filePath));
}

function addLoggerImport(content) {
  // Check if logger import already exists
  if (content.includes('from "@/lib/utils/logger"')) {
    return content;
  }

  // Find the last import statement
  const lines = content.split('\n');
  let lastImportIndex = -1;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith('import ') || lines[i].trim().startsWith('import{')) {
      lastImportIndex = i;
    }
    // Stop at first non-import, non-comment, non-empty line
    if (lines[i].trim() &&
        !lines[i].trim().startsWith('import') &&
        !lines[i].trim().startsWith('//') &&
        !lines[i].trim().startsWith('/*') &&
        !lines[i].trim().startsWith('*') &&
        !lines[i].trim().startsWith('"use') &&
        !lines[i].trim().startsWith("'use")) {
      break;
    }
  }

  if (lastImportIndex >= 0) {
    lines.splice(lastImportIndex + 1, 0, loggerImport);
    return lines.join('\n');
  }

  // If no imports found, add after 'use client' directive
  const useClientIndex = lines.findIndex(line =>
    line.includes('"use client"') || line.includes("'use client'")
  );

  if (useClientIndex >= 0) {
    lines.splice(useClientIndex + 2, 0, loggerImport);
    return lines.join('\n');
  }

  // Otherwise, add at the top
  return loggerImport + '\n\n' + content;
}

function replaceConsoleCalls(content) {
  // Replace console.error with logger.error
  content = content.replace(
    /console\.error\(['"]([^'"]+)['"],\s*([^)]+)\);?/g,
    'logger.error("$1", $2);'
  );

  content = content.replace(
    /console\.error\(['"]([^'"]+)['"]\);?/g,
    'logger.error("$1");'
  );

  // Replace console.warn with logger.warn
  content = content.replace(
    /console\.warn\(['"]([^'"]+)['"],\s*([^)]+)\);?/g,
    'logger.warn("$1", $2);'
  );

  content = content.replace(
    /console\.warn\(['"]([^'"]+)['"]\);?/g,
    'logger.warn("$1");'
  );

  // Replace console.log with logger.debug (except in comments/examples)
  content = content.replace(
    /^(\s*)console\.log\(['"]([^'"]+)['"],\s*([^)]+)\);?/gm,
    '$1logger.debug("$2", $3);'
  );

  content = content.replace(
    /^(\s*)console\.log\(['"]([^'"]+)['"]\);?/gm,
    '$1logger.debug("$2");'
  );

  // Replace console.info with logger.info
  content = content.replace(
    /console\.info\(['"]([^'"]+)['"],\s*([^)]+)\);?/g,
    'logger.info("$1", $2);'
  );

  content = content.replace(
    /console\.info\(['"]([^'"]+)['"]\);?/g,
    'logger.info("$1");'
  );

  return content;
}

function processFile(filePath) {
  if (!shouldProcessFile(filePath)) {
    return false;
  }

  const content = fs.readFileSync(filePath, 'utf8');

  // Check if file has console statements (excluding mocked ones)
  const hasConsole = /console\.(log|error|warn|info|debug)\(/.test(content) &&
                     !/console\.(error|warn|log) = vi\.fn\(\)/.test(content);

  if (!hasConsole) {
    return false;
  }

  let newContent = content;

  // Add logger import if needed
  newContent = addLoggerImport(newContent);

  // Replace console calls
  newContent = replaceConsoleCalls(newContent);

  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    return true;
  }

  return false;
}

function walkDir(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next' && file !== 'dist') {
        walkDir(filePath, fileList);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

// Main execution
console.log('Starting console statement replacement...\n');

const files = walkDir(srcDir);
let processedCount = 0;

files.forEach(file => {
  if (processFile(file)) {
    processedCount++;
    console.log(`✓ Processed: ${path.relative(srcDir, file)}`);
  }
});

console.log(`\n✅ Complete! Processed ${processedCount} files.`);
console.log('\nPlease review the changes and run:\n  npm run lint --fix');
