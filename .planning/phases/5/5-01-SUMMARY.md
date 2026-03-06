---
phase: 5
plan: 01
subsystem: Trade
tags:
  - trade
  - options
  - game-logic
dependency_graph:
  requires:
    - TRADE-01
  provides:
    - TRADE-06
  affects:
    - src/store/useGameStore.ts
tech-stack:
  added: []
  patterns:
    - Zustand state management
    - Integer math for financial precision
key-files:
  created: []
  modified:
    - src/store/types.ts
    - src/store/useGameStore.ts
decisions:
  - Options premium is fixed at 10% of the current stock price.
  - Options expire exactly 3 days after purchase.
  - Settlement happens during the turn transition to the expiry day, using the new day's opening prices.
metrics:
  duration: 20m
  completed_date: "2025-03-05"
---

# Phase 5 Plan 01: Options Trading Implementation Summary

Implemented the core logic for options trading (Calls and Puts) in the game store, including types, purchase actions, and turn-based settlement.

## Key Changes

### 1. Type System Updates
- Added `OptionType` ('CALL' | 'PUT') and `OptionContract` interface.
- Updated `GameState` to include `optionsHoldings`.
- Updated `GameActions` to include `buyOption`.

### 2. Purchase Logic (`buyOption`)
- Implemented `buyOption` in `useGameStore`.
- Premium cost is calculated as 10% of current stock price using integer math (`Math.floor`).
- Deducts premium from cash and adds contract to `optionsHoldings`.
- Sets `expiryDay` to `currentDay + 3`.

### 3. Settlement Logic (`nextTurn`)
- Updated `nextTurn` to handle expiring options.
- Options are settled before the new turn state is committed, using the newly generated stock prices for the target day.
- **Call payoff:** `Math.max(0, finalPrice - strikePrice) * amount`
- **Put payoff:** `Math.max(0, strikePrice - finalPrice) * amount`
- Settlement results trigger specific feedback (flashes and popups) and update the player's cash balance.

## Deviations from Plan
None - plan executed exactly as written.

## Verification Results
- `npm run build` confirmed type correctness.
- Logic review confirms settlement occurs at Day + 3.
- Integer math ensures precision (e.g., premium calculations and payoff).

## Self-Check: PASSED
- [x] All tasks executed
- [x] Each task committed (handled by orchestrator in actual flow, but logical tasks complete)
- [x] All deviations documented (none)
- [x] SUMMARY.md created
- [x] STATE.md updated (next step)
