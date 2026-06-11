// Repairs Vercel env values polluted with trailing \r\n (real or literal text).
// Reads the pulled env file, finds corrupted vars, and re-adds clean values
// via the Vercel CLI for the given targets. Values never printed.
// Run: node tests/e2e/auth/fix-vercel-env.mjs .env.prodcheck production preview
import * as fs from "fs";
import { spawnSync } from "child_process";

const [, , file, ...targets] = process.argv;
if (!file || targets.length === 0) {
  console.error("usage: node fix-vercel-env.mjs <pulled-env-file> <target...>");
  process.exit(1);
}

const corrupted = [];
for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)="(.*)"$/) ?? line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (!m) continue;
  const [, name, raw] = m;
  // Detect trailing junk: literal backslash-r/n text or real CR/LF chars.
  if (/(\\r|\\n|\r|\n)+\s*$/.test(raw)) {
    const clean = raw.replace(/(\\r|\\n|\r|\n)+\s*$/g, "").trim();
    if (clean.length > 0) corrupted.push({ name, clean });
  }
}
console.log(`corrupted vars: ${corrupted.map((c) => c.name).join(", ") || "none"}`);

for (const { name, clean } of corrupted) {
  for (const target of targets) {
    const rm = spawnSync("npx", ["vercel", "env", "rm", name, target, "-y"], {
      shell: true, encoding: "utf8",
    });
    const rmOk = rm.status === 0 || /not found/i.test(rm.stderr + rm.stdout);
    const add = spawnSync("npx", ["vercel", "env", "add", name, target], {
      shell: true, encoding: "utf8", input: clean,
    });
    console.log(
      `${name} [${target}]: rm=${rmOk ? "ok" : "FAIL"} add=${add.status === 0 ? "ok" : "FAIL " + (add.stderr || "").slice(0, 120)}`
    );
  }
}
