---
phase: 16-qol-polish
plan: "03"
subsystem: message-templates
tags: [guru, messages, content, flavor-text]
dependency_graph:
  requires: [16-02]
  provides: [ticker-specific-guru-messages]
  affects: [src/data/messageTemplates.ts, src/store/useGameStore.ts]
tech_stack:
  added: []
  patterns: [ticker-keyed message pool, price-direction enum]
key_files:
  created: []
  modified:
    - src/data/messageTemplates.ts
    - src/store/useGameStore.ts
decisions:
  - 5% price move threshold used to distinguish UP/FLAT/DOWN guru direction (matches plan spec)
  - getRandomPrediction removed from useGameStore import since getGuruVideoMessage handles fallback internally
  - sentiment BULLISH/BEARISH field on guruPrediction state kept unchanged for wasGuruCorrect accuracy tracking
metrics:
  duration_minutes: 8
  completed: "2026-03-17T10:02:38Z"
  tasks_completed: 2
  tasks_total: 2
  files_modified: 2
---

# Phase 16 Plan 03: GuruTube Ticker-Specific Messages Summary

Expanded GuruTube video messages from generic BULLISH/BEARISH templates to a ticker-keyed structure with 90 unique messages (6 tickers x 3 directions x 5 each) using company-name flavor text, and wired advanceDay to derive direction from actual price movement.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Add GURU_VIDEO_MESSAGES (90 messages) and getGuruVideoMessage helper | 0004157 | src/data/messageTemplates.ts |
| 2 | Update advanceDay to use getGuruVideoMessage with price-based direction | 9607b4a | src/store/useGameStore.ts |

## What Was Built

**messageTemplates.ts additions:**
- `GuruSentimentDir` type: `'DOWN' | 'FLAT' | 'UP'`
- `GURU_VIDEO_MESSAGES` constant: Record keyed by ticker (`$GAME`, `$APE`, `$POPC`, `$GOOGO`, `$APPO`, `$BERG`) with DOWN/FLAT/UP arrays of 5 strings each = 90 total
- `getGuruVideoMessage(ticker, direction)` helper with fallback to `getRandomPrediction` for unknown tickers
- Each message references the company name (GAMEGO, APE LABS, POPCORNFLIX, GOOGO, APPO, ICEBERG CAPITAL) for flavor

**useGameStore.ts changes:**
- Import updated: `getRandomPrediction` removed, `getGuruVideoMessage` and `GuruSentimentDir` added
- `advanceDay` now derives `guruDirection` from `prevTPrice` vs `nextTPrice` with ±5% threshold
- `predictionText` now calls `getGuruVideoMessage(predictionTicker, guruDirection)`
- `sentiment` BULLISH/BEARISH still derived for `guruPrediction.sentiment` so `wasGuruCorrect` tracking is unaffected

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removed getRandomPrediction from useGameStore import**
- **Found during:** Task 2 verification (build)
- **Issue:** After replacing `getRandomPrediction(sentiment, predictionTicker)` with `getGuruVideoMessage(...)`, `getRandomPrediction` became unused in useGameStore.ts, causing TS6133 error
- **Fix:** Removed `getRandomPrediction` from the import line in useGameStore.ts (it remains exported from messageTemplates.ts and used internally in the `getGuruVideoMessage` fallback)
- **Files modified:** src/store/useGameStore.ts
- **Commit:** 9607b4a

## Pre-existing Build Errors (Out of Scope)

The following TypeScript errors existed before this plan and are unchanged:
- `LaptopBrowser.tsx(15)`: `dismissEvent` unused variable
- `IntraChart.tsx(47,50)`: `marketTime`, `ticker` unused variables
- `Robbinghood.tsx(366)`: `stockColor` unused variable
- `messageTemplates.ts(415)`: `SHARK` missing from MESSAGE_TEMPLATES type
- `useGameStore.ts(695,705,715)`: string index on typed stock record
- `marketUtils.ts(135)`: Spread types on non-object

These are logged to deferred items and not touched per scope boundary rules.

## Self-Check: PASSED

- `src/data/messageTemplates.ts` — FOUND, modified with 152-line addition
- `src/store/useGameStore.ts` — FOUND, modified with getGuruVideoMessage call
- Commit `0004157` — FOUND (feat(16-03): add GURU_VIDEO_MESSAGES)
- Commit `9607b4a` — FOUND (feat(16-03): update advanceDay)
- GURU_VIDEO_MESSAGES has 6 ticker keys, each with DOWN/FLAT/UP arrays of 5 strings = 90 total
- getGuruVideoMessage exported with fallback
- advanceDay derives guruDirection from price delta and calls getGuruVideoMessage
- wasGuruCorrect tracking unchanged (guruPrediction.sentiment field still BULLISH/BEARISH)
