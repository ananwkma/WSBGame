# Project State

## Phase 15: Live Market Events Polish
- [x] **Plan 01 — (Wave 1 parallel)**: Real-time engine (plan 01 in wave)
- [x] **Plan 02 — UI Branding & Cleanup**: Phone renamed uPhone/uMessage/readit; HYPE LEVEL bar removed; DualViewShell hype jitter eliminated; laptop readit tab added with u/DegenTrader WSB onboarding post and 6 troll tutorial replies.
- [x] **Plan 03 — IntraChart Component**: Multi-timeframe SVG chart with OHLC candles, crosshair, groupBars utility, IntraChart wired in Robbinghood for stock and portfolio views, earnings countdown.
- [x] **Plan 05 — Sound & Polish**: Chiptune sound engine (market bells, big gain/loss, borrow sound); pixel coin/flame particle bursts on 20%+ tick moves; EndingScreen framer-motion entrance animation.
- [x] **Plan 06 — Final Verification**: TypeScript clean build confirmed (tsc --noEmit exits 0); NewsPanel scrolling ticker; IntraChart OHLC tooltip + x-axis labels; all 7 human gameplay checks approved.

## Key Decisions (Phase 15)
- Removed useGameStore entirely from DualViewShell — static animate {x:0,y:0}
- ReaditTab uses existing pixel.css classes — no new CSS file
- LaptopBrowser address bar URL updated per-tab
- IntraChart dailyHistory expects HistoryPoint (turn+price); liveNetWorthHistory mapped at call site from NetWorthPoint (turn+value)
- EARNINGS_DAYS static lookup in Robbinghood.tsx spread across days 3-8 for all 6 tickers
- MARKET CLOSED overlay shown only when !marketIsOpen AND intradayBars.length === 0

## Completed Phases
- [x] **Phase 1: Core Shell & Visual Filter**
- [x] **Phase 2: Trading Engine & UI**
- [x] **Phase 3: Narrative Events & Messaging**
- [x] **Phase 4: Polish & Endings**
- [x] **Phase 5: Advanced Trading & Dynamic Social**
- [x] **Phase 6: Options Chains & Portfolio Analytics**
- [x] **Phase 7: History Tab & Performance Indicators**
- [x] **Phase 8: Messaging Overhaul & Chart Fix**
- [x] **Phase 9: Accurate Options Engine**
- [x] **Phase 10: Social Expansion & GuruTube Overhaul**
- [x] **Phase 11: Granular Narrative & Debt Foundation**
  - [x] **14-Tier Wife Brackets**: Implemented specific narrative tones for net worth ranges from "Bankrupt" to "Billionaire".
  - [x] **Massive Content Expansion**: Added 875+ unique message templates, with 25 variations for every character and sentiment tier.
  - [x] **Range-Based Logic**: Refactored the narrative engine to select messages based on exact financial values rather than simple sentiment.
  - [x] **Debt Foundation**: Initialized `sharkDebt` state to prepare for future loan mechanics.
- [x] **Phase 12: Multiple Endings Expansion**
  - [x] **Plan 01 — Type System & Detection Cascade**: Replaced 3-value EndingType with 10-value union; added peakOpportunityCost infrastructure; implemented 10-ending priority cascade in nextTurn() with cents thresholds.
  - [x] **Plan 02 — EndingScreen UI**: Rebuilt EndingScreen.tsx with 10 WSB-ironic endings — unique title, description, color, and ASCII art per ending; Record<EndingType, EndingContent> enforces TypeScript exhaustiveness; .ending-ascii CSS class added to pixel.css.
- [x] **Phase 14: Shark Loans & Debt Mechanic**
  - [x] **Plan 01 — Debt Engine**: Full sharkDebt game-loop engine — borrowFromShark action, 20% per-turn compounding, debt-adjusted net worth, correct DEBT_SPIRAL detection, Loan Shark thread, and tiered threatening messages.
  - [x] **Plan 02 — Shark Loan UI**: SharkLoanPanel in Loan Shark SMS thread with 4 preset borrow buttons and outstanding debt display; SHARK DEBT row in Robbinghood Portfolio tab; SHARK DEBT stat on EndingScreen.
  - [x] **Plan 03 — Verification**: All 7 gameplay checks passed. Fixed net worth display (negative sign + red color), fixed LOSS PORN: LEGENDARY STATUS popup color.

## Recent Changes
- Fixed net worth display in Portfolio tab: negative net worth now shows `-$X` in red (#ba8b8b) when debt exceeds assets.
- Fixed LOSS PORN: LEGENDARY STATUS popup — changed from green ('positive') to red ('negative').
- Human-verified full shark loan loop: borrow, compound, wife bracket shift, DEBT_SPIRAL ending, post-game lock.

## Key Decisions
- Conservative proxy (t.totalValue) used for OPTION_SELL opportunity cost since strike price is not stored in TradeEntry.
- PAPER_HANDS check only applies when settledNetWorth < $100k to avoid false positives for wealthy players.
- peakOpportunityCost computed lazily at game-end, not tracked mid-game.
- Emoji in ASCII art replaced with text/symbol alternatives for compatibility with 4-color Game Boy palette filter.
- ENDING_CONTENT typed as Record<EndingType, EndingContent> so TypeScript enforces exhaustiveness at compile time.
- newDebt computed as local variable at top of nextTurn() so it is in scope for both the day>=10 branch and the normal-turn set().
- debtRatio uses post-debt currentNetWorth so ratio correctly exceeds 1.0 when debt outpaces assets.
- Loan Shark thread seeded in getInitialState() so contact exists before borrowFromShark is ever called.
- SharkLoanPanel defined as non-exported inline component; SHARK DEBT placed after Buying Power in Portfolio; EndingScreen uses inline stat-row div for span-level color control.
- formatCurrency uses Math.abs internally; negative net worth sign handled at call site in Robbinghood.tsx to avoid breaking PerformanceIndicator.

## Completed Phases
- [x] **Phase 15: Live Market Events Polish** — All 6 plans complete. Real-time market clock, intraday SVG chart, market events with NewsPanel, chiptune sounds, pixel particle bursts, EndingScreen animation, and branding polish (uPhone/uMessage/readit/NEXT DAY/no HYPE LEVEL) all confirmed in-browser.

## Phase 16: QoL Polish (In Progress)
- [x] **Plan 01 — Market Gating & Readit Text**: NEXT DAY gated (marketTime<960), all 4 SwipeConfirm trading gates added (!marketIsOpen), ReaditTab text color fixed. All 6 human-verify checks passed.
- [x] **Plan 02 — Intraday Message Scheduling**: Wife and extra-contact messages now delivered mid-session via ScheduledMessage queue with random deliverAt 570-959 instead of all at day start. Net-worth swing trigger (10%+ from day open) fires one immediate wife message via tickMarket, once per day.
- [x] **Plan 03 — GuruTube Ticker-Specific Messages**: GURU_VIDEO_MESSAGES added with 90 strings (6 tickers x 3 directions x 5 each, referencing company names). advanceDay now derives guruDirection from price delta (±5% threshold) and calls getGuruVideoMessage. wasGuruCorrect tracking unchanged.

## Key Decisions (Phase 16)
- marketTime < 960 used for NEXT DAY gate (not !marketIsOpen, which also fires during pre-market 360-569, wrongly blocking button at game start)
- Only SwipeConfirm execution gated; ALL IN/SELL ALL shortcuts and OptionsChain browsing left unaffected
- color: '#e0dbcb' on ReaditTab outermost wrapper div fixes .forum-post black text cascade
- Wife and extra-contact messages scheduled with random deliverAt 570-959 (market hours) so they appear mid-session rather than all at once on NEXT DAY
- Extra-contact thread entries still created at advanceDay time (empty shell) so tickMarket delivery can find the thread
- Swing trigger uses state.netWorthBars[0].open as dayOpenNW; gated by netWorthBars.length > 0 and dayOpenNW > 0 to avoid division by zero
- Swing message deliverAt: newTime (immediate delivery on next tickMarket pass)
- 5% price move threshold (±0.05) used to classify guru direction as UP/FLAT/DOWN in advanceDay
- getRandomPrediction removed from useGameStore import after replacement; fallback still exists inside getGuruVideoMessage in messageTemplates.ts

## Current Focus
- Phase 18 Plan 01 complete (e05fb3d, f85a00d). Clock speed control added.
- Last session: Phase 18 Plan 01 complete (2026-03-18)

## Phase 18: Clock Speed Control (In Progress)
- [x] **Plan 01 — Clock Speed Control**: Speed parameter added to useMarketClock (1x/2x/5x, BASE_INTERVAL_MS/speed). App.tsx gains SPEEDS const, ClockSpeed type, clockSpeed state, cycleSpeed function, speed cycle button inside clock box. NEXT DAY resets to 1x. DEBUG/IS_DEBUG_MODE/skipTime/+5m/+1h all removed.

## Key Decisions (Phase 18)
- SPEEDS const and ClockSpeed type are local to App.tsx — not exported or in Zustand
- Speed resets to 1x on each NEXT DAY press (local state, not persisted across page refresh)
- IS_DEBUG_MODE removed entirely from NEXT DAY gate — gate is now purely marketTime < 960
- Speed button placed as third child inside clock container div (after status text)

## Key Decisions (Phase 17)
- previousDayBars NOT in partialize exclusion list — persists through page reload for chart pre-population on refresh
- Snapshot uses state.intradayBars (not get().intradayBars) inside set() call for atomic pre-reset capture
- persist version 3 migration uses version < 3 guard to cover all older saves regardless of skipped versions
- pointerEvents: auto required on lock overlay — DualViewShell .screenContent sets pointer-events:none on unfocused panel
- Lock snapshot taken in focus-transition effect so pre-lock messages don't trigger notifications
- Single setTimeout in lockNotifs effect dismisses all expired items in one pass using arrivedAt > cutoff filter
- isIntraday=false hardcoded in IntraChart for uniform xAt() spacing — pre-populated bars from yesterday fall outside 570-960 time axis causing clamp gaps if xAtTime is used
- handleToggleCandles timeframe bump removed — both LINE and CANDLE now share same tab-specific timeframe set (TODAY: 1M/10M/30M; ALL: 1H/4H/1D)

## Key Decisions
- useMarketClock uses getState().tickMarket() (non-stale closure) for setInterval
- Per-tick vol = dailyVol/sqrt(390) to preserve daily variance across 390 market ticks
- Persist version bumped to 1 with migration stripping hype and nextTurn from saved state
- advanceDay resets marketTime to 480 (8am pre-market) for all days after Day 1; Day 1 starts at 360 (6am)
- AudioContext created lazily on first playTone call — avoids browser autoplay policy violations before user interaction
- bigGainTicker/bigLossTicker are transient fields excluded from persist partialize; reset to null each tick
- 20% single-tick threshold for particle/sound trigger fires mainly during market event price multipliers
- ParticleBurst placed in relative wrapper around chart container in Robbinghood stock detail view

