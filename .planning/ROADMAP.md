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

## Phase Details

### Phase 8: Messaging Overhaul & Chart Fix
**Goal**: Overhaul the social layer into a modern threaded messaging app and fix the persistent green chart bug.
**Depends on**: Phase 7
**Requirements**: NARR-04, NARR-05, VIS-08
**Success Criteria**:
  1. Net Worth chart turns red correctly when daily performance is negative.
  2. Messaging app features a contact list with avatars, previews, and unread badges.
  3. Clicking a contact opens a full thread view with a "New Messages" separator line.
  4. Contacts are auto-sorted with the most recent activity at the top.
  5. The "Wife" character sends daily messages that react dynamically to the player's Net Worth (Starting: $100k).
**Plans**:
- [x] 8-01-PLAN.md — Fix: PriceChart Color Logic & Duplicate Values.
- [x] 8-02-PLAN.md — State: Threaded Messaging & Wife Sentiment Engine.
- [x] 8-03-PLAN.md — UI: Contact List & Thread Detail View.

### Phase 9: Accurate Options Engine
**Goal**: Replace the simplified options pricing model with a mathematically consistent Black-Scholes implementation.
**Depends on**: Phase 8
**Requirements**: TRADE-09, TRADE-10, TRADE-11, TRADE-12
**Success Criteria**:
  1. Options premiums calculated via Black-Scholes approximation.
  2. Greeks (Delta, Gamma, Theta, Vega) updated based on the new model.
  3. Each stock has a dynamic Implied Volatility (IV) value.
  4. "IV Crush" logic implemented for narrative-driven volatility spikes/drops.
  5. UI updated to display IV and Vega for better player visibility.
**Plans**:
- [x] 09-01-PLAN.md — Logic: Black-Scholes Engine & Normal CDF.
- [x] 09-02-PLAN.md — State: Dynamic IV & IV Crush Logic.
- [x] 09-03-PLAN.md — UI: IV Indicators & Vega Display.

### Phase 10: Social Expansion & GuruTube Overhaul
**Goal**: Overhaul GuruTube into a high-energy financial news parody and massively expand the narrative content.
**Depends on**: Phase 9
**Requirements**: NARR-06, NARR-07, VIS-09
**Success Criteria**:
  1. GuruTube features dynamic SVG mini-charts that reflect real stock performance.
  2. Multiple ticker marquees scroll across the GuruTube UI with live stock data.
  3. The Guru character has at least 4 distinct emotional states tied to their current prediction.
  4. Daily text volume increased to 2-4 messages per turn.
  5. Message variety improved via a new template system in `src/data/messageTemplates.ts`.
**Plans**:
- [x] 10-01-PLAN.md — UI: GuruTube Visual Overhaul (SVG Charts & Marquees).
- [x] 10-02-PLAN.md — Logic: Guru Emotions & Narrative Template System.
- [x] 10-03-PLAN.md — Content: High-Volume Message Generation & Polish.

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

