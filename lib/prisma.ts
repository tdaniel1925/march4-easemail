import { PrismaClient } from "./generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  // Use the pooler URL (port 6543) — Vercel cannot reach the direct DB port 5432.
  // Strip ?pgbouncer=true since that's a Prisma ORM hint, not a pg driver parameter.
  const rawUrl = process.env.DATABASE_URL;
  if (!rawUrl) {
    throw new Error("DATABASE_URL env var is not set.");
  }
  const connectionString = rawUrl.replace(/[?&]pgbouncer=true/i, "").replace(/\?$/, "");
  console.log("[prisma] connecting via DATABASE_URL pooler to", connectionString.replace(/:([^:@]+)@/, ":***@"));
  const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
