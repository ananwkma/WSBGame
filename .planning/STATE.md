# Project State

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

## Phase 12: Multiple Endings Expansion (In Progress)
- [x] **Plan 01 — Type System & Detection Cascade**: Replaced 3-value EndingType with 10-value union; added peakOpportunityCost infrastructure; implemented 10-ending priority cascade in nextTurn() with cents thresholds.
- [ ] **Plan 02 — EndingScreen UI**: Update EndingScreen.tsx to display all 10 endings.

## Recent Changes
- Replaced `EndingType` union (`MOON | LEGEND | MENDYS`) with 10-value union covering full wealth/behavior spectrum.
- Added `peakOpportunityCost: number` to `GameState` and `getOpportunityCost()` to `GameActions`.
- Implemented 10-ending priority cascade in `nextTurn()` with behavior overrides (DEBT_SPIRAL, PAPER_HANDS) and wealth brackets (BREAK_EVEN through PRIVATE_ISLAND).
- Removed stale karma-gated LEGEND ending.

## Key Decisions
- Conservative proxy (t.totalValue) used for OPTION_SELL opportunity cost since strike price is not stored in TradeEntry.
- PAPER_HANDS check only applies when settledNetWorth < $100k to avoid false positives for wealthy players.
- peakOpportunityCost computed lazily at game-end, not tracked mid-game.

## Current Focus
- Phase 12 Plan 01 complete. EndingScreen.tsx (Plan 02) still references old 3 endings and needs updating to consume all 10 EndingType values.
