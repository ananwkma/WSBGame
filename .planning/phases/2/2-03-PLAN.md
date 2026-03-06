---
phase: 2
plan: 03
type: execute
wave: 3
depends_on: [2-02]
files_modified: [src/components/Feedback/ScreenFlash.tsx, src/components/Feedback/PopupText.tsx, src/App.tsx]
autonomous: true
requirements: [TRADE-01, TRADE-05]

must_haves:
  truths:
    - "Screen flashes green for positive trades/gains and red for losses"
    - "Popup text ('TO THE MOON!') appears near the trading buttons on success"
    - "Robbinghood app is visible and functional within the laptop view"
  artifacts:
    - path: "src/components/Feedback/ScreenFlash.tsx"
      provides: "Full-screen overlay for color flashes"
    - path: "src/components/Feedback/PopupText.tsx"
      provides: "Animated text labels for feedback"
  key_links:
    - from: "src/App.tsx"
      to: "src/components/Trade/Robbinghood.tsx"
      via: "Render inside DualViewShell laptopContent"
      pattern: "<Robbinghood.*/>"
---

<objective>
Enhance the trading experience with visual feedback (flashes, popups) and integrate the full trading engine into the main game viewport.

Purpose: To provide high-impact sensory rewards for gameplay actions and finalize the Phase 2 goals.
Output: A polished, integrated trading simulation in the game's core loop.
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
@.planning/phases/2/2-02-SUMMARY.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Implement Feedback Components (Flashes & Popups)</name>
  <files>src/components/Feedback/ScreenFlash.tsx, src/components/Feedback/PopupText.tsx</files>
  <action>
    Implement high-impact feedback:
    - `ScreenFlash`: An overlay that flashes green (#A89F94 or white) for 200ms when triggered.
    - `PopupText`: Floating text ("TO THE MOON!", "GUH", "💎 🙌") that appears at a specific position, drifts up, and fades out.
    - Export hooks or a simple event mechanism to trigger these from the store or components.
  </action>
  <verify>Call the trigger functions from a test button and confirm flash/popup behavior.</verify>
  <done>Juice components are available to provide immediate visual feedback for player actions.</done>
</task>

<task type="auto">
  <name>Task 2: Integrate into App.tsx and Laptop View</name>
  <files>src/App.tsx</files>
  <action>
    Finalize integration:
    - Replace placeholder laptop content in `App.tsx` with the `Robbinghood` component.
    - Add a "Next Day" button to the laptop shell that calls `nextTurn()`.
    - Hook up `ScreenFlash` and `PopupText` to trade execution and turn changes.
    - Ensure `DualViewShell` layout handles the Robbinghood app correctly.
  </action>
  <verify>
    Run `npm run dev` and perform a full loop:
    1. Select a stock in Laptop view.
    2. Swipe to buy.
    3. Observe flash and popup.
    4. Click "Next Day".
    5. Observe price changes on chart and net worth update.
  </verify>
  <done>The game's core trading loop is fully integrated and functional.</done>
</task>

<task type="auto">
  <name>Task 3: Final Phase 2 Verification</name>
  <files>src/App.tsx, src/store/useGameStore.ts</files>
  <action>
    Conduct a final review of all Phase 2 requirements:
    - [x] TRADE-01: Robbinghood App Interface (functional tabs & shell)
    - [x] TRADE-03: Portfolio Tracking (net worth calculates correctly)
    - [x] TRADE-04: Stair-step Charts (rendering correctly)
    - [x] TRADE-05: Market Simulation (volatility 10-50%)
    - [x] ECON-01: Starting Capital ($100,000)
    - [x] TECH-02: Global State Management (Zustand store)
    - [x] Palette & Pixel Alignment check.
  </action>
  <verify>Visually audit the UI for 4-color palette adherence and sharp pixel rendering.</verify>
  <done>Phase 2 is complete and all requirements are met.</done>
</task>

</tasks>

<verification>
Check all success criteria:
- User can buy/sell $GAME, $POPC, $APE via Robbinghood.
- Net worth updates immediately.
- Stair-step charts track performance.
- Market updates on discrete turns.
- Visual juice (flashes/popups) feels satisfying.
</verification>

<success_criteria>
1. A fully functional "Robbinghood" app exists inside the laptop view.
2. The trading engine uses integer math and correctly simulates market volatility.
3. UI remains strictly responsive and adheres to the pixel-art aesthetic.
4. All trade interactions have visual feedback.
</success_criteria>

<output>
After completion, create `.planning/phases/2/2-03-SUMMARY.md`
</output>
