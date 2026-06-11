import * as fs from "fs";

export function loadEnvLocal(file = ".env.local") {
  const env = {};
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    let v = m[2].trim();
    if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
    // Strip literal backslash-r / backslash-n escape text some values carry.
    v = v.replace(/(\\r|\\n)+$/g, "").trim();
    env[m[1]] = v;
  }
  return env;
}

if (process.argv[2] === "check") {
  const env = loadEnvLocal();
  const k = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  console.log("anon len:", k.length, "tail codes:", [...k.slice(-2)].map((c) => c.charCodeAt(0)));
  const r = await fetch(env.NEXT_PUBLIC_SUPABASE_URL + "/auth/v1/health", { headers: { apikey: k } });
  console.log("health ->", r.status, (await r.text()).slice(0, 60));
}
