---
phase: 4
plan: 01
type: execute
wave: 1
depends_on: [3-03]
files_modified: [src/store/useGameStore.ts, src/components/Feedback/EndingScreen.tsx, src/App.tsx, src/styles/pixel.css]
autonomous: true
requirements: [ECON-04, TECH-03]

must_haves:
  truths:
    - "Game evaluates performance and shows one of 3 endings on Day 10"
    - "Player progress is automatically saved to localStorage using Zustand persist"
    - "Game can be reset from the ending screen"
  artifacts:
    - path: "src/components/Feedback/EndingScreen.tsx"
      provides: "Fullscreen result overlay with thematic text"
---

<objective>
Implement game endings and persistent storage to complete the core gameplay loop.

Purpose: To provide finality and longevity to the game.
Output: A game that saves progress and reaches 3 distinct conclusions based on performance.
</objective>

<tasks>

<task type="auto">
  <name>Task 1: Implement Zustand Persistence</name>
  <files>src/store/useGameStore.ts</files>
  <action>
    Refactor `useGameStore.ts` to use Zustand's `persist` middleware.
    - Set the storage key to `wsb-trader-save`.
    - Use `partialize` to exclude `lastFlash` and `popups` from being saved.
    - Add a `resetGame()` action that clears holdings and restores initial cash.
  </action>
  <verify>Refresh the page after a trade and confirm holdings/cash persist.</verify>
  <done>Game state is persistent across browser refreshes.</done>
</task>

<task type="auto">
  <name>Task 2: Ending Logic & EndingScreen Component</name>
  <files>src/store/useGameStore.ts, src/components/Feedback/EndingScreen.tsx</files>
  <action>
    Create `EndingScreen.tsx`:
    - Fullscreen overlay using the 4-color palette.
    - Displays one of 3 result types (MOON, LEGEND, MENDY'S) based on a `result` prop.
    - Includes a "RESTART GAME" button that calls `resetGame()`.
    Update `useGameStore.ts`:
    - In `nextTurn()`, check if `day === 10`.
    - If so, set a `gameStatus` state (e.g., 'playing' | 'ended').
    - Calculate and store the `endingType`.
  </action>
  <verify>Fast-forward to Day 10 and confirm the correct ending screen appears.</verify>
  <done>Game conclusion logic and UI are implemented.</done>
</task>

</tasks>

<success_criteria>
1. Player progress saves automatically.
2. Reaching Day 10 triggers the ending UI.
3. Restart button successfully resets the game state.
</success_criteria>
