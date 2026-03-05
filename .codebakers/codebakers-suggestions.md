# CodeBakers Suggestions
_Patterns and improvements captured during the EaseMail build. Feed these back into CLAUDE.md._

---

## #1 — Prisma JSON Field Cast Pattern (CRITICAL)

**Problem:** Prisma `Json` fields require `InputJsonValue` for writes and return `JsonValue` on reads. TypeScript strict mode rejects typed arrays (e.g. `Condition[]`) because they lack an index signature.

**Wrong:**
```typescript
conditions: body.conditions,              // TS error on write
conditions: r.conditions as Condition[],  // TS error on read — types don't overlap
conditions: body.conditions as unknown,   // TS error — unknown not assignable to InputJsonValue
```

**Correct pattern:**
```typescript
// WRITE: roundtrip through JSON.parse/stringify to get `any`
conditions: JSON.parse(JSON.stringify(body.conditions ?? [])),

// READ: cast through unknown first
conditions: r.conditions as unknown as Condition[],
```

**Add to CodeBakers:** Include this as a hard pattern in the patterns library. Any time a Prisma model has a `Json` column storing a typed array, apply this cast. The `JSON.parse(JSON.stringify(...))` approach is the only universally safe option — `as unknown as Prisma.InputJsonValue` still fails in some Prisma versions.

---

## #2 — `prisma migrate dev` vs `prisma db push` for Drifted DBs

**Problem:** Running `prisma migrate dev --name add_x` on a DB that already has the tables (created outside Prisma's migration history) throws a "Drift detected" error and blocks.

**Pattern:**
- Use `npx prisma db push` when: adding a model to a live DB that was set up without migrations, or when migration history has drifted from actual DB state
- Use `npx prisma migrate dev` only when: starting fresh or migration history is clean

**Add to CodeBakers:** Add a note to the migration step of the atomic unit checklist — if `migrate dev` throws drift errors, fall back to `db push` and log the decision in ASSUMPTIONS.md.

---

## #3 — HTML Contenteditable Blank Lines

**Problem:** Converting plain text to `contenteditable` HTML by splitting on `\n\n` and wrapping in `<div>` blocks, then joining with `""`, collapses all blank lines. `<div>` elements stack flush with no gap unless explicitly separated.

**Wrong:**
```typescript
return paragraphs.map((p) => `<div>${p}</div>`).join(""); // blank lines invisible
```

**Correct:**
```typescript
// Insert an empty <div><br></div> between each paragraph block
return paragraphs.map((p) => `<div>${p}</div>`).join("<div><br></div>");
```

**Why:** In contenteditable, a blank line is represented as `<div><br></div>` — an empty block with a forced line break. This is what browsers produce when the user presses Enter twice.

**Add to CodeBakers:** Add this to the patterns library as `contenteditable-blank-lines.md`. Reference it any time converting plain text to HTML for a rich text editor.

---

## #4 — SpeechRecognition Auto-Restart Pattern

**Problem:** The browser's `SpeechRecognition` API auto-stops after a period of silence. Without handling `onend`, the recording appears to be running but has silently stopped.

**Pattern:**
```typescript
rec.onend = () => {
  if (!intentionalStopRef.current) {
    // Browser stopped due to silence — restart
    try { rec.start(); } catch { /* already stopping */ }
  } else {
    setIsRecording(false);
    clearInterval(timerRef.current);
  }
};
```

**Key refs:**
- `intentionalStopRef` — set to `true` before calling `rec.stop()` explicitly
- Always wrap `rec.start()` in `onend` with try/catch — the rec object may be mid-stop

**10-minute limit:** Use a separate time ref (not just state) to track elapsed time in the interval and call `stopRecording()` when it hits 600:
```typescript
dictateTimeRef.current += 1;
setRecordingTime(dictateTimeRef.current);
if (dictateTimeRef.current >= 600) stopRecording();
```

---

## #5 — Async Event Handlers in React (TypeScript strict)

**Problem:** React's `onClick` prop type is `() => void`. Assigning an async function directly works at runtime but can generate unhandled promise warnings in some linting configs. TypeScript in strict mode may also flag this.

**Pattern:** Always wrap async handlers:
```tsx
// Wrong
onClick={handleSaveEdit}

// Correct
onClick={() => void handleSaveEdit()}
```

The `void` operator discards the returned Promise, satisfying the `() => void` type contract explicitly and preventing unhandled rejection warnings.

---

## #6 — Stale Turbopack Build Cache

**Problem:** After renaming or removing a function, the Next.js Turbopack dev server may still serve a cached bundle that references the old name, causing `ReferenceError: X is not defined` at runtime even though `tsc --noEmit` passes cleanly.

**Fix:** Restart the dev server (`Ctrl+C` → `npm run dev`). Turbopack rebuilds from scratch.

**Add to CodeBakers:** Add to the Error Sniffer — if tsc passes but the browser throws a ReferenceError for something that doesn't exist in source, the fix is always a dev server restart, not a code change.

---

## #7 — Client-Side Rule Enforcement Architecture

**Pattern learned:** For single-tenant email apps with inbox rules, client-side enforcement is correct:
- Fetch rules once on mount, store in a `useRef` (not state) so callbacks don't close over stale values
- Apply pure rule engine to every email batch (initial load, account switch, infinite scroll page)
- Fire Graph side effects via `Promise.allSettled` — never let one failure block others
- Always return `emails` from the engine even if rules fail (try/catch, fallback to original batch)
- Increment `emailCount` per matched rule asynchronously — never block inbox render for stats

**Deduplication:** Track processed email IDs to prevent double-firing when rules are loaded after initial emails are already in state.

---

## #8 — Prisma Schema Additions to Existing Projects

When adding a new model to an existing Prisma schema on a live DB:

1. Add model to `schema.prisma`
2. Run `npx prisma generate` (regenerates client types)
3. Run `npx prisma db push` (not `migrate dev` if DB has drift)
4. Verify with `npx tsc --noEmit` — Prisma client types update on generate, TypeScript errors may surface

Common cast errors will appear immediately after `generate` — fix them before moving to API layer.

---

## #9 — AI Output → Email Body Pipeline

For any feature that sends text through an LLM and inserts the result into an email body:

1. **API prompt:** Instruct Claude to return ONLY the email body — no subject line, no preamble, no meta-commentary
2. **`formatEmailSpacing()`:** Apply after receiving AI output to enforce salutation blank line and closing gap
3. **`remixTextToHtml()`:** Apply before inserting into `contenteditable` — converts `\n\n` to `<div><br></div>` separators
4. **Show preview first:** Never auto-insert AI output. Show a preview with the same rendering as the final insert so the user sees exactly what they'll get.

This pipeline is now standardized for both AI Remix and AI Dictate.

---

## #10 — MSAL getAllAccounts() Does Not Trigger Cache Load

**Problem:** `ConfidentialClientApplication.getTokenCache().getAllAccounts()` is synchronous and reads only the in-memory cache. It does NOT trigger `beforeCacheAccess`. When a new MSAL client is created per request (Next.js API route pattern), the in-memory cache is empty, so `getAllAccounts()` always returns `[]` — even if tokens are persisted in the DB.

**Wrong:**
```typescript
const accounts = await msalClient.getTokenCache().getAllAccounts();
const account = accounts.find((a) => a.homeAccountId === homeAccountId);
// account is always undefined on a fresh client instance!
```

**Correct — pre-load from DB before calling getAllAccounts():**
```typescript
const row = await prisma.msalTokenCache.findUnique({ where: { userId }, select: { cacheJson: true } });
if (row?.cacheJson) {
  msalClient.getTokenCache().deserialize(row.cacheJson);
}
const accounts = await msalClient.getTokenCache().getAllAccounts();
```

**Add to CodeBakers:** Any MSAL node integration that creates a client per request MUST pre-load the token cache from persistence before `getAllAccounts()`. The `ICachePlugin.beforeCacheAccess` hook is only triggered by `acquireTokenSilent` and similar token acquisition operations — not by read helpers.

---

## #11 — API Routes Without try/catch Return HTML, Not JSON

**Problem:** When a Next.js API route has an unhandled thrown error (e.g., no try/catch around an async call), Next.js catches it and returns an HTML error page (500). Any client code that calls `.json()` on that response will throw `SyntaxError: Unexpected end of JSON input`. This is always misread as a client-side bug.

**Pattern:** Every API route that does async work must wrap it in try/catch and return `NextResponse.json({ error })` on failure — never let Next.js generate the error response.

```typescript
// Wrong — unhandled throw returns HTML 500
const data = await graphGet(...);

// Correct
try {
  const data = await graphGet(...);
  return NextResponse.json({ data });
} catch (err) {
  return NextResponse.json({ error: String(err) }, { status: 500 });
}
```

**Defensive client pattern:** Always check `r.ok` before calling `r.json()`:
```typescript
.then((r) => { if (!r.ok) throw new Error(`${r.status}`); return r.json(); })
```

**Add to CodeBakers:** Add to Error Sniffer — "Unexpected end of JSON input" in the browser almost always means an API route returned HTML instead of JSON. Check server logs for unhandled throws in route handlers.

---

## #12 — Account Deletion Must Clean Up All homeAccountId-Scoped Records

**Problem:** Deleting a connected account record leaves orphaned data — webhook subscriptions, delta sync links, drafts, and MSAL token cache entries all reference `homeAccountId`. Leaving them causes silent Graph API calls with stale tokens, and the old account still appears in the sidebar switcher.

**Complete disconnect checklist:**
1. Cancel Graph webhook subscriptions for that `homeAccountId` (best-effort, `Promise.allSettled`)
2. Remove account tokens from MSAL cache JSON (deserialize → `removeAccount()` → serialize → save to DB)
3. Delete `WebhookSubscription` records in DB
4. Delete `EmailDeltaLink` records in DB
5. Delete `Draft` records for that `homeAccountId` in DB
6. Delete `MsConnectedAccount` record
7. Promote new default account if deleted was default
8. Update Zustand store client-side so sidebar reflects the change immediately

**Add to CodeBakers:** Add as a standard pattern in `agents/patterns/account-disconnect.md`. Any multi-account app must implement this full cleanup or users will see phantom accounts in the UI and receive Graph auth errors.

---

## #13 — Memory Updates Must Be Automatic, Not User-Prompted

**Problem:** Claude completes tasks and reports done without updating BRAIN.md, the dependency map, or codebakers-suggestions.md — leaving memory stale across sessions. Users have to explicitly ask "did you update CodeBakers?" every time.

**Root cause:** The memory update step is listed in the system but not enforced as a hard gate before reporting done. Claude treats it as optional cleanup rather than a required part of task completion.

**Solution — Two-layer enforcement:**

**Layer 1: Hard rule in CLAUDE.md (top of Hard Rules section):**
> **🧠 Memory:** After every completed task — before reporting done — you MUST:
> 1. Update `BRAIN.md` (current focus, new patterns, any architecture decisions made)
> 2. Run `pnpm dep:map` if any store or component was added or changed
> 3. Add to `codebakers-suggestions.md` if a new reusable pattern was discovered
>
> This is not optional. Skipping it is a protocol violation.

**Layer 2: Add to `@verify` / `verify-protocol-compliance.ps1`:**
Add a check: "Was BRAIN.md modified today?" If `git log --since=midnight .codebakers/BRAIN.md` returns no commits, flag as a warning. If it's been more than 24 hours since the last BRAIN.md update and work has been done (commits exist today), flag as a violation.

**The standard:** Memory updates are part of task completion — the same as `tsc --noEmit`. A task is not done until memory reflects what was built.
