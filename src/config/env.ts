import { config } from "@/lib/config";

/**
 * Environment variables configuration
 * This file is being replaced by the centralized config in /src/lib/config.ts
 * It remains for backward compatibility with existing code
 */

// Re-export environment variables for backward compatibility
export const OPENAI_API_KEY = config.openaiApiKey;
export const SUPABASE_URL = config.supabaseUrl;
export const SUPABASE_ANON_KEY = config.supabaseAnonKey;

// Any access to these variables will now use values from the centralized config
// which includes default values and validation
