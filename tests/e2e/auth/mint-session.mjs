// Mints a fresh Playwright session for the e2e test user without an
// interactive login: admin magic link -> verifyOtp -> @supabase/ssr cookie.
// Run with: node tests/e2e/auth/mint-session.mjs
import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { loadEnvLocal } from "./env-util.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../../..");

const env = loadEnvLocal(path.join(root, ".env.local"));

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const email = env.TEST_USER_EMAIL;
if (!url || !serviceKey || !anonKey || !email) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / NEXT_PUBLIC_SUPABASE_ANON_KEY / TEST_USER_EMAIL");
  process.exit(1);
}

const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({ type: "magiclink", email });
if (linkErr) {
  console.error("generateLink failed:", linkErr.message);
  process.exit(1);
}

const anon = createClient(url, anonKey, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
});
const { data: verifyData, error: verifyErr } = await anon.auth.verifyOtp({
  type: "magiclink",
  token_hash: linkData.properties.hashed_token,
});
if (verifyErr || !verifyData.session) {
  console.error("verifyOtp failed:", verifyErr?.message ?? "no session");
  process.exit(1);
}

const projectRef = new URL(url).hostname.split(".")[0];
const cookieValue = "base64-" + Buffer.from(JSON.stringify(verifyData.session)).toString("base64url");
const storageState = {
  cookies: [
    {
      name: `sb-${projectRef}-auth-token`,
      value: cookieValue,
      domain: "localhost",
      path: "/",
      expires: Math.floor(Date.now() / 1000) + 30 * 24 * 3600,
      httpOnly: false,
      secure: false,
      sameSite: "Lax",
    },
  ],
  origins: [],
};

const out = path.join(__dirname, "session.json");
fs.writeFileSync(out, JSON.stringify(storageState, null, 2));
console.log(`Session minted for ${email} -> ${out}`);
