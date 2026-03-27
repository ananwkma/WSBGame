# Phase 12: Multiple Endings Expansion - Research

**Researched:** 2026-03-08
**Domain:** Game state logic, TypeScript type system, React component content, Zustand store mutations
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**The 10 Endings**

Wealth-based (evaluated after behavior checks fail):

| # | Name | Net Worth Condition |
|---|------|---------------------|
| 1 | MENDYS | ≤ $80,000 |
| 2 | BREAK EVEN | $80k – $120k (roughly what the player started with) |
| 3 | SMALL WINS | $120k – $300k |
| 4 | TENDIES | $300k – $1M |
| 5 | TO THE MOON | $1M – $10M |
| 6 | HEDGE FUND DARLING | $10M – $100M |
| 7 | WOLF OF WALL STREET | $100M – $1B |
| 8 | PRIVATE ISLAND | $1B+ |

Behavior-based (checked first; only override if final wealth ≤ $100k):

| # | Name | Trigger Condition |
|---|------|-------------------|
| 9 | DEBT SPIRAL | `sharkDebt > finalNetWorth` (debt exceeds everything you have — effectively negative) |
| 10 | PAPER HANDS | finalNetWorth < $100k AND `peakOpportunityCost >= $1,000,000` (sold a position that would have been worth $1M+ at game end) |

**Priority & Conflict Resolution**

1. Behavior endings check first, but only apply if finalNetWorth ≤ $100k.
   - If player ended rich (>$100k), they get a wealth ending regardless of behavior.
2. DEBT SPIRAL beats PAPER HANDS when both conditions are met simultaneously.
3. If no behavior ending qualifies, fall through to the wealth bracket table.

**Opportunity Cost Infrastructure**

- Track a `peakOpportunityCost` value in game state (number, starts at 0).
- When a player sells any position, calculate what that position would be worth at game end (day 10 prices × amount sold). If this exceeds the current `peakOpportunityCost`, update it.
- Expose a `getOpportunityCost()` helper function (or derived state) for future features to reference.
- This value is used ONLY for PAPER HANDS detection in this phase — future phases may use it for other mechanics.

**Visual Treatment**

- Same card layout for all endings (no per-ending layout redesign).
- Each ending gets a unique color for the card border and title.
- Medium ASCII art (10–15 lines) depicting the ending scenario, placed below the description text.
- Art should be readable in a monospace font and fit the pixel/retro aesthetic of the game.

**Tone**

- All endings use the same WSB-ironic voice throughout — dark humor, self-aware, sarcastic.
- Tone does NOT escalate with wealth. Even PRIVATE ISLAND ($1B+) is self-deprecating and unhinged.
- The copy should feel like a Reddit post title from r/wallstreetbets.

**Replacing Existing Endings**

- MOON, LEGEND, MENDYS are fully replaced.
- `EndingType` in `types.ts` will be updated to reflect all 10 new ending keys.
- `ENDING_CONTENT` in `EndingScreen.tsx` will be rebuilt with all 10 entries.

### Claude's Discretion

- Specific copy/description text for each ending (constrained by tone rules above)
- Specific ASCII art content for each ending (constrained by style guidance in CONTEXT.md)
- Specific color chosen per ending (constrained: must be unique per ending)

### Deferred Ideas (OUT OF SCOPE)

- Opportunity cost display during gameplay (show missed gains) — future phase
- OPTIONS GOD / ONE TRICK PONY / LEGEND endings — removed from this phase's scope
- Shark loan / debt mechanic gameplay implementation — separate phase
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| NARR-10 | Not explicitly defined in REQUIREMENTS.md (ECON-04 covers multi-endings at ≥3; NARR-10 is the expanded version) | This phase supersedes ECON-04 by expanding from 3 to 10 distinct endings with behavior-based triggers, unique visuals, and WSB-ironic copy. Research confirms the full implementation path through existing Zustand store, types.ts, and EndingScreen.tsx. |
</phase_requirements>

---

## Summary

Phase 12 is a pure in-codebase refactor with content generation. No new libraries are required. The work touches exactly four files: `src/store/types.ts` (EndingType union), `src/store/useGameStore.ts` (ending detection logic + peakOpportunityCost state), `src/components/Feedback/EndingScreen.tsx` (ENDING_CONTENT map + ASCII art renderer), and `src/styles/pixel.css` (ASCII art pre-block styling if needed).

The existing ending detection lives in `nextTurn()` in `useGameStore.ts` at line 561–583. The current logic is 3 lines. It must be replaced with the 10-ending priority cascade described in CONTEXT.md. The `sellStock` and `sellOption` actions are the two points where `peakOpportunityCost` must be updated — both already exist and are simple set() calls.

The biggest complexity in this phase is the ASCII art display. The `ending-card` CSS has `text-align: center` and no `pre` tag styling. ASCII art requires a `<pre>` element with a monospace font and `white-space: pre`. The current CSS has a `font-family: monospace` on `.stat-row` but not on the card body, so a `.ending-ascii` class is needed. The Game Boy Pocket palette filter (`PaletteFilter`) applies via SVG `feColorMatrix` globally, so the unique colors per ending will be remapped through the palette — **this is a known pitfall**. Colors must be chosen to survive the `feColorMatrix` transform, not just look good in their raw hex form.

**Primary recommendation:** Implement in three discrete tasks — (1) state layer: add `peakOpportunityCost` to GameState/types.ts and update sell actions + ending detection in useGameStore.ts, (2) content layer: rebuild ENDING_CONTENT in EndingScreen.tsx with all 10 entries including ASCII art, (3) style layer: add `.ending-ascii` CSS class and verify colors survive the palette filter.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Zustand | Already installed (persist middleware in use) | Game state management | Already the project store — `peakOpportunityCost` is a plain number field in `GameState` |
| React | Already installed | EndingScreen component | `EndingScreen.tsx` is already a functional component; extend in place |
| TypeScript | Already installed | Type safety for EndingType union | `EndingType` is defined in `types.ts` line 68 — extend the union |

### Supporting

No new packages required. All work is within existing project files.

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Hard-coded ENDING_CONTENT object | Separate endings data file | A separate file adds indirection for no gain — the data is consumed only in EndingScreen.tsx. Keep co-located. |
| Inline ASCII art strings | Imported text assets | ASCII strings inline in the ENDING_CONTENT object are simpler — no import chain needed. |

**Installation:**
```bash
# No new packages needed
```

---

## Architecture Patterns

### Files to Modify

```
src/
├── store/
│   ├── types.ts              # Extend EndingType union, add peakOpportunityCost to GameState
│   └── useGameStore.ts       # Update getInitialState(), sellStock(), sellOption(), nextTurn()
├── components/
│   └── Feedback/
│       └── EndingScreen.tsx  # Rebuild ENDING_CONTENT map, add ASCII art <pre> block
└── styles/
    └── pixel.css             # Add .ending-ascii CSS class
```

### Pattern 1: EndingType Union Replacement

**What:** Replace the 3-value union with 10 new ending keys. The old keys `MOON | LEGEND | MENDYS` are removed entirely. All 10 new keys are added.

**When to use:** Any time the ending set changes — just update the union and the ENDING_CONTENT map will give a TypeScript error if any key is missing.

**Example:**
```typescript
// src/store/types.ts — replace line 68
export type EndingType =
  | 'MENDYS'
  | 'BREAK_EVEN'
  | 'SMALL_WINS'
  | 'TENDIES'
  | 'TO_THE_MOON'
  | 'HEDGE_FUND_DARLING'
  | 'WOLF_OF_WALL_STREET'
  | 'PRIVATE_ISLAND'
  | 'DEBT_SPIRAL'
  | 'PAPER_HANDS';
```

Note: Use SCREAMING_SNAKE_CASE to match existing codebase conventions (see current `'MOON' | 'LEGEND' | 'MENDYS'`).

### Pattern 2: peakOpportunityCost State Field

**What:** Add a `peakOpportunityCost: number` field to `GameState` (starts at 0). Updated in `sellStock()` and `sellOption()` by calculating the hypothetical end-value of the sold position using current day-10 prices or a forward estimate.

**Critical implementation detail:** "What that position would be worth at game end (day 10 prices × amount sold)" — but the game has not ended yet when the player sells. The correct interpretation from CONTEXT.md is: **at the moment of selling, multiply the current price × amount sold and compare against the final settled price**. However, game-end prices are only known at end-of-game. The practical approach (confirmed by CONTEXT.md wording "calculate what that position would be worth at game end") is:

- Record sell transactions with `(amount, ticker, sellDay)`.
- At game end, during the `day >= 10` branch in `nextTurn()`, iterate tradeHistory for SELL entries and compute `finalPrice[ticker] * amountSold`. Track the peak across all sells.
- This avoids forward-looking price knowledge during mid-game.

**Alternative simpler approach** (also valid per CONTEXT.md): at the moment of each sell, store `(amount × currentPrice)` as a proxy. Then at game end, update `peakOpportunityCost` by recomputing from tradeHistory. The CONTEXT.md says to compute it "at game end" for the PAPER HANDS check, so either: compute lazily at end, or recompute from tradeHistory. The cleanest approach is lazy: compute it only inside the `day >= 10` block before selecting the ending.

**Example:**
```typescript
// In getInitialState() — add to returned object:
peakOpportunityCost: 0,

// In GameState interface — add field:
peakOpportunityCost: number;

// In nextTurn(), inside the day >= 10 block — compute before ending detection:
const finalPrices = stocks; // already settled stocks at this point
const peakOpportunityCost = (Object.keys(finalPrices) as StockTicker[]).reduce((peak, ticker) => {
  const finalPrice = finalPrices[ticker].currentPrice;
  const tickerSells = get().tradeHistory.filter(t => t.type === 'SELL' && t.ticker === ticker);
  const hypotheticalValue = tickerSells.reduce((sum, t) => sum + (finalPrice * t.amount), 0);
  return Math.max(peak, hypotheticalValue);
}, 0);
```

Note: `peakOpportunityCost` for OPTION sells would require similar logic (amount × finalIntrinsicValue). See pitfalls section.

### Pattern 3: getOpportunityCost() Helper

**What:** A selector or action on the store that returns `peakOpportunityCost` for external consumers.

**Example:**
```typescript
// In GameActions interface — add:
getOpportunityCost: () => number;

// In store implementation:
getOpportunityCost: () => get().peakOpportunityCost,
```

### Pattern 4: Ending Detection Priority Cascade

**What:** Replace the 3-line ending selection in `nextTurn()` (lines 577–579) with a priority cascade.

**When to use:** Called once, at end of game. Order matters — behavior endings evaluated first, wealth last.

**Example:**
```typescript
// Replace lines 577-579 in nextTurn():
let ending: EndingType;
const netWorthDollars = settledNetWorth / 100; // convert cents to dollars

if (netWorthDollars <= 100000) {
  // Behavior endings only apply when player is not rich
  if (get().sharkDebt > settledNetWorth) {
    ending = 'DEBT_SPIRAL';
  } else if (netWorthDollars < 100000 && peakOpportunityCost >= 100000000) {
    // peakOpportunityCost in cents — $1M = 100000000 cents
    ending = 'PAPER_HANDS';
  } else {
    // Fall through to wealth brackets at low net worth
    ending = netWorthDollars <= 80000 ? 'MENDYS' : 'BREAK_EVEN';
  }
} else {
  // Wealth brackets — player is above $100k
  if (netWorthDollars < 300000) ending = 'SMALL_WINS';
  else if (netWorthDollars < 1000000) ending = 'TENDIES';
  else if (netWorthDollars < 10000000) ending = 'TO_THE_MOON';
  else if (netWorthDollars < 100000000) ending = 'HEDGE_FUND_DARLING';
  else if (netWorthDollars < 1000000000) ending = 'WOLF_OF_WALL_STREET';
  else ending = 'PRIVATE_ISLAND';
}
```

**IMPORTANT:** All monetary values in the store are in **cents** (cash starts at 10000000 = $100,000). The `settledNetWorth` computed in `nextTurn()` is also in cents. Thresholds from CONTEXT.md are in dollars. Multiply dollar thresholds by 100 before comparing.

### Pattern 5: ASCII Art Display in EndingScreen

**What:** Add a `<pre>` block after the description paragraph. The `.ending-ascii` class provides monospace, centered, and properly white-space-preserved rendering.

**Example:**
```tsx
// In EndingScreen.tsx — add after <p className="ending-description">:
{content.ascii && (
  <pre className="ending-ascii">{content.ascii}</pre>
)}
```

```css
/* In pixel.css — add new class: */
.ending-ascii {
  font-family: monospace;
  font-size: 0.7rem;
  line-height: 1.2;
  white-space: pre;
  text-align: left;
  display: inline-block;
  margin: 0 auto 2rem auto;
  color: inherit;
}
```

### Pattern 6: ENDING_CONTENT Map Rebuild

**What:** Replace the 3-entry `ENDING_CONTENT` object with a 10-entry version. TypeScript will enforce exhaustiveness if the type annotation is added.

**Example structure:**
```typescript
const ENDING_CONTENT: Record<EndingType, {
  title: string;
  description: string;
  color: string;
  ascii: string;
}> = {
  MENDYS: { ... },
  BREAK_EVEN: { ... },
  // ... all 10 entries
};
```

### Anti-Patterns to Avoid

- **Comparing `settledNetWorth` to dollar thresholds without converting:** The store uses cents throughout. Forgetting to multiply by 100 (or divide settledNetWorth by 100) will cause every player to get MENDYS or PRIVATE_ISLAND due to a 100x magnitude error.
- **Checking behavior endings without the wealth guard:** The CONTEXT.md explicitly states behavior endings ONLY apply if `finalNetWorth ≤ $100k`. Do not trigger DEBT_SPIRAL or PAPER_HANDS for a player who ended with $50M even if sharkDebt > 0.
- **Using raw hex color values that don't survive the Game Boy palette filter:** See Pitfall 1 below.
- **Computing peakOpportunityCost during sells (mid-game):** Cannot know end-of-game prices mid-game. Compute from tradeHistory at game-end time.
- **Removing `sharkDebt` from the debt comparison without understanding the current debt value:** `sharkDebt` is initialized to 0 in `getInitialState()`. In this phase it is always 0 (debt mechanics not yet implemented). DEBT_SPIRAL will never trigger in this phase — that is correct and expected per CONTEXT.md ("Shark loan / debt mechanic gameplay implementation — separate phase").

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead |
|---------|-------------|-------------|
| ASCII art centering | Custom flex layout | CSS `display: inline-block` on `<pre>` inside a centered container |
| Color-safe palette | Custom color picker UI | Choose colors from the 4-color Game Boy palette values or close approximations that survive the feColorMatrix |
| Ending state persistence | Manual localStorage write | Zustand `persist` middleware already handles it — `peakOpportunityCost` will be included automatically since it's in the store state (not in the `partialize` exclusion list) |
| Type exhaustiveness checking | Runtime checks | TypeScript: annotate `ENDING_CONTENT` as `Record<EndingType, ...>` and the compiler enforces all 10 keys are present |

**Key insight:** This phase is entirely data + logic work. The infrastructure (Zustand, React, TypeScript, persist) already handles everything. The only novel work is the detection cascade and the content.

---

## Common Pitfalls

### Pitfall 1: Colors Destroyed by PaletteFilter

**What goes wrong:** The `PaletteFilter` component applies a global SVG `feColorMatrix` that remaps all colors to the 4-color Game Boy Pocket palette (#0f380f, #306230, #8bac0f, #9bbc0f or similar). A color like `#ff6600` will be collapsed to the nearest palette value, making all endings look the same shade.

**Why it happens:** `PaletteFilter` is rendered at the root in `App.tsx` and applies to the entire viewport including the ending overlay.

**How to avoid:** Test colors at the correct palette level. The existing EndingScreen uses `#00ff00`, `#ffffff`, and `#ff0000` as color values — these were likely chosen knowing the palette filter would remap them to the lightest, middle, and darkest palette shades respectively. New ending colors should similarly be chosen to produce distinct results after remapping, not before. Use the three existing colors as reference points: green → brightest, white → second, red → darkest. For 10 distinct endings you need 10 distinguishable values, but the filter only has 4 distinct palette values. The practical solution: use values from both ends of the spectrum and accept that some endings will share a post-filter hue — differentiate them via shade (brightness) not hue.

**Warning signs:** All ending cards look the same color during testing.

### Pitfall 2: Cents vs. Dollars in Threshold Comparisons

**What goes wrong:** `settledNetWorth` is in cents (e.g., $1M = 100,000,000 cents). CONTEXT.md specifies thresholds in dollars. Comparing `settledNetWorth >= 1000000` instead of `settledNetWorth >= 100000000` means $10 triggers TO_THE_MOON.

**Why it happens:** The store tracks all money in cents for integer precision. This is documented in comments (`cash: 10000000, // $100,000.00`).

**How to avoid:** Either divide `settledNetWorth / 100` to get dollars before all comparisons, or multiply every threshold constant by 100. The divide approach is cleaner. Add a `const finalNetWorthDollars = settledNetWorth / 100;` line and use that for all threshold comparisons.

**Warning signs:** Every game ends with MENDYS or PRIVATE_ISLAND — both indicate a magnitude error.

### Pitfall 3: PAPER_HANDS Opportunity Cost Units

**What goes wrong:** `peakOpportunityCost` computed from `finalPrice * amount` is in cents (since `currentPrice` is in cents throughout the store). CONTEXT.md says the threshold is $1,000,000. Comparing `peakOpportunityCost >= 1000000` catches only $10k in value; the actual threshold is `100000000`.

**Why it happens:** Same cents convention as pitfall 2, but applied to a new derived value.

**How to avoid:** When comparing `peakOpportunityCost` to $1M threshold, use `peakOpportunityCost >= 100000000` (cents) or compute it in dollars. Annotate the unit in a comment.

### Pitfall 4: Options Sells Not Counted in peakOpportunityCost

**What goes wrong:** `tradeHistory` has both `SELL` (stock) and `OPTION_SELL` entries. If only `SELL` entries are checked when computing `peakOpportunityCost`, selling a winning option that would have been worth $2M at expiry won't trigger PAPER_HANDS.

**Why it happens:** Two separate trade types for stocks and options. Options require computing intrinsic value at settlement (`Math.max(0, finalPrice - strikePrice) * amount` for calls).

**How to avoid:** In the `peakOpportunityCost` computation block, also iterate `OPTION_SELL` entries from `tradeHistory`. For each, compute hypothetical intrinsic value using final stock prices.

**Warning signs:** Players who sold winning options never get PAPER_HANDS even when they should.

### Pitfall 5: TypeScript Errors When EndingType Union Changes

**What goes wrong:** After updating `EndingType`, the old switch/if-else on `EndingType` values in `useGameStore.ts` (line 577) and potentially elsewhere will have TypeScript errors or miss new cases.

**Why it happens:** String union types require exhaustive handling when used in switch statements.

**How to avoid:** After updating the union in `types.ts`, TypeScript will immediately flag any code that pattern-matches on `EndingType`. Fix all callsites. Currently only two callsites: `nextTurn()` (detection) and `EndingScreen.tsx` (content lookup). The `ENDING_CONTENT: Record<EndingType, ...>` annotation ensures all 10 entries are required.

### Pitfall 6: ASCII Art Breaks the Card Layout

**What goes wrong:** Wide ASCII art (>50 chars per line) overflows the 500px max-width `.ending-card` container on mobile or small viewports.

**Why it happens:** `<pre>` elements do not wrap by default. 10–15 lines of 50+ char ASCII will exceed container width.

**How to avoid:** Keep ASCII art at 40 chars wide maximum. The `.ending-ascii` CSS should also include `overflow-x: auto` as a safety valve. Test on the minimum viewport width used in the game's responsive design.

---

## Code Examples

### Current Ending Detection (to be replaced)

```typescript
// src/store/useGameStore.ts lines 577-580 (CURRENT — to replace)
let ending: EndingType = 'MENDYS';
if (settledNetWorth >= 100000000) ending = 'MOON';
else if (karma >= 50000 || settledNetWorth <= 0) ending = 'LEGEND';
```

### Current EndingType (to be replaced)

```typescript
// src/store/types.ts line 68 (CURRENT — to replace)
export type EndingType = 'MOON' | 'LEGEND' | 'MENDYS';
```

### Current GameState (fields to add)

```typescript
// src/store/types.ts — GameState interface currently has:
finalNetWorth: number | null; // settled net worth at game end
// Add after finalNetWorth:
peakOpportunityCost: number; // peak hypothetical value of sold positions at game end (cents)
```

### Current ENDING_CONTENT (to be rebuilt)

```typescript
// src/components/Feedback/EndingScreen.tsx lines 9-25 (CURRENT — to replace entire object)
const ENDING_CONTENT = {
  MOON: { title: 'TO THE MOON', description: '...', color: '#00ff00' },
  LEGEND: { title: 'LEGENDARY STATUS', description: '...', color: '#ffffff' },
  MENDYS: { title: "WENDY'S IS HIRING", description: '...', color: '#ff0000' },
};
```

### EndingScreen Component (current render — minimal changes needed)

```tsx
// The EndingScreen component at lines 27-56 is already correct in structure.
// Only changes: add ascii field to content lookup, add <pre> block in render.
// The border and title color already come from content.color — no structural change.
```

### Zustand persist partialize (no change needed)

```typescript
// useGameStore.ts lines 848-851 — currently excludes lastFlash and popups:
partialize: (state) => {
  const { lastFlash, popups, ...rest } = state;
  return rest;
},
// peakOpportunityCost is in `rest` and will be persisted automatically.
```

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| 3 endings: MOON, LEGEND, MENDYS | 10 endings: 8 wealth brackets + 2 behavior triggers | Adds narrative resolution appropriate to the 10-day arc |
| Karma-based LEGEND ending | Behavior-based DEBT_SPIRAL and PAPER_HANDS | More specific, mechanically grounded — behavior reflects actual player actions |
| No opportunity cost tracking | `peakOpportunityCost` field in GameState | Infrastructure for future missed-gains display feature |

**Deprecated/outdated after this phase:**

- `'MOON' | 'LEGEND' | 'MENDYS'` — removed from `EndingType`; any string literal `'MOON'` or `'LEGEND'` elsewhere in the codebase should be searched and removed
- The karma-based ending trigger (`karma >= 50000`) in `nextTurn()` — removed; karma no longer drives ending selection

---

## Open Questions

1. **Are there references to the old EndingType values ('MOON', 'LEGEND', 'MENDYS') outside the three known files?**
   - What we know: They are used in `types.ts` (definition), `useGameStore.ts` (detection), `EndingScreen.tsx` (content lookup).
   - What's unclear: Whether any other component, test, or data file references these string literals.
   - Recommendation: Run a codebase grep for `'MOON'`, `'LEGEND'`, and the old `EndingType` before finalizing — the planner should include this as a verification step.

2. **How should the color palette interaction be handled for 10 distinct endings?**
   - What we know: The palette filter remaps colors to 4 values. The existing 3 endings use green/white/red — which map to 3 distinct palette values. 10 endings cannot all be visually unique through color alone after filtering.
   - What's unclear: Whether the design intent is "best effort" visual distinction or "guarantee unique post-filter colors."
   - Recommendation: Accept that color is a primary indicator only in pre-filter display; treat it as flavor. Plan should note this is acceptable per the game's retro aesthetic.

3. **Should `peakOpportunityCost` persist in localStorage across game sessions?**
   - What we know: It is in the store state and the `partialize` function includes all state except `lastFlash` and `popups`. It will persist automatically.
   - What's unclear: Whether this is correct behavior (should reset on new game).
   - Recommendation: It IS included in `resetGame()` (which calls `getInitialState()` where it starts at 0), so reset is handled correctly. Persistence across a saved mid-game is also correct.

---

## Sources

### Primary (HIGH confidence)

- Direct source code read: `src/store/types.ts` — current `EndingType`, `GameState` interface, `GameActions` interface
- Direct source code read: `src/store/useGameStore.ts` — full `nextTurn()` logic (lines 556–843), `getInitialState()`, `sellStock()`, `sellOption()`
- Direct source code read: `src/components/Feedback/EndingScreen.tsx` — current component structure, `ENDING_CONTENT` shape
- Direct source code read: `src/styles/pixel.css` — `.ending-card`, `.ending-title`, `.ending-description`, `.ending-stats` CSS classes (lines 34–81)
- Direct source code read: `src/App.tsx` — confirms `EndingScreen` is rendered conditionally at root level

### Secondary (MEDIUM confidence)

- `.planning/phases/12-multiple-endings-expansion/12-CONTEXT.md` — all locked decisions and implementation specs
- `.planning/STATE.md` — phase history, confirms `sharkDebt` added in Phase 11

### Tertiary (LOW confidence)

- None required — all implementation facts sourced directly from codebase.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new packages; all tools already in use
- Architecture: HIGH — implementation path fully visible from direct source reads
- Pitfalls: HIGH — all pitfalls identified from direct code inspection (cents convention, palette filter, type exhaustiveness)

**Research date:** 2026-03-08
**Valid until:** 2026-04-08 (stable — no external dependencies)
