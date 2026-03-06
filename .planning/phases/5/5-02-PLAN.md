---
phase: 5
plan: 02
type: execute
wave: 2
depends_on:
  - 5-01
files_modified:
  - src/components/Trade/Robbinghood.tsx
  - src/components/Trade/Robbinghood.css
autonomous: false
requirements:
  - TRADE-07
  - TRADE-08
must_haves:
  truths:
    - "All In button sets amount to Math.floor(cash / costPerUnit)"
    - "Trade UI shows total cost reactive to input"
  artifacts:
    - path: "src/components/Trade/Robbinghood.tsx"
      provides: "Updated Trade UI with cost calc and All In button"
---

<objective>
Enhance the Robbinghood Trade interface with real-time feedback and high-velocity trading buttons. This includes adding cost calculation, "Buying Power" displays, an "All In" feature, and a toggle for options trading.

Purpose: To improve usability and support the new options trading feature.
Output: Modernized Robbinghood Trade UI.
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
@.planning/phases/5/5-01-SUMMARY.md
@src/components/Trade/Robbinghood.tsx
@src/components/Trade/Robbinghood.css
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add Cost Calc, Buying Power, and "ALL IN"</name>
  <files>src/components/Trade/Robbinghood.tsx</files>
  <action>
    - Inside the `Trade` tab (selected stock view):
      - Add a label displaying "BUYING POWER: [formatted cash]".
      - Add a label below the amount input displaying "TOTAL COST: [formatted cost]".
      - The cost = `tradeAmount * currentPrice` (for stocks) or `tradeAmount * Math.floor(currentPrice * 0.1)` (for options).
      - Add an "ALL IN" button next to the amount input:
        - When clicked, it calculates `Math.floor(cash / currentPrice)` (for stocks) or `Math.floor(cash / Math.floor(currentPrice * 0.1))` (for options) and updates `tradeAmount`.
  </action>
  <verify>
    Ensure cost changes as trade amount changes. Clicking "ALL IN" should set the input to the maximum amount affordable.
  </verify>
  <done>
    UI provides clear financial feedback and high-velocity shortcuts.
  </done>
</task>

<task type="auto">
  <name>Task 2: Integrate Options Trading UI</name>
  <files>src/components/Trade/Robbinghood.tsx, src/components/Trade/Robbinghood.css</files>
  <action>
    - Add a toggle in the `Trade` tab: "Mode: STOCK | OPTION".
    - If "STOCK" is selected, show standard Buy/Sell SwipeConfirms.
    - If "OPTION" is selected:
      - Add another sub-toggle: "Type: CALL | PUT".
      - Premium = Math.floor(currentPrice * 0.1) (display it).
      - Show "SWIPE TO BUY [type] CONTRACT" SwipeConfirm.
      - Use `buyOption` action from the store.
    - Style the new toggles and labels in `Robbinghood.css` to match the 4-color palette and pixel grid.
  </action>
  <verify>
    Verify that switching to "OPTION" mode allows purchasing CALLs and PUTs using the new store action.
  </verify>
  <done>
    Users can trade both stocks and options from the same screen.
  </done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>New Trade UI with Options support and "All In" functionality.</what-built>
  <how-to-verify>
    1. Open Robbinghood -> Trade -> Select a stock.
    2. Check "Buying Power" and "Total Cost" display.
    3. Click "ALL IN" and verify the amount is correct.
    4. Toggle to "OPTION" mode.
    5. Buy a CALL contract and verify cash decreases by premium.
    6. Verify look and feel in both modes.
  </how-to-verify>
  <resume-signal>Type "approved" or describe issues</resume-signal>
</task>

</tasks>

<verification>
- Cost calculation is reactive to amount input.
- "All In" button sets maximum possible amount.
- Options mode correctly triggers `buyOption`.
- UI maintains 4-color palette and pixel grid.
</verification>

<success_criteria>
- Real-time cost visible.
- "All In" functionality works.
- Options trading integrated into the UI.
- No visual regressions.
</success_criteria>

<output>
After completion, create `.planning/phases/5/5-02-SUMMARY.md`
</output>
