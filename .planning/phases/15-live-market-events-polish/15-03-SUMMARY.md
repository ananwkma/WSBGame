---
phase: 15-live-market-events-polish
plan: "03"
subsystem: ui
tags: [chart, svg, candles, ohlc, intraday, timeframe, crosshair, react]

requires:
  - phase: 15-live-market-events-polish
    provides: [CandleBar, intradayBars, netWorthBars, marketTime, marketIsOpen, tickMarket]
provides:
  - IntraChart SVG component with 4 timeframe tabs, candle/line toggle, crosshair, MARKET CLOSED overlay
  - groupBars() OHLC aggregation utility for 30M/1H/1D timeframes
  - IntraChart wired in Robbinghood for both stock and portfolio net worth views
  - Earnings countdown below stock header using EARNINGS_DAYS lookup
affects: [Robbinghood.tsx, chart display, portfolio view, stock trade view]

tech-stack:
  added: []
  patterns:
    - "ResizeObserver for responsive SVG width tracking"
    - "localStorage for per-user chart timeframe preference"
    - "Inline SVG candle rendering with rect+line per bar"
    - "d3-shape line() with curveLinear for line chart mode"

key-files:
  created: [src/components/Trade/IntraChart.tsx]
  modified: [src/utils/marketUtils.ts, src/components/Trade/Robbinghood.tsx]

key-decisions:
  - "IntraChart uses dailyHistory HistoryPoint[] (turn+price) for history mode — liveNetWorthHistory mapped from NetWorthPoint (turn+value) at call site"
  - "netWorthBars passed as optional prop; portfolio chart uses them for intraday session, falls back to intradayBars=[] when timeframe is ALL"
  - "EARNINGS_DAYS spread across days 3-8 for all 6 tickers to create meaningful gameplay tension"
  - "Candle bar width computed dynamically: max(2, min(8, chartW/barCount - 1)) to scale gracefully"
  - "MARKET CLOSED overlay only shown when !marketIsOpen AND intradayBars.length === 0 (no pre-market data yet)"

patterns-established:
  - "Pattern: Chart source bar selection — sessionOnly + timeframe determines whether to use intradayBars (with groupBars) or build synthetic bars from dailyHistory"
  - "Pattern: Earnings countdown — static EARNINGS_DAYS lookup per ticker, compares against currentDay from store"

requirements-completed: [TRADE-14]

duration: 3min
completed: 2026-03-14
---

# Phase 15 Plan 03: IntraChart Component Summary

**Multi-timeframe SVG intraday chart with OHLC candles, crosshair tooltip, and earnings countdown wired into Robbinghood for both stock and portfolio views**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-03-14T22:07:32Z
- **Completed:** 2026-03-14T22:10:27Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Created IntraChart.tsx (195 lines) with 4 timeframe tabs [1M/30M/1H/1D], session/history toggle [TODAY/ALL], line/candle toggle, Y-axis dollar labels, crosshair with price+time tooltip, and MARKET CLOSED overlay
- Added `groupBars()` to marketUtils.ts for OHLC aggregation of 1-minute CandleBar[] into 30M/1H/1D buckets
- Replaced both PriceChart usages in Robbinghood.tsx with IntraChart — individual stock (candle toggle enabled) and portfolio net worth (candle toggle disabled)
- Added earnings countdown line below each stock's price header using a static EARNINGS_DAYS lookup spread across days 3-8

## Task Commits

1. **Task 1: Add groupBars utility and create IntraChart.tsx** - `26a923e` (feat)
2. **Task 2: Wire IntraChart into Robbinghood.tsx** - `4a54dd0` (feat)

**Plan metadata:** (docs commit)

## Files Created/Modified
- `src/components/Trade/IntraChart.tsx` - Full SVG chart component: timeframe tabs, candle/line modes, crosshair, MARKET CLOSED overlay, localStorage timeframe persistence
- `src/utils/marketUtils.ts` - Added `groupBars(bars, intervalMinutes)` and `CandleBar` import
- `src/components/Trade/Robbinghood.tsx` - Replaced PriceChart with IntraChart in both views; added EARNINGS_DAYS and earnings countdown; added intradayBars/marketTime/marketIsOpen/netWorthBars/currentDay store selectors

## Decisions Made
- Used `liveNetWorthHistory.map((p) => ({ turn: p.turn, price: p.value }))` to convert NetWorthPoint[] to HistoryPoint[] at the Robbinghood call site, since the IntraChart dailyHistory prop expects `{turn, price}` but netWorthHistory has `{turn, value}`
- EARNINGS_DAYS defined as static lookup in Robbinghood.tsx (not read from scheduledEvents) since the plan allows discretion and scheduledEvents are seeded per-day dynamically

## Deviations from Plan

None - plan executed exactly as written, with one minor adaptation at the portfolio chart mapping (using `turn`/`value` field names matching actual NetWorthPoint type, vs the plan's example showing `day`/`netWorth`).

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- IntraChart renders correctly for both stock and portfolio views
- groupBars utility available for any future chart aggregation needs
- Earnings countdown displays for all 6 tickers
- Zero TypeScript errors

---
*Phase: 15-live-market-events-polish*
*Completed: 2026-03-14*
