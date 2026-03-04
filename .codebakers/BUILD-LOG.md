# Build Log

## 2026-03-04
- [Session Start] Git initialized. CodeBakers memory system initialized.
- [Setup] refs/ and .codebakers/ created.
- [Review] Full codebase deep review completed. TypeScript: CLEAN.
- [Fix] Login page: ErrorMessage component now reads ?error= param and displays inline banner.
- [Fix] lib/prisma.ts: removed fallback to DATABASE_URL (pgbouncer pooler). Now exclusively uses DIRECT_URL. Root cause: Supabase Supavisor rejects @prisma/adapter-pg connections on port 6543 with "Tenant or user not found". Direct connection (port 5432) works correctly.
- [Fix] auth callback: added granular error logging with name/message/cause/stack.
- [Done] Login flow fully working end-to-end. GET /inbox 200.
