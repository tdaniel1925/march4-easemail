// Diagnostic: try the app's own silent-token path for every connected
// Microsoft account of the e2e test user. Run: npx tsx tests/e2e/auth/check-graph-tokens.ts
import * as fs from "fs";
import * as path from "path";

for (const line of fs
  .readFileSync(path.join(process.cwd(), ".env.local"), "utf8")
  .split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (!m) continue;
  let v = m[1] === "DATABASE_CA_CERT" ? m[2] : m[2].trim();
  if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
  if (m[1] === "DATABASE_CA_CERT") v = v.replace(/\\n/g, "\n");
  else v = v.replace(/(\\r|\\n)+$/g, "").trim();
  if (!process.env[m[1]]) process.env[m[1]] = v;
}

async function main() {
  const { prisma } = await import("../../../lib/prisma");
  const { createMsalClient, acquireTokenSilent, GRAPH_SCOPES } = await import(
    "../../../lib/microsoft/msal"
  );

  const user = await prisma.user.findFirst({
    where: { email: process.env.TEST_USER_EMAIL! },
  });
  if (!user) throw new Error("test user not found");
  const accounts = await prisma.msConnectedAccount.findMany({
    where: { userId: user.id },
  });
  console.log(`user ${user.email} — ${accounts.length} MS accounts`);
  for (const acc of accounts) {
    const msal = createMsalClient(user.id);
    try {
      const token = await acquireTokenSilent(
        msal,
        acc.homeAccountId,
        user.id,
        GRAPH_SCOPES
      );
      const r = await fetch("https://graph.microsoft.com/v1.0/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(`  ${acc.msEmail}: TOKEN OK, /me -> ${r.status}`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.log(`  ${acc.msEmail}: FAILED — ${msg.slice(0, 220)}`);
    }
  }
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("FATAL:", e.message);
  process.exit(1);
});
