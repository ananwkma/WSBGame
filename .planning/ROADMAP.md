# Roadmap

## Phases
- [ ] **Phase 1: Core Shell & Visual Filter** - Set up the foundation, layout, and global 4-color aesthetic.
- [ ] **Phase 2: Trading Engine & UI** - Build the functional "Robbinghood" app and core economic loop.
- [ ] **Phase 3: Narrative Events & Messaging** - Connect the world via forum posts, guru advice, and social pressure.
- [ ] **Phase 4: Polish & Endings** - Final narrative outcomes, save state, and juice.
- [ ] **Phase 5: Advanced Trading & Dynamic Social** - Options trading, UI enhancements, and reactive social layer.

## Phase Details

### Phase 1: Core Shell & Visual Filter
**Goal**: Establish the "feel" of the game and the core navigation shell.
**Depends on**: Nothing (start here)
**Requirements**: VIS-01, VIS-02, VIS-03, VIS-04, TECH-01
**Success Criteria**:
  1. The user sees a 4-color grayscale pixel art screen (SVG palette enforced).
  2. The user can switch focus between a "Laptop" view and a "Phone" view.
  3. UI elements align to a strict pixel grid (8x8 tile logic).
  4. The layout is responsive and scales clearly on different screen resolutions.
**Plans**:
- [ ] 1-01-PLAN.md — Project scaffolding and global SVG palette filter.
- [ ] 1-02-PLAN.md — Responsive game viewport and dual-view focus shell.

### Phase 2: Trading Engine & UI
**Goal**: Implement the core mechanical gameplay of trading meme stocks.
**Depends on**: Phase 1
**Requirements**: TRADE-01, TRADE-02, TRADE-03, TRADE-04, TRADE-05, ECON-01, TECH-02
**Success Criteria**:
  1. User can buy and sell at least 3 distinct "meme stocks" via the Robbinghood app.
  2. User's Portfolio Net Worth updates immediately after a trade.
  3. A stair-step line chart visually tracks profit/loss over "time" (turns).
  4. The market updates based on discrete game steps (simulated narrative time).
**Plans**: TBD

### Phase 3: Narrative Events & Messaging
**Goal**: Create the "Echo Chamber" that drives player FOMO and market movement.
**Depends on**: Phase 2
**Requirements**: NARR-01, NARR-02, NARR-03, NARR-04, ECON-02, ECON-03
**Success Criteria**:
  1. A scrolling forum feed (r/wsb) provides narrative context and "tips."
  2. User receives text messages that progress a story or provide financial pressure.
  3. "Losing it all" results in a "Loss Porn" karma notification on the forum.
  4. High-hype posts increase a "FOMO Meter" that causes visual UI artifacts (jitter).
**Plans**:
- [ ] 3-01-PLAN.md — Narrative Event Engine & State.
- [ ] 3-02-PLAN.md — Phone Apps: Chat & r/wsb.
- [ ] 3-03-PLAN.md — Laptop: GuruTube & Event Integration.

### Phase 4: Polish & Endings
**Goal**: Close the loop with narrative consequences and high-quality "pixel juice."
**Depends on**: Phase 3
**Requirements**: ECON-04, VIS-03 (Polish), TECH-03
**Success Criteria**:
  1. The game triggers one of three endings (e.g., "Moon," "Dumpster," or "Legend") based on stats.
  2. All UI transitions (closing/opening apps) have satisfying pixel-art animations.
  3. Player progress is saved automatically and persists after a browser refresh.
**Plans**:
- [x] 4-01-PLAN.md — Ending Logic & Persistence.
- [x] 4-02-PLAN.md — Visual Polish & Animations.

### Phase 5: Advanced Trading & Dynamic Social
**Goal**: Deepen the economic simulation and enhance the social "echo chamber."
**Depends on**: Phase 4
**Requirements**: TRADE-06, TRADE-07, TRADE-08, NARR-05, VIS-05
**Success Criteria**:
  1. User can buy Calls and Puts for all stocks.
  2. Trade page shows real-time cost calculation and buying power.
  3. "All In" button allows quick execution of maximum possible trade.
  4. Phone text is bolded and highly readable.
  5. Forum posts and messages dynamically respond to stock performance and portfolio milestones.
**Plans**:
- [x] 5-01-PLAN.md — Options Trading Engine.
- [x] 5-02-PLAN.md — Robbinghood UI Refinement.
- [x] 5-03-PLAN.md — Dynamic Social & Bold Text.

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
- [ ] 6-01-PLAN.md — Options Chain Logic & Market Value.
- [ ] 6-02-PLAN.md — Visual Overhaul: Diagonal Charts & Pre-population.
- [ ] 6-03-PLAN.md — UI: Portfolio Graph & Options Chain.

## Progress Table

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1: Shell & Filter | 0/2 | Not started | - |
| 2: Trading Engine | 0/3 | Not started | - |
| 3: Narrative/Social | 0/3 | Not started | - |
| 4: Polish & Endings | 2/2 | Completed | 2026-03-05 |
| 5: Advanced Trading | 3/3 | Completed | 2026-03-05 |
| 6: Analytics & Overhaul | 0/3 | In progress | - |
