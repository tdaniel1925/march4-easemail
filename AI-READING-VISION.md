# 🍞 Making EaseMail's Reading Experience World-Class with AI

**Goal:** when a user opens an email (or their inbox), the AI does the reading *with* them — summarizing, surfacing what matters, drafting the reply, and taking the next action — so a 40-email morning becomes a 5-minute triage.

This is a build plan, ordered so each phase ships value on its own. The app already has the hard parts in place: a provider abstraction (Graph/IMAP/JMAP), a cached-email store, an Anthropic key, a voice-profile system, and existing AI endpoints (`ai-reply`, `ai-priority`, `remix`, `dictate`). We extend those rather than rebuild.

> **Model guidance:** default every feature to **Claude Fable 5** (`claude-fable-5`) — it's the most capable generally available model and handles long email threads, tool use, and nuance far better than older tiers. Use **Claude Haiku 4.5** (`claude-haiku-4-5-20251001`) only for the high-volume, latency-sensitive classifier passes (per-email priority/category scoring) where you're running hundreds of calls. Never hardcode an old model id.

---

## Phase 1 — The Reading Pane that reads for you (highest impact, ~1 week)

When an email is open, render an **AI panel** above the body with three things, generated on open and cached:

1. **One-line TL;DR** + a 3-bullet summary for anything over ~200 words or any thread with >2 messages. Threads especially: summarize the *whole* conversation, not just the latest message ("Tony asked for pricing → Bill sent the 3-tier quote → you're being asked to approve tier 2 by Friday").
2. **Extracted action items & key facts** as chips: dates ("respond by Fri Jun 13"), amounts ("$4,200"), names, decisions requested, attachments referenced. Each date chip → one-click "Add to calendar" (you already have `/api/calendar/nl-create`); each ask → "Draft reply".
3. **Suggested next action**: Reply / Reply-all / Forward to {person} / Schedule / Archive / Snooze-until — the AI picks the most likely one and pre-loads it.

**Implementation:**
- New route `POST /api/mail/ai-summary` — input: messageId + homeAccountId; pulls the full thread via the provider, sends to Fable 5 with a structured-output tool (`{ tldr, bullets[], actionItems[{type,label,payload}], suggestedAction }`). Cache the result keyed by `messageId + latestMessageReceivedAt` in a new `AiEmailInsight` table (or reuse `cachedSearchResult`-style TTL cache) so re-opening is instant and free.
- Render in `EmailReadClient` / `InboxClient` split-pane, **collapsible**, above the sanitized body. Loading skeleton while generating; graceful "summary unavailable" on failure (never block the email).
- Sanitize all AI output before render (it's model text, but treat as untrusted — DOMPurify, same as bodies).
- Rate-limit with the existing `rateLimiters.ai`; generate **lazily on open**, not on sync, to control spend.

**Why first:** it's the feature users feel immediately on every single email, and it reuses existing thread-fetch + Anthropic plumbing.

---

## Phase 2 — Inbox triage: priority + categories that are actually smart (~1 week)

Upgrade the existing `ai-priority` endpoint from a per-call prompt into a **standing triage layer**:

- **Priority score (0–100) + reason** per email, shown as a colored rail and an "Urgent / Important / FYI / Promotional" band. Use **Haiku 4.5** in batches (20–40 emails per call) at sync time, store on `cachedEmail` (`aiPriority Int?`, `aiCategory String?`, `aiReason String?`). Re-score only new/changed emails.
- **Smart bundles**: auto-group newsletters, receipts, calendar invites, and "needs reply" into collapsible sections at the top of the inbox ("3 need a reply · 12 newsletters · 2 receipts"). The category data already exists once scored.
- **"Catch me up"** button: one AI call summarizing everything that arrived since last visit — "While you were away: 2 things need you today (Bill's approval, the Zinnia contract), 1 meeting moved, the rest is newsletters." This is the killer demo.
- Learn from behavior: when a user archives-without-reading a sender repeatedly, down-weight; when they reply fast, up-weight. Store per-sender signals; feed them into the scorer prompt.

**Implementation:** extend `app/api/mail/ai-priority`, add the scoring fields to the schema (migration), run scoring in the sync pipeline (`lib/sync/`) with the polling-first state machine already in the codebase. Surface in `InboxClient` as bands/bundles.

---

## Phase 3 — Reply intelligence that sounds like you (~1 week)

The app already has a `voiceProfile`. Make it the centerpiece:

- **3 one-tap reply drafts** under every email ("Yes, Friday works" / "Need more detail" / "Decline politely"), each written in the user's voice (feed `voiceProfile` into the prompt). Tap → opens the composer pre-filled and editable. This is Superhuman/Shortwave's signature feature.
- **Thread-aware drafting**: the reply prompt gets the whole thread + the extracted action items from Phase 1, so "draft a reply" already addresses the actual asks and references the right names/dates.
- **Tone & length controls** (already partially in `remix`): formal/warm/brief/detailed toggles on the draft.
- **Voice profile auto-refresh**: re-analyze sent mail periodically (the `voice-profile.ts` bug where it learned from *received* mail was fixed earlier — keep it sent-only) so the voice stays current.

**Implementation:** extend `ai-reply` to return 3 variants with a structured tool; wire the variant chips into `EmailReadClient`; pass thread + insights through.

---

## Phase 4 — Agentic actions: the AI does, not just suggests (~2 weeks)

Give the model **tools** (Anthropic tool-use) so it can act on a confirmed instruction:

- "Reply to Bill that tier 2 works and propose Thursday 2pm" → drafts the reply, *and* creates a tentative calendar hold, and shows both for one-click confirm.
- "Unsubscribe me from all of these" on a newsletter bundle → finds the list-unsubscribe header, acts, reports.
- "Summarize this thread and forward to my paralegal with the key dates" → composes + attaches the extracted dates.
- Natural-language inbox commands: "show me everything from the Zinnia deal this week", "snooze all newsletters to Saturday".

**Implementation:** a single `POST /api/mail/agent` endpoint running a Fable 5 tool-use loop with a curated toolset that maps to **existing** routes (send, reply, calendar create, snooze, archive, label, search) — every tool call is server-side, ownership-checked, and **requires explicit user confirmation before any send/delete** (show the proposed action, user taps Confirm). Read the `claude-api` skill for the tool-use loop pattern. Keep a hard "no irreversible action without confirmation" rule.

---

## Cross-cutting: cost, latency, trust

- **Cache aggressively.** Summaries/insights keyed by message + last-received-time never regenerate until the thread changes. This is the difference between affordable and not.
- **Tiered models.** Haiku for the hundreds-of-emails scoring pass; Fable 5 for the on-demand summary/draft/agent calls a user actually looks at.
- **Lazy, not eager.** Generate summaries on open and drafts on request — not for every email at sync — unless the user opts into pre-generation.
- **Privacy is the selling point** (this is a law-firm app): keep all AI processing server-side through your own Anthropic key, never log email bodies to third parties, add a per-org "AI features off" switch, and document that content isn't used for training. Respect the existing sensitivity labels — optionally skip AI on attorney-client-flagged mail.
- **Always sanitize AI output** before rendering, and **never auto-send** — the AI proposes, the user disposes.
- **Streaming** the summary/draft tokens into the UI makes it feel instant even when generation takes 2–3s.

---

## Suggested sequence

1. **Phase 1** (per-email summary + action chips) — ship this first; it's the daily-felt win and reuses existing plumbing.
2. **Phase 2** (priority + "Catch me up") — the inbox-level win and the best demo.
3. **Phase 3** (voice replies) — the retention feature.
4. **Phase 4** (agentic) — the differentiator, once trust is established.

Each phase is independently shippable and independently valuable. Phase 1 alone moves EaseMail from "an email client" to "an email client that reads for you."
