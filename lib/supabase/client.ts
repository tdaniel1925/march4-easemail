import { createBrowserClient } from "@supabase/ssr";

/**
 * Strips accidental literal escape sequences (\r\n, \n, \r) that can appear
 * when env vars are set with trailing newlines or embedded escape sequences.
 */
function cleanEnvVar(value: string | undefined): string {
  if (!value) return "";
  return value.replace(/\\r\\n/g, "").replace(/\\n/g, "").replace(/\\r/g, "").trim();
}

export function createClient() {
  return createBrowserClient(
    cleanEnvVar(process.env.NEXT_PUBLIC_SUPABASE_URL),
    cleanEnvVar(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  );
}
