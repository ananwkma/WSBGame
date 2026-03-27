---
phase: 6-options-chains
plan: 01
type: execute
wave: 1
depends_on: []
files_modified: [src/store/types.ts, src/store/useGameStore.ts]
autonomous: true
requirements: [TRADE-09]

must_haves:
  truths:
    - "Options market value is included in total Net Worth."
    - "Options expire in 1 turn (1DTE) instead of 3."
    - "Options chain logic generates 3 distinct strike levels."
  artifacts:
    - path: "src/store/useGameStore.ts"
      provides: "Option valuation and chain generation logic"
    - path: "src/store/types.ts"
      provides: "Updated OptionContract and GameState types"
  key_links:
    - from: "useGameStore.ts"
      to: "netWorth calculation"
      via: "market value sum"
---

<objective>
Implement the core logic for high-fidelity options chains and accurate portfolio valuation.

Purpose: To provide realistic options pricing (Greeks) and ensure the player's net worth reflects their entire portfolio, including active option contracts.
Output: Updated store with market-value-aware net worth and a utility to generate options chains.
</objective>

<execution_context>
@C:/Users/ananW/.gemini/get-shit-done/workflows/execute-plan.md
@C:/Users/ananW/.gemini/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/6/RESEARCH.md
@src/store/useGameStore.ts
@src/store/types.ts
</context>

<tasks>

<task type="auto">
  <name>Update Store Types & Expiry Logic</name>
  <files>src/store/types.ts, src/store/useGameStore.ts</files>
  <action>
    - Update `OptionContract` in `types.ts` to include: `strikePrice: number`, `delta: number`, `gamma: number`, `theta: number`.
    - Add `netWorthHistory: { turn: number; value: number }[]` to `GameState`.
    - Update `buyOption` in `useGameStore.ts` to accept `strikePrice` and Greeks as parameters.
    - Set `expiryDay` to `day + 1` in `buyOption` (1DTE settlement).
    - Refactor `nextTurn` settlement logic to ensure options purchased on Day N settle at the end of Day N+1 (which matches current logic if expiryDay = day + 1).
  </action>
  <verify>
    - `buyOption` signature updated.
    - `OptionContract` has Greek fields.
    - Settlement still works in `nextTurn`.
  </verify>
  <done>
    - Store types support Greeks and 1DTE expiry.
  </done>
</task>

<task type="auto">
  <name>Implement Market Value & Chain Logic</name>
  <files>src/store/useGameStore.ts</files>
  <action>
    - Implement `calculateOptionMarketValue(option, currentPrice)`:
      - Intrinsic: `max(0, currentPrice - strike)` for CALL, `max(0, strike - currentPrice)` for PUT.
      - Extrinsic: Add a "volatility premium" based on moneyness (use a simpler version of the research sigmoid).
    - Implement `generateOptionsChain(ticker, currentPrice)`:
      - Create 3 strikes: ITM (90% price), OTM (100% price), Far OTM (110% price) for Calls (inverse for Puts).
      - Calculate Delta/Gamma/Theta for each strike.
    - Implement a `getNetWorth()` selector (or store method) that sums: `cash + stockValue + optionsMarketValue`.
    - Update `nextTurn` to push the current total net worth to `netWorthHistory`.
  </action>
  <verify>
    - `getNetWorth()` returns correct value when holding options.
    - `generateOptionsChain` returns 3 pairs of contracts.
  </verify>
  <done>
    - Portfolio valuation is accurate and options chain logic is ready for UI.
  </done>
</task>

</tasks>

<verification>
Check that `netWorth` reflects option value in the store state. Verify `nextTurn` settles options after 1 turn.
</verification>

<success_criteria>
- Total Net Worth includes (Shares * Price) + (Options * MarketValue).
- Options expire the next turn.
- Store can generate a chain of 3 strikes per stock.
</success_criteria>

<output>
After completion, create `.planning/phases/6/6-01-SUMMARY.md`
</output>
