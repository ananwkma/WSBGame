---
phase: 18-clock-speed-control
plan: "01"
subsystem: market-clock
tags: [clock, speed-control, debug-removal, ux]
dependency_graph:
  requires: []
  provides: [clock-speed-control]
  affects: [useMarketClock, App]
tech_stack:
  added: []
  patterns: [local-state-cycling, parameterized-hook]
key_files:
  created: []
  modified:
    - src/hooks/useMarketClock.ts
    - src/App.tsx
decisions:
  - SPEEDS const and ClockSpeed type are local to App.tsx — not exported or stored in Zustand
  - Speed resets to 1x on each NEXT DAY press (local state, not persisted)
  - IS_DEBUG_MODE conditions removed from NEXT DAY gate — gate is now purely marketTime < 960
  - Speed button placed as third child inside clock container div (after status text)
metrics:
  duration: "~1 minute"
  completed: "2026-03-18"
  tasks_completed: 2
  files_modified: 2
---

# Phase 18 Plan 01: Clock Speed Control Summary

Clock speed control added to the market clock: 1x/2x/5x cycling button next to the clock, speed-aware hook, NEXT DAY reset, and full debug code removal.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Parameterize useMarketClock hook | e05fb3d | src/hooks/useMarketClock.ts |
| 2 | Add speed state, cycle button, fix NEXT DAY, remove debug | f85a00d | src/App.tsx |

## What Was Built

**useMarketClock.ts** — Hook now accepts `speed: 1 | 2 | 5 = 1`. The `setInterval` uses `BASE_INTERVAL_MS / speed` (2000ms / 1000ms / 400ms). The dep array is `[speed]` so the interval tears down and recreates whenever speed changes. The `getState()` pattern is unchanged to avoid stale closures.

**App.tsx** — Added `SPEEDS = [1, 2, 5] as const`, `ClockSpeed` type, `clockSpeed` state (starts at 1), and `cycleSpeed` function that cycles through the array. `useMarketClock(clockSpeed)` receives the live speed. NEXT DAY `onClick` calls `advanceDay()` then `setClockSpeed(1)`. The speed cycle button (`{clockSpeed}x`) is placed inside the dark clock container div as the third child. `DEBUG`, `IS_DEBUG_MODE`, `skipTime`, and the `+5m`/`+1h` debug block are all removed.

## Decisions Made

- `SPEEDS` const and `ClockSpeed` type are local to `App.tsx` — not exported, not in Zustand. Speed is transient local state.
- Speed resets to 1x on NEXT DAY; it does not persist across page refreshes (intentional per user decision).
- `IS_DEBUG_MODE` conditions removed entirely from NEXT DAY button — gate is now purely `marketTime < 960`.
- Speed button uses existing `next-turn-btn` class with `position: static` override and small font/padding so it fits inside the clock box.

## Verification

- `npx tsc --noEmit` exits 0 with no diagnostic output.
- No references to `DEBUG`, `IS_DEBUG_MODE`, or `skipTime` remain in `App.tsx`.
- Only clock-speed names in `App.tsx`: `SPEEDS`, `ClockSpeed`, `clockSpeed`, `setClockSpeed`, `cycleSpeed`.

## Deviations from Plan

None — plan executed exactly as written.
