# 🍞 Rules Overhaul + Folders + Calendar TZ + Private AI — Plan

Date: 2026-06-21. Grounded in verified code reading (file:line in notes).

## Root cause (explains issues 1,3,4,6,7)
Rules **only run client-side in InboxClient** (`InboxClient.tsx:564,876`) — never during server sync or cron. And several actions bypass the provider/cache layer, so even when they fire, the inbox (which reads from `cachedEmail`) doesn't reflect them. Forward is hardcoded to Microsoft Graph and silently swallows errors on IMAP/JMAP. "label" is an explicit no-op. "skip_inbox" only hides client-side with no server move. Mark-read PATCHes Graph but never updates `cachedEmail` → stays unread in the list.

---

## The 9 changes

### A. Server-side rules engine (the spine — fixes 1,3,4,6,7)
- Run rules during sync: in `lib/sync/email-sync.ts` (and IMAP/JMAP sync), after new emails are upserted, load the user's active rules and apply them server-side via a new `lib/rules/apply-server.ts`. Also add `/api/cron/apply-rules` as a backstop sweep.
- All actions go through the **provider + cache**: every action updates Graph/IMAP/JMAP AND the `cachedEmail` row, so the inbox reflects it immediately.
- Rewrite `apply-action/route.ts` to route through `getProvider(accountId)` (not hardcoded `graphPost/graphPatch`), and stop swallowing errors silently (log + report).

### B. Custom-folder creation from rules + sidebar (fixes 1, 2)
- New rule action `move_to_folder` with a `folderId` (or `folderName` to auto-create). Schema (`createRuleSchema`), `SideEffect`, rule-engine, server apply, and the EmailRulesClient UI all get it.
- Rule builder UI: a "Move to folder" action with a folder picker + "Create new folder…" inline (calls existing `POST /api/mail/folders`, which already creates in Graph + CachedFolder).
- Add `createFolder` to the provider interface; implement for Microsoft (exists in route), IMAP (`ImapFlow.mailboxCreate`), JMAP (`Mailbox/set`). Sidebar already renders `CachedFolder` — new folders appear after the fire-and-forget folders/sync.

### C. Full folder sync to all levels, all accounts (fix 2)
- `folder-sync.ts` already recurses 10 levels for Microsoft. Add folder sync for IMAP (`list()` full hierarchy) and JMAP (`Mailbox/get`) so custom folders on every account/level land in `CachedFolder`. Trigger on account switch + cron sync.

### D. Forward that actually forwards (fix 3)
- Add `forwardMessage(userId, accountId, messageId, toAddress)` to the provider interface; implement Microsoft (Graph forward), IMAP (fetch source → re-send via nodemailer with attribution), JMAP (EmailSubmission of a forwarded draft). Route the `forward` action through the provider, not hardcoded Graph.

### E. Label = Graph categories (fix 4)
- Implement `label` action as categories: provider `addCategories(messageId, [label])` (Microsoft `updateCategories` already exists at `label/route.ts:84`; IMAP via keywords/flags; JMAP via keywords). Update `cachedEmail.categories`. The inbox "Labeled" tab already filters by categories.

### F. Skip inbox → move to folder (fix 6)
- `skip_inbox` becomes a server move to a target folder (default Archive, or a chosen custom folder), via `provider.moveMessage` + cache delete-from-inbox. No more client-only hide.

### G. Mark read / mark important (fix 7, and harden 5)
- Route both through the provider (`markRead`, `flagMessage`) which update the cache; mark-important already worked, mark-read now updates `cachedEmail.isRead` so it leaves the unread list.

### H. Calendar timezone setting (fix 9)
- Plumbing already works: `preferredTimeZone` flows layout → AppShell → CalendarClient. **Only the settings UI is missing.** Add a timezone `<select>` (IANA list) to `SettingsClient.tsx` Appearance/Profile section, wired to the existing `PATCH /api/user/settings` (already validates `preferredTimeZone`). Default surfaces the current value.

### I. Private / self-hosted LLM for all AI features (fix 8)
- Today 10 files each `new Anthropic(...)` directly (model `claude-haiku-4-5-20251001`). Introduce one factory `lib/ai/client.ts` that returns an Anthropic-compatible client pointed at `AI_BASE_URL`/`AI_API_KEY`/`AI_MODEL` env (defaults to Anthropic). Repoint all 10 call sites at the factory. Self-hosted setup documented separately (see PRIVATE-LLM-SETUP.md).

---

## Build order (each verified before moving on)
1. Provider interface additions (createFolder, forwardMessage, addCategories) + 3 impls — `tsc`.
2. Server rules engine `lib/rules/apply-server.ts` + wire into email-sync + `/api/cron/apply-rules`.
3. Rewrite `apply-action` route through providers; add `move_to_folder`/`skip_inbox` move/`label` cases.
4. Schema + SideEffect + rule-engine action types (`move_to_folder`, label real, skip_inbox move).
5. EmailRulesClient UI overhaul: all actions incl. folder picker + create-folder; per-account.
6. IMAP/JMAP folder sync to all levels.
7. AI client factory + repoint 10 sites.
8. Settings timezone control.
9. Migration(s) if any new columns (rule action payloads are JSON — likely none).

## Verify
- `tsc --noEmit` 0, `eslint .` 0 errors, `pnpm build` OK, unit tests (tenant guard + add rule-engine tests for new actions), e2e on rules + calendar, and a live end-to-end test: create each rule type against the test account and confirm the action lands on Graph AND the cache.

## Private LLM — see PRIVATE-LLM-SETUP.md
