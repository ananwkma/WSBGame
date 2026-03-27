# Phase 6: Options Chains & Portfolio Analytics - Research

**Researched:** 2026-03-05
**Domain:** Financial UI & Greek Approximations
**Confidence:** HIGH

## Summary
Phase 6 overhauls the options system to include high-fidelity chains with Greeks and a portfolio analytics layer. Charts will transition to a linear (diagonal) style and be pre-populated with data.

## 1. Options Chain & 1DTE Logic
Options will be simplified to a 1-day expiry (1DTE) model. 
- **Chain Structure:** Three strikes per stock:
    - **ITM (In-the-Money):** Strike < Price (Calls), Strike > Price (Puts).
    - **OTM (Out-of-the-Money):** Strike approx. Price.
    - **Far OTM:** Strike > Price (Calls), Strike < Price (Puts).
- **Greeks (Made-up but logical):**
    - **Delta:** Sensitivity to price move (0 to 1). Calculated using a Sigmoid function based on moneyness.
    - **Gamma:** Rate of change of Delta. Highest at-the-money.
    - **Theta:** Time decay (negative value).
- **1DTE Expiry:** All purchased options settle at the end of the next turn.

## 2. Portfolio Net Worth & Market Value
A critical bug was identified where Net Worth does not reflect option value.
- **Formula:** `NetWorth = Cash + Σ(Stock Holding * Price) + Σ(Option Holding * MarketValue)`.
- **Option Market Value:** `Intrinsic Value + Extrinsic Value (Volatility Premium)`.
- **Storage:** Persist `netWorthHistory` in the store to drive the homepage chart.

## 3. Visual Chart Overhaul
- **Linear Lines:** Replace `d3.curveStepAfter` with `d3.curveLinear` in `PriceChart.tsx`.
- **Pre-population:** Generate ~20 turns of arbitrary historical data for each stock during the initial game setup.
- **Performance Chart:** New chart component on the Robbinghood Home tab showing Net Worth performance.

## 4. Requirement Mapping
- **TRADE-09:** High-fidelity Options Chain with Greeks.
- **TRADE-10:** Portfolio Net Worth performance chart.
- **VIS-06:** Linear (diagonal) line charts.
- **VIS-07:** Historical data pre-population.

## Code Example: Greek Sigmoid (Delta)
```typescript
const calculateDelta = (price: number, strike: number, type: 'CALL' | 'PUT') => {
  const moneyness = (price - strike) / (strike * 0.2); // simple vol factor
  const delta = 1 / (1 + Math.exp(-2 * moneyness));
  return type === 'CALL' ? delta : delta - 1;
};
```
