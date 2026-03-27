---
phase: 3
plan: 03
type: execute
wave: 3
depends_on: [3-02]
files_modified: [src/components/Apps/Laptop/GuruTube.tsx, src/store/useGameStore.ts, src/components/Feedback/PopupText.tsx, src/components/Apps/Laptop/Laptop.css]
autonomous: true
requirements: [NARR-03, ECON-03, ECON-02]

must_haves:
  truths:
    - "Laptop features a functional GuruTube app with pixel-art 'videos'"
    - "Market movements are triggered by narrative events on specific turns"
    - "Loss Porn karma is awarded when net worth hits zero"
  artifacts:
    - path: "src/components/Apps/Laptop/GuruTube.tsx"
      provides: "Simplified video player app for advice"
    - path: "src/components/Apps/Laptop/Laptop.css"
      provides: "Pixel art styling for GuruTube components"
---

<objective>
Connect market events to narrative triggers and add high-impact "Laptop" content for storytelling.

Purpose: To provide the narrative "advice" and consequences on the laptop screen.
Output: Functional GuruTube app and integrated narrative triggers for market events.
</objective>

<tasks>

<task type="auto">
  <name>Task 1: Build GuruTube App for Laptop</name>
  <files>src/components/Apps/Laptop/GuruTube.tsx, src/components/Apps/Laptop/Laptop.css</files>
  <action>
    Create `GuruTube.tsx`:
    - Display a looping 2-frame pixel art "Guru" avatar (simulating 4fps video).
    - Add a scrolling "Advice" bar with text from the current day's events.
    - Implement pixelated "Play/Pause" and "Hype" buttons.
    - Style with 4-color palette and 8x8 grid alignment.
  </action>
  <verify>Confirm the 2-frame animation works and advice text is readable.</verify>
  <done>GuruTube app is functional and integrated into the laptop view.</done>
</task>

<task type="auto">
  <name>Task 2: Integrate Narrative Triggers into nextTurn()</name>
  <files>src/store/useGameStore.ts</files>
  <action>
    Update `nextTurn()` in `useGameStore.ts`:
    - Check for `GameEvent` with type 'SHIFT' on the current day.
    - If a shift event exists, apply its `delta` to the specified stock's price (e.g., +200% for $GAME).
    - Trigger a "HUGE MOVE!" popup text when a shift event occurs.
  </action>
  <verify>Check Day 4 (or any test turn) to confirm stock prices jump according to narrative shifts.</verify>
  <done>Narrative-driven market shifts are functional.</done>
</task>

<task type="auto">
  <name>Task 3: Implement Loss Porn Karma Trigger</name>
  <files>src/store/useGameStore.ts, src/components/Feedback/PopupText.tsx</files>
  <action>
    Implement "Loss Porn" trigger:
    - In `useGameStore.ts`, check `netWorth` at the end of `nextTurn()`.
    - If `netWorth <= 0`, add a large amount of `karma` (e.g., +10,000).
    - Trigger a "LOSS PORN: LEGENDARY STATUS" popup.
    - Log a special "Loss Porn" post in the `forumPosts` array.
  </action>
  <verify>Lose all money and confirm the karma/post triggers appear correctly.</verify>
  <done>Loss porn mechanic is integrated and rewards the player for losing.</done>
</task>

</tasks>

<success_criteria>
1. GuruTube provides thematic "investment advice" via simple animations.
2. Market movements feel narrative-driven on key days.
3. Losing it all has a unique community-reward mechanic (Karma).
</success_criteria>
