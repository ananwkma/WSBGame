---
phase: 16-qol-polish
plan: 02
subsystem: ui
tags: [zustand, messaging, scheduling, game-loop]

# Dependency graph
requires:
  - phase: 15-live-market-events
    provides: pendingMessages queue and tickMarket delivery infrastructure
provides:
  - netWorthTriggerFiredToday boolean field in GameState (transient, excluded from persist)
  - advanceDay schedules wife and extra-contact messages as ScheduledMessage with random deliverAt 570-959
  - tickMarket swing detection fires one wife message when net worth moves 10%+ from day open
affects: [advanceDay, tickMarket, narrative-messaging]

# Tech tracking
tech-stack:
  added: []
  patterns: ["ScheduledMessage queue used for all intraday narrative messages instead of direct thread push at day transition"]

key-files:
  created: []
  modified:
    - src/store/types.ts
    - src/store/useGameStore.ts

key-decisions:
  - "Wife and extra-contact messages scheduled with random deliverAt 570-959 (random market hours) so they appear mid-session rather than all at once on NEXT DAY"
  - "Extra-contact thread entries still created in newThreads at advanceDay time so tickMarket delivery can find the thread"
  - "pendingMessages: [] reset in Task 1 replaced by pendingMessages: newScheduledMessages in Task 2 — Task 1 reset was temporary scaffolding"
  - "Swing trigger uses state.netWorthBars[0].open (first bar of the day) as dayOpenNW; gated by netWorthBars.length > 0 and dayOpenNW > 0 to avoid division by zero on day 1"
  - "Swing message deliverAt: newTime (immediate delivery on next tickMarket pass) rather than a future scheduled time"

patterns-established:
  - "Intraday narrative messages: always schedule via ScheduledMessage queue, never push directly to threads at day boundary"

requirements-completed: [UX-02]

# Metrics
duration: 15min
completed: 2026-03-17
---

# Phase 16 Plan 02: Intraday Message Scheduling Summary

**Wife and extra-contact messages converted from instant day-start delivery to ScheduledMessage queue with random mid-session deliverAt; 10% net-worth swing triggers one immediate wife message per day via tickMarket**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-03-17T00:00:00Z
- **Completed:** 2026-03-17T00:15:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Added `netWorthTriggerFiredToday: boolean` to GameState (transient, persisted-excluded, reset each day)
- advanceDay now populates `pendingMessages` with ScheduledMessage entries for wife and extra contacts (random deliverAt within 9:30am–4pm window) instead of pushing messages directly into threads
- tickMarket swing detection block fires one reactive wife ScheduledMessage (deliverAt: newTime = immediate) when net worth moves 10%+ from the day's open bar, at most once per day

## Task Commits

Each task was committed atomically:

1. **Task 1: Add netWorthTriggerFiredToday to GameState, initialize, and reset in advanceDay** - `d11f76f` (feat)
2. **Task 2: Convert advanceDay messages to ScheduledMessages and add swing trigger in tickMarket** - `40bf64c` (feat)

**Plan metadata:** (docs commit — follows below)

## Files Created/Modified
- `src/store/types.ts` - Added `netWorthTriggerFiredToday: boolean` field to GameState interface
- `src/store/useGameStore.ts` - Imported ScheduledMessage type; initialized field; partialize exclusion; advanceDay scheduled message conversion; tickMarket swing detection block

## Decisions Made
- `pendingMessages: []` set in Task 1 was scaffolding — replaced by `pendingMessages: newScheduledMessages` in Task 2 so no intermediate state regression
- Extra contact thread entries created at advanceDay time (thread shell with empty messages) so tickMarket delivery has a target thread to append to
- `state.netWorthBars[0].open` chosen as dayOpenNW because the first bar of the day captures market-open net worth; safe because swing detection is gated by `netWorthBars.length > 0`

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
Pre-existing TypeScript errors (LaptopBrowser.tsx, IntraChart.tsx, Robbinghood.tsx, messageTemplates.ts, marketUtils.ts) were present before this plan. None are related to changes in this plan and none were introduced by this plan.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- pendingMessages queue now carries both day-scheduled and reactive swing messages
- tickMarket delivery infrastructure handles both correctly (deliverAt <= newTime)
- Ready for Phase 16 Plan 03 or further QoL polish

---
*Phase: 16-qol-polish*
*Completed: 2026-03-17*
