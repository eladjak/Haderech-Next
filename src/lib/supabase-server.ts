import { createServerClient as createClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/supabase";

export function createServerClient(cookieStore: ReturnType<typeof cookies>) {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set(name, value, options);
          } catch (error) {
            console.error("Error setting cookie:", error);
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set(name, "", {
              ...options,
              maxAge: 0,
            });
          } catch (error) {
            console.error("Error removing cookie:", error);
          }
        },
      },
      auth: {
        detectSessionInUrl: true,
        persistSession: true,
      },
    }
  );
}
