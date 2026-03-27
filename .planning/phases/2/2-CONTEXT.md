# Phase 2: Trading Engine & UI - Context

**Created:** 2026-03-03
**Status:** LOCKED

## 1. Trading Interface (UX)
The 'Robbinghood' app must feel like a deliberate, high-stakes mobile interface within the laptop screen.
- **Structure:** Use a **Tabbed Navigation** pattern (e.g., Portfolio, Trade, History).
- **Execution:** Implement an **Interactive Swipe/Hold** confirm mechanic for trades (simulating a 'Swipe to Trade' mobile feel).
- **Feedback:** Use high-impact **Screen Flashes** (Green for gains, Red for losses) and **Visual Text Popups** (e.g., "TO THE MOON!", "GUH") for significant trades or price movements.

## 2. Market Behavior (Logic)
The market should be volatile but narrative-driven, rewarding (or punishing) the player's "degenerate" decisions.
- **Volatility:** Asset prices should swing between **10% and 50%** per turn.
- **Guru Advice:** Implement "GuruTube" advice as an **Inverse Indicator** (e.g., 70% of the time they are wrong, 30% they are right).
- **Turn Loop:** Clicking "Next Day" triggers the market update, price history logging, and checks for narrative event triggers.

## 3. Asset Variety (Content)
Start with a focused set of "meme" assets to establish the economic loop.
- **Assets:** **Stocks Only** for the initial implementation of Phase 2 (Options to be deferred or added in Phase 3).
- **Tickers:** Use **Inspired Clones** (e.g., $GAME for GameStop, $POPC for AMC, $APE for Reddit favorites).
- **Starting State:** Player begins with **$100,000** in cash and zero holdings.

## 4. State & Economics
- **Precision:** Store all currency and prices in **cents (integers)** to prevent rounding errors.
- **Metrics:** Track **Total Net Worth** (Cash + Market Value of Holdings) as the primary game-ending metric.
- **History:** Maintain a price history (array of prices) for each ticker to drive the **Stair-Step Chart** visualization.

---
*Downstream agents (researcher/planner) must strictly adhere to these UX and logic decisions.*
