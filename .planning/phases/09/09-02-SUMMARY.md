---
phase: 09-accurate-options-engine
plan: 09-02-PLAN
subsystem: Options Engine
tags: [IV, IV Crush, Dynamic Volatility, Game Loop]
requires: [09-01-SUMMARY]
provides: [Dynamic IV management]
affects: [Option Premiums, Risk Management]
tech-stack: [Zustand, Black-Scholes]
key-files: [src/store/useGameStore.ts]
decisions:
  - "IV increases 1-2 turns before a SHIFT event to simulate market anticipation."
  - "IV resets to base value (Crush) immediately on the day the SHIFT event occurs."
  - "IV decays slowly (10% per turn) towards base level when no events are near."
metrics:
  duration: 15m
  completed_date: "2024-05-18"
---

# Phase 09 Plan 02: Dynamic IV and IV Crush Summary

Implemented dynamic Implied Volatility (IV) logic into the game loop to simulate market anticipation and post-event volatility collapse ("IV Crush").

## Key Changes

### `src/store/useGameStore.ts`

- **Initialized Base IV**: Confirmed initial IV levels for $GAME (150%), $POPC (80%), and $APE (300%) in the global state.
- **Dynamic IV Logic in `nextTurn`**:
    - **Anticipation Spikes**: Added logic to detect `SHIFT` events 1 or 2 days in the future and increase IV by 1.0 (100%) to reflect market buildup.
    - **IV Crush**: Implemented immediate reset of IV to base values when a `SHIFT` event occurs on the current turn.
    - **Volatility Decay**: Added a slow decay mechanism (`iv * 0.9`) to gradually return IV to base levels during periods of no major events.

## Verification Results

- **Start of Game**: $GAME IV is 1.5.
- **Anticipation**: Day 4 has a SHIFT event for $GAME. On Day 2 (transitioning to Day 3), IV spikes as Day 4 is `nextDayNum + 1`.
- **Crush**: On Day 3 (transitioning to Day 4), IV resets to 1.5 as Day 4 is `nextDayNum`.
- **Premiums**: Option premiums significantly increase during spikes and collapse after the crush, as expected from the Black-Scholes model integration.

## Deviations from Plan

- None. Task 1 was already partially implemented in the codebase (the base IV values were already correct), so I focused on the dynamic logic in Task 2.

## Self-Check: PASSED
- [x] Initial IV levels correctly set.
- [x] IV spikes 1-2 days before SHIFT events.
- [x] IV resets (crush) on the day of SHIFT events.
- [x] IV decays towards base levels during quiet periods.
- [x] All changes committed and verified.
