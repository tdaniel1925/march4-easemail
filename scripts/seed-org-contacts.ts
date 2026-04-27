/**
 * Seed org_contacts table from org_emails.csv
 *
 * Usage: pnpm exec tsx scripts/seed-org-contacts.ts
 */
import { PrismaClient } from "../lib/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

const rawUrl = process.env.DATABASE_URL;
if (!rawUrl) throw new Error("DATABASE_URL not set");
const connectionString = rawUrl.replace(/[?&]pgbouncer=true/i, "").replace(/\?$/, "");

const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Find or create the default org
  let org = await prisma.organization.findFirst({ where: { slug: "default" } });
  if (!org) {
    org = await prisma.organization.create({
      data: { name: "D. Miller Law Firm", slug: "default" },
    });
    console.log("Created org:", org.id);
  }
  console.log("Org:", org.id, org.name);

  // Read CSV
  const csvPath = path.join(__dirname, "..", "org_emails.csv");
  const raw = fs.readFileSync(csvPath, "utf-8");
  const lines = raw.trim().split("\n").slice(1); // skip header

  let created = 0;
  let skipped = 0;

  for (const line of lines) {
    const match = line.match(/"([^"]*)","([^"]*)","([^"]*)"/);
    if (!match) { skipped++; continue; }

    const [, firstName, lastName, email] = match;
    if (!email?.trim()) { skipped++; continue; }

    try {
      await prisma.orgContact.upsert({
        where: { orgId_email: { orgId: org.id, email: email.trim().toLowerCase() } },
        update: { firstName: firstName.trim(), lastName: lastName.trim() },
        create: {
          orgId: org.id,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim().toLowerCase(),
        },
      });
      created++;
    } catch (err) {
      console.error(`Failed for ${email}:`, err);
      skipped++;
    }
  }

  console.log(`Done: ${created} contacts imported, ${skipped} skipped`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
