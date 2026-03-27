---
phase: 6-options-chains
plan: 02
type: execute
wave: 1
depends_on: []
files_modified: [src/components/Trade/PriceChart.tsx, src/store/useGameStore.ts, src/utils/marketUtils.ts]
autonomous: true
requirements: [VIS-06, VIS-07]

must_haves:
  truths:
    - "Price charts use diagonal (linear) lines instead of stair-steps."
    - "Game starts with 20 turns of historical price data."
  artifacts:
    - path: "src/utils/marketUtils.ts"
      provides: "Historical data generation"
    - path: "src/components/Trade/PriceChart.tsx"
      provides: "Updated line chart generator"
  key_links:
    - from: "useGameStore.ts"
      to: "marketUtils.ts"
      via: "getInitialState calls"
---

<objective>
Enhance the visual quality of stock charts and provide historical context by pre-populating data.

Purpose: To improve game aesthetics (modernized charts) and give players immediate technical context for stock performance at the start of a new game.
Output: Diagonal charts and a utility for generating realistic seed data.
</objective>

<execution_context>
@C:/Users/ananW/.gemini/get-shit-done/workflows/execute-plan.md
@C:/Users/ananW/.gemini/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@src/components/Trade/PriceChart.tsx
@src/store/useGameStore.ts
</context>

<tasks>

<task type="auto">
  <name>Transition to Linear Charts</name>
  <files>src/components/Trade/PriceChart.tsx</files>
  <action>
    - Replace `curveStepAfter` with `curveLinear` from `d3-shape` in the `lineGenerator`.
    - Ensure the SVG path rendering is smooth.
  </action>
  <verify>
    - Chart shows diagonal lines connecting data points.
  </verify>
  <done>
    - Stair-step charts are replaced by linear charts.
  </done>
</task>

<task type="auto">
  <name>Implement Historical Data Generation</name>
  <files>src/utils/marketUtils.ts, src/store/useGameStore.ts</files>
  <action>
    - Create `src/utils/marketUtils.ts` with `generateHistoricalData(initialPrice: number, turns: number)`.
      - Use a random walk algorithm with moderate volatility to generate plausible historical price points.
    - Update `getInitialState` in `useGameStore.ts`:
      - For each stock, initialize `history` with 20 turns of generated data.
      - Ensure `turn` and `day` still start at 1, but history reflects turns -20 to 1.
      - Ensure `currentPrice` matches the last point in the generated history.
  </action>
  <verify>
    - Game start shows 20 historical points on the chart for each stock.
    - `currentPrice` is consistent with the latest historical point.
  </verify>
  <done>
    - Game start data is rich and provides context for technical analysis.
  </done>
</task>

</tasks>

<verification>
Start a new game and check the Trade charts for diagonal lines and pre-populated data points.
</verification>

<success_criteria>
- Charts use diagonal lines.
- 20 historical data points exist for each stock at game start.
</success_criteria>

<output>
After completion, create `.planning/phases/6/6-02-SUMMARY.md`
</output>
