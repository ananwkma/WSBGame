---
phase: 2
plan: 02
type: execute
wave: 2
depends_on: [2-01]
files_modified: [src/components/Trade/Robbinghood.tsx, src/components/Trade/PriceChart.tsx, src/components/Trade/SwipeConfirm.tsx]
autonomous: true
requirements: [TRADE-01, TRADE-04]

must_haves:
  truths:
    - "User can switch between Portfolio, Trade, and History tabs"
    - "Stock charts show stair-step lines using current price history"
    - "Swiping to the end of SwipeConfirm executes the trade"
  artifacts:
    - path: "src/components/Trade/Robbinghood.tsx"
      provides: "Main tabbed interface"
    - path: "src/components/Trade/PriceChart.tsx"
      provides: "SVG stair-step chart component"
    - path: "src/components/Trade/SwipeConfirm.tsx"
      provides: "Framer Motion drag-to-confirm interaction"
  key_links:
    - from: "src/components/Trade/Robbinghood.tsx"
      to: "src/store/useGameStore.ts"
      via: "useGameStore hook"
      pattern: "useGameStore"
---

<objective>
Build the 'Robbinghood' UI components and interactive trade confirmation mechanic.

Purpose: To provide a high-fidelity, tactile trading interface within the game's retro aesthetic.
Output: A functional tabbed application with dynamic charts and swipe-to-trade interaction.
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
@.planning/phases/2/2-01-SUMMARY.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Build Robbinghood Shell with Tabs</name>
  <files>src/components/Trade/Robbinghood.tsx</files>
  <action>
    Create a `Robbinghood` component that implements tabbed navigation:
    - Tabs: 'Portfolio' (Net Worth, Holdings), 'Trade' (Buy/Sell select), 'History' (Activity log).
    - Style to fit within the 16:10 Laptop viewport, using the pixel-perfect theme.
    - Connect to `useGameStore` to display cash and assets.
  </action>
  <verify>Visually confirm tabs switch content and cash balance matches the store.</verify>
  <done>Main Robbinghood interface is structured and displays live store data.</done>
</task>

<task type="auto">
  <name>Task 2: Implement PriceChart using d3-shape</name>
  <files>src/components/Trade/PriceChart.tsx</files>
  <action>
    Implement `PriceChart` component:
    - Accept `history: number[]` as a prop.
    - Use `d3.line().curve(d3.curveStepAfter)` to generate the path.
    - Render as an SVG with the dark palette colors.
    - Ensure it fits within the Robbinghood 'Trade' tab.
  </action>
  <verify>Pass a mock history array and confirm the stair-step line renders correctly.</verify>
  <done>Responsive stair-step charts are available for stock price visualization.</done>
</task>

<task type="auto">
  <name>Task 3: Implement SwipeConfirm Component</name>
  <files>src/components/Trade/SwipeConfirm.tsx</files>
  <action>
    Create `SwipeConfirm` using Framer Motion:
    - Implement a slider that the user must drag to the right to confirm.
    - Use `onDragEnd` to check if the threshold (e.g., >80%) was met.
    - Accept `onConfirm` callback to trigger the trade.
    - Add tactile feedback (slight bounce/snap back if not fully swiped).
  </action>
  <verify>Drag the slider in the browser and confirm the trade only fires when swiped fully.</verify>
  <done>Tactile swipe-to-confirm mechanic is functional and integrated.</done>
</task>

</tasks>

<verification>
Test the full trade flow:
1. Navigate to 'Trade' tab.
2. Select a stock and amount.
3. Swipe the 'SwipeConfirm' bar.
4. Verify balance and holdings updated in 'Portfolio' tab.
</verification>

<success_criteria>
1. Tabs function correctly and preserve local UI state (active tab).
2. Charts update correctly after "Next Turn" increases history length.
3. Swipe interaction feels smooth and prevents accidental trades.
4. All UI elements adhere to the 4-color palette and 8x8 pixel grid.
</success_criteria>

<output>
After completion, create `.planning/phases/2/2-02-SUMMARY.md`
</output>
