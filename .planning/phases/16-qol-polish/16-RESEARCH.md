# Phase 16: QoL Polish - Research

**Researched:** 2026-03-17
**Domain:** React/Zustand game state, CSS theming, content expansion
**Confidence:** HIGH

---

## Summary

Phase 16 is a pure in-codebase polish pass with no external library requirements. All five
deliverables operate on existing patterns that are already established in the project.

The five work items are: (1) gate NEXT DAY behind `marketTime >= 960`, (2) gate buy/sell/option
actions behind `marketIsOpen`, (3) deliver `pendingMessages` at random intraday times or on
≥10% net-worth swing instead of only at day-start, (4) expand `GURU_PREDICTIONS` from 5 entries
per sentiment to 15 per ticker per sentiment (90 total across 6 tickers), and (5) add an explicit
light text color to the body paragraphs inside `ReaditTab.tsx` because they inherit black from
the laptop browser's light `#e0dbcb` background.

**Primary recommendation:** All five items are surgical, self-contained changes with zero
external dependencies. The correct execution order is CSS fix first (trivial, no logic risk),
then market-hour gates (two independent locations), then intraday message scheduling, then
GuruTube content.

---

## Standard Stack

No new libraries are required. Existing stack covers everything:

| Library | Version in Use | Purpose |
|---------|---------------|---------|
| zustand | already installed | game state, `marketIsOpen`, `pendingMessages` |
| react | already installed | component rendering, `disabled` prop |
| framer-motion | already installed | existing UI (no new animation needed) |

**Installation:** none required.

---

## Architecture Patterns

### Existing Market-State Flow
```
useMarketClock (2s interval)
  └─ tickMarket() in useGameStore.ts
       ├─ increments marketTime by 1 (minutes)
       ├─ sets marketIsOpen = (marketTime >= 570 && marketTime < 960)
       └─ delivers pendingMessages when pm.deliverAt <= newTime
```

`marketIsOpen` and `marketTime` are exposed directly from `useGameStore` and already used in
`App.tsx` for the clock display. Market closes at `marketTime === 960` (4:00 PM).

### NEXT DAY Button — Location
`App.tsx` line 49:
```tsx
<button className="next-turn-btn" style={{ position: 'static' }} onClick={advanceDay}>
  NEXT DAY
</button>
```
`advanceDay` is already imported from `useGameStore`. `marketTime` and `marketIsOpen` are
already destructured in the same component. The fix is:
- Pull `marketTime` from store (already done).
- Add `disabled={marketIsOpen || marketTime < 960}` — market is still open OR hasn't
  reached close yet.
- Add `opacity` and `cursor: not-allowed` via the `disabled` attribute or conditional style.

The threshold is `marketTime < 960` (not `marketIsOpen`, because `marketIsOpen` becomes false
the moment the clock passes 960 — so `!marketIsOpen && marketTime >= 960` is the "market
has closed today" condition). Simplest expression: `disabled={marketTime < 960}` is sufficient
because the clock stops at 1439 and can only reach 960+ after market close.

### Trading Gates — Location
`Robbinghood.tsx` already imports `marketIsOpen` from the store (line 54). The SwipeConfirm
components (lines 535–553) accept a `disabled` prop. Each buy/sell SwipeConfirm needs:
```tsx
disabled={tradeAmount === 0 || !marketIsOpen}
```
Similarly the ALL IN / SELL ALL shortcut buttons (lines 502–526) should become inert when
`!marketIsOpen` — either by disabling them or by the SwipeConfirm gate being sufficient.

The OptionsChain selector can remain active after close (player can browse strikes), only
the actual swipe-to-buy/sell should be blocked.

Visual pattern already in the codebase: buttons use `cursor: not-allowed; opacity: 0.5` in
`.all-in-btn:disabled` or via conditional inline styles. Check Robbinghood.css for existing
`.all-in-btn` rules before adding new styles.

### Intraday Message Scheduling — Current vs. Target

**Current behavior:** All narrative messages (`Wife`, `Ape Friend`, `Guru`, extra contacts)
are generated inside `advanceDay()` and immediately pushed to `threads`. They appear
at day-start (when `advanceDay` is called).

**Target behavior:** Messages delivered at random minutes during market hours, or immediately
when net worth changes by ≥10% in a single tick.

**Mechanism already exists:** The store already has `pendingMessages: ScheduledMessage[]`
(type defined in `types.ts` line 141–145) and `tickMarket()` already delivers them
(lines 851–865 in `useGameStore.ts`). The infrastructure is wired and working — it was
built for Phase 15 but never populated by `advanceDay`.

**Implementation path:**
1. In `advanceDay()`, instead of pushing messages directly into `threads`, wrap each
   message as a `ScheduledMessage` with a random `deliverAt` in the range 570–959
   (market hours, 9:30am–4pm).
2. Push them to `pendingMessages` in the `set()` call at the end of `advanceDay`.
3. For the net-worth trigger: inside `tickMarket()`, after computing `currentNetWorth`,
   compare it against the previous tick's net worth (or the start-of-day net worth).
   If change ≥ 10%, create an immediate `ScheduledMessage` with `deliverAt = newTime`
   for the current most-relevant contact (Wife is the most logical choice for a big swing).
   Alternatively use a simpler "snapshot at day start" approach: store `dayOpenNetWorth`
   and compare in each tick.

**Key constraint:** `pendingMessages` is in the `partialize` exclusion list (line 1451) —
it is NOT persisted to localStorage. This means if the user refreshes mid-day the queue is
lost, which is acceptable for a game context and consistent with how `intradayBars` work.

### GuruTube Content Expansion

**Current structure:** `GURU_PREDICTIONS` in `messageTemplates.ts` (line 999) has two keys:
`BULLISH` (5 entries) and `BEARISH` (5 entries). These are ticker-agnostic — the ticker is
substituted via `{ticker}` placeholder.

**Target structure (per requirements):**
- 15 messages per ticker per sentiment (down/flat/up), 6 tickers × 3 sentiments × 5 messages
  minimum = 90 total.
- The requirement says "5 for predicted huge move down, 5 for moderate movement, 5 for huge
  move up" per ticker.

**Implementation options:**

Option A — Ticker-keyed lookup (most precise):
```ts
export const GURU_VIDEO_MESSAGES: Record<StockTicker, {
  DOWN: string[];
  FLAT: string[];
  UP: string[];
}> = {
  '$GAME': { DOWN: [...5 msgs], FLAT: [...5 msgs], UP: [...5 msgs] },
  // ... 6 tickers total
};
```
Used in `GuruTube.tsx` or `advanceDay()` by detecting sentiment from the `guruPrediction`
field and replacing the current `getRandomPrediction` call.

Option B — Keep flat structure, expand to 15 entries each (less per-ticker flavor):
```ts
BULLISH: [...15 ticker-agnostic messages],
BEARISH: [...15 ticker-agnostic messages],
FLAT:    [...15 ticker-agnostic messages],
```
Add a FLAT sentiment key alongside BULLISH/BEARISH, and pick based on % change magnitude.

**Recommendation:** Option B is lower-risk (existing `getRandomPrediction` call site barely
changes, just add FLAT and expand counts). Option A delivers richer per-ticker flavor but
requires touching more call sites. Given the success criteria says "≥15 unique messages per
ticker per sentiment", Option A is the correct read. However, because the current `guruPrediction`
only stores `BULLISH | BEARISH` sentiment, adding FLAT requires changing the type and the
selection logic in `advanceDay`.

The cleanest approach: create a new `GURU_TICKER_MESSAGES` constant structured by ticker and
sentiment (`UP`/`FLAT`/`DOWN`), add a helper `getGuruVideoMessage(ticker, sentiment)`, and
call it from `advanceDay()` using price comparison to determine which of UP/FLAT/DOWN to use.

**GuruTube component:** Currently the advice displayed in the scrolling marquee at the bottom
of `GuruTube.tsx` comes from `threads['Crypto Guru'].messages[0].text` — the most recent
Guru thread message. The video itself shows an emoji face. Changing content data in
`messageTemplates.ts` is sufficient; the component rendering code needs no structural change.

### Readit Forum Text Visibility — Root Cause

`ReaditTab.tsx` renders inside `LaptopBrowser`'s `.browser-content` div. That div has:
```css
/* LaptopBrowser.css line 90-95 */
.browser-content {
  background-color: #e0dbcb;  /* light cream */
}
```
The `browser-content` container has no `color` property set, so it inherits the browser
default which is `black` (or very dark) text.

The text body inside `ReaditTab.tsx` uses this structure:
```tsx
<div style={{ fontSize: '0.78em', lineHeight: '1.5', opacity: 0.9, marginBottom: '8px' }}>
  <p>...</p>
```
No `color` is set on these `<p>` tags. The `.forum-post` CSS class sets `background-color:
#2b2b26` (very dark) but does NOT set `color`. Result: dark text on dark background.

**Fix options:**
1. Add `color: '#e0dbcb'` to the body text `<div>` wrapper in `ReaditTab.tsx` — minimal, no
   CSS change needed.
2. Add `color: #e0dbcb` to `.forum-post` in `Phone.css` — global, would affect WsbForum on
   phone too (which works correctly because `phone-app-container` already sets the right
   color). Safe addition.
3. Set `color: '#e0dbcb'` on the outermost `ReaditTab` wrapper div — most reliable, one line.

**Recommendation:** Option 3. Add `color: '#e0dbcb'` inline on the outermost `<div>` in
`ReaditTab.tsx`. This is contained, requires no new CSS rules, and follows the existing
pattern of using inline styles for colors in this codebase.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead |
|---------|-------------|-------------|
| Message queue | Custom delivery system | Existing `pendingMessages` + `tickMarket` delivery |
| Trade blocking | Custom permission system | `disabled` prop on SwipeConfirm |
| Button gating | JS onClick guards | HTML `disabled` attribute + CSS `:disabled` |
| Content randomization | Custom picker | Existing `getRandomTemplate` / new static lookup |

---

## Common Pitfalls

### Pitfall 1: NEXT DAY Condition Wrong Direction
**What goes wrong:** Using `disabled={!marketIsOpen}` would disable the button during
pre-market AND post-market, preventing day advance even after close.
**How to avoid:** Condition must be `disabled={marketTime < 960}`. Once `marketTime` hits
960 the clock continues to tick to 1439 but `marketIsOpen` is already false. The correct
gate is "has the market closed today" = `marketTime >= 960`.

### Pitfall 2: Blocking Sells as Well as Buys After Close
**What goes wrong:** Real markets allow limit orders but the requirement says "disable trading
after market closed" — this means ALL trades (buy AND sell). The user spec is unambiguous.
Both buy and sell SwipeConfirm components need the `!marketIsOpen` gate.
**How to avoid:** Apply `disabled={!marketIsOpen || tradeAmount === 0}` to ALL SwipeConfirm
instances in the Trade tab, both STOCK and OPTION modes.

### Pitfall 3: pendingMessages Queue Grows Unboundedly
**What goes wrong:** If `advanceDay` adds 3–5 messages every day as ScheduledMessage entries,
and some days the market is skipped (DEBUG +1h button), undelivered messages pile up.
**How to avoid:** In `advanceDay`, clear `pendingMessages` as part of the reset set:
```ts
pendingMessages: newPendingMessages.filter(m => !m.delivered), // clear old delivered
```
The `advanceDay` set already resets `marketTime` and `intradayBars`; add
`pendingMessages: []` to that reset (undelivered from previous day are discarded, which is
intentional — they were mid-session messages for the day that just ended).

### Pitfall 4: Net-Worth Trigger Fires Excessively
**What goes wrong:** During market events, a 30% price spike can register as a 10%+ net-worth
swing every few ticks if the player is heavily positioned, flooding the message queue.
**How to avoid:** Track a `lastNetWorthSwingMessage: number` (marketTime) in state and gate
the trigger to only fire at most once per day, or once per 60-minute window. Use a simple
flag like `netWorthTriggerFiredToday: boolean` reset in `advanceDay`. Add it as a transient
field excluded from persist `partialize`.

### Pitfall 5: GuruTube 90-message requirement miscounted
**What goes wrong:** Writing 15 generic messages and claiming "15 per ticker" because
`{ticker}` is substituted. The success criteria says "≥15 unique messages per ticker" — if
using a ticker-keyed structure, each ticker must have 15 distinct strings not shared.
**How to avoid:** Use a fully keyed structure `Record<StockTicker, {DOWN,FLAT,UP}[]>` where
each leaf is a string array of ≥5 unique items. Count: 6 tickers × 3 sentiments × 5 msgs =
90 minimum. Each ticker's messages should reference the ticker name specifically for flavor.

---

## Code Examples

### NEXT DAY Gating (App.tsx)
```tsx
// Source: existing App.tsx structure
const marketTime = useGameStore((state) => state.marketTime);
// marketIsOpen already destructured

<button
  className="next-turn-btn"
  style={{ position: 'static', opacity: marketTime < 960 ? 0.4 : 1, cursor: marketTime < 960 ? 'not-allowed' : 'pointer' }}
  onClick={advanceDay}
  disabled={marketTime < 960}
>
  NEXT DAY
</button>
```

### Trade Gating (Robbinghood.tsx)
```tsx
// marketIsOpen already destructured from useGameStore at line 54
// Apply to all SwipeConfirm instances:
<SwipeConfirm
  label={`SWIPE TO BUY ${tradeAmount} SHARES`}
  onConfirm={handleBuy}
  disabled={tradeAmount === 0 || !marketIsOpen}
/>
```

### Intraday Message Scheduling (useGameStore.ts advanceDay)
```ts
// Instead of pushing to newThreads[sender].messages directly:
const deliverAt = 570 + Math.floor(Math.random() * 390); // random 9:30am–4:00pm
const scheduledMsg: ScheduledMessage = {
  message: { ...wifeMessage },
  deliverAt,
  delivered: false,
};
// Collect all scheduled messages, then include in set():
set((state) => ({
  ...normalFields,
  pendingMessages: [...scheduledMessages], // replaces old pending
}));
```

### Net-Worth Swing Trigger (useGameStore.ts tickMarket)
```ts
// After computing currentNetWorth:
const prevNetWorth = state.netWorthBars.length > 0
  ? state.netWorthBars[0].open  // opening net worth of the day
  : state.netWorthHistory[state.netWorthHistory.length - 1]?.value ?? currentNetWorth;
const swingPct = prevNetWorth > 0 ? Math.abs(currentNetWorth - prevNetWorth) / prevNetWorth : 0;
if (swingPct >= 0.10 && !state.netWorthTriggerFiredToday && newIsOpen) {
  // create immediate pending message
}
```

### Readit Text Color Fix (ReaditTab.tsx)
```tsx
// Outermost div — add color inline style:
<div
  className="phone-app-content"
  style={{ padding: '8px', overflowY: 'auto', height: '100%', boxSizing: 'border-box', color: '#e0dbcb' }}
>
```

### GuruTube Content Structure (messageTemplates.ts)
```ts
export const GURU_VIDEO_MESSAGES: Record<StockTicker, { DOWN: string[]; FLAT: string[]; UP: string[] }> = {
  '$GAME': {
    DOWN: [
      "GAMEGO in full meltdown. I called this. Diamond hands are now dust hands.",
      // ... 4 more unique to $GAME bearish
    ],
    FLAT: [
      "GAMEGO chopping sideways. The algos are bored. So am I.",
      // ...
    ],
    UP: [
      "GAMEGO breaking out. I told you to buy the dip. Did you listen?",
      // ...
    ],
  },
  // ... repeat for '$APE', '$POPC', '$GOOGO', '$APPO', '$BERG'
};
```

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| NEXT DAY always clickable | Gate on `marketTime >= 960` | Prevents exploiting day skip mid-session |
| Messages arrive at day start | Scheduled via `pendingMessages` + random `deliverAt` | Feels live and dynamic |
| 5 BULLISH / 5 BEARISH guru strings | 15 per ticker per sentiment keyed lookup | More variety, ticker-specific flavor |
| ReaditTab inherits black text | Explicit `color: #e0dbcb` | Readable on dark `#2b2b26` forum-post bg |

---

## Open Questions

1. **Net-worth trigger: use opening-of-day vs. per-tick delta?**
   - What we know: `netWorthBars[0].open` gives the opening net worth for the day.
   - What's unclear: Whether a ≥10% swing should be measured from day open or from the
     previous tick.
   - Recommendation: Use day-open baseline. Comparing against `netWorthBars[0].open`
     avoids false triggers from steady drift and matches user expectation of "big change
     within the day."

2. **ALL IN / SELL ALL buttons after market close**
   - The buttons currently set `tradeAmount` but don't execute a trade. Since SwipeConfirm
     is the actual execution gate, ALL IN / SELL ALL can stay functional (they only update
     local component state). No separate gating needed on these buttons.

3. **GuruTube video face / ticker-aware visual**
   - The current `GuruTube.tsx` uses emoji faces. The requirement is about message text
     only. No visual change to the video player component is needed.

---

## Phase Requirements

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| UX-02 | QoL Polish: market-hour gating (NEXT DAY and trading disabled while market is open), intraday message scheduling (random timing + net-worth triggers), GuruTube content expanded to ≥15 messages per ticker per sentiment (≥90 total), readit forum text legible | All five sub-items investigated. Implementation paths identified for each. No blockers found. |
</phase_requirements>

---

## Sources

### Primary (HIGH confidence)
- Direct code audit: `src/App.tsx` — NEXT DAY button location and existing `marketTime` usage
- Direct code audit: `src/store/useGameStore.ts` — `tickMarket`, `advanceDay`, `pendingMessages` delivery
- Direct code audit: `src/store/types.ts` — `ScheduledMessage`, `GameState` fields
- Direct code audit: `src/components/Trade/Robbinghood.tsx` — SwipeConfirm `disabled` prop usage
- Direct code audit: `src/components/Laptop/ReaditTab.tsx` — text node color issue
- Direct code audit: `src/components/Laptop/LaptopBrowser.css` — `.browser-content` background
- Direct code audit: `src/components/Apps/Phone/Phone.css` — `.forum-post` color rules
- Direct code audit: `src/data/messageTemplates.ts` — `GURU_PREDICTIONS` current size

### Secondary (MEDIUM confidence)
- State.md Phase 15 decisions: confirms `pendingMessages` field purpose and `partialize` exclusion
- Requirements.md UX-02: confirms success criteria thresholds (≥15 per ticker, ≥90 total, marketTime ≥ 960)

---

## Metadata

**Confidence breakdown:**
- NEXT DAY gate: HIGH — button and condition locations confirmed in source
- Trade gate: HIGH — `marketIsOpen` already in Robbinghood, `disabled` prop confirmed on SwipeConfirm
- Intraday messaging: HIGH — `pendingMessages` + delivery in `tickMarket` confirmed working
- GuruTube content: HIGH — data structure and call site fully understood, writing content is straightforward
- Readit text fix: HIGH — root cause confirmed (no `color` on ReaditTab body text, parent inherits browser black)

**Research date:** 2026-03-17
**Valid until:** 2026-04-17 (stable codebase, no external deps)
