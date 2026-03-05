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
