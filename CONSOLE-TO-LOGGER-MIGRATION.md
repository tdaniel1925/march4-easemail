# Console to Logger Migration Guide

## Status: IN PROGRESS (11/87 complete)

This document tracks the replacement of all `console.log/error/warn` calls with structured `pino` logger calls.

---

## Setup Complete ✅

- [x] Install pino@9.7.0 and pino-pretty@13.1.0
- [x] Create `lib/logger.ts` with structured logger configuration
- [x] Configure child loggers: `authLogger`, `graphLogger`, `syncLogger`, `cronLogger`, `apiLogger`

---

## Migration Pattern

### Before (console)
```typescript
console.log("[auth/callback] LOGIN flow, exchanging code");
console.error("Microsoft OAuth error:", error, description);
console.warn("Reauth required for userId:", userId);
```

### After (pino)
```typescript
import { authLogger } from "@/lib/logger";

authLogger.info({ flow: "login" }, "LOGIN flow started, exchanging code");
authLogger.error({ error, errorDescription: description }, "Microsoft OAuth error");
authLogger.warn({ userId }, "Reauth required for user");
```

### Key Differences

1. **Context first, message second**: `logger.info({ context }, "message")`
2. **Structured data**: Pass objects for searchable/filterable logs
3. **Use child loggers**: `authLogger`, `syncLogger`, `cronLogger`, `apiLogger`, `graphLogger`
4. **No string concatenation**: Separate context from message

---

## Files Completed (1/53) ✅

### app/api/auth/microsoft/callback/route.ts (11 replacements)
- [x] Line 43: OAuth error → `authLogger.error`
- [x] Line 57: Teams consent flow started → `authLogger.info`
- [x] Line 66: Teams consent cache updated → `authLogger.info`
- [x] Line 75: ADD flow started → `authLogger.info`
- [x] Line 92: ADD blocked unauthorized email → `authLogger.warn`
- [x] Line 96: ADD linking account → `authLogger.info`
- [x] Line 111: ADD done → `authLogger.info`
- [x] Line 118: LOGIN flow started → `authLogger.info`
- [x] Line 132: Token acquired → `authLogger.info`
- [x] Line 140: LOGIN blocked unauthorized → `authLogger.warn`
- [x] Line 214-218: Catch block error → `authLogger.error`

---

## Files Remaining (52/53) 🔴

### Critical Priority (API Routes - Auth & Cron)

#### app/api/cron/sync/route.ts (2 replacements)
- [ ] Line 103-106: Reauth warning → `syncLogger.warn({ userId, homeAccountId, errorMsg }, "Reauth required")`
- [ ] Line 115-118: Sync error → `syncLogger.error({ err, userId, homeAccountId }, "Sync failed")`

#### app/api/cron/send-scheduled/route.ts (1 replacement)
- [ ] Import `cronLogger`
- [ ] Replace console statements with `cronLogger.info/error`

#### app/api/cron/cleanup-ai-replies/route.ts (1 replacement)
- [ ] Import `cronLogger`
- [ ] Replace console statements

### High Priority (API Routes - Mail Operations)

#### app/api/mail/send/route.ts (1 replacement)
- [ ] Import `apiLogger`
- [ ] Replace console statements

#### app/api/mail/inbox/route.ts (1 replacement)
- [ ] Import `apiLogger`
- [ ] Replace console statements

#### app/api/mail/folder/route.ts (1 replacement)
- [ ] Import `apiLogger`
- [ ] Replace console statements

#### app/api/mail/search/route.ts (2 replacements)
- [ ] Import `apiLogger`
- [ ] Replace console statements

#### app/api/mail/mark-read/route.ts (1 replacement)
- [ ] Import `apiLogger`
- [ ] Replace console statements

#### app/api/mail/delete/route.ts (1 replacement)
- [ ] Import `apiLogger`
- [ ] Replace console statements

#### app/api/mail/archive/route.ts (1 replacement)
- [ ] Import `apiLogger`
- [ ] Replace console statements

#### app/api/mail/move-folder/route.ts (1 replacement)
- [ ] Import `apiLogger`
- [ ] Replace console statements

#### app/api/mail/folders/route.ts (1 replacement)
- [ ] Import `apiLogger`
- [ ] Replace console statements

#### app/api/mail/attachments/[messageId]/[attachmentId]/route.ts (1 replacement)
- [ ] Import `apiLogger`
- [ ] Replace console statements

### AI Routes

#### app/api/mail/ai-reply/route.ts (2 replacements)
- [ ] Import `apiLogger`
- [ ] Replace console statements

#### app/api/mail/remix/route.ts (1 replacement)
- [ ] Import `apiLogger`
- [ ] Replace console statements

#### app/api/mail/dictate/route.ts (1 replacement)
- [ ] Import `apiLogger`
- [ ] Replace console statements

#### app/api/ai-replies/route.ts (2 replacements)
- [ ] Import `apiLogger`
- [ ] Replace console statements

### Rules

#### app/api/rules/apply-action/route.ts (2 replacements)
- [ ] Import `apiLogger`
- [ ] Replace console statements

### Teams Routes

#### app/api/teams/chats/route.ts (1 replacement)
- [ ] Import `apiLogger`
- [ ] Replace console statements

#### app/api/teams/chats/[id]/messages/route.ts (1 replacement)
- [ ] Import `apiLogger`
- [ ] Replace console statements

#### app/api/teams/chats/[id]/send/route.ts (1 replacement)
- [ ] Import `apiLogger`
- [ ] Replace console statements

#### app/api/teams/teams/route.ts (1 replacement)
- [ ] Import `apiLogger`
- [ ] Replace console statements

#### app/api/teams/teams/[id]/channels/route.ts (1 replacement)
- [ ] Import `apiLogger`
- [ ] Replace console statements

#### app/api/teams/channels/[id]/messages/route.ts (1 replacement)
- [ ] Import `apiLogger`
- [ ] Replace console statements

#### app/api/teams/channels/[id]/send/route.ts (1 replacement)
- [ ] Import `apiLogger`
- [ ] Replace console statements

#### app/api/calendar/teams-meeting/route.ts (1 replacement)
- [ ] Import `apiLogger`
- [ ] Replace console statements

### Medium Priority (Components)

#### components/inbox/InboxClient.tsx (6 replacements)
- [ ] Import `logger` from "@/lib/logger"
- [ ] Replace console statements (mostly error handling)

#### components/inbox/EmailReadClient.tsx (1 replacement)
- [ ] Import `logger`
- [ ] Replace console statements

#### components/compose/ComposeClient.tsx (1 replacement)
- [ ] Import `logger`
- [ ] Replace console statements

#### components/folder/FolderClient.tsx (3 replacements)
- [ ] Import `logger`
- [ ] Replace console statements

#### components/contacts/ContactsClient.tsx (3 replacements)
- [ ] Import `logger`
- [ ] Replace console statements

#### components/signatures/SignaturesClient.tsx (3 replacements)
- [ ] Import `logger`
- [ ] Replace console statements

#### components/settings/SettingsClient.tsx (3 replacements)
- [ ] Import `logger`
- [ ] Replace console statements

#### components/attachments/AttachmentsClient.tsx (1 replacement)
- [ ] Import `logger`
- [ ] Replace console statements

#### components/Sidebar.tsx (1 replacement)
- [ ] Import `logger`
- [ ] Replace console statements

### Low Priority (Pages & Error Handlers)

#### app/inbox/page.tsx (1 replacement)
- [ ] Import `logger`
- [ ] Replace console statements

#### app/inbox/[id]/page.tsx (1 replacement)
- [ ] Import `logger`
- [ ] Replace console statements

#### app/trash/page.tsx (1 replacement)
- [ ] Import `logger`
- [ ] Replace console statements

#### app/starred/page.tsx (1 replacement)
- [ ] Import `logger`
- [ ] Replace console statements

#### app/sent/page.tsx (1 replacement)
- [ ] Import `logger`
- [ ] Replace console statements

#### app/drafts/page.tsx (1 replacement)
- [ ] Import `logger`
- [ ] Replace console statements

#### app/folder/[folderId]/page.tsx (1 replacement)
- [ ] Import `logger`
- [ ] Replace console statements

#### app/attachments/page.tsx (1 replacement)
- [ ] Import `logger`
- [ ] Replace console statements

#### app/error.tsx (1 replacement)
- [ ] Import `logger`
- [ ] Replace console.error with `logger.error`

#### app/inbox/error.tsx (1 replacement)
- [ ] Import `logger`
- [ ] Replace console.error with `logger.error`

#### app/calendar/error.tsx (1 replacement)
- [ ] Import `logger`
- [ ] Replace console.error with `logger.error`

#### app/compose/error.tsx (1 replacement)
- [ ] Import `logger`
- [ ] Replace console.error with `logger.error`

#### app/dashboard/error.tsx (1 replacement)
- [ ] Import `logger`
- [ ] Replace console.error with `logger.error`

### Utilities & Scripts

#### lib/prisma.ts (1 replacement)
- [ ] Import `logger`
- [ ] Replace console.log in connection logging

#### scripts/generate-dep-map.ts (2 replacements)
- [ ] Import `logger`
- [ ] Replace console statements

#### tests/e2e/auth/export-session.ts (6 replacements)
- [ ] Import `logger`
- [ ] Replace console statements (or leave as-is for CLI tool)

#### tests/e2e/auth/global-setup.ts (1 replacement)
- [ ] Import `logger`
- [ ] Replace console statements (or leave as-is for test setup)

---

## Migration Commands

### 1. First, install dependencies:
```bash
npm install
```

### 2. Search for remaining console statements:
```bash
# Count remaining
grep -r "console\.\(log\|error\|warn\|info\|debug\)" --include="*.ts" --include="*.tsx" app/ components/ lib/ | wc -l

# List all files with console statements
grep -rl "console\.\(log\|error\|warn\|info\|debug\)" --include="*.ts" --include="*.tsx" app/ components/ lib/
```

### 3. After completing all replacements:
```bash
# Verify no console statements remain (except in node_modules, tests, scripts)
npm run lint
npm run type-check

# Test the logger works
npm run dev
# Check console for colorized pino-pretty output
```

---

## Example Migration (Step-by-Step)

### File: app/api/cron/sync/route.ts

**Before:**
```typescript
console.warn(
  `[sync] reauth required for ${userId}/${homeAccountId}:`,
  errorMsg
);
```

**After:**
```typescript
// At top of file
import { syncLogger } from "@/lib/logger";

// Replace console.warn
syncLogger.warn(
  { userId, homeAccountId, errorMsg },
  "Reauth required for account"
);
```

---

## Validation Checklist

After completing all replacements:

- [ ] `npm run type-check` passes (no TypeScript errors)
- [ ] `npm run lint` passes
- [ ] `npm run dev` shows pretty-printed logs in development
- [ ] No `console.log/error/warn` found in `app/`, `components/`, `lib/` (except comments)
- [ ] All API routes use appropriate child logger (`authLogger`, `syncLogger`, `apiLogger`, `cronLogger`)
- [ ] Error objects passed as `{ err }` or `{ error }` for proper serialization
- [ ] Context data (userId, homeAccountId, etc.) passed as object, not string concatenation

---

## Benefits After Migration

1. **Searchable Logs**: Query by userId, homeAccountId, error type, etc.
2. **Structured Data**: JSON logs in production for log aggregation tools (Datadog, LogRocket, etc.)
3. **Pretty Dev Logs**: Colorized, readable logs during development
4. **Performance**: Pino is 5x faster than console.log
5. **Redaction**: Sensitive fields (password, token, accessToken) automatically removed
6. **Context**: Child loggers add subsystem context to every log automatically

---

## Next Steps

1. Run `npm install` to install pino and pino-pretty
2. Start with critical API routes (cron, auth, mail operations)
3. Move to components
4. Finish with pages and utilities
5. Run validation checklist
6. Commit: `git commit -m "refactor: replace console calls with structured logger (pino)"`
