# Roadmap

## Phases
- [x] **Phase 1: Core Shell & Visual Filter** - Set up the foundation, layout, and global 4-color aesthetic.
- [x] **Phase 2: Trading Engine & UI** - Build the functional "Robbinghood" app and core economic loop.
- [x] **Phase 3: Narrative Events & Messaging** - Connect the world via forum posts, guru advice, and social pressure.
- [x] **Phase 4: Polish & Endings** - Final narrative outcomes, save state, and juice.
- [x] **Phase 5: Advanced Trading & Dynamic Social** - Options trading, UI enhancements, and reactive social layer.
- [x] **Phase 6: Options Chains & Portfolio Analytics** - High-fidelity options, portfolio tracking, and visual overhaul.
- [x] **Phase 7: History Tab & Performance Indicators** - Trade ledger, cost basis, and color-coded gain/loss feedback.
- [x] **Phase 8: Messaging Overhaul & Chart Fix** - Threaded messaging, unread indicators, dynamic Wife dialogue, and fixing the chart line color bug.
- [x] **Phase 9: Accurate Options Engine** - Implement Black-Scholes model, updated Greeks, and IV dynamics (IV Crush).
- [x] **Phase 10: Social Expansion & GuruTube Overhaul** - Dynamic GuruTube UI (charts, marquees, emotions) and high-volume narrative templates.
- [x] **Phase 11: Granular Narrative & Debt Foundation** - 14-tier narrative brackets, 800+ message templates, and groundwork for loans/debt.

## Phase Details

### Phase 11: Granular Narrative & Debt Foundation
**Goal**: Implement a highly granular, 14-bracket narrative system for the Wife and massively expand message variety for all characters.
**Depends on**: Phase 10
**Requirements**: NARR-08, NARR-09, MECH-01
**Success Criteria**:
  1. Wife character has 14 distinct Net Worth brackets ranging from Bankrupt (<$0) to Billionaire (>$1B).
  2. Each Wife bracket contains at least 25 unique message templates (350 total).
  3. Other characters (Guru, Apes, etc.) have 25 unique templates per sentiment tier.
  4. Message generation logic supports exact numeric range lookups.
  5. Foundation laid for "Shark Loans" mechanic (state tracking for debt).
**Plans**:
- [x] 11-01-PLAN.md — Logic: Range-Based Template Selector & Types.
- [x] 11-02-PLAN.md — Content: The Great Message Expansion (Wife - 350 texts).
- [x] 11-03-PLAN.md — Content: Supporting Cast Expansion (500+ texts).

### Phase 12: Multiple Endings Expansion
**Goal**: Replace the 3-ending system with 10 distinct, flavored endings based on varied conditions — net worth thresholds, trading behavior, karma, debt, and other playstyle signals.
**Depends on**: Phase 11
**Requirements**: NARR-10
**Success Criteria**:
  1. At least 10 unique endings exist, each with its own title, description, and visual treatment.
  2. Each ending has a distinct trigger condition (not all net-worth-gated).
  3. Ending detection evaluates all conditions and picks the most specific match.
  4. Existing MOON / LEGEND / MENDYS endings are replaced or absorbed.
**Plans**: 3 plans
**Plan list**:
- [x] 12-01-PLAN.md — State layer: EndingType union (10 values), peakOpportunityCost field, 10-ending detection cascade in useGameStore
- [ ] 12-02-PLAN.md — Content layer: ENDING_CONTENT rebuild (10 entries with WSB copy + ASCII art), .ending-ascii CSS class
- [ ] 12-03-PLAN.md — Verification: stale-reference audit, tsc clean build, human visual check of ending screens

## Progress Table


| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1: Shell & Filter | 2/2 | Completed | 2026-03-03 |
| 2: Trading Engine | 3/3 | Completed | 2026-03-03 |
| 3: Narrative/Social | 3/3 | Completed | 2026-03-03 |
| 4: Polish & Endings | 2/2 | Completed | 2026-03-05 |
| 5: Advanced Trading | 3/3 | Completed | 2026-03-05 |
| 6: Options Chains | 3/3 | Completed | 2026-03-05 |
| 7: History & Perf | 3/3 | Completed | 2026-03-06 |
| 8: Messaging & Chart | 3/3 | Completed | 2026-03-06 |
| 9: Options Engine | 3/3 | Completed | 2026-03-06 |
| 10: Social & Guru | 3/3 | Completed | 2026-03-06 |
| 11: Granular Narrative | 3/3 | Completed | 2026-03-08 |
| 12: Multiple Endings | 1/3 | In Progress | — |

