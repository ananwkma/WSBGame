# Phase 7: History Tab & Performance Indicators - Research

**Researched:** 2026-03-06
**Domain:** Financial UI & Trade Ledger State
**Confidence:** HIGH

## Summary

Phase 7 focuses on enhancing the trading experience by providing better feedback on performance and a clear history of actions. This requires extending the global game state to track individual trade events and calculate performance metrics relative to "yesterday" (the previous turn's state).

**Primary recommendation:** Implement a central `tradeHistory` array in the Zustand store and update the `buy`/`sell` actions to append to it. Use a standard `averageCostBasis` calculation for stocks to provide "Total Gain/Loss" for current holdings.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| TRADE-09 | **History Tab:** Robbinghood "History" tab showing all past trades with realized P/L. | Logic for `TradeEntry` structure and P/L calculation identified. |
| TRADE-10 | **Daily Performance:** Color-coded display of daily net worth changes on the main screen. | `netWorthHistory` already exists; logic to compare current vs last entry identified. |
| TRADE-11 | **Asset Performance:** Percentage change displays for individual assets in all lists. | `StockData.history` already exists; logic to compare current vs last turn's price identified. |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Zustand | 4.x | State Management | Current project standard for game state. |
| Framer Motion | 10.x | UI Animations | Used for tab switching and color-coded flash effects. |
| Intl.NumberFormat | Native | Currency/Percent Formatting | Standard browser API for consistent financial formatting. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| uuid or nanoid | N/A | ID Generation | Generating unique IDs for trade history entries (or use `Math.random().toString(36)` as seen in existing code). |

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   ├── Feedback/
│   │   └── PerformanceText.tsx  # New: Reusable color-coded % display
├── store/
│   ├── types.ts                # Update: Add TradeEntry and related types
│   └── useGameStore.ts         # Update: Logic for history recording and cost basis
```

### Pattern 1: Average Cost Basis for Stocks
To calculate unrealized profit/loss on current holdings, we need the average price paid.
**Formula:** `New Basis = (Current Shares * Current Basis + New Shares * Purchase Price) / (Current Shares + New Shares)`

### Pattern 2: Trade Ledger (History)
Instead of just updating `cash` and `holdings`, every transaction should create an entry in a `tradeHistory` array.
```typescript
interface TradeEntry {
  id: string;
  type: 'BUY' | 'SELL' | 'OPTION_BUY' | 'OPTION_SELL' | 'OPTION_EXPIRY';
  ticker: string;
  amount: number;
  price: number;       // Execution price
  totalValue: number;  // amount * price
  day: number;
  realizedPL?: number; // Only for SELL or EXPIRY
}
```

### Anti-Patterns to Avoid
- **Recalculating everything on render:** Calculate metrics like `dailyChange` once per turn or use `useMemo` in components.
- **Floating point math for currency:** The project already uses cents (integers) for `cash`. Keep this pattern for all trade history to avoid precision issues.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Currency Formatting | `'$' + (val/100).toFixed(2)` | `Intl.NumberFormat` | Handles locales and proper rounding better. |
| Unique IDs | Complex counters | `crypto.randomUUID()` | Built-in and collision-resistant. |

## Common Pitfalls

### Pitfall 1: Average Cost Basis with Partial Sells
**What goes wrong:** Selling shares shouldn't change the *average cost* of the remaining shares, but it *does* realize profit/loss.
**How to avoid:** Only update `averageCostBasis` on **BUY** operations. **SELL** operations use the existing basis to calculate `realizedPL`.

### Pitfall 2: Option Expiry in History
**What goes wrong:** Options that expire worthless often get forgotten in history.
**How to avoid:** Explicitly add an `OPTION_EXPIRY` entry in the `nextTurn` logic when filtering out expired options.

### Pitfall 3: "Yesterday" definition
**What goes wrong:** Confusing "previous turn" with "start of game".
**How to avoid:** Clearly use `netWorthHistory[netWorthHistory.length - 1]` for "Yesterday" performance.

## Code Examples

### Percentage Calculation & Display Pattern
```typescript
// Logic
const calculatePercentChange = (current: number, previous: number) => {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

// Component Pattern
const PerformanceIndicator = ({ value, percent }: { value: number, percent: number }) => {
  const isPositive = percent >= 0;
  const color = isPositive ? '#94ba8b' : '#ba8b8b'; // Green vs Red in Gameboy palette
  const sign = isPositive ? '+' : '';
  
  return (
    <span style={{ color }}>
      {sign}{formatCurrency(value)} ({sign}{percent.toFixed(2)}%)
    </span>
  );
};
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| O(n) history search | Memoized selectors | N/A | Performance remains high even with hundreds of trades. |

## Open Questions

1. **How to handle options P/L display?**
   - Options are more complex than stocks. 
   - Recommendation: Show "Premium Paid" vs "Current Market Value" for open positions. For history, show "Total Paid" vs "Total Received/Settled".

2. **Should "History" persist between resets?**
   - Recommendation: No, keep it part of the save game state (which it will be if added to the Zustand store).

## Sources

### Primary (HIGH confidence)
- `src/store/useGameStore.ts` - Existing state structure.
- `src/components/Trade/Robbinghood.tsx` - Current trading UI.

### Secondary (MEDIUM confidence)
- Investopedia: "Average Cost Basis" - Standard financial logic.
- MDN: `Intl.NumberFormat` - Formatting standards.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Using project defaults.
- Architecture: HIGH - Standard ledger pattern.
- Pitfalls: HIGH - Common financial app edge cases.

**Research date:** 2026-03-06
**Valid until:** 2026-04-06
