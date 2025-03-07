"use client";

export {};

/**
 * Configuration file that centralizes all environment variables
 * Provides default values for build and development environments
 */

// Helper function to get environment variables with default values
const getEnv = (key: string, defaultValue = ""): string => {
  // During build time, use default values for missing environment variables
  const isBuildTime =
    process.env.NODE_ENV === "production" && typeof window === "undefined";

  if (isBuildTime && !process.env[key]) {
    // Log a warning during build time if an environment variable is missing
    console.warn(
      `Missing environment variable ${key}, using default value for build time.`
    );
    return defaultValue;
  }

  return process.env[key] || defaultValue;
};

// Configuration object with all environment variables
export const config = {
  // Authentication and authorization
  nextAuthUrl: getEnv("NEXTAUTH_URL", "http://localhost:3000"),
  nextAuthSecret: getEnv(
    "NEXTAUTH_SECRET",
    "your-development-secret-DO-NOT-USE-IN-PROD"
  ),
  googleClientId: getEnv("GOOGLE_CLIENT_ID", "mock-google-client-id"),
  googleClientSecret: getEnv(
    "GOOGLE_CLIENT_SECRET",
    "mock-google-client-secret"
  ),

  // Supabase
  supabaseUrl: getEnv(
    "NEXT_PUBLIC_SUPABASE_URL",
    "https://your-project.supabase.co"
  ),
  supabaseAnonKey: getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "your-anon-key"),
  supabaseServiceRoleKey: getEnv(
    "SUPABASE_SERVICE_ROLE_KEY",
    "your-service-role-key"
  ),

  // OpenAI
  openaiApiKey: getEnv("OPENAI_API_KEY", "sk-mock-openai-key"),

  // Email server
  emailServer: {
    host: getEnv("EMAIL_SERVER_HOST", "smtp.example.com"),
    port: parseInt(getEnv("EMAIL_SERVER_PORT", "587")),
    auth: {
      user: getEnv("EMAIL_SERVER_USER", "user@example.com"),
      pass: getEnv("EMAIL_SERVER_PASSWORD", "password"),
    },
  },

  // Additional settings
  nodeEnv: process.env.NODE_ENV || "development",
  isProduction: process.env.NODE_ENV === "production",
  isDevelopment: process.env.NODE_ENV === "development",
  isTest: process.env.NODE_ENV === "test",

  // Application settings
  appName: "HaDerech",
  appVersion: process.env.npm_package_version || "0.1.0",
  appUrl: getEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000"),

  // Feature flags
  features: {
    enableSimulator: getEnv("ENABLE_SIMULATOR", "true") === "true",
    enableForum: getEnv("ENABLE_FORUM", "true") === "true",
    enableAnalytics: getEnv("ENABLE_ANALYTICS", "false") === "true",
  },
};

// Default export
export default config;
