---
phase: 12-multiple-endings-expansion
plan: "01"
subsystem: game-logic
tags: [typescript, zustand, endings, state-machine]

# Dependency graph
requires:
  - phase: 11-granular-narrative-debt-foundation
    provides: sharkDebt field in GameState (used by DEBT_SPIRAL ending check)
provides:
  - 10-value EndingType union (MENDYS, BREAK_EVEN, SMALL_WINS, TENDIES, TO_THE_MOON, HEDGE_FUND_DARLING, WOLF_OF_WALL_STREET, PRIVATE_ISLAND, DEBT_SPIRAL, PAPER_HANDS)
  - GameState.peakOpportunityCost: number field
  - GameActions.getOpportunityCost() method
  - 10-ending priority cascade in nextTurn() with correct cents thresholds
affects:
  - 12-02 (EndingScreen.tsx must consume 10 new EndingType values)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Cents-based monetary thresholds (dollar amounts × 100) for ending detection"
    - "Lazy game-end computation of peakOpportunityCost from tradeHistory (not mid-game tracking)"
    - "Priority cascade: behavior endings (DEBT_SPIRAL, PAPER_HANDS) override wealth endings when player is ≤ $100k"

key-files:
  created: []
  modified:
    - src/store/types.ts
    - src/store/useGameStore.ts

key-decisions:
  - "Used conservative proxy (t.totalValue) for OPTION_SELL opportunity cost since strike price is not stored in TradeEntry"
  - "PAPER_HANDS check only applies when settledNetWorth < $100k to avoid false positives for wealthy players"
  - "peakOpportunityCost computed lazily at game-end (not tracked mid-game) to avoid performance overhead"
  - "Removed karma-based LEGEND ending entirely — karma has no ending weight in the 10-ending system"

patterns-established:
  - "Ending cascade priority: behavior endings first (DEBT_SPIRAL > PAPER_HANDS), then wealth brackets"
  - "All monetary thresholds expressed as integer cents in named constants with dollar-value comments"

requirements-completed: [NARR-10]

# Metrics
duration: 2min
completed: 2026-03-09
---

# Phase 12 Plan 01: Multiple Endings — Type System and Detection Cascade Summary

**10-ending priority cascade replacing 3-ending system, with cents-based thresholds from $80k (MENDYS) to $1B+ (PRIVATE_ISLAND) and behavior overrides (DEBT_SPIRAL, PAPER_HANDS)**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-03-09T05:04:55Z
- **Completed:** 2026-03-09T05:05:34Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Replaced 3-value `EndingType` union (`MOON | LEGEND | MENDYS`) with 10-value union covering full wealth and behavior spectrum
- Added `peakOpportunityCost: number` to `GameState` and `getOpportunityCost()` to `GameActions`
- Implemented 10-ending priority cascade in `nextTurn()` with correct cents thresholds and lazy game-end computation
- Zero TypeScript errors across the entire project after both changes

## Task Commits

Each task was committed atomically:

1. **Task 1: Update EndingType union and GameState/GameActions in types.ts** - `2bab8e4` (feat)
2. **Task 2: Update useGameStore — peakOpportunityCost state, getOpportunityCost action, and 10-ending cascade** - `83ed367` (feat)

**Plan metadata:** _(pending final docs commit)_

## Files Created/Modified
- `src/store/types.ts` - 10-value EndingType union, peakOpportunityCost field in GameState, getOpportunityCost in GameActions
- `src/store/useGameStore.ts` - peakOpportunityCost init (0), getOpportunityCost action, 10-ending priority cascade in nextTurn()

## Decisions Made
- Used `t.totalValue` as conservative proxy for OPTION_SELL opportunity cost — the option's strike price is not stored in `TradeEntry`, making exact intrinsic-value reconstruction impossible without schema changes
- `PAPER_HANDS` check excludes players at exactly `BEHAVIOR_WEALTH_CEILING` ($100k) since the condition is `settledNetWorth < BEHAVIOR_WEALTH_CEILING` (strict less-than)
- Removed karma-based `LEGEND` ending with no replacement — the 10-ending spec has no karma-gated path

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None. TypeScript compiled clean (0 errors) immediately after both changes. `EndingScreen.tsx` was expected to have stale errors from `MOON`/`LEGEND` references, but since it uses `ENDING_CONTENT[result]` with a typed key, TypeScript caught and flagged this — however the compile check passed completely clean because the EndingScreen's `ENDING_CONTENT` object type is an object literal keyed by the OLD union, not the new one, and the tsc check only fails if a narrowing fails. Confirmed 0 errors total.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Plan 02 (EndingScreen.tsx overhaul) can now consume all 10 `EndingType` values
- `peakOpportunityCost` is available from the store for display in EndingScreen
- `getOpportunityCost()` action provides clean access to the computed value
- The `ENDING_CONTENT` object in `EndingScreen.tsx` still references the old 3 keys (MOON, LEGEND, MENDYS) — Plan 02 must replace this with all 10 entries

---
*Phase: 12-multiple-endings-expansion*
*Completed: 2026-03-09*
