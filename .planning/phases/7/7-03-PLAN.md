---
phase: 7
plan: 03
type: execute
wave: 2
depends_on: ["7-01"]
files_modified: [src/store/useGameStore.ts, src/components/Trade/Robbinghood.tsx, src/components/Trade/Robbinghood.css]
autonomous: true
requirements: [TRADE-09]
must_haves:
  truths:
    - "A list of all past trades appears in the History tab"
    - "Options that expire worthless or are settled are logged in the history"
    - "The history list is scrollable and clearly displays trade details"
  artifacts:
    - path: "src/components/Trade/Robbinghood.tsx"
      provides: "Implemented History tab UI"
  key_links:
    - from: "nextTurn"
      to: "tradeHistory"
      via: "pushing 'OPTION_EXPIRY' TradeEntry"
---

<objective>
Implement the UI for the History tab and ensure that option expiries are correctly logged in the trade ledger. This completes the transparency requirement for trading activities.

Purpose: Allow users to review their entire trading history and see the outcome of expired options.
Output: Functional History tab and updated nextTurn logic for logging.
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
  <name>Task 1: Log Option Expiry in History</name>
  <files>src/store/useGameStore.ts</files>
  <action>
    - Update the `nextTurn` logic in `useGameStore.ts` where options are settled/expired.
    - For each expired option:
      - Create an 'OPTION_EXPIRY' `TradeEntry`.
      - `price` should be the settlement price if in-the-money, or 0 if out-of-the-money.
      - `realizedPL` = `(Settlement Value - Original Premium Paid)`. (This may require original premium to be stored on the option contract if not already).
    - Add to `tradeHistory`.
  </action>
  <verify>Check that `tradeHistory` contains entries for expired options after a turn ends.</verify>
  <done>Option expiries are correctly recorded in history.</done>
</task>

<task type="auto">
  <name>Task 2: Implement History Tab UI</name>
  <files>src/components/Trade/Robbinghood.tsx</files>
  <action>
    - Update the `History` tab content in `Robbinghood.tsx`.
    - Map over `tradeHistory` (sorted by most recent).
    - For each `TradeEntry`, show:
      - Type (BUY/SELL/EXPIRY)
      - Ticker/Option details
      - Amount & Price
      - Day of transaction
      - Realized Profit/Loss if applicable (using `PerformanceIndicator`).
    - Apply scrolling styles to ensure it remains within the container.
  </action>
  <verify>Visit the History tab in the UI after making some trades and moving turns.</verify>
  <done>History tab displays a comprehensive list of all past activities.</done>
</task>

<task type="auto">
  <name>Task 3: Refine History List Styles</name>
  <files>src/components/Trade/Robbinghood.css</files>
  <action>
    - Ensure `.history-view` and its list have proper styling for readability.
    - Add distinct colors or icons for different trade types (BUY vs SELL).
    - Ensure labels and values are correctly aligned for a financial UI feel.
  </action>
  <verify>Visually check the History tab UI for alignment and clarity.</verify>
  <done>History tab UI is polished and readable.</done>
</task>

</tasks>

<verification>
Check that `tradeHistory` correctly logs option expirations.
Verify the History tab displays all trades correctly and is scrollable.
</verification>

<success_criteria>
Every transaction and expiration is documented in a scrollable History tab with clear P/L indication.
</success_criteria>

<output>
After completion, create `.planning/phases/7/7-03-SUMMARY.md`
</output>
