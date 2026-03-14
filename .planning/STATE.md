# Project State

## Phase 15: Live Market Events Polish
- [x] **Plan 01 — (Wave 1 parallel)**: Real-time engine (plan 01 in wave)
- [x] **Plan 02 — UI Branding & Cleanup**: Phone renamed uPhone/uMessage/readit; HYPE LEVEL bar removed; DualViewShell hype jitter eliminated; laptop readit tab added with u/DegenTrader WSB onboarding post and 6 troll tutorial replies.
- [x] **Plan 05 — Sound & Polish**: Chiptune sound engine (market bells, big gain/loss, borrow sound); pixel coin/flame particle bursts on 20%+ tick moves; EndingScreen framer-motion entrance animation.

## Key Decisions (Phase 15)
- Removed useGameStore entirely from DualViewShell — static animate {x:0,y:0}
- ReaditTab uses existing pixel.css classes — no new CSS file
- LaptopBrowser address bar URL updated per-tab

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

## Current Focus
- Phase 15 in progress. Plans 15-01, 15-02, 15-05 complete (2026-03-14).
- Last session: Completed 15-05-PLAN.md (2026-03-14)

## Key Decisions
- useMarketClock uses getState().tickMarket() (non-stale closure) for setInterval
- Per-tick vol = dailyVol/sqrt(390) to preserve daily variance across 390 market ticks
- Persist version bumped to 1 with migration stripping hype and nextTurn from saved state
- advanceDay resets marketTime to 480 (8am pre-market) for all days after Day 1; Day 1 starts at 360 (6am)
- AudioContext created lazily on first playTone call — avoids browser autoplay policy violations before user interaction
- bigGainTicker/bigLossTicker are transient fields excluded from persist partialize; reset to null each tick
- 20% single-tick threshold for particle/sound trigger fires mainly during market event price multipliers
- ParticleBurst placed in relative wrapper around chart container in Robbinghood stock detail view

