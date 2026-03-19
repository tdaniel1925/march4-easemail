import "@testing-library/jest-dom";
import { expect, afterEach, vi} from "vitest";
import { cleanup } from "@testing-library/react";

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock environment variables for tests
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";
process.env.MICROSOFT_CLIENT_ID = "test-client-id";
process.env.MICROSOFT_CLIENT_SECRET = "test-client-secret";
process.env.MICROSOFT_TENANT_ID = "test-tenant-id";
process.env.ANTHROPIC_API_KEY = "test-anthropic-key";
