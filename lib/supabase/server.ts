import { cache } from "react";
import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

/**
 * Strips accidental literal escape sequences (\r\n, \n, \r) and surrounding
 * whitespace from env var values. These can appear when env vars are copy-pasted
 * with trailing newlines or when a .env file has CRLF-encoded escape sequences
 * embedded inside quoted strings.
 */
function cleanEnvVar(value: string | undefined): string {
  if (!value) return "";
  // Remove literal backslash-r-backslash-n, backslash-n, backslash-r sequences
  // then trim whitespace/control chars from both ends
  return value
    .replace(/\\r\\n/g, "")
    .replace(/\\n/g, "")
    .replace(/\\r/g, "")
    .trim();
}

const SUPABASE_URL = cleanEnvVar(process.env.NEXT_PUBLIC_SUPABASE_URL);
const SUPABASE_ANON_KEY = cleanEnvVar(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const SUPABASE_SERVICE_ROLE_KEY = cleanEnvVar(process.env.SUPABASE_SERVICE_ROLE_KEY);

export const createClient = cache(async () => {
  const cookieStore = await cookies();

  return createServerClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server Component — cookies can't be set
          }
        },
      },
    }
  );
});

export function createServiceClient() {
  // Service role client must NOT use cookies — authenticates via key only.
  return createSupabaseClient(
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
