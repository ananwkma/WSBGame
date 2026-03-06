---
phase: 7
plan: 02
type: execute
wave: 2
depends_on: ["7-01"]
files_modified: [src/components/Feedback/PerformanceIndicator.tsx, src/components/Trade/Robbinghood.tsx, src/components/Trade/Robbinghood.css]
autonomous: true
requirements: [TRADE-10, TRADE-11]
must_haves:
  truths:
    - "The main portfolio screen shows the daily net worth change ($ and %)"
    - "Each stock in the trade list shows its 24h performance (%)"
    - "Holdings in the portfolio show total unrealized gain/loss based on average cost basis"
  artifacts:
    - path: "src/components/Feedback/PerformanceIndicator.tsx"
      provides: "Reusable color-coded performance display"
  key_links:
    - from: "Robbinghood.tsx"
      to: "PerformanceIndicator.tsx"
      via: "React component props"
---

<objective>
Update the UI to show performance metrics for daily change, stock price movement, and unrealized profit/loss. This uses the logic from Phase 7 Plan 1.

Purpose: Provide the user with clear feedback on their gains and losses.
Output: New component for indicators and updated Robbinghood UI.
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
@src/components/Trade/Robbinghood.tsx
@src/store/useGameStore.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create PerformanceIndicator Component</name>
  <files>src/components/Feedback/PerformanceIndicator.tsx</files>
  <action>
    - Create a reusable component that takes `value` (in cents) and/or `percent`.
    - Apply green/red coloring from the palette:
      - Positive: `#94ba8b` (Green)
      - Negative: `#ba8b8b` (Red)
    - Handle formatting with + sign for positive values.
    - Provide options to show either absolute amount, percentage, or both.
  </action>
  <verify>Check the file creation and basic logic.</verify>
  <done>PerformanceIndicator is ready for use in the UI.</done>
</task>

<task type="auto">
  <name>Task 2: Update Main Portfolio View</name>
  <files>src/components/Trade/Robbinghood.tsx</files>
  <action>
    - Import `PerformanceIndicator`.
    - Calculate `dailyChange` and `dailyPercent` using `netWorthHistory`:
      - Current Net Worth vs Last Item in `netWorthHistory`.
    - Display this below the main Net Worth display on the Portfolio tab.
  </action>
  <verify>Check that daily change displays and updates when moving to the next day.</verify>
  <done>Main portfolio screen shows correct daily performance.</done>
</task>

<task type="auto">
  <name>Task 3: Add Asset Performance to Lists</name>
  <files>src/components/Trade/Robbinghood.tsx</files>
  <action>
    - For the Stock List (Trade tab):
      - Calculate 24h change using `stock.history` (last vs current).
      - Add `PerformanceIndicator` next to each ticker.
    - For the Holdings List (Portfolio tab):
      - Calculate total unrealized profit/loss: `(currentPrice - costBasis) * amount`.
      - Calculate total percentage gain/loss: `((currentPrice - costBasis) / costBasis) * 100`.
      - Use `PerformanceIndicator` to display these values.
  </action>
  <verify>Confirm that performance indicators show for individual stocks and holdings.</verify>
  <done>Lists show individual asset performance correctly.</done>
</task>

</tasks>

<verification>
Check visual presence of green/red indicators on main screen and in lists.
Confirm percentage values match the actual price movements between turns.
</verification>

<success_criteria>
Daily performance, asset performance, and unrealized gain/loss are visible and color-coded.
</success_criteria>

<output>
After completion, create `.planning/phases/7/7-02-SUMMARY.md`
</output>
