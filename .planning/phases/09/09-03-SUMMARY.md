---
phase: 09-accurate-options-engine
plan: 09-03-PLAN
subsystem: Trade
tags: [UI, options, greeks, IV]
dependency_graph:
  requires: [09-01-PLAN, 09-02-PLAN]
  provides: [IV-Vega-Display]
  affects: [src/components/Trade/OptionsChain.tsx, src/components/Trade/Robbinghood.tsx]
tech-stack: [React, Zustand, Framer Motion]
key-files: [src/components/Trade/OptionsChain.tsx, src/components/Trade/Robbinghood.tsx]
decisions:
  - Added IV and Vega to the UI to improve transparency of the options pricing model.
  - Formatted IV as a percentage and Vega to 2 decimal places for clarity.
metrics:
  duration: 15m
  completed_date: "2024-10-30"
---

# Phase 09 Plan 03: UI Metrics Update Summary

## Objective
Update the UI to display the new volatility-related metrics (IV and Vega) to provide players with necessary information to understand "IV Crush" and how volatility affects their option prices.

## Key Changes
### Options Chain Update
- Added **Vega (V)** to the Greeks display in `OptionsChain.tsx`.
- Vega is now shown alongside Delta, Gamma, and Theta, formatted to 2 decimal places.

### Robbinghood App Updates
- Added an **IV Indicator** to the stock detail view, showing the current Implied Volatility percentage for the selected stock.
- Updated the **Portfolio View** to show the current IV of the underlying stock for each held option position. This helps players monitor volatility risks like IV Crush.

## Deviations
None - plan executed as written.

## Verification Results
- **Options Chain:** Vega (V) is visible for both calls and puts.
- **Stock View:** IV % is displayed in the stock detail header.
- **Portfolio:** IV % is shown in the holding details for option contracts.

## Self-Check: PASSED
- [x] Vega is displayed in Options Chain.
- [x] IV is visible in Stock View.
- [x] IV is visible in Portfolio for options.
- [x] Commits made for each task.
