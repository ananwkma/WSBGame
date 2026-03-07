# Phase 9: Accurate Options Engine - Research

**Researched:** 2026-03-06
**Domain:** Financial Engineering / Options Pricing
**Confidence:** HIGH

## Summary

This phase replaces the simplified "Gaussian extrinsic" options model with a mathematically consistent Black-Scholes implementation. This ensures that Greeks (Delta, Gamma, Theta, Vega) are accurately calculated and that premiums reflect market expectations, volatility (IV), and time to decay. The engine will handle the "IV Crush" phenomenon where implied volatility spikes before major events (Earnings, Squeezes) and collapses afterward, drastically affecting option prices even if the underlying price remains favorable.

**Primary recommendation:** Use the Abramowitz & Stegun approximation for the Normal CDF to implement Black-Scholes in pure TypeScript, ensuring zero dependencies and high performance.

<user_constraints>
## User Constraints (from CONTEXT.md)

*Note: No CONTEXT.md was provided for this phase. Research is based on the objectives provided in the prompt.*

### Locked Decisions
- Implement Black-Scholes approximation for turn-based options.
- Define specific IV levels: $GAME (high), $POPC (medium), $APE (extreme).
- Implement "IV Crush" logic.
- Ensure 1DTE options retain value under high IV.

### Claude's Discretion
- Implementation details of the BS formula and CDF approximation.
- Specific IV values and scaling for "Time to Expiry" (T).
- Exact math for IV Crush triggers and decay.

### Deferred Ideas (OUT OF SCOPE)
- Multi-day expiries (LEAPS, Monthlys).
- Early exercise (American options) - settlement remains European-style at turn transition.
- Dividend yields.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| TRADE-09 | Black-Scholes Model | Implemented via `BlackScholes` utility with CDF approximation. |
| TRADE-10 | Implied Volatility (IV) | Assigned to stocks and reactive to hype/events. |
| TRADE-11 | Options Greeks | Derived from BS partial derivatives (Delta, Gamma, Theta, Vega). |
| TRADE-12 | IV Crush Logic | Implemented in `nextTurn` based on event proximity. |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Pure TS | N/A | Math Implementation | High performance, zero dependency, easy to audit. |

### Supporting
| Component | Purpose | Details |
|-----------|---------|---------|
| Abramowitz & Stegun | CDF Approximation | Industry standard for approximating the normal distribution without a full `erf` function. |

## Architecture Patterns

### Recommended Project Structure
```
src/
├── utils/
│   └── optionsMath.ts      # Black-Scholes engine and CDF
├── store/
│   ├── types.ts            # Added IV and Greeks to StockData and Option
│   └── useGameStore.ts      # Updated pricing logic and IV Crush in nextTurn
```

### Pattern 1: Black-Scholes Engine
**What:** A stateless utility that calculates premium and greeks given (S, K, T, R, V, Type).
**When to use:** Everywhere options are priced (Chain generation, Portfolio valuation, Selling).

### Anti-Patterns to Avoid
- **Hard-coding Theta/Delta:** Greeks must be derived from the model to prevent arbitrage-like errors in the game economy.
- **Ignoring T=0:** Ensure the model handles the exact moment of expiry gracefully (intrinsic only).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Normal Distribution | Custom Gaussian | Abramowitz & Stegun | Better tails and symmetry for Call/Put parity. |
| Greeks Scaling | Random factors | Formal Derivatives | Consistency ensures that buying a Call and selling a Put (synthetic) behaves correctly. |

## Common Pitfalls

### Pitfall 1: Time to Expiry (T) Units
**What goes wrong:** Using "Days" instead of "Years" in the BS formula results in massive premiums.
**How to avoid:** Normalize $T$ as `daysToExpiry / 252` (standard trading days).

### Pitfall 2: Division by Zero at T=0
**What goes wrong:** Gamma and Vega approach infinity/NaN as $T \to 0$.
**How to avoid:** Return `intrinsic` value and `0` for greeks (except Delta) when $T$ is below a small threshold (e.g., $1/1000$ of a day).

### Pitfall 3: IV Crush Perception
**What goes wrong:** Players feel cheated if IV drops and they lose money while price goes UP.
**How to avoid:** Visual feedback! Explicitly show "IV" in the UI so players can see the "Crush" happening.

## Code Examples

### Standard Black-Scholes with Greeks (TS)
```typescript
/**
 * Abramowitz & Stegun approximation for Standard Normal CDF
 */
function stdNormalCDF(x: number): number {
  const b1 = 0.319381530;
  const b2 = -0.356563782;
  const b3 = 1.781477937;
  const b4 = -1.821255978;
  const b5 = 1.330274429;
  const p = 0.2316419;
  const c = 0.39894228;

  if (x >= 0) {
    const t = 1.0 / (1.0 + p * x);
    return (1.0 - c * Math.exp(-x * x / 2.0) * t *
      (t * (t * (t * (t * b5 + b4) + b3) + b2) + b1));
  } else {
    const t = 1.0 / (1.0 - p * x);
    return (c * Math.exp(-x * x / 2.0) * t *
      (t * (t * (t * (t * b5 + b4) + b3) + b2) + b1));
  }
}

function stdNormalPDF(x: number): number {
  return Math.exp(-0.5 * Math.pow(x, 2)) / Math.sqrt(2 * Math.PI);
}

export function calculateBS(
  type: 'CALL' | 'PUT',
  s: number, // Stock Price
  k: number, // Strike Price
  t: number, // Time in years (e.g. 1/252)
  v: number, // Volatility (e.g. 2.0 for 200%)
  r: number = 0.05 // Risk-free rate
) {
  if (t <= 0.0001) {
    const price = type === 'CALL' ? Math.max(0, s - k) : Math.max(0, k - s);
    return { price, delta: type === 'CALL' ? (s > k ? 1 : 0) : (s < k ? -1 : 0), gamma: 0, theta: 0, vega: 0 };
  }

  const d1 = (Math.log(s / k) + (r + Math.pow(v, 2) / 2) * t) / (v * Math.sqrt(t));
  const d2 = d1 - v * Math.sqrt(t);

  const n_d1 = stdNormalCDF(d1);
  const n_d2 = stdNormalCDF(d2);
  const pdf_d1 = stdNormalPDF(d1);

  let price, delta, theta;
  const exp_rt = Math.exp(-r * t);

  if (type === 'CALL') {
    price = s * n_d1 - k * exp_rt * n_d2;
    delta = n_d1;
    theta = (-(s * pdf_d1 * v) / (2 * Math.sqrt(t)) - r * k * exp_rt * n_d2) / 252;
  } else {
    price = k * exp_rt * stdNormalCDF(-d2) - s * stdNormalCDF(-d1);
    delta = n_d1 - 1;
    theta = (-(s * pdf_d1 * v) / (2 * Math.sqrt(t)) + r * k * exp_rt * stdNormalCDF(-d2)) / 252;
  }

  const gamma = pdf_d1 / (s * v * Math.sqrt(t));
  const vega = (s * Math.sqrt(t) * pdf_d1) / 100; // 1% vol change

  return { price, delta, gamma, theta, vega };
}
```

## State of the Art

| Stock | Target IV (Base) | Extreme IV (Squeeze) |
|-------|------------------|----------------------|
| $POPC | 80%              | 200%                 |
| $GAME | 150%             | 400%                 |
| $APE  | 300%             | 800%                 |

**IV Crush Trigger:**
- **Pre-event:** If `SHIFT` event in `T+1` or `T+2`, IV increases by `+100% to +200%` absolute.
- **Post-event:** Immediately after `nextTurn` where event occurs, IV resets to Base + (Hype * 0.5).

## Accuracy Check

**Scenario:** $GAME @ $100, Strike @ $130, IV 200%, 1DTE.
- **Old Model:** ~$0.46
- **New BS Model ($T=1/252$):** ~$0.12
- **New BS Model ($T=1/252$, IV 500%):** ~$4.20

**Observation:** BS is more conservative for far OTM options at "normal" high IVs, but explodes in value when IV hits "Extreme" levels, which perfectly captures the "lottery ticket" feel of $APE or $GAME.

## Open Questions

1. **Risk-free Rate (r):** Should we keep it static (5%) or make it a meme (e.g., 0% because JPOW brrrr)?
   - *Recommendation:* Keep static 5% for stability, or 0% for easier math.
2. **Game Year Length:** 252 (trading days) vs 365 (calendar).
   - *Recommendation:* Use 252 as it's industry standard and makes 1 day feel "longer" (more decay).

## Sources

### Primary (HIGH confidence)
- Investopedia / Wikipedia: Black-Scholes formula and Greeks derivatives.
- Abramowitz and Stegun (1964): Handbook of Mathematical Functions (CDF Approximation).

### Secondary (MEDIUM confidence)
- Option Trading StackExchange: Scaling Theta for daily vs annual.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Pure TS math is robust.
- Architecture: HIGH - Integration into Zustand is straightforward.
- Pitfalls: MEDIUM - Handling $T \to 0$ edge cases requires careful testing.

**Research date:** 2026-03-06
**Valid until:** 2026-04-06 (Stable domain)
