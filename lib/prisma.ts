import { PrismaClient } from "./generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  // ALWAYS use the direct connection string — @prisma/adapter-pg is incompatible
  // with pgbouncer transaction mode (port 6543). Never fall back to DATABASE_URL.
  const connectionString = process.env.DIRECT_URL;
  if (!connectionString) {
    throw new Error("DIRECT_URL env var is not set. Prisma requires a direct DB connection.");
  }
  console.log("[prisma] connecting via DIRECT_URL to", connectionString.replace(/:([^:@]+)@/, ":***@"));
  const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
