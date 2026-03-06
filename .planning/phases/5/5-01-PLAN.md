---
phase: 5
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/store/types.ts
  - src/store/useGameStore.ts
autonomous: true
requirements:
  - TRADE-06
must_haves:
  truths:
    - "Options premium is exactly 10% of strike (Math.floor)"
    - "Settlement occurs exactly 3 turns after purchase"
  artifacts:
    - path: "src/store/types.ts"
      provides: "OptionContract and OptionType definitions"
    - path: "src/store/useGameStore.ts"
      provides: "buyOption action and settlement logic in nextTurn"
---

<objective>
Implement the core logic for options trading (Calls and Puts) within the game store. This includes defining the data structures, the purchase action, and the turn-based settlement logic with a 3-day expiry.

Purpose: To add depth to the trading simulation by allowing leveraged bets on price movements.
Output: Working options engine in the Zustand store.
</objective>

<execution_context>
@C:/Users/ananW/.gemini/get-shit-done/workflows/execute-plan.md
@C:/Users/ananW/.gemini/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/5/RESEARCH.md
@src/store/types.ts
@src/store/useGameStore.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Update Types and State Schema</name>
  <files>src/store/types.ts, src/store/useGameStore.ts</files>
  <action>
    - In `src/store/types.ts`:
      - Add `OptionType = 'CALL' | 'PUT'`.
      - Add `OptionContract` interface: `{ id: string; ticker: StockTicker; type: OptionType; strikePrice: number; amount: number; expiryDay: number; }`.
      - Add `optionsHoldings: OptionContract[]` to `GameState`.
      - Add `buyOption: (ticker: StockTicker, type: OptionType, amount: number) => void` to `GameActions`.
    - In `src/store/useGameStore.ts`:
      - Initialize `optionsHoldings: []` in `getInitialState`.
      - Ensure `optionsHoldings` is NOT filtered out in the `persist` partialize (only `lastFlash` and `popups` are excluded).
  </action>
  <verify>
    `npm run build` or `tsc` confirms types are correctly integrated.
  </verify>
  <done>
    `GameState` and `GameActions` reflect the new options-related properties and methods.
  </done>
</task>

<task type="auto">
  <name>Task 2: Implement buyOption and Settlement Logic</name>
  <files>src/store/useGameStore.ts</files>
  <action>
    - Implement `buyOption(ticker, type, amount)`:
      - Premium cost = Math.floor(currentPrice * 0.1) * amount. (Ensure integer math).
      - Validate `cash >= cost`.
      - Subtract `cost` from `cash`.
      - Add new `OptionContract` to `optionsHoldings` with `expiryDay: day + 3`.
      - Trigger feedback (flash + popup).
    - Update `nextTurn()`:
      - Before updating `turn/day`, filter `optionsHoldings` for contracts where `expiryDay === nextDayNum`.
      - For each expiring contract:
        - Calculate payoff (ensure integers):
          - CALL: Math.max(0, Math.floor(currentPrice - strikePrice)) * amount.
          - PUT: Math.max(0, Math.floor(strikePrice - currentPrice)) * amount.
        - Add payoff to `cash`.
        - If payoff > 0, trigger positive flash and "WINNER!" popup.
        - If payoff == 0, trigger negative flash and "EXPIRED WORTHLESS" popup.
      - Remove expired contracts from `optionsHoldings`.
  </action>
  <verify>
    Run a test script or manual console test to buy a call, skip 3 turns, and verify cash increases/decreases based on price movement.
  </verify>
  <done>
    Options can be purchased and settle correctly after 3 turns.
  </done>
</task>

</tasks>

<verification>
- Buy a CALL option at strike $100.
- Advance 3 days.
- If price is $150, verify cash increases by $50 * amount.
- If price is $50, verify cash does not increase and option disappears.
</verification>

<success_criteria>
- `buyOption` subtracts 10% premium using integer math.
- `optionsHoldings` tracks active contracts.
- Settlement occurs exactly 3 days after purchase.
- Persistence works for options state.
</success_criteria>

<output>
After completion, create `.planning/phases/5/5-01-SUMMARY.md`
</output>
