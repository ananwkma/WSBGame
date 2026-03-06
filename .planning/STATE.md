# Project State

## Phase 9: Accurate Options Engine (In Progress)
- [x] **09-01: Black-Scholes Engine & Normal CDF**
  - [x] Implemented `calculateBS` function in `marketUtils.ts`.
  - [x] Updated `calculateOptionPrice` and Greek calculations to use the new engine.
- [x] **09-02: Dynamic IV & IV Crush Logic**
  - [x] Implemented turn-based IV dynamics in `useGameStore.ts`.
  - [x] Added IV spikes before SHIFT events and IV Crush on the day of the event.

## Completed Phases
- [x] **Phase 1: Core Shell & Visual Filter**
- [x] **Phase 2: Trading Engine & UI**
- [x] **Phase 3: Narrative Events & Messaging**
- [x] **Phase 4: Polish & Endings**
- [x] **Phase 5: Advanced Trading & Dynamic Social**
- [x] **Phase 6: Options Chains & Portfolio Analytics**
- [x] **Phase 7: History Tab & Performance Indicators**
- [x] **Phase 8: Messaging Overhaul & Chart Fix**

## Recent Changes
- Implemented dynamic Implied Volatility (IV) in the game store.
- IV now spikes 1-2 turns before major SHIFT events to simulate market anticipation.
- IV resets to base levels (IV Crush) immediately when the SHIFT event occurs.
- IV decays slowly (10% per turn) towards base level during periods of low activity.
- Options premiums now correctly reflect volatility changes via the Black-Scholes model.

## Current Focus
- Phase 09, Wave 3: UI indicators for IV and Vega.
