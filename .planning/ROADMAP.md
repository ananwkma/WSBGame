# Roadmap

## Phases
- [x] **Phase 1: Core Shell & Visual Filter** - Set up the foundation, layout, and global 4-color aesthetic.
- [x] **Phase 2: Trading Engine & UI** - Build the functional "Robbinghood" app and core economic loop.
- [x] **Phase 3: Narrative Events & Messaging** - Connect the world via forum posts, guru advice, and social pressure.
- [x] **Phase 4: Polish & Endings** - Final narrative outcomes, save state, and juice.
- [x] **Phase 5: Advanced Trading & Dynamic Social** - Options trading, UI enhancements, and reactive social layer.
- [x] **Phase 6: Options Chains & Portfolio Analytics** - High-fidelity options, portfolio tracking, and visual overhaul.
- [ ] **Phase 7: History Tab & Performance Indicators** - Trade ledger, cost basis, and color-coded gain/loss feedback.

## Phase Details

### Phase 6: Options Chains & Portfolio Analytics
**Goal**: Implement high-fidelity options chains, portfolio tracking, and visual chart overhaul.
**Depends on**: Phase 5
**Requirements**: TRADE-09, TRADE-10, VIS-06, VIS-07
**Success Criteria**:
  1. Options UI displays a chain of ITM, OTM, and Far OTM contracts with "made up" Greeks.
  2. All options are 1DTE and settle automatically the next day.
  3. Portfolio Net Worth accurately includes the market value of active options.
  4. Robbinghood homepage features a "Net Worth" performance line chart.
  5. All charts use diagonal lines (linear) instead of stair-steps.
  6. Charts are pre-populated with arbitrary historical data.
**Plans**:
- [x] 6-01-PLAN.md — Options Chain Logic & Market Value.
- [x] 6-02-PLAN.md — Visual Overhaul: Diagonal Charts & Pre-population.
- [x] 6-03-PLAN.md — UI: Portfolio Graph & Options Chain.

### Phase 7: History Tab & Performance Indicators
**Goal**: Implement a complete trade ledger and provide real-time performance feedback across the UI.
**Depends on**: Phase 6
**Requirements**: TRADE-09, TRADE-10, TRADE-11
**Success Criteria**:
  1. A 'History' tab in Robbinghood displays a scrollable list of all past trades (BUY/SELL/EXPIRY).
  2. The main portfolio screen shows "Daily Change" in both dollar amount and percentage (green/red).
  3. Every stock in the market list shows its 24h (1 turn) percentage change.
  4. Active holdings show total unrealized gain/loss percentage based on average cost basis.
**Plans**:
- [ ] 7-01-PLAN.md — State: Trade Ledger & Cost Basis Logic.
- [ ] 7-02-PLAN.md — UI: Performance Indicators & Color-coded Feedback.
- [ ] 7-03-PLAN.md — UI: History Tab & Expiry Logging.

## Progress Table

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1: Shell & Filter | 2/2 | Completed | 2026-03-03 |
| 2: Trading Engine | 3/3 | Completed | 2026-03-03 |
| 3: Narrative/Social | 3/3 | Completed | 2026-03-03 |
| 4: Polish & Endings | 2/2 | Completed | 2026-03-05 |
| 5: Advanced Trading | 3/3 | Completed | 2026-03-05 |
| 6: Options Chains | 3/3 | Completed | 2026-03-05 |
| 7: History & Perf | 0/3 | Not started | - |
