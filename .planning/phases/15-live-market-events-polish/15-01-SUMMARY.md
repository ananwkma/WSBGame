---
phase: 15-live-market-events-polish
plan: "01"
subsystem: market-engine
tags: [real-time, store, hooks, types, hype-removal]
dependency_graph:
  requires: []
  provides: [tickMarket, advanceDay, useMarketClock, CandleBar, MarketEvent, ScheduledMessage, intradayBars, marketTime]
  affects: [src/store/useGameStore.ts, src/store/types.ts, src/hooks/useMarketClock.ts, src/App.tsx]
tech_stack:
  added: [useMarketClock hook, CandleBar OHLC, MarketEvent system, ScheduledMessage queue]
  patterns: [getState() non-stale closure, setInterval with cleanup, sqrt(390) tick vol scaling, Zustand persist migration v1]
key_files:
  created: [src/hooks/useMarketClock.ts]
  modified: [src/store/types.ts, src/store/useGameStore.ts, src/App.tsx, src/components/Shell/DualViewShell.tsx, src/components/Apps/Phone/PhoneApp.tsx]
decisions:
  - "useMarketClock uses getState().tickMarket() (not a reactive selector) to avoid stale closure in setInterval"
  - "Per-tick vol = dailyVol / sqrt(390) so daily variance is preserved across 390 market ticks"
  - "advanceDay resets marketTime to 480 (8am pre-market) for all days after Day 1; Day 1 starts at 360 (6am)"
  - "Persist version bumped to 1 with migrate() that strips hype and nextTurn from saved state"
  - "currentDay added as redundant alias to day so tickMarket can reference it without breaking existing day-based logic"
metrics:
  duration: "8 minutes"
  completed: "2026-03-14"
  tasks_completed: 3
  files_changed: 5
---

# Phase 15 Plan 01: Real-Time Market Engine & Hype Removal Summary

Real-time price engine with sqrt(390) tick scaling, OHLC candle accumulation, useMarketClock hook driving 2-second ticks, and full hype system removal from types, store, and UI.

## Tasks Completed

| # | Task | Commit | Key Files |
|---|------|--------|-----------|
| 1 | Add new types and remove hype from types.ts | d541cc3 | src/store/types.ts |
| 2a | Implement tickMarket, advanceDay, hype removal, persist migration | 0f40819 | src/store/useGameStore.ts, DualViewShell.tsx, PhoneApp.tsx |
| 2b | Create useMarketClock hook and wire into App.tsx | 8cbdc05 | src/hooks/useMarketClock.ts, src/App.tsx |

## What Was Built

### New Types (types.ts)
- `CandleBar` — OHLC 1-minute bar with `openTime` in in-game minutes
- `MarketEventType` — 4 event types: EARNINGS, FED_ANNOUNCEMENT, MEME_FRENZY, INSIDER_LEAK
- `MarketEvent` — full event spec with id, ticker, day, triggerTime, priceMultiplier, rampMinutes, fired, narrativeKey
- `ScheduledMessage` — mid-session message queue entry with deliverAt time
- New `GameState` fields: `marketTime`, `marketIsOpen`, `intradayBars`, `netWorthBars`, `scheduledEvents`, `activeEvents`, `pendingMessages`, `currentDay`
- New `GameActions`: `tickMarket`, `advanceDay`, `dismissEvent` (replaced `nextTurn`)

### Store Changes (useGameStore.ts)
- `tickMarket()` — fires every 2 real seconds via useMarketClock; moves prices per-tick using vol/sqrt(390), upserts OHLC bars per stock, fires scheduled events, delivers pending messages, accumulates net worth bars
- `advanceDay()` — renamed from nextTurn(); resets intradayBars, netWorthBars, activeEvents; sets marketTime=480 (8am); all existing day-end logic preserved
- `dismissEvent()` — removes event from activeEvents by id
- Hype removed from: getInitialState, buyStock, buyOption, advanceDay final set()
- `partialize` now excludes: intradayBars, netWorthBars, pendingMessages, activeEvents, marketTime, marketIsOpen
- Persist version 1 with migration that strips hype and nextTurn from saved data

### useMarketClock Hook (new file)
- `setInterval` at 2000ms calling `useGameStore.getState().tickMarket()`
- Empty deps array — single interval per mount
- Cleanup on unmount via returned `clearInterval`

### App.tsx
- Imports and mounts `useMarketClock()`
- Replaces `nextTurn` selector with `advanceDay`
- "NEXT TURN" button relabelled to "NEXT DAY"

### UI Hype Cleanup
- `DualViewShell.tsx` — removed hype state, removed phone shake animation
- `PhoneApp.tsx` — removed HYPE LEVEL bar UI component and hype state selector

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed message.from → message.sender in tickMarket pending message delivery**
- **Found during:** Task 2a implementation
- **Issue:** Plan's tickMarket code referenced `message.from` but the `Message` interface uses `message.sender`
- **Fix:** Changed `newThreads[message.from]` to `newThreads[message.sender]`
- **Files modified:** src/store/useGameStore.ts
- **Commit:** 0f40819

**2. [Rule 1 - Bug] Removed hype references from UI components not covered by plan scope**
- **Found during:** Task 2a (discovered during grep verification)
- **Issue:** DualViewShell.tsx and PhoneApp.tsx read `state.hype` which no longer exists in GameState
- **Fix:** Removed HYPE LEVEL bar from PhoneApp, removed hype-driven shake animation from DualViewShell
- **Files modified:** src/components/Shell/DualViewShell.tsx, src/components/Apps/Phone/PhoneApp.tsx
- **Commit:** 0f40819

## Self-Check: PASSED

- src/hooks/useMarketClock.ts: FOUND
- src/store/types.ts: FOUND
- src/store/useGameStore.ts: FOUND
- Commit d541cc3 (types): FOUND
- Commit 0f40819 (store): FOUND
- Commit 8cbdc05 (hook + App): FOUND
