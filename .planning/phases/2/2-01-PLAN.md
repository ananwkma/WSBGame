---
phase: 2
plan: 01
type: execute
wave: 1
depends_on: []
files_modified: [package.json, src/store/useGameStore.ts, src/store/types.ts]
autonomous: true
requirements: [ECON-01, TRADE-02, TRADE-03, TRADE-05, TECH-02]

must_haves:
  truths:
    - "Starting balance is 10,000,000 cents ($100,000)"
    - "Stock prices are stored in integers (cents)"
    - "Buying/Selling stocks updates balance and holdings correctly"
    - "Next turn increases/decreases stock prices by 10-50%"
  artifacts:
    - path: "src/store/useGameStore.ts"
      provides: "Zustand store with actions and state"
    - path: "src/store/types.ts"
      provides: "Types for GameState, Stock, and History"
  key_links:
    - from: "src/store/useGameStore.ts"
      to: "zustand"
      via: "create hook"
      pattern: "create<.*>"
---

<objective>
Implement the core trading engine and portfolio state using Zustand. This engine will manage money, stock holdings, and market volatility.

Purpose: To provide a robust, integer-precision financial simulation that drives the rest of the game.
Output: A functional Zustand store capable of handling trades and turn-based market updates.
</objective>

<execution_context>
@C:/Users/ananW/.gemini/get-shit-done/workflows/execute-plan.md
@C:/Users/ananW/.gemini/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/2/RESEARCH.md
@.planning/phases/2/2-CONTEXT.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Install Dependencies and Define Types</name>
  <files>package.json, src/store/types.ts</files>
  <action>
    Install `zustand`, `framer-motion`, `d3-shape`, and `@types/d3-shape`.
    Create `src/store/types.ts` to define:
    - `StockTicker`: '$GAME' | '$POPC' | '$APE'
    - `HistoryPoint`: { turn: number, price: number }
    - `StockData`: { ticker: StockTicker, currentPrice: number, history: HistoryPoint[] }
    - `GameState`: { cash: number, holdings: Record<StockTicker, number>, stocks: Record<StockTicker, StockData>, turn: number }
  </action>
  <verify>Run `npm list zustand framer-motion d3-shape` and check for successful install.</verify>
  <done>Dependencies installed and types defined for the game state.</done>
</task>

<task type="auto">
  <name>Task 2: Implement Game Store and Actions</name>
  <files>src/store/useGameStore.ts</files>
  <action>
    Implement `useGameStore` with Zustand:
    - Initial state: cash = 10,000,000 ($100,000), holdings = all 0, turn = 1.
    - Stocks: $GAME (initial 10000 - $100), $POPC (initial 5000 - $50), $APE (initial 2500 - $25).
    - Implement `buyStock(ticker, amount)`: validates cash, updates balance and holdings.
    - Implement `sellStock(ticker, amount)`: validates holdings, updates balance and holdings.
    - Implement `nextTurn()`:
      - For each stock, calculate new price: `current * (1 + (rand(0.1, 0.5) * (rand > 0.5 ? 1 : -1)))`.
      - Round new price to nearest integer, min 1 cent.
      - Add new price to history.
      - Increment turn.
  </action>
  <verify>
    Create a temporary test file or use a console test in `App.tsx` to:
    1. Buy 10 $GAME.
    2. Check if cash is reduced by 10 * currentPrice and holdings is 10.
    3. Call `nextTurn()` and verify stock prices changed and history was updated.
  </verify>
  <done>Core trading and market simulation logic is functional in the store.</done>
</task>

</tasks>

<verification>
Verify store state transitions using a small test script or by logging state changes in the console. 
Confirm that currency math is always performed with integers (cents) and that stock prices follow the 10-50% volatility rule.
</verification>

<success_criteria>
1. Zustand store correctly manages cash, holdings, and stock prices.
2. `buyStock` and `sellStock` correctly update state with integer precision.
3. `nextTurn` generates volatile price changes and logs history.
4. Total Net Worth is calculable as `cash + sum(holdings * price)`.
</success_criteria>

<output>
After completion, create `.planning/phases/2/2-01-SUMMARY.md`
</output>
