---
phase: 17-phone-lock-chart-overhaul
plan: "03"
subsystem: chart
tags: [intrachart, timeframes, sliding-window, previousDayBars, react, typescript]

# Dependency graph
requires:
  - phase: 17-phone-lock-chart-overhaul
    plan: "01"
    provides: previousDayBars field in GameState (Record<string, CandleBar[]>)
provides:
  - IntraChart TODAY tab with 1M/10M/30M timeframes (line and candle)
  - IntraChart ALL tab with 1H/4H/1D timeframes (line and candle)
  - WINDOW_SIZE sliding window slicing for all timeframes
  - previousDayBars pre-population for TODAY tab and 1H/4H ALL tab
  - Separate localStorage keys per tab with old-key migration
affects:
  - src/components/Trade/IntraChart.tsx
  - src/components/Trade/Robbinghood.tsx

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Sliding window: sourceBars.slice(-WINDOW_SIZE[timeframe]) for consistent bar count"
    - "Per-tab localStorage keys: chartTimeframe-TODAY and chartTimeframe-ALL"
    - "isIntraday=false for uniform xAt spacing regardless of bar time values"
    - "Index-based x-axis labels derived from bar indices not fixed time marks"

key-files:
  created: []
  modified:
    - src/components/Trade/IntraChart.tsx
    - src/components/Trade/Robbinghood.tsx

key-decisions:
  - "isIntraday=false so uniform xAt() is always used — pre-populated bars from yesterday fall outside 570-960 time axis causing gaps if xAtTime is used"
  - "TODAY tab uses combined [...previousDayBars, ...barsToUse] then groupBars so pre-populated bars appear on left side of window"
  - "Net worth IntraChart in Portfolio tab left without previousDayBars prop — defaults to [] in IntraChart, correct behavior since net worth bars are not keyed by ticker"
  - "handleToggleCandles bump removed — both LINE and CANDLE modes now share same timeframe set per tab"
  - "x-axis labels derived from bar indices (step-based sampling) replacing fixed time mark array [570,660,750...]"

# Metrics
duration: 3min
completed: 2026-03-17
---

# Phase 17 Plan 03: IntraChart Timeframe Overhaul Summary

**IntraChart overhauled with TODAY (1M/10M/30M) and ALL (1H/4H/1D) tab-specific timeframes, WINDOW_SIZE sliding window, and previousDayBars pre-population; Robbinghood passes previousDayBars[selectedStock] to the stock chart**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-03-17T11:36:23Z
- **Completed:** 2026-03-17T11:39:35Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Replaced `LINE_TIMEFRAMES`/`CANDLE_TIMEFRAMES` constants with `TODAY_TIMEFRAMES` (`['1M','10M','30M']`) and `ALL_TIMEFRAMES` (`['1H','4H','1D']`) — both modes work on both tabs
- Added `WINDOW_SIZE` record controlling max visible bars per timeframe (1M:60, 10M:39, 30M:13, 1H:16, 4H:10, 1D:10)
- Added `previousDayBars?: CandleBar[]` optional prop to `IntraChartProps`
- TODAY tab pre-populates with `[...previousDayBars, ...barsToUse]` via `groupBars`
- ALL tab 1H/4H timeframes combine `[...previousDayBars, ...intradayBars]` via `groupBars`
- ALL tab 1D unchanged (daily history approach)
- Sliding window applied via `sourceBars.slice(-windowSize)` after all derivation
- Replaced fixed time-mark x-axis labels with index-based step sampling
- `isIntraday = false` forces uniform `xAt()` spacing, preventing gaps from pre-populated bars
- `handleTabSwitch` loads correct per-tab localStorage key on tab change
- One-time migration of old `chartTimeframe` key to `chartTimeframe-TODAY` or `chartTimeframe-ALL`
- Removed `handleToggleCandles` bump from 1M→10M in candle mode
- Robbinghood.tsx destructures `previousDayBars` from store; passes `previousDayBars[selectedStock] || []` to stock IntraChart

## Task Commits

Each task was committed atomically:

1. **Task 1: Overhaul IntraChart timeframes, sliding window, and previousDayBars pre-population** - `3472342` (feat)
2. **Task 2: Pass previousDayBars from store to IntraChart in Robbinghood.tsx** - `c975104` (feat)

## Files Created/Modified

- `src/components/Trade/IntraChart.tsx` - Full overhaul: new Timeframe type, TODAY/ALL tab logic, WINDOW_SIZE slicing, previousDayBars pre-population, per-tab localStorage, index-based x-axis labels
- `src/components/Trade/Robbinghood.tsx` - Added previousDayBars to store destructure; passed to stock IntraChart

## Decisions Made

- `isIntraday = false` is hardcoded so uniform `xAt()` is always used. Pre-populated bars from yesterday have `openTime` values outside the 570-960 intraday window, which would cause `xAtTime` to clamp them all to the left edge. Uniform spacing is the correct behavior for a sliding-window chart.
- Net worth IntraChart in Portfolio tab intentionally omits `previousDayBars` — it defaults to `[]` inside IntraChart which is correct since net worth bars aren't keyed by ticker in the same way.
- `handleToggleCandles` bump logic removed — the old code bumped from 1M to 10M when entering candle mode. In the new design both LINE and CANDLE share the same tab-specific timeframe set, so no bump is needed.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- IntraChart overhaul complete. Phase 17 Plan 03 was the last code-change plan in this phase.
- TypeScript compiles clean (tsc --noEmit exits 0).
- Verification in running app: TODAY tab shows 1M/10M/30M; ALL tab shows 1H/4H/1D; candle toggle works on both tabs without timeframe jump; Day 2+ TODAY chart pre-populates with yesterday's bars on left.

## Self-Check: PASSED

- FOUND: src/components/Trade/IntraChart.tsx
- FOUND: src/components/Trade/Robbinghood.tsx
- FOUND: .planning/phases/17-phone-lock-chart-overhaul/17-03-SUMMARY.md
- FOUND commit: 3472342 (Task 1)
- FOUND commit: c975104 (Task 2)

---
*Phase: 17-phone-lock-chart-overhaul*
*Completed: 2026-03-17*
