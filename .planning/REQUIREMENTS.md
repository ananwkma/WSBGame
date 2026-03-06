# Requirements

## Visuals & Aesthetic (VIS)
- **VIS-01:** The entire game must render using a 4-color grayscale "Game Boy Pocket" palette via SVG `feColorMatrix`.
- **VIS-02:** Dual-interface layout: A central "Laptop Screen" and a peripheral "Handheld Phone."
- **VIS-03:** Pixel-perfect rendering using `image-rendering: pixelated` and 8x8 grid alignment.
- **VIS-04:** Interface must be responsive, adapting the laptop/phone layout for different screen sizes (Laptop focus vs. Phone focus).

## Trading Engine (TRADE)
- **TRADE-01: Robbinghood App:** A simulated trading interface for buying and selling assets.
- **TRADE-02: Asset Support:** Support for Stocks (shares) and basic Options (Calls/Puts).
- **TRADE-03: Portfolio Tracking:** Real-time display of Net Worth, Day Gain/Loss, and Total Gain/Loss.
- **TRADE-04: Charts:** Stair-step pixel line graphs for individual stocks and total portfolio performance.
- **TRADE-05: Market Simulation:** Prices update based on "Steps" (narrative beats) rather than real-time clock.

## Narrative & Social (NARR)
- **NARR-01: r/wsb Forum:** A scrolling feed of "Due Diligence" (DD), Memes, and "Loss Porn" posts.
- **NARR-02: Messages App:** Direct message threads from "Ape Friend" (encourages risk) and "The Wife" (encourages stability).
- **NARR-03: GuruTube:** Parody video player featuring pixel-frame animations of "finance gurus" giving advice.
- **NARR-04: Dynamic Content:** Forum posts and messages must change based on the player's current trades and market volatility.

## Economics & Progression (ECON)
- **ECON-01: Starting Capital:** Player starts with $100,000 cash.
- **ECON-02: Loss Porn Karma:** A reputation system where losing significant money on "YOLO" trades earns community respect.
- **ECON-03: FOMO Meter:** A psychological stat that increases when reading hyped forum posts, affecting UI stability (jitter).
- **ECON-04: Multi-Endings:** At least three distinct endings based on Net Worth and Karma (e.g., "Moon Millionaire," "Community Legend," "Dumpster Behind Wendy's").

## Technical (TECH)
- **TECH-01: Framework:** Built with React + Vite for fast UI-driven development.
- **TECH-02: State Management:** Global game state (Money, Stocks, Reputation, Story Progress) managed via Zustand for performance.
- **TECH-03: Persistence:** Simple local storage save system to track progress between sessions.

## Advanced Features (Phase 5)
- **TRADE-06: Options Support:** User can buy Calls and Puts for all stocks with turn-based expiry.
- **TRADE-07: Real-time Cost Calculation:** Trade page shows expected cost and buying power before execution.
- **TRADE-08: "All In" Execution:** Shortcut to spend all available cash on a specific stock or option.
- **NARR-05: Reactive Social Feed:** Forum posts and messages dynamically respond to stock performance and portfolio changes.
- **VIS-05: Enhanced Readability:** High-contrast bold text for mobile/phone interface to improve accessibility.

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| VIS-01 | Phase 1 | Satisfied |
| VIS-02 | Phase 1 | Satisfied |
| VIS-03 | Phase 1 | Satisfied |
| VIS-04 | Phase 1 | Satisfied |
| TRADE-01 | Phase 2 | Satisfied |
| TRADE-02 | Phase 2 | Satisfied |
| TRADE-03 | Phase 2 | Satisfied |
| TRADE-04 | Phase 2 | Satisfied |
| TRADE-05 | Phase 2 | Satisfied |
| NARR-01 | Phase 3 | Satisfied |
| NARR-02 | Phase 3 | Satisfied |
| NARR-03 | Phase 3 | Satisfied |
| NARR-04 | Phase 3 | Satisfied |
| ECON-01 | Phase 2 | Satisfied |
| ECON-02 | Phase 3 | Satisfied |
| ECON-03 | Phase 3 | Satisfied |
| ECON-04 | Phase 4 | Satisfied |
| TECH-01 | Phase 1 | Satisfied |
| TECH-02 | Phase 2 | Satisfied |
| TECH-03 | Phase 4 | Satisfied |
| TRADE-06 | Phase 5 | Complete |
| TRADE-07 | Phase 5 | Pending |
| TRADE-08 | Phase 5 | Pending |
| NARR-05 | Phase 5 | Pending |
| VIS-05 | Phase 5 | Pending |
