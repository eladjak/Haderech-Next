/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    ...(process.env.NODE_ENV === "production"
      ? {
          "@fullhuman/postcss-purgecss": {
            content: [
              "./src/**/*.{js,jsx,ts,tsx}",
              "./src/app/**/*.{js,jsx,ts,tsx}",
              "./src/components/**/*.{js,jsx,ts,tsx}",
            ],
            defaultExtractor: (content) =>
              content.match(/[\w-/:]+(?<!:)/g) || [],
            safelist: {
              standard: ["html", "body"],
              deep: [/^dark/, /^light/, /^theme-/],
              greedy: [/^data-/, /^aria-/],
            },
          },
        }
      : {}),
  },
};

export default config;
