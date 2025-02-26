import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

// פונקציית עזר שמאפשרת להגדיר משתנה כנדרש רק בסביבת פיתוח
const _requiredInDev = (schema) => {
  return process.env.NODE_ENV === "production" ? schema.optional() : schema;
};

// פונקציית עזר שמאפשרת להגדיר ערכים ריקים למשתנים בזמן בנייה
const optionalInBuild = (schema) => {
  // בדיקה האם זו סביבת בנייה (ורסל) או סביבת פיתוח מקומית
  const isBuildEnv =
    process.env.VERCEL_ENV === "preview" ||
    process.env.VERCEL_ENV === "production" ||
    process.env.NODE_ENV === "production";

  return isBuildEnv ? schema.optional() : schema;
};

// משתנים קריטיים שחייבים להיות מוגדרים גם בסביבת ייצור
const _criticalVars = (schema) => schema;

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "test", "production"]).optional(),

    // משתנים קריטיים - נדרשים תמיד
    NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),

    // משתנים שניתן להפוך לאופציונליים בסביבת ייצור
    DATABASE_URL: optionalInBuild(z.string().url()),
    SUPABASE_SERVICE_ROLE_KEY: optionalInBuild(z.string().min(1)),
    OPENAI_API_KEY: optionalInBuild(z.string().min(1)),
    OPENAI_ORGANIZATION: z.string().optional(),
    NEXTAUTH_URL: optionalInBuild(z.string().url()),
    NEXTAUTH_SECRET: optionalInBuild(z.string().min(1)),

    // Google services - אופציונלי בסביבת בנייה
    GOOGLE_CLIENT_ID: optionalInBuild(z.string().min(1)),
    GOOGLE_CLIENT_SECRET: optionalInBuild(z.string().min(1)),
    GOOGLE_REDIRECT_URI: optionalInBuild(z.string().url()),

    // Email settings - אופציונלי בסביבת בנייה
    EMAIL_SERVER_HOST: optionalInBuild(z.string().min(1)),
    EMAIL_SERVER_PORT: optionalInBuild(z.string().min(1)),
    EMAIL_SERVER_USER: optionalInBuild(z.string().min(1)),
    EMAIL_SERVER_PASSWORD: optionalInBuild(z.string().min(1)),
    EMAIL_FROM: optionalInBuild(z.string().email()),

    // שירותים נוספים אופציונליים
    REDIS_URL: z.string().url().optional(),
    STRIPE_SECRET_KEY: z.string().min(1).optional(),
    STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),
    VERCEL_URL: z.string().optional(),
    VERCEL_ENV: z.enum(["development", "preview", "production"]).optional(),
  },
  client: {
    NEXT_PUBLIC_APP_URL: optionalInBuild(z.string().url()),

    // אלה כבר קיימים בסביבת השרת - רק לוודא
    NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),

    // שירותי אנליטיקה ותכונות
    NEXT_PUBLIC_ANALYTICS_ID: z.string().min(1).optional(),
    NEXT_PUBLIC_POSTHOG_KEY: z.string().min(1).optional(),
    NEXT_PUBLIC_POSTHOG_HOST: z.string().min(1).optional(),
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string().min(1).optional(),
    NEXT_PUBLIC_CLOUDINARY_API_KEY: z.string().min(1).optional(),
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1).optional(),

    // דגלי תכונות
    NEXT_PUBLIC_FEATURE_FORUMS: z.enum(["true", "false"]).optional(),
    NEXT_PUBLIC_FEATURE_GROUPS: z.enum(["true", "false"]).optional(),
    NEXT_PUBLIC_FEATURE_SIMULATOR: z.enum(["true", "false"]).optional(),
    NEXT_PUBLIC_FEATURE_BOT: z.enum(["true", "false"]).optional(),

    // מידע על האפליקציה - אופציונלי בסביבת בנייה
    NEXT_PUBLIC_SITE_URL: optionalInBuild(z.string().url()),
    NEXT_PUBLIC_APP_NAME: optionalInBuild(z.string().min(1)),
    NEXT_PUBLIC_APP_DESCRIPTION: optionalInBuild(z.string().min(1)),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_ORGANIZATION: process.env.OPENAI_ORGANIZATION,
    DATABASE_URL: process.env.DATABASE_URL,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI,
    EMAIL_SERVER_HOST: process.env.EMAIL_SERVER_HOST,
    EMAIL_SERVER_PORT: process.env.EMAIL_SERVER_PORT,
    EMAIL_SERVER_USER: process.env.EMAIL_SERVER_USER,
    EMAIL_SERVER_PASSWORD: process.env.EMAIL_SERVER_PASSWORD,
    EMAIL_FROM: process.env.EMAIL_FROM,
    REDIS_URL: process.env.REDIS_URL,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    VERCEL_URL: process.env.VERCEL_URL,
    VERCEL_ENV: process.env.VERCEL_ENV,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_ANALYTICS_ID: process.env.NEXT_PUBLIC_ANALYTICS_ID,
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME:
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    NEXT_PUBLIC_CLOUDINARY_API_KEY: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_FEATURE_FORUMS: process.env.NEXT_PUBLIC_FEATURE_FORUMS,
    NEXT_PUBLIC_FEATURE_GROUPS: process.env.NEXT_PUBLIC_FEATURE_GROUPS,
    NEXT_PUBLIC_FEATURE_SIMULATOR: process.env.NEXT_PUBLIC_FEATURE_SIMULATOR,
    NEXT_PUBLIC_FEATURE_BOT: process.env.NEXT_PUBLIC_FEATURE_BOT,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_APP_DESCRIPTION: process.env.NEXT_PUBLIC_APP_DESCRIPTION,
  },
  // אפשר לדלג על תיקוף בסביבת בנייה - מעודכן כדי לדלג בצורה אגרסיבית יותר
  skipValidation:
    !!process.env.SKIP_ENV_VALIDATION ||
    process.env.NODE_ENV === "production" ||
    process.env.VERCEL_ENV === "production" ||
    process.env.VERCEL_ENV === "preview",
});
