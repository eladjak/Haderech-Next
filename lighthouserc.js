module.exports = {
  ci: {
    collect: {
      url: ["http://localhost:3000"],
      startServerCommand: "pnpm run start",
      numberOfRuns: 3,
    },
    assert: {
      preset: "lighthouse:recommended",
      assertions: {
        "categories:performance": ["error", { minScore: 0.8 }],
        "categories:accessibility": ["error", { minScore: 0.9 }],
        "categories:best-practices": ["error", { minScore: 0.9 }],
        "categories:seo": ["error", { minScore: 0.9 }],

        // בדיקות ביצועים ספציפיות
        "first-contentful-paint": ["error", { maxNumericValue: 2000 }],
        "largest-contentful-paint": ["error", { maxNumericValue: 2500 }],
        "first-meaningful-paint": ["error", { maxNumericValue: 2000 }],
        "speed-index": ["error", { maxNumericValue: 3000 }],
        "total-blocking-time": ["error", { maxNumericValue: 300 }],
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.1 }],

        // בדיקות נגישות ספציפיות
        "aria-allowed-attr": "error",
        "aria-required-attr": "error",
        "aria-required-children": "error",
        "aria-required-parent": "error",
        "aria-roles": "error",
        "aria-valid-attr-value": "error",
        "aria-valid-attr": "error",
        "button-name": "error",
        "document-title": "error",
        "html-has-lang": "error",
        "image-alt": "error",
        "link-name": "error",
        list: "error",
        listitem: "error",
        "meta-viewport": "error",

        // בדיקות SEO ספציפיות
        "meta-description": "error",
        "document-title": "error",
        "font-size": "error",
        "link-text": "error",
        "robots-txt": "error",
        "tap-targets": "error",
        viewport: "error",

        // בדיקות PWA
        "installable-manifest": "error",
        "service-worker": "error",
        "splash-screen": "error",
        "themed-omnibox": "error",
        "content-width": "error",
        viewport: "error",
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
    server: {
      port: 3000,
      buildDir: ".next",
    },
  },
};
