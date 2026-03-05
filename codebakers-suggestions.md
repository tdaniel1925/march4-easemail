# CodeBakers Suggestions
*Captured during EaseMail build — pull these into future framework versions*

---

## 1. Prisma + Supabase Adapter Pattern (Critical)

**What went wrong:** `lib/prisma.ts` fell back to `DATABASE_URL` (pgbouncer pooler, port 6543) which is incompatible with `@prisma/adapter-pg`. Caused `DriverAdapterError: Tenant or user not found` that looked like an auth error, not a DB error. Took significant time to trace.

**Suggestion:** Add a dedicated pattern doc: `agents/patterns/prisma-supabase.md`
- Rule: `@prisma/adapter-pg` requires `DIRECT_URL` (port 5432 on `db.projectref.supabase.co`) — never the pooler
- Interview agent should ask: "Are you using Prisma with Supabase?" → if yes, auto-emit `CREDENTIALS-NEEDED.md` entry with exact `.env.local` template
- BRAIN.md should flag `DIRECT_URL` as a required env var for Prisma projects
- Error Sniffer should detect `DATABASE_URL ?? DIRECT_URL` fallback pattern and warn

---

## 2. Turbopack Cache Corruption Recovery

**What went wrong:** Turbopack's `.next` cache became corrupted mid-session (`.sst` files missing). Compilation hung indefinitely with no clear error in the browser. User couldn't type in the terminal.

**Suggestion:**
- Add to Error Sniffer: detect `Unable to open static sorted file` / `.sst` error pattern → auto-prescribe `rm -rf .next && restart server`
- Add to CREDENTIALS-NEEDED or onboarding: "If compilation hangs >2 min, delete `.next` folder and restart"
- Consider adding a `fix:cache` script to `package.json`: `"fix:cache": "rimraf .next && echo 'Cache cleared. Run npm run dev.'"`

---

## 3. next.config.ts / Environment Variable Restart Reminder

**What went wrong:** User changed `.env.local` mid-session (DIRECT_URL) and didn't restart — changes weren't picked up, making the fix appear broken when it wasn't.

**Suggestion:**
- Whenever Claude edits `.env.local`, auto-output: "**Restart your dev server** — env changes don't hot-reload."
- Add to Error Sniffer: any env var fix should always include a restart reminder in the response

---

## 4. DOMPurify / SSR-Safe Library Pattern

**What went wrong:** `import DOMPurify from "dompurify"` at module top level crashed Next.js SSR (`window is not defined`). Fix was lazy dynamic import inside `useEffect`.

**Suggestion:** Add pattern: `agents/patterns/ssr-safe-imports.md`
- Libraries that access `window`/`document` at import time must be lazily imported
- Known offenders to flag in Error Sniffer: `dompurify`, `quill`, `draft-js`, `leaflet`, `chart.js` (some configs)
- Interview agent should ask: "Will you render user-generated HTML?" → if yes, auto-prescribe DOMPurify with SSR-safe import pattern

---

## 5. Supabase Auth → Prisma User Sync Pattern

**What went wrong:** The OAuth callback had an O(n) `listUsers()` scan to find an existing user by email. Should use `getUserByEmail()` or a direct DB lookup.

**Suggestion:** Add pattern: `agents/patterns/supabase-user-sync.md`
- After OAuth callback, always look up user by ID (from `supabase.auth.getUser()`) not by scanning user list
- Template for upsert: `prisma.user.upsert({ where: { id: user.id }, ... })`
- Flag `listUsers()` in Error Sniffer as a performance/security smell

---

## 6. Graph API / External OAuth Token Pattern

**What went wrong:** MSAL token cache, homeAccountId, multi-account switching — none of this had a pattern in CodeBakers. Had to build from scratch without guardrails.

**Suggestion:** Add pattern: `agents/patterns/external-oauth-token-cache.md`
- When a project uses a second OAuth provider (MS, Google, etc.) alongside Supabase Auth:
  - Token cache must be tied to Supabase user ID (not session)
  - homeAccountId must be stored in DB and passed through all API calls
  - Account switching requires re-fetching all data, not just re-rendering

---

## 7. Infinite Scroll → dep:map Should Track Pagination State

**What went wrong:** Infinite scroll introduced `nextLink` state in InboxClient but the dep:map doesn't capture pagination state — it only tracks stores and components.

**Suggestion:**
- dep:map could optionally track "pagination state" as a concept — when a component has `nextLink`/`cursor`/`page` state, flag it so mutation handlers know to reset it on account/filter switches
- Or: add a note to the mutation handler pattern — "if component has pagination state, reset it on entity switch"

---

## 8. `ErrorMessage` Component Anti-Pattern (Login Page)

**What went wrong:** The login page had an `ErrorMessage` component that returned `null` always — it was a stub that never got implemented, silently hiding auth errors from users for potentially a long time.

**Suggestion:**
- Error Sniffer should detect `return null` in components named `*Error*`, `*Message*`, `*Alert*`, `*Toast*`, `*Banner*` — flag as likely unimplemented UI feedback
- Completeness Verifier should check: "Does every error path have visible user feedback?"

---

## 9. Dev Server Port Convention

**Observation:** Project runs on port 4000 (non-default). `EADDRINUSE` errors occurred multiple times when the server was already running.

**Suggestion:**
- Interview agent should ask: "What port will you run on?" → store in BRAIN.md
- Add `kill:dev` script to package.json: `"kill:dev": "npx kill-port 4000"` (using project's configured port)
- Add to onboarding: "If you see EADDRINUSE, run `npm run kill:dev` then restart"

---

## 10. Zustand Store Initialization from Server Components

**What worked well but wasn't in the framework:** The `StoreInitializer` pattern (client component that initializes Zustand from server-loaded data) is reusable and non-obvious.

**Correction to original suggestion:** The `useRef` guard trick (calling `setState` during render) causes React's "setState during render of another component" warning. **Correct pattern is `useLayoutEffect` with `[]`** — fires synchronously after DOM mount, before paint, before any `useEffect` in sibling components. This guarantees store is seeded before any consumer effect fires.

**Suggestion:** Add pattern: `agents/patterns/zustand-server-init.md`
- Template: `useLayoutEffect(() => { useStore.setState({...serverData}); }, [])`
- Never use `useRef` guard + setState-during-render — React flags this as an error in concurrent mode
- When Interview detects "user has multiple accounts" or "multi-tenant" → auto-suggest this pattern

---

---

## 11. BUILD-LOG Update Is Skipped in Practice (Critical Protocol Gap)

**What went wrong:** BUILD-LOG.md was updated in one batch at the end of the session, not after each feature. Claude treated git commits as the primary record and deprioritized the CodeBakers memory files — exactly the enforcement gap v4.3.0 was supposed to fix.

**Why it happens:** The commit step feels like "done." The BUILD-LOG update is a second step with no hard gate enforcing it. Without enforcement it gets deferred and then forgotten.

**Suggestion — make BUILD-LOG update part of the commit command, not a separate step:**

The commit template in CLAUDE.md should be extended to always include a BUILD-LOG append as part of the same action:

```
After every commit:
  1. git add [files]
  2. git commit -m "..."
  3. Append to .codebakers/BUILD-LOG.md immediately (same response, no exceptions)
  4. git add .codebakers/BUILD-LOG.md && git commit -m "chore(memory): log [feature]"
```

Or simpler: **fold the BUILD-LOG entry into the feature commit itself** — always stage `.codebakers/BUILD-LOG.md` alongside the feature files. One commit, always includes the log. No separate step to forget.

**Additionally:** The Self-Verification check (Layer 2 of enforcement) should explicitly ask:
- "Did I append to BUILD-LOG.md for every feature this session?"
- If no → block next feature until it's done

---

## 12. Third-Party API: Field Names Don't Match Intuition (Graph API `sentDateTime`)

**What went wrong:** Sent items in MS Graph have `sentDateTime`, not `receivedDateTime`. Using `$orderby=receivedDateTime desc` on `sentItems` silently returns emails in undefined order — no error, just wrong data. Took manual inspection to diagnose.

**Why this is a framework problem:** CodeBakers builds API routes fast and assumes field names are obvious. For third-party APIs, they often aren't.

**Suggestion:**
- Add to Error Sniffer: when building routes for "sent" or "outbox" type folders, warn that `receivedDateTime` may be null and `sentDateTime` should be used instead
- Add to `agents/patterns/external-oauth-token-cache.md`: include a Graph API field reference section covering `receivedDateTime` vs `sentDateTime` vs `lastModifiedDateTime` and when each applies
- General rule: **any `$orderby` on a third-party API route should be verified against the API docs before committing** — wrong field gives wrong results silently

---

## 13. Third-Party API: `$filter` + `$orderby` Incompatibility (Graph `InefficientFilter`)

**What went wrong:** MS Graph returns `400 InefficientFilter` when combining `$filter=flag/flagStatus eq 'flagged'` with `$orderby`. This only affects certain filter fields (flag, categories) — not others (isRead, hasAttachments). No indication of this in the route code.

**Why this is a framework problem:** The route looks correct. TypeScript passes. It fails at runtime with a cryptic Graph error.

**Suggestion:**
- Add to Error Sniffer: detect `$filter=flag/flagStatus` combined with `$orderby` → warn "Graph API rejects this combination — remove `$orderby`"
- Add to `agents/patterns/external-oauth-token-cache.md`: document Graph `$filter` + `$orderby` known incompatibilities
- General rule: **when a third-party API route fails with a 400 and an unfamiliar error code, that error code is information** — look it up before trying other fixes

---

## 14. Display Context Awareness — `from` vs `toRecipients` in Folder Views

**What went wrong:** The EmailRow component always displayed `email.from.name`. In Sent and Drafts folders, `from` is always the logged-in user — so every email in Sent showed the user's own name. Looked like incoming emails because the names were wrong even though the data was correct.

**Why this is a framework problem:** CodeBakers' Completeness Verifier checks that flows work end-to-end, but doesn't check whether the *display context* makes semantic sense.

**Suggestion:**
- Add to Completeness Verifier: "In any list view that shows sender/recipient, verify the correct field is displayed based on folder context: `from` for received, `toRecipients` for sent/drafts/outbox"
- Add to atomic-unit checklist for email features: "Does the list display sender OR recipient based on folder direction?"
- This generalises: any list component that renders differently based on context (read vs unread, sent vs received, mine vs shared) should have that context explicitly captured in the component's props, not inferred silently

---

## 15. Account-Scoped Resource IDs in URLs — Redirect on Account Switch

**What went wrong:** Custom Graph folder IDs (e.g., `/folder/AAMkADk...`) are scoped to a specific mailbox. When the user switched accounts while on a custom folder page, FolderClient tried to fetch the old folder ID from the new account — Graph returned 404, `data.emails` was undefined, caused a runtime crash.

**Why this is a framework problem:** This class of bug — *URL contains a resource ID that belongs to a specific account* — will appear in any multi-account or multi-tenant app. There's no pattern for it.

**Suggestion:** Add pattern: `agents/patterns/account-scoped-resource-ids.md`
- Rule: any dynamic route with a third-party resource ID (`/folder/[id]`, `/email/[id]`, `/document/[id]`) must handle account/tenant switching
- Standard behavior: on account switch, redirect to the "home" page for that resource type (e.g., `/inbox` for email folders)
- Implementation: maintain a `Set` of well-known resource keys that exist on all accounts; anything outside that set is account-scoped and gets the redirect treatment
- API routes that receive an account-scoped ID for the wrong account should return `404` (not `500`) so the client can distinguish "wrong account" from "server error"
- dep:map should flag dynamic routes (`[param]`) as candidates for this review

---

## 16. Search Scope Not Inherited from UI Context

**What went wrong:** The search API (`/api/mail/search`) always searched the inbox regardless of which folder the user was currently in. Searching in Sent returned inbox results. This was silent — no error, just wrong results from the wrong folder.

**Why this is a framework problem:** Search is treated as a global feature, but users expect it to be contextual. The disconnect between UI context (current folder) and API scope (hardcoded folder) is invisible until you test it in the right folder.

**Suggestion:**
- Add to Completeness Verifier: "If a page has a search input, verify the search is scoped to the current context (folder, project, workspace) not the global default"
- Add to atomic-unit checklist for search features: "Does the search API accept a `context` or `folder` param? Is it being passed from the UI?"
- General rule: **search APIs should always accept a scope parameter** — even if the first implementation only uses one scope, the parameter should exist from day one so adding scoping later doesn't require a breaking change

*Last updated: 2026-03-05 | EaseMail session 2*
