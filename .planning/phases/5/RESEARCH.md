# Phase 5: Advanced Trading & Dynamic Social - Research

**Researched:** 2026-03-05
**Domain:** Financial Simulation & Social Narrative Engine
**Confidence:** HIGH

## Summary
Phase 5 focuses on deepening the economic simulation through Options trading and making the social layer (Phone/Forum) reactive to player performance. 

## 1. Options Trading (Turn-Based)
For a turn-based game, we will use a simplified "Premium + Expiry" model instead of complex Greeks.
- **Contract Type:** CALL (bet price goes up) or PUT (bet price goes down).
- **Strike Price:** Locked to the `currentPrice` at the time of purchase.
- **Expiry:** Options expire in a fixed number of turns (e.g., 3 days).
- **Premium (Cost):** Calculated as a percentage of the strike price (e.g., 5-10% based on stock volatility).
- **Payoff Calculation:**
  - **Call:** `Math.max(0, currentPrice - strikePrice)` at expiry.
  - **Put:** `Math.max(0, strikePrice - currentPrice)` at expiry.
- **Settlement:** On `nextTurn()`, check for expired contracts and add the payoff to the user's cash balance.

## 2. Robbinghood UI Enhancements
The trade screen needs to provide more immediate financial context.
- **Real-time Cost:** A dynamic label showing `Amount * CurrentPrice` (for stocks) or `Amount * Premium` (for options).
- **Buying Power:** A quick-view label showing the current `cash` balance.
- **"All In" Button:** A convenience button that calculates `Math.floor(cash / currentPrice)` and sets the amount input.

## 3. Phone Readability (Pixel Bold)
To improve readability on the phone without blurring pixel fonts:
- **Technique:** Use CSS `text-shadow: 1px 0 0 currentColor` to simulate a "pixel-aligned" bold effect.
- **Context:** Apply this specifically to the message bubbles and forum post titles on the phone.

## 4. Dynamic Social Simulation
The forum and messages should feel like they are watching the player.
- **State Triggers:**
  - **Loss Porn:** Triggered if `netWorth` drops by >30% in one turn.
  - **Tendies:** Triggered if `netWorth` gains by >50% in one turn.
- **Progressive Messaging:** Message chains that unlock based on a combination of `day` count and `netWorth` milestones.
- **Forum Reactions:** New `ForumPost` types that are added to the store when specific market conditions are met (e.g., "$GAME is cratering, who is holding bags?").

## 5. Implementation Strategy
- **Store Updates:** Extend `GameState` with `optionsHoldings` and dynamic social trigger logic.
- **Component Refactor:** Modularize the `Trade` tab in `Robbinghood` to support both Stock and Option trading modes.
- **CSS Refactor:** Add utility classes for bold pixel text in `pixel.css`.
