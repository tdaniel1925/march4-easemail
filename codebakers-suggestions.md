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

---

## 17. MSAL Scope Conflict — Token Cache Poisoning

**What went wrong:** After adding Teams scopes to `GRAPH_SCOPES`, `acquireTokenSilent` kept returning the old cached mail-only token (still technically valid), causing Graph to return 403 on Teams endpoints. The loop was: request Teams scopes → MSAL returns cached mail token (valid, no Teams scopes) → Graph 403 → trigger consent → user consents → MSAL caches new token but still returns old one on next call → repeat.

**Root cause:** MSAL's in-memory cache returns the first valid token it finds for an account. If a token exists that satisfies the account match but not the scope match, MSAL may still return it rather than using the refresh token to get a new one — especially when scope sets overlap.

**Fix:** Separate scope constants per feature domain. Never mix mail and Teams scopes in one array. Each domain requests only its own scopes:
```typescript
export const GRAPH_SCOPES = ["Mail.ReadWrite", "Calendars.ReadWrite", ...];
export const TEAMS_SCOPES = ["Chat.ReadWrite", "ChannelMessage.Send", ...];
// acquireTokenSilent accepts scopes param, defaults to GRAPH_SCOPES
```

**Suggestion:**
- Add to `agents/patterns/external-oauth-token-cache.md`: scope set separation rule
- Error Sniffer: detect a single `GRAPH_SCOPES` array with >2 distinct API surface areas → warn to split by domain
- Interview agent: "Will this app use multiple Microsoft API surfaces (mail + Teams, mail + SharePoint)?" → if yes, auto-prescribe separate scope constants

---

## 18. Incremental OAuth Consent — Adding Scopes Without Disconnect

**What went wrong:** When Teams scopes were added after users had already connected their MS accounts, the options were: (a) force everyone to disconnect and reconnect (bad UX), or (b) build an incremental consent flow. Neither pattern existed in the framework.

**The pattern that worked:** A dedicated consent route that initiates OAuth with `prompt=consent` and the new scopes only, with a custom `state` value (`teams_consent:{userId}`) so the callback knows to update the MSAL cache without touching the user's account.

```
GET /api/auth/microsoft/teams-consent
  → getAuthCodeUrl({ scopes: TEAMS_SCOPES, prompt: "consent", state: "teams_consent:{userId}" })
  → redirect to MS

GET /api/auth/microsoft/callback (state = "teams_consent:...")
  → acquireTokenByCode({ scopes: TEAMS_SCOPES })
  → MSAL cache updated
  → redirect to /feature-page (no account changes)
```

**Suggestion:**
- Add pattern: `agents/patterns/incremental-oauth-consent.md`
- Rule: any time a feature requires new OAuth scopes on an existing provider connection, never force full disconnect — build an incremental consent route
- Interview agent: "Does this feature add new OAuth scopes to an existing provider?" → auto-scaffold the consent route + callback handler
- Error Sniffer: if a route returns 403 from an external OAuth API and the user is already connected → suggest incremental consent before suggesting reconnect

---

## 19. Admin-Consent vs User-Consent Scopes (MS Graph)

**What went wrong:** `ChannelMessage.Read.All` and `Presence.Read.All` were added to `GRAPH_SCOPES` but both require **tenant admin consent** — not user consent. Including them caused `acquireTokenSilent` to throw `consent_required` in an infinite loop even after the user consented, because the user *cannot* grant these scopes themselves.

**The distinction:**
- **User-consent scopes**: `Mail.ReadWrite`, `Chat.ReadWrite`, `ChannelMessage.Send`, `Calendars.ReadWrite` — any user can grant these
- **Admin-consent scopes**: `ChannelMessage.Read.All`, `Presence.Read.All`, `User.Read.All` — require the tenant admin to grant via Azure portal

**Fix:** Remove admin-consent scopes from all user-facing consent flows. Handle 403 from Graph gracefully at the route level — return a specific error code so the UI can show an informative message instead of a broken state.

**Suggestion:**
- Add to `agents/patterns/external-oauth-token-cache.md`: table of common Graph scopes with consent level (user vs admin)
- Error Sniffer: flag any scope containing `.All` or `Read.All` suffix as likely admin-consent → warn to verify in MS docs before including in user consent flow
- Interview agent: "Will you need org-wide data access (all users' presence, all channel messages)?" → if yes, warn that admin consent is required and may not be grantable in all customer tenants

---

## 20. AI Prompts — System Parameter Separation

**What went wrong:** All AI routes had persona context embedded in the user message turn rather than the `system` parameter. This is less effective — the model doesn't weight it as strongly and the boundary between "who I am" and "what to do" is blurred.

**The pattern that works:**
```typescript
// Bad — context buried in user message
const prompt = `You are an AI assistant for a law firm. Analyze this email...`;
client.messages.create({ messages: [{ role: "user", content: prompt }] });

// Good — persona in system, task in user
const system = `You are an email assistant for Darren Miller Law Firm. You understand legal context...`;
const prompt = `Analyze this email and return JSON...`;
client.messages.create({ system, messages: [{ role: "user", content: prompt }] });
```

**Additional lessons:**
- Industry/domain context in the system prompt dramatically improves output quality (legal terms preserved, appropriate formality, correct event durations)
- Prescribe reply option roles explicitly ("Option 1 must be a brief acknowledgment, Option 2 must request clarification") rather than asking the model to "be different" — vague differentiation instructions produce similar outputs
- Extract contextual data (sender first name, firm name) and inject into prompts rather than leaving the model to guess

**Suggestion:**
- Add pattern: `agents/patterns/ai-prompt-structure.md`
- Rule: always use `system` for persona/context, `messages` for the specific task
- Interview agent: "Will you have AI features?" → if yes, ask for industry/domain context → store in BRAIN.md → auto-inject into all AI prompt system strings
- Completeness Verifier: check that all AI routes use `system` parameter, not persona-in-user-message

---

## 21. Post-Action Navigation — router.back() vs router.push()

**What went wrong:** After sending an email, `router.push("/sent")` was hardcoded. This dumped the user into the sent folder regardless of where they came from — if they opened compose from inbox, they ended up in sent instead of returning to inbox. Felt broken.

**The rule:** After any "complete and close" action (send email, save form, submit), use `router.back()` to return the user to their prior context — not a hardcoded destination. The exception is when the action *creates* something the user should then view (e.g., creating a new record → navigate to that record's page).

```typescript
// Bad — ignores where user came from
router.push("/sent");

// Good — returns to prior context
router.back();

// Also good — when you need to control destination, use a returnTo param
// /compose?returnTo=/inbox → router.push(searchParams.get("returnTo") ?? "/inbox")
```

**Suggestion:**
- Add to `agents/patterns/atomic-unit.md`: post-action navigation rule
- Completeness Verifier: check that form submission / send / delete actions use `router.back()` or a `returnTo` param — not hardcoded destination routes
- Error Sniffer: flag `router.push("/[folder|page]")` inside submit/send handlers as a likely UX issue

---

## 22. Search: Cache-First Before External API

**What went wrong:** The search route always hit the MS Graph API (`/me/messages?$search=...`). This was slow (500ms–2s per query), had a hardcoded `$top=250` that showed as a fake result count ("250 results for 'godaddy'"), and burned API quota on every keystroke.

**The pattern that fixed it:**
1. Query the local DB cache first (fast, <50ms, `contains` insensitive)
2. If cache has results → return them immediately with accurate count
3. If cache is empty → fall back to external API with a reduced page size

```typescript
const cached = await prisma.cachedEmail.findMany({
  where: { userId, homeAccountId, OR: [
    { subject: { contains: q, mode: "insensitive" } },
    { fromName: { contains: q, mode: "insensitive" } },
    { bodyPreview: { contains: q, mode: "insensitive" } },
  ]},
  take: 100,
});
if (cached.length > 0) return cached; // fast path
// else fall back to Graph with $top=50
```

**Suggestion:**
- Add to `agents/patterns/mutation-handler.md` or a new `agents/patterns/cache-first-reads.md`: the cache-first search pattern
- Rule: any feature with a search input that queries an external API should route through local cache first if a cache table exists
- Interview agent: "Will users search across large datasets from an external API?" → if yes, auto-prescribe a cache table + cache-first search route
- Completeness Verifier: if a project has cached tables and a search route that hits the external API directly → flag as a performance gap

---

## 23. Env-Var Domain Gate vs DB-Based Access Control

**What was built:** A domain allowlist using `ALLOWED_DOMAINS` env var + `ADMIN_EMAILS` env var, checked in both middleware and the OAuth callback. Works well for single-tenant / known-user-set apps.

**Why this doesn't scale:** For multi-tenant SaaS, the allowed domains are per-org and stored in the DB — not in env vars. Baking access control into env vars means every new customer requires a deployment. The gate must move to the DB when going multi-tenant.

**The two patterns:**
```
Single-tenant (env-var gate):
  ALLOWED_DOMAINS=dmillerlaw.com
  Middleware reads env → checks user.email domain
  ✓ Simple, zero DB queries, good for one customer

Multi-tenant (DB gate):
  organizations table has allowedDomains: string[]
  Middleware reads org from DB → checks user.email domain
  ✓ Self-serve, each org controls its own domain list
```

**Suggestion:**
- Add to `agents/patterns/auth-access-control.md`: document both patterns with clear "use this when" guidance
- Interview agent: "Is this app for one customer or multiple?" → single customer → env-var gate pattern → multiple customers → DB gate pattern
- BRAIN.md should explicitly record which pattern is in use so future sessions don't accidentally mix them
- When generating the env-var gate pattern, always add a comment: `// For multi-tenant: move this to organizations.allowedDomains in DB`

---

*Last updated: 2026-03-05 | EaseMail session 3*
