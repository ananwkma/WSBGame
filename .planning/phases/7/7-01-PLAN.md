---
phase: 7
plan: 01
type: execute
wave: 1
depends_on: []
files_modified: [src/store/types.ts, src/store/useGameStore.ts]
autonomous: true
requirements: [TRADE-09]
must_haves:
  truths:
    - "Every trade (BUY, SELL, OPTION_BUY, OPTION_SELL) is recorded in a tradeHistory array"
    - "The game state tracks average cost basis for each stock ticker"
    - "Average cost basis only updates on BUY operations"
  artifacts:
    - path: "src/store/types.ts"
      provides: "TradeEntry and updated GameState types"
    - path: "src/store/useGameStore.ts"
      provides: "Logic for history recording and cost basis calculation"
  key_links:
    - from: "buyStock"
      to: "tradeHistory"
      via: "pushing new TradeEntry"
    - from: "sellStock"
      to: "tradeHistory"
      via: "pushing new TradeEntry with realizedPL"
---

<objective>
Implement the state management for a complete trade ledger and average cost basis tracking. This forms the foundation for history viewing and performance metrics.

Purpose: Track every user action for transparency and performance analysis.
Output: Updated Zustand store with trade history and cost basis logic.
</objective>

<execution_context>
@C:/Users/ananW/.gemini/get-shit-done/workflows/execute-plan.md
@C:/Users/ananW/.gemini/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/7/07-RESEARCH.md
@src/store/types.ts
@src/store/useGameStore.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Update Store Types</name>
  <files>src/store/types.ts</files>
  <action>
    - Define `TradeType` union: 'BUY' | 'SELL' | 'OPTION_BUY' | 'OPTION_SELL' | 'OPTION_EXPIRY'.
    - Define `TradeEntry` interface:
      - id: string
      - type: TradeType
      - ticker: string
      - amount: number
      - price: number (execution price in cents)
      - totalValue: number (amount * price)
      - day: number
      - realizedPL?: number (profit/loss in cents, for SELL/EXPIRY)
    - Update `GameState`:
      - Add `tradeHistory: TradeEntry[]`.
      - Add `costBasis: Record<StockTicker, number>`.
    - Update `GameActions` if necessary (though existing actions will be modified).
  </action>
  <verify>Check `src/store/types.ts` for new definitions.</verify>
  <done>Types are correctly defined and integrated into `GameState` and `GameStore`.</done>
</task>

<task type="auto">
  <name>Task 2: Implement History Recording & Cost Basis Logic</name>
  <files>src/store/useGameStore.ts</files>
  <action>
    - Update `getInitialState`:
      - Initialize `tradeHistory` as an empty array.
      - Initialize `costBasis` for all tickers at 0.
    - Update `buyStock`:
      - Calculate new `costBasis`: `(Current Shares * Current Basis + New Shares * Purchase Price) / (Current Shares + New Shares)`.
      - Push 'BUY' `TradeEntry` to `tradeHistory`.
    - Update `sellStock`:
      - Calculate `realizedPL`: `(Selling Price - Cost Basis) * amount`.
      - Push 'SELL' `TradeEntry` to `tradeHistory`.
      - Do NOT update `costBasis` on sell (keep the existing basis).
    - Update `buyOption`:
      - Push 'OPTION_BUY' `TradeEntry` to `tradeHistory`.
    - Update `sellOption`:
      - Find the original option to calculate realized PL if possible, or just log the revenue as 'OPTION_SELL'.
      - Push 'OPTION_SELL' `TradeEntry` to `tradeHistory`.
    - Ensure IDs are generated using `Math.random().toString(36).substring(7)`.
  </action>
  <verify>Perform some trades in the UI (if possible) or check the store state in devtools to see `tradeHistory` populating.</verify>
  <done>All trades result in a new entry in `tradeHistory`, and stock cost basis is correctly updated on BUYS.</done>
</task>

</tasks>

<verification>
Check that `tradeHistory` contains entries for every trade made.
Check that `costBasis` correctly reflects the average price paid for stocks.
</verification>

<success_criteria>
`tradeHistory` is populated with correct data after trades. `costBasis` updates only on stock buys.
</success_criteria>

<output>
After completion, create `.planning/phases/7/7-01-SUMMARY.md`
</output>
