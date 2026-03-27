---
phase: 6-options-chains
plan: 03
type: execute
wave: 2
depends_on: ["6-01", "6-02"]
files_modified: [src/components/Trade/OptionsChain.tsx, src/components/Trade/Robbinghood.tsx]
autonomous: true
requirements: [TRADE-09, TRADE-10]

must_haves:
  truths:
    - "Robbinghood Portfolio tab displays a Net Worth performance chart."
    - "Options Chain component shows Delta, Gamma, and Theta for 3 strikes."
    - "Net Worth is correctly calculated and displayed even when all-in on options."
  artifacts:
    - path: "src/components/Trade/OptionsChain.tsx"
      provides: "Visual contract selector with Greeks"
    - path: "src/components/Trade/Robbinghood.tsx"
      provides: "Updated portfolio view and UI integration"
  key_links:
    - from: "OptionsChain.tsx"
      to: "buyOption in useGameStore"
      via: "onClick handler"
    - from: "Robbinghood.tsx"
      to: "netWorthHistory"
      via: "rendering in PriceChart"
---

<objective>
Finalize the user interface for options chains and portfolio performance tracking.

Purpose: To make the game's financial tools intuitive and visually compelling, ensuring players can make informed trades based on Greeks and track their overall growth.
Output: An interactive options chain and a centralized portfolio performance graph.
</objective>

<execution_context>
@C:/Users/ananW/.gemini/get-shit-done/workflows/execute-plan.md
@C:/Users/ananW/.gemini/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@src/components/Trade/Robbinghood.tsx
@src/components/Trade/PriceChart.tsx
@src/store/useGameStore.ts
</context>

<tasks>

<task type="auto">
  <name>Build the Options Chain UI</name>
  <files>src/components/Trade/OptionsChain.tsx, src/components/Trade/Robbinghood.tsx</files>
  <action>
    - Create `src/components/Trade/OptionsChain.tsx`:
      - Fetch chain data using `generateOptionsChain` from store.
      - Display a table-like layout for 3 strikes (ITM, OTM, Far OTM).
      - Show Delta, Gamma, Theta for each contract.
      - Use pixel-art styles (8x8 alignment, 4-color palette).
    - Replace the simplistic Call/Put toggle in `Robbinghood.tsx` with the new `OptionsChain` component when in OPTION mode.
    - Connect the "Buy" action in `OptionsChain` to the updated `buyOption` store method.
  </action>
  <verify>
    - Options Chain displays Greeks and prices correctly.
    - Buying an option from the chain updates the portfolio.
  </verify>
  <done>
    - Options trading is now high-fidelity and informative.
  </done>
</task>

<task type="auto">
  <name>Portfolio Performance Chart & Fixes</name>
  <files>src/components/Trade/Robbinghood.tsx</files>
  <action>
    - Integrate `PriceChart` into the "Portfolio" view of `Robbinghood.tsx` using `netWorthHistory` from the store.
    - Ensure the chart uses the same 4-color palette and diagonal line style (from Plan 6-02).
    - Update the `netWorth` calculation in the UI to use the new centralized store method (summing cash, shares, and option market value).
    - Fix the bug where Net Worth displays $0.00 if cash and shares are zero but options are held.
  </action>
  <verify>
    - Portfolio view shows a graph of Net Worth over time.
    - Net Worth remains accurate throughout the game session.
  </verify>
  <done>
    - Portfolio analytics and valuation are visually unified and accurate.
  </done>
</task>

</tasks>

<verification>
Check the Robbinghood Home tab for the performance chart. Verify the Options Chain shows Greeks and allows contract selection.
</verification>

<success_criteria>
- Portfolio tab features a historical net worth chart.
- Options Chain displays Delta, Gamma, Theta.
- Net Worth never says $0.00 incorrectly.
</success_criteria>

<output>
After completion, create `.planning/phases/6/6-03-SUMMARY.md`
</output>
