const path = require("path");

const buildEslintCommand = (filenames) =>
  `next lint --fix --file ${filenames
    .map((f) => path.relative(process.cwd(), f))
    .join(" --file ")}`;

module.exports = {
  "*.{js,jsx,ts,tsx}": [
    buildEslintCommand,
    "prettier --write",
    "vitest related --run",
    () => "tsc --noEmit",
  ],
  "*.{json,css,scss,md}": ["prettier --write"],
  "*.{test,spec}.{js,jsx,ts,tsx}": ["vitest related --run"],
};
