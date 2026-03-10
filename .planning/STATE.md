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
- [x] **Phase 12: Multiple Endings Expansion**
  - [x] **Plan 01 — Type System & Detection Cascade**: Replaced 3-value EndingType with 10-value union; added peakOpportunityCost infrastructure; implemented 10-ending priority cascade in nextTurn() with cents thresholds.
  - [x] **Plan 02 — EndingScreen UI**: Rebuilt EndingScreen.tsx with 10 WSB-ironic endings — unique title, description, color, and ASCII art per ending; Record<EndingType, EndingContent> enforces TypeScript exhaustiveness; .ending-ascii CSS class added to pixel.css.
- [x] **Phase 14: Shark Loans & Debt Mechanic**
  - [x] **Plan 01 — Debt Engine**: Full sharkDebt game-loop engine — borrowFromShark action, 20% per-turn compounding, debt-adjusted net worth, correct DEBT_SPIRAL detection, Loan Shark thread, and tiered threatening messages.
  - [x] **Plan 02 — Shark Loan UI**: SharkLoanPanel in Loan Shark SMS thread with 4 preset borrow buttons and outstanding debt display; SHARK DEBT row in Robbinghood Portfolio tab; SHARK DEBT stat on EndingScreen.

## Recent Changes
- Added SharkLoanPanel inline component to MessageThread.tsx: renders below messages for Loan Shark thread with outstanding debt display and 4 preset borrow buttons ($10k/$25k/$50k/$100k), disabled when game ended.
- Added SHARK DEBT conditional row to Robbinghood Portfolio tab using red color (#ba8b8b), hidden when sharkDebt === 0.
- Added SHARK DEBT stat row to EndingScreen.tsx, hidden when sharkDebt === 0.
- Added shark-loan-panel CSS styles to Phone.css.
- TypeScript compiles clean (0 errors).

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

## Current Focus
- Phase 14 complete. Full shark loan mechanic: engine (14-01) + player-facing UI (14-02).
- Last session: Completed 14-02-PLAN.md (2026-03-10)
