---
phase: 08
plan: 01
subsystem: Trade
tags: [ui, polish, chart]
tech-stack: [React, D3-shape]
key-files: [src/components/Trade/PriceChart.tsx, src/components/Trade/Robbinghood.tsx]
metrics:
  duration: 15m
  completed_date: 2024-03-24
---

# Phase 08 Plan 01: Fix PriceChart & Duplicate Points Summary

Improved visual accuracy of portfolio performance tracking by correcting chart color logic and preventing redundant data points in the history trace.

## Key Changes

### Trade UI Polish
- **PriceChart Color Logic**: Updated `PriceChart` to compare current value against the first point in the provided history array instead of the previous point. This ensures the chart color (Green/Red) reflects the overall performance across the visible timeframe.
- **Redundant Data Filter**: Implemented `useMemo` in `Robbinghood` to sanitize the net worth history before passing it to `PriceChart`. It now only appends the "live" current-day point if it represents a new point in time (turn index), preventing visual glitches in the SVG path.

## Verification Results
- `PriceChart` correctly turns red if net worth is below the starting $100,000, even after a minor gain.
- Portfolio chart renders a clean continuous line without duplicate turn artifacts.

## Self-Check: PASSED
- [x] PriceChart.tsx updated with initial value comparison.
- [x] Robbinghood.tsx updated with memoized history filtering.
- [x] Commits made for each task.
