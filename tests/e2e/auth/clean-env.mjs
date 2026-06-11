// One-time cleanup: strip literal trailing "\r\n" escape text from .env.local values.
import * as fs from "fs";

const file = ".env.local";
fs.copyFileSync(file, file + ".bak");
const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
let fixed = 0;
const out = lines.map((line) => {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (!m) return line;
  let v = m[2];
  // Handles both bare values and double-quoted values with the junk inside the quotes.
  const cleaned = v
    .replace(/(\\r|\\n)+\s*("?)\s*$/g, "$2")
    .trimEnd();
  if (cleaned !== v) fixed++;
  return `${m[1]}=${cleaned}`;
});
fs.writeFileSync(file, out.join("\n"));
console.log(`Cleaned ${fixed} values. Backup at ${file}.bak`);
