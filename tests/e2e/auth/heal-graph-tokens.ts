// Attempts to heal the MSAL token cache: redeems the stored raw refresh
// tokens via acquireTokenByRefreshToken (MSAL rewrites clean cache entries),
// then persists the refreshed cache. Run: npx tsx tests/e2e/auth/heal-graph-tokens.ts
import * as fs from "fs";
import * as path from "path";

for (const line of fs
  .readFileSync(path.join(process.cwd(), ".env.local"), "utf8")
  .split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (!m) continue;
  let v = m[2].trim();
  if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
  if (m[1] === "DATABASE_CA_CERT") v = v.replace(/\\n/g, "\n");
  else v = v.replace(/(\\r|\\n)+$/g, "").trim();
  if (!process.env[m[1]]) process.env[m[1]] = v;
}

async function main() {
  const { prisma } = await import("../../../lib/prisma");
  const { createMsalClient, GRAPH_SCOPES } = await import(
    "../../../lib/microsoft/msal"
  );

  const user = await prisma.user.findFirst({
    where: { email: process.env.TEST_USER_EMAIL! },
  });
  if (!user) throw new Error("test user not found");

  const row = await prisma.msalTokenCache.findUnique({
    where: { userId: user.id },
  });
  if (!row) throw new Error("no msal cache row");
  const cache = JSON.parse(row.cacheJson);
  const rtEntries = Object.entries(
    cache.RefreshToken as Record<string, { secret: string; home_account_id: string }>
  );
  console.log(`found ${rtEntries.length} stored refresh tokens`);

  const msal = createMsalClient(user.id);
  // Pre-load existing cache so healed entries merge with accounts/metadata.
  msal.getTokenCache().deserialize(row.cacheJson);

  let healed = 0;
  for (const [key, rt] of rtEntries) {
    const homeId = rt.home_account_id ?? key.split("-login.")[0];
    try {
      const result = await msal.acquireTokenByRefreshToken({
        refreshToken: rt.secret,
        scopes: GRAPH_SCOPES,
        forceCache: true,
      });
      if (!result?.accessToken) throw new Error("no access token returned");
      const me = await fetch("https://graph.microsoft.com/v1.0/me", {
        headers: { Authorization: `Bearer ${result.accessToken}` },
      });
      const body = (await me.json()) as { userPrincipalName?: string };
      console.log(
        `  ${homeId.slice(0, 8)}…: REDEEMED OK — /me ${me.status} (${body.userPrincipalName ?? "?"})`
      );
      healed++;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.log(`  ${homeId.slice(0, 8)}…: FAILED — ${msg.slice(0, 200)}`);
    }
  }

  if (healed > 0) {
    const serialized = msal.getTokenCache().serialize();
    await prisma.msalTokenCache.upsert({
      where: { userId: user.id },
      update: { cacheJson: serialized },
      create: { userId: user.id, cacheJson: serialized },
    });
    console.log(`persisted healed cache (${healed} account(s))`);
  }
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("FATAL:", e.message);
  process.exit(1);
});
