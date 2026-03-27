# Phase 2: Trading Engine & UI - Research

**Researched:** 2026-03-03
**Domain:** Game State, Financial Simulation, SVG Graphics, Framer Motion
**Confidence:** HIGH

## Summary
This research covers the implementation of a volatile trading engine and its accompanying mobile-style UI. The core findings recommend **Zustand** for state management to handle high-frequency updates (even in turn-based, history logging can be heavy), **D3-shape** for stair-step path generation, and **Framer Motion** for the tactile 'Swipe-to-Trade' interaction.

**Primary recommendation:** Use Zustand with a subscription-based selector pattern for the portfolio and market state to ensure UI snappiness during turn transitions.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **Structure:** Tabbed Navigation (Portfolio, Trade, History).
- **Execution:** Interactive Swipe/Hold confirm mechanic.
- **Feedback:** Screen Flashes (Green/Red) and Visual Text Popups ("TO THE MOON!", "GUH").
- **Volatility:** Asset prices swing between 10% and 50% per turn.
- **Guru Advice:** Inverse Indicator (70% wrong, 30% right).
- **Turn Loop:** "Next Day" button triggers market update and price history logging.
- **Assets:** Stocks Only ($GAME, $POPC, $APE).
- **Starting State:** $100,000 in cash, zero holdings.
- **Precision:** Store all currency/prices in cents (integers).
- **Metrics:** Track Total Net Worth (Cash + Market Value).
- **History:** Maintain price history array for Stair-Step Charts.

### Claude's Discretion
- State management library choice (Zustand vs Context).
- Chart implementation details (D3 vs hand-rolled).
- Specific volatility algorithm implementation.

### Deferred Ideas (OUT OF SCOPE)
- Options (Calls/Puts) - Deferred to Phase 3.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| TRADE-01 | Robbinghood App Interface | Tabbed navigation and Swipe-to-confirm research. |
| TRADE-04 | Stair-step pixel line graphs | D3 `curveStepAfter` implementation verified. |
| TRADE-05 | Market Simulation (Steps) | Arcade-style 10-50% volatility logic defined. |
| TECH-02 | Global State Management | Zustand recommended for performance and scalability. |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Zustand | 4.5+ | Global Game State | Superior re-render control compared to Context. |
| D3-shape | 3.1+ | Path Generation | Industry standard for complex SVG curves (Step-after). |
| Framer Motion | 11.0+ | Interaction/Animation | Best-in-class for drag/swipe and layout transitions. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|--------------|
| clsx/tailwind-merge | Latest | Style Management | Conditional styling for Green/Red flashes. |

## Architecture Patterns

### Recommended Project Structure
```
src/
├── store/
│   └── useGameStore.ts  # Central Zustand store (Portfolio, Market, History)
├── components/
│   ├── Trade/
│   │   ├── SwipeConfirm.tsx
│   │   └── PriceChart.tsx
│   └── Feedback/
│       ├── ScreenFlash.tsx
│       └── PopupText.tsx
└── logic/
    └── marketEngine.ts  # 10-50% Volatility & Guru Logic
```

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| SVG Path Logic | String Concatenation | `d3.line().curve(d3.curveStepAfter)` | Handles edge cases, scales, and clean path data. |
| Drag Logic | Touch/Mouse Events | Framer Motion `drag` | Complex physics, constraints, and mobile support. |
| Currency Math | Floating Point | Integers (Cents) | **Strictly required** per CONTEXT.md to avoid rounding errors. |

## Common Pitfalls

### Pitfall 1: Floating Point Errors
**What goes wrong:** Adding `$0.10 + $0.20` results in `$0.30000000000000004`.
**How to avoid:** Always use integers (cents). Multiply by 100 on input, divide by 100 only at the final display string level.

### Pitfall 2: Context Over-rendering
**What goes wrong:** Updating price history for 5 stocks every turn causes the entire UI (Navigation, Portfolio, Forum) to re-render.
**How to avoid:** Use Zustand selectors: `const portfolio = useStore(s => s.portfolio)`.

## Code Examples

### Stair-Step Chart (D3 + React)
```typescript
import { line, curveStepAfter } from 'd3-shape';

const generatePath = (history: number[], width: number, height: number) => {
  const xScale = (i: number) => (i / (history.length - 1)) * width;
  const yScale = (val: number) => height - (val / Math.max(...history)) * height;
  
  const lineGen = line<number>()
    .x((_, i) => xScale(i))
    .y(d => yScale(d))
    .curve(curveStepAfter);
    
  return lineGen(history);
};
```

### Volatility Logic (Arcade Model)
```typescript
const calculateNextPrice = (currentPrice: number): number => {
  const magnitude = Math.random() * 0.4 + 0.1; // 0.1 to 0.4 (10-50%)
  const direction = Math.random() > 0.5 ? 1 : -1;
  const change = 1 + (magnitude * direction);
  return Math.max(1, Math.round(currentPrice * change)); // Min 1 cent
};
```

### Inverse Guru Roll
```typescript
const getGuruAdvice = (isStockBullish: boolean) => {
  const isLying = Math.random() < 0.7; // 70% chance to mislead
  const adviceBullish = isLying ? !isStockBullish : isStockBullish;
  return adviceBullish ? "🚀 TO THE MOON!" : "📉 ABANDON SHIP!";
};
```
