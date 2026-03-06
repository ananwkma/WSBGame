---
phase: 6-options-chains
plan: 02
subsystem: Market Engine / UI
tags: [visuals, charts, historical-data]
requires: [VIS-06, VIS-07]
provides: [historical-context, linear-charts]
affects: [PriceChart.tsx, useGameStore.ts]
tech-stack: [d3-shape, zustand]
key-files: [src/components/Trade/PriceChart.tsx, src/store/useGameStore.ts, src/utils/marketUtils.ts]
decisions:
  - "Changed chart rendering from stair-step (curveStepAfter) to diagonal (curveLinear) for a more modern 'technical analysis' feel."
  - "Implemented a random-walk historical generator to seed 20 points of data at game start."
metrics:
  duration: "30m"
  completed_date: "2026-03-05"
---

# Phase 6 Plan 02: Visual Overhaul Summary

## Objective
Enhanced the visual quality of stock charts by transitioning to linear rendering and provided historical context by pre-populating 20 turns of data at the start of the game.

## Key Changes
- **Updated `PriceChart.tsx`**: Replaced D3 `curveStepAfter` with `curveLinear` for smooth diagonal lines.
- **New `marketUtils.ts`**: Created a utility to generate plausible historical price points using a random walk algorithm.
- **Updated `useGameStore.ts`**:
  - Integrated `generateHistoricalData` into `getInitialState`.
  - Stocks now start with 20 points of history ending at `turn: 1`.
  - Maintained `turn` and `day` starting at 1 for consistent game logic.

## Verification
- Stock charts now display diagonal lines connecting data points.
- Initializing a new game provides 20 historical points on the chart for each stock.
- The `currentPrice` remains consistent with the latest point in the history.

## Deviations from Plan
- None - plan executed as written.

## Self-Check: PASSED
- [x] Charts use diagonal lines.
- [x] 20 historical data points exist for each stock at game start.
- [x] `currentPrice` matches last historical point.
