# Phase 14: Shark Loans & Debt Mechanic - Research

**Researched:** 2026-03-09
**Domain:** Game state mechanics, Phone SMS UI extension, Zustand store mutation
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| MECH-02 | Shark Loans & Debt Mechanic: functional sharkDebt state, loan shark SMS contact, per-turn compounding interest, debt factored into net worth and DEBT_SPIRAL ending | All sections below directly address each requirement component |
</phase_requirements>

---

## Summary

`sharkDebt` already exists as a top-level `number` field in `GameState` (initialized to `0`) and is already read in the `nextTurn()` game-ending check: if `sharkDebt > settledNetWorth` the game ends with `DEBT_SPIRAL`. However, nothing currently writes to it — no UI to borrow, no compounding interest per turn, and `getNetWorth()` does NOT subtract it. The DEBT_SPIRAL ending description already references "the sharks came calling" and "borrowing money to buy options on meme stocks."

The messaging system is thread-based: `threads: Record<string, Thread>` where each key is the contact name. All existing contacts (Wife, Ape Friend, Brokerage, Crypto Guru, Wife's Boyfriend) are seeded in `getInitialState()` and messages are added by `nextTurn()` by mutating a `newThreads` clone. Adding "Loan Shark" as a new thread contact follows the exact same pattern. The `ChatApp` renders all threads from state, so a new thread appears automatically once it is inserted into the `threads` record.

The borrowing action must be a new GameActions method (`borrowFromShark`) that adds cash and increases `sharkDebt`. Each `nextTurn()` call should compound outstanding debt. The UI entry point belongs in `MessageThread` when the selected contact is "Loan Shark" — a special "BORROW" action button rendered at the bottom of that thread, below the message bubbles.

**Primary recommendation:** Add `borrowFromShark(amount: number)` action to the store; compound `sharkDebt` in `nextTurn()` before the end-game check; update `getNetWorth()` to subtract `sharkDebt`; seed the "Loan Shark" thread in `getInitialState()`; render a special borrow action panel inside `MessageThread` when `thread.contactName === 'Loan Shark'`.

---

## Standard Stack

No new packages are required. All work is pure TypeScript/React + Zustand patterns already established in the codebase.

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Zustand | already installed | State mutations via `set()` / `get()` | Used for all game state; no alternatives needed |
| React | already installed | Conditional UI in MessageThread | Established component pattern |

### Supporting
None — no new dependencies.

---

## Architecture Patterns

### Existing Thread System Shape

```
threads: Record<string, Thread>

Thread = {
  contactName: string
  avatar: string
  lastReadDay: number
  messages: Message[]    // messages[0] is NEWEST (prepend on insert)
}

Message = {
  id: string
  sender: string
  text: string
  day: number
}
```

The `ChatApp` reads `state.threads`, sorts them by `messages[0].day` descending, and renders a `MessageList`. Selecting a thread renders `MessageThread` with that thread. No structural changes are needed to ChatApp or MessageList — they work for any thread in state.

### Pattern 1: Seeding the Loan Shark Thread in getInitialState()

**What:** Add "Loan Shark" to the `initialThreads` object in `getInitialState()`, identical to how other contacts are initialized.
**When to use:** Always — the contact should exist from turn 1 so the player can discover it.

```typescript
// In getInitialState() inside useGameStore.ts
// Source: existing pattern at lines 212-218 of useGameStore.ts
const initialThreads: Record<string, any> = {
  'Ape Friend':    { contactName: 'Ape Friend',    avatar: '🦍', lastReadDay: 1, messages: [] },
  'Wife':          { contactName: 'Wife',           avatar: '👩', lastReadDay: 1, messages: [] },
  'Brokerage':     { contactName: 'Brokerage',      avatar: '🏛️', lastReadDay: 1, messages: [] },
  'Crypto Guru':   { contactName: 'Crypto Guru',    avatar: '📉', lastReadDay: 1, messages: [] },
  "Wife's Boyfriend": { contactName: "Wife's Boyfriend", avatar: '😎', lastReadDay: 1, messages: [] },
  // ADD:
  'Loan Shark':    { contactName: 'Loan Shark',     avatar: '🦈', lastReadDay: 1, messages: [
    { id: 'shark-intro', sender: 'Loan Shark', text: 'Heard you been losing big. I got cash, no questions asked. Fast. Easy. Hit me up.', day: 1 }
  ]},
};
```

### Pattern 2: borrowFromShark Action

**What:** A new action in `GameActions` that increments `cash` and `sharkDebt` by the same amount.
**When to use:** Triggered from the Loan Shark MessageThread UI.

```typescript
// In types.ts GameActions interface — add:
borrowFromShark: (amount: number) => void;

// In useGameStore.ts store body — add:
borrowFromShark: (amount) => {
  const { cash, sharkDebt, threads, day } = get();
  const confirmMsg: Message = {
    id: `shark-borrow-${day}`,
    sender: 'Loan Shark',
    text: `Done. $${(amount / 100).toLocaleString()} wired. Don't be late.`,
    day,
  };
  set({
    cash: cash + amount,
    sharkDebt: sharkDebt + amount,
    threads: {
      ...threads,
      'Loan Shark': {
        ...threads['Loan Shark'],
        messages: [confirmMsg, ...threads['Loan Shark'].messages],
      },
    },
  });
},
```

### Pattern 3: Compound Interest in nextTurn()

**What:** Apply a per-turn interest rate to `sharkDebt` each time `nextTurn()` runs (both during normal turns and just before end-game settlement).
**When to use:** Every turn where `sharkDebt > 0`.
**Where:** In `nextTurn()`, apply compounding BEFORE the end-of-game check and also BEFORE the normal-turn `set()` call. The debt should compound even on the final day.

```typescript
// In nextTurn(), at the very top of the function body:
const SHARK_INTEREST_RATE = 0.20; // 20% per turn
const currentDebt = get().sharkDebt;
const newDebt = currentDebt > 0
  ? Math.round(currentDebt * (1 + SHARK_INTEREST_RATE))
  : 0;

// Then use newDebt in end-game check instead of get().sharkDebt:
if (newDebt > settledNetWorth) {
  ending = 'DEBT_SPIRAL';
}

// And include in the normal-turn set() call:
set((state) => ({
  // ...existing fields...
  sharkDebt: newDebt,
}));
```

**CRITICAL detail:** Currently line 601 calls `get().sharkDebt` inside the end-game branch, which reads the OLD (un-compounded) debt. The new debt value must be computed FIRST, applied to state, and THEN checked — or computed locally and passed into both the check and the set() call.

### Pattern 4: Debt Subtracted from getNetWorth()

**What:** `getNetWorth()` currently returns `cash + stockValue + optionsValue`. It must subtract `sharkDebt`.
**Why:** The `getNetWorth()` result feeds: the wife bracket selection, the `netWorthHistory`, the daily performance calculation in Robbinghood, and the live net worth display. If debt is not subtracted here, the wife bracket will be wrong and the chart will not reflect the player's true financial position.

```typescript
// In useGameStore.ts getNetWorth:
getNetWorth: () => {
  const { cash, holdings, stocks, optionsHoldings, day, sharkDebt } = get();
  // ...existing stock and options calculations...
  return cash + stockValue + optionsValue - sharkDebt;
},
```

**Note on the end-game settled calculation:** The `settledNetWorth` in `nextTurn()` at day >= 10 is computed separately (not via `getNetWorth()`). It must ALSO subtract the newly compounded `newDebt`:

```typescript
const settledNetWorth = cash + optionPayouts + stockValue - newDebt;
```

### Pattern 5: Loan Shark Threatening Messages in nextTurn()

**What:** Per-turn, when `sharkDebt > 0`, insert a threat message into the Loan Shark thread.
**When to use:** Every turn after borrowing.
**Tone tiers:** Low debt (< net worth): mild pressure; approaching net worth: serious threats; exceeds net worth: "you're dead" messages.

The messages should be inserted into `newThreads['Loan Shark'].messages` in the same place where wife/guru messages are inserted (lines ~793–812 of useGameStore.ts).

```typescript
// After newThreads is built from processEvents():
if (newDebt > 0) {
  const debtRatio = netWorth > 0 ? newDebt / netWorth : 999;
  const sharkText = pickSharkMessage(debtRatio, newDebt);
  const sharkMsg = {
    id: `shark-${nextDayNum}`,
    sender: 'Loan Shark',
    text: sharkText,
    day: nextDayNum,
  };
  if (newThreads['Loan Shark']) {
    newThreads['Loan Shark'].messages = [sharkMsg, ...newThreads['Loan Shark'].messages];
  }
}
```

### Pattern 6: Special Borrow Panel in MessageThread

**What:** When the open thread is "Loan Shark", render a special action panel below the message bubbles (not inside them) with preset loan amounts and a "BORROW" button.
**Where to add it:** `MessageThread.tsx`, guarded by `thread.contactName === 'Loan Shark'`.
**What it needs from store:** `borrowFromShark` action, `cash`, `sharkDebt`, `gameStatus`.
**Why preset amounts:** Avoids a free-text input, is faster to implement, and fits the pixel aesthetic.

```tsx
// In MessageThread.tsx — add after the thread-messages div, before closing container:
{thread.contactName === 'Loan Shark' && (
  <SharkLoanPanel />
)}
```

`SharkLoanPanel` is a small inline component (can be defined in MessageThread.tsx) that:
- Shows current debt as "OUTSTANDING: $X"
- Shows preset buttons: [$10k] [$25k] [$50k] [$100k]
- Disables if `gameStatus === 'ended'`
- Calls `borrowFromShark(amount)` on click

### Pattern 7: Debt Display in Robbinghood Portfolio Tab

**What:** The Portfolio tab currently shows NET WORTH and CASH. Add a SHARK DEBT row.
**Where:** In Robbinghood.tsx, inside the Portfolio stats area around line 153–158.
**Style note:** Should use a negative/warning color to stand out — the 4-color palette has `#ba8b8b` (red/warning) used in the battery indicator.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Loan shark message delivery | A separate queue or event system | Inline mutation in nextTurn() (same as wife/guru) | The existing pattern at lines 793-847 of useGameStore.ts handles all per-turn message injection via direct `newThreads` mutation |
| Borrow amount validation | Complex form | Preset buttons with `cash + loan <= MAX_DEBT` guard | Simpler, fits the pixel UI, prevents unlimited borrowing exploit |
| Thread UI for new contact | A custom component | The existing `MessageThread` + `MessageList` | They are fully generic — any new entry in `threads` state is automatically rendered |

---

## Common Pitfalls

### Pitfall 1: Double-Counting Debt in DEBT_SPIRAL End-Game Check

**What goes wrong:** The current end-game branch (line 601) reads `get().sharkDebt` directly. If compounding is applied in a separate `set()` call earlier in `nextTurn()`, the check may run against the old state.
**Why it happens:** Zustand's `set()` is synchronous but the `get()` after it reflects the new state. However, the end-game branch currently RETURNS early (line 644) before the normal-turn `set()` runs — so if compounding only happens in the normal-turn `set()`, the end-game branch uses the UNCOMPOUNDED debt.
**How to avoid:** Compute `newDebt` as a local variable at the top of `nextTurn()` BEFORE the `day >= 10` branch, and use `newDebt` consistently throughout both branches.
**Warning signs:** DEBT_SPIRAL never triggers even when debt > net worth, or triggers one turn late.

### Pitfall 2: getNetWorth() Not Updated — Wife Bracket Wrong

**What goes wrong:** If `getNetWorth()` does not subtract `sharkDebt`, the wife bracket remains incorrectly high even when the player is deeply in debt.
**Why it happens:** `getNetWorth()` feeds the `wifeText` generation at line 800 of useGameStore.ts via `{ netWorth: String(netWorth) }`. The local `netWorth` variable at line 750 is computed as `nextCash + stockValue + optionsValue` — also without debt subtraction.
**How to avoid:** Subtract `newDebt` from both `getNetWorth()` return value AND the local `netWorth` variable in nextTurn().
**Warning signs:** Wife says "wonderful" while player is in the BANKRUPT bracket despite massive debt.

### Pitfall 3: settledNetWorth Ignores Debt at Game End

**What goes wrong:** `settledNetWorth` (line 571) is computed independently of `getNetWorth()`. It must explicitly subtract `newDebt` or the DEBT_SPIRAL detection check (`newDebt > settledNetWorth`) compares apples to oranges.
**Why it happens:** The settled calculation is bespoke (uses intrinsic option value, not BS price).
**How to avoid:** Add `- newDebt` to the `settledNetWorth` assignment.
**Warning signs:** DEBT_SPIRAL never fires; ending screen shows impossibly high "FINAL NET WORTH" for a player who borrowed heavily.

### Pitfall 4: Loan Shark Thread Missing on resetGame()

**What goes wrong:** `resetGame()` calls `set(getInitialState())`. If the Loan Shark thread is seeded in `getInitialState()`, reset works correctly. If it is only added dynamically, it disappears on reset.
**How to avoid:** Seed "Loan Shark" in `getInitialState()` with its intro message.

### Pitfall 5: Compounding on Turn 1 Before Any Debt Exists

**What goes wrong:** Running `Math.round(0 * 1.2)` is harmless, but adding a `newDebt > 0` guard avoids a needless mutation every turn and keeps the set() call clean.
**How to avoid:** Guard the interest logic: `const newDebt = currentDebt > 0 ? Math.round(currentDebt * 1.20) : 0;`

### Pitfall 6: Borrow Action Available After Game Ends

**What goes wrong:** The player presses a borrow button on the EndingScreen and changes state after the game is over.
**How to avoid:** In the SharkLoanPanel, read `gameStatus` from the store and disable all borrow buttons when `gameStatus === 'ended'`.

### Pitfall 7: Large Debt Breaks the netWorthHistory Chart

**What goes wrong:** The `netWorthHistory` stores values from `getNetWorth()`. If `getNetWorth()` now returns a large negative value, the chart Y-axis can invert or clip in PriceChart.
**Why it happens:** The chart is currently not tested with negative values.
**How to avoid:** This is a known acceptable edge-case for the DEBT_SPIRAL story arc. No fix needed unless it looks broken — note it as a possible visual artifact.

---

## Code Examples

### Current DEBT_SPIRAL Detection (lines 597-602 of useGameStore.ts)

```typescript
// Source: useGameStore.ts lines 597-602
if (settledNetWorth <= BEHAVIOR_WEALTH_CEILING) {
  // Check behavior endings first (DEBT_SPIRAL beats PAPER_HANDS)
  if (get().sharkDebt > settledNetWorth) {
    ending = 'DEBT_SPIRAL';
  }
  // ...
}
```

After this phase, the check should use `newDebt` (locally computed) and `settledNetWorth` should already have `newDebt` subtracted.

### Current getNetWorth() (lines 451-465 of useGameStore.ts)

```typescript
// Source: useGameStore.ts lines 451-465
getNetWorth: () => {
  const { cash, holdings, stocks, optionsHoldings, day } = get();
  const stockValue = (Object.keys(holdings) as StockTicker[]).reduce((total, ticker) => {
    return total + (stocks[ticker].currentPrice * holdings[ticker]);
  }, 0);
  const optionsValue = optionsHoldings.reduce((total, option) => {
    const stock = stocks[option.ticker];
    const tRemaining = Math.max(0.0001, (option.expiryDay - day) / 252);
    const marketValue = calculateOptionPrice(stock.currentPrice, option.strikePrice, option.type, stock.iv, tRemaining);
    return total + (marketValue * option.amount);
  }, 0);
  return cash + stockValue + optionsValue;
  // NEEDS: - sharkDebt
},
```

### Wife Message Selection in nextTurn() (line 800 of useGameStore.ts)

```typescript
// Source: useGameStore.ts line 800
// netWorth is a LOCAL variable (cash + stocks + options — no debt subtraction yet)
const wifeText = getRandomTemplate('WIFE', 'NEUTRAL', { netWorth: String(netWorth) });
```

After this phase, the `netWorth` local variable must subtract `newDebt` so wife brackets reflect true financial standing.

### TemplateCategory Type (messageTemplates.ts line 3)

```typescript
export type TemplateCategory = 'WIFE' | 'GURU' | 'APES' | 'BROKERAGE' | 'IRS' | 'LAMBO' | 'STALKER' | 'COWORKER';
```

To support structured shark message templates, add `'SHARK'` to this union and add a `SHARK` entry to `MESSAGE_TEMPLATES` in messageTemplates.ts.

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| sharkDebt = 0, never modified | sharkDebt initialized to 0, read in end-game check but never written | Phase 14 makes it writable via borrowFromShark and self-compounding in nextTurn |
| DEBT_SPIRAL check uses `get().sharkDebt` (stale within same nextTurn call) | Must be replaced with locally-computed `newDebt` variable | Fixes off-by-one turn triggering |
| getNetWorth() omits debt | Must subtract sharkDebt | Fixes wife bracket, chart, portfolio display |

---

## Open Questions

1. **Maximum borrowable debt / loan cap**
   - What we know: No cap currently specified in requirements or roadmap.
   - What's unclear: Should the player be able to borrow unlimited amounts? Or is there a cap (e.g., 2x starting capital)?
   - Recommendation: Use Claude's discretion — implement a max single-borrow of $100k (10,000,000 cents) and allow multiple borrows with no overall cap. This lets the death spiral be as deep as the player wants while preventing trivially large single inputs.

2. **Preset borrow amounts**
   - What we know: Requirements specify "accessible via phone's SMS", no specific UX details.
   - What's unclear: Free-text input vs. preset amounts.
   - Recommendation: Preset buttons ($10k, $25k, $50k, $100k) — consistent with the game's pixel/arcade feel and avoids decimal/validation complexity.

3. **Wife bracket when debt pushes net worth negative**
   - What we know: WIFE_BRACKETS has `{ min: -Infinity, max: 0, key: 'BANKRUPT' }` as the lowest bracket.
   - What's unclear: Should debt-driven negative net worth trigger BANKRUPT wife messages sooner/more intensely than market losses alone?
   - Recommendation: No special logic needed — if `getNetWorth()` returns a negative number, `getWifeBracket()` will naturally return `'BANKRUPT'` via the existing `-Infinity to 0` bracket.

4. **Debt display on EndingScreen for DEBT_SPIRAL**
   - What we know: EndingScreen shows `finalNetWorth` and `karma`. `finalNetWorth` is set to `settledNetWorth` which will now include debt subtraction.
   - What's unclear: Should it also show the final shark debt amount separately?
   - Recommendation: Add a third stat row `StatRow label="SHARK DEBT"` on the EndingScreen, reading `state.sharkDebt`. This requires reading `sharkDebt` in EndingScreen.tsx.

---

## Implementation Plan Overview (for planner)

This phase naturally decomposes into three plans:

**Plan 14-01 — Store Layer:**
- Add `borrowFromShark(amount: number)` to `GameActions` interface in types.ts
- Implement `borrowFromShark` in useGameStore.ts (adds cash, adds debt, posts confirmation message)
- Seed "Loan Shark" thread in `getInitialState()`
- Compute `newDebt` at top of `nextTurn()` with 20% compounding
- Update `getNetWorth()` to subtract `sharkDebt`
- Update the local `netWorth` variable in nextTurn() to subtract `newDebt`
- Update `settledNetWorth` to subtract `newDebt`
- Update DEBT_SPIRAL check to use `newDebt` and debt-adjusted `settledNetWorth`
- Add SHARK templates to messageTemplates.ts; insert per-turn shark threat messages

**Plan 14-02 — UI Layer:**
- Add `SharkLoanPanel` component inside MessageThread.tsx (conditional on contact name)
- Add SHARK DEBT row to Robbinghood Portfolio tab

**Plan 14-03 — Verification:**
- TypeScript clean build (`tsc --noEmit`)
- Manual test: borrow on Day 2, verify debt compounds on Day 3, verify wife goes BANKRUPT when net worth goes negative, verify DEBT_SPIRAL ending fires on Day 10

---

## Sources

### Primary (HIGH confidence)
- Direct code inspection of `src/store/useGameStore.ts` — complete nextTurn(), getNetWorth(), getInitialState(), DEBT_SPIRAL detection logic
- Direct code inspection of `src/store/types.ts` — GameState, Thread, Message, GameActions interfaces
- Direct code inspection of `src/data/messageTemplates.ts` — TemplateCategory, getRandomTemplate, WIFE_BRACKETS
- Direct code inspection of `src/components/Apps/Phone/ChatApp.tsx`, `MessageList.tsx`, `MessageThread.tsx`, `PhoneApp.tsx`
- Direct code inspection of `src/components/Feedback/EndingScreen.tsx` — DEBT_SPIRAL ending content
- Direct code inspection of `src/components/Trade/Robbinghood.tsx` — Portfolio tab stats display

### Secondary (MEDIUM confidence)
- Zustand documentation pattern: `set()` + `get()` within same action for state that depends on current state — standard Zustand usage, confirmed by codebase patterns in buyStock, sellOption, etc.

---

## Metadata

**Confidence breakdown:**
- Store architecture: HIGH — read complete source files
- Thread/messaging patterns: HIGH — read all Phone UI components
- Interest compounding approach: HIGH — simple math, the pattern is clear
- DEBT_SPIRAL bug (stale get() in end-game branch): HIGH — confirmed by reading lines 557-644 of useGameStore.ts
- Preset borrow amounts UX: MEDIUM — design choice, no prior art in codebase

**Research date:** 2026-03-09
**Valid until:** 2026-04-08 (stable codebase, no external dependencies)
