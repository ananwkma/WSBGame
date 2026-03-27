# Phase 12: Multiple Endings Expansion - Context

**Gathered:** 2026-03-08
**Status:** Ready for planning

<domain>
## Phase Boundary

Replace the 3-ending system (MOON/LEGEND/MENDYS) with 10 distinct endings. Each ending has a unique trigger condition, WSB-ironic copy, color, and medium ASCII art scene. The ending detection logic evaluates all conditions at game end and selects the most specific match per the priority rules below.

</domain>

<decisions>
## Implementation Decisions

### The 10 Endings

**Wealth-based (evaluated after behavior checks fail):**

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

**Behavior-based (checked first; only override if final wealth ≤ $100k):**

| # | Name | Trigger Condition |
|---|------|-------------------|
| 9 | DEBT SPIRAL | `sharkDebt > finalNetWorth` (debt exceeds everything you have — effectively negative) |
| 10 | PAPER HANDS | finalNetWorth < $100k AND `peakOpportunityCost >= $1,000,000` (sold a position that would have been worth $1M+ at game end) |

### Priority & Conflict Resolution

1. **Behavior endings check first**, but **only apply if finalNetWorth ≤ $100k**.
   - If player ended rich (>$100k), they get a wealth ending regardless of behavior.
2. **DEBT SPIRAL beats PAPER HANDS** when both conditions are met simultaneously.
3. If no behavior ending qualifies, fall through to the wealth bracket table.

### Opportunity Cost Infrastructure

- Track a `peakOpportunityCost` value in game state (number, starts at 0).
- When a player sells any position, calculate what that position would be worth at game end (day 10 prices × amount sold). If this exceeds the current `peakOpportunityCost`, update it.
- Expose a `getOpportunityCost()` helper function (or derived state) for future features to reference.
- This value is used ONLY for PAPER HANDS detection in this phase — future phases may use it for other mechanics.

### Visual Treatment

- Same card layout for all endings (no per-ending layout redesign).
- Each ending gets a **unique color** for the card border and title.
- **Medium ASCII art (10–15 lines)** depicting the ending scenario, placed **below the description text**.
- Art should be readable in a monospace font and fit the pixel/retro aesthetic of the game.

### Tone

- All endings use the **same WSB-ironic voice** throughout — dark humor, self-aware, sarcastic.
- Tone does NOT escalate with wealth. Even PRIVATE ISLAND ($1B+) is self-deprecating and unhinged.
- The copy should feel like a Reddit post title from r/wallstreetbets.

### Replacing Existing Endings

- MOON, LEGEND, MENDYS are fully replaced.
- `EndingType` in `types.ts` will be updated to reflect all 10 new ending keys.
- `ENDING_CONTENT` in `EndingScreen.tsx` will be rebuilt with all 10 entries.

</decisions>

<specifics>
## Specific Ideas

- PRIVATE ISLAND: "You bought a private island. Your wife's boyfriend lives there too. You don't care."
- BREAK EVEN: neutral/grey color, understated — "You could have just left it in a savings account."
- PAPER HANDS: the most narratively ironic ending in the game. Copy should really twist the knife.
- ASCII art examples by ending:
  - MENDYS: a spatula / Wendy's counter
  - PRIVATE ISLAND: palm tree + jet
  - DEBT SPIRAL: sinking money / hole in ground
  - PAPER HANDS: hands with paper, crying

</specifics>

<deferred>
## Deferred Ideas

- Opportunity cost display during gameplay (show missed gains) — future phase
- OPTIONS GOD / ONE TRICK PONY / LEGEND endings — removed from this phase's scope but could be added in a future endings expansion
- Shark loan / debt mechanic gameplay implementation — separate phase (debt state already initialized)

</deferred>

---

*Phase: 12-multiple-endings-expansion*
*Context gathered: 2026-03-08*
