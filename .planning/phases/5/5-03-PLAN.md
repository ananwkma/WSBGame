---
phase: 5
plan: 03
type: execute
wave: 2
depends_on:
  - 5-01
files_modified:
  - src/styles/pixel.css
  - src/components/Apps/Phone/ChatApp.tsx
  - src/components/Apps/Phone/WsbForum.tsx
  - src/store/useGameStore.ts
autonomous: true
requirements:
  - NARR-05
  - VIS-05
must_haves:
  truths:
    - "prevNetWorth is calculated at the beginning of nextTurn before updates"
    - "Social triggers activate correctly on large portfolio swings"
  artifacts:
    - path: "src/styles/pixel.css"
      provides: ".pixel-bold utility class"
    - path: "src/store/useGameStore.ts"
      provides: "Dynamic social triggers and extended events"
---

<objective>
Increase phone readability using bold pixel text and implement a dynamic social layer that reacts to player performance and extends the narrative.

Purpose: To enhance the social immersion and make the game react to player gains and losses.
Output: Dynamic social engine and refined readability.
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
@src/styles/pixel.css
@src/components/Apps/Phone/ChatApp.tsx
@src/components/Apps/Phone/WsbForum.tsx
@src/store/useGameStore.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add Pixel-Bold CSS and Apply to Phone Apps</name>
  <files>src/styles/pixel.css, src/components/Apps/Phone/ChatApp.tsx, src/components/Apps/Phone/WsbForum.tsx</files>
  <action>
    - Add `.pixel-bold` to `src/styles/pixel.css`:
      - `text-shadow: 1px 0 0 currentColor;` to simulate a "pixel-aligned" bold effect.
    - Apply this class to message text in `ChatApp.tsx`.
    - Apply this class to post titles and usernames in `WsbForum.tsx`.
  </action>
  <verify>
    Visually check the phone apps to ensure the text appears bolder and remains readable on the 4-color palette.
  </verify>
  <done>
    Phone app text is bold and highly readable.
  </done>
</task>

<task type="auto">
  <name>Task 2: Dynamic Social Triggers and Extended Narrative</name>
  <files>src/store/useGameStore.ts</files>
  <action>
    - Update `nextTurn()` in `useGameStore.ts` to implement dynamic social triggers:
      - At the BEGINNING of `nextTurn()`, calculate `prevNetWorth` (cash + market value of holdings).
      - AFTER market updates and settlement, calculate `currentNetWorth`.
      - If `currentNetWorth` gain > 50% relative to `prevNetWorth`: Add a "Tendies" forum post (id: `tendies-{day}`, title: "TENDIES SECURED! 🍗 LFG!!", user: "YOU").
      - If `currentNetWorth` loss > 30% relative to `prevNetWorth`: Add a "Loss Porn" forum post (id: `loss-{day}`, title: "GUH. Lost 30% today. Am I doing it right?", user: "YOU").
    - Extend `INITIAL_EVENTS` with messages and posts for Days 5 through 10:
      - Day 5: "Margin call" warning message.
      - Day 6: "The squeeze is squozen" guru advice.
      - Day 7: "Hedge funds are crying" forum post.
      - Day 8: "Wife's boyfriend" joke message.
      - Day 9: "Final YOLO" motivational message.
      - Day 10: "Moon or Bust" forum megathread.
  </action>
  <verify>
    Test that making a large gain or loss triggers a forum post from "YOU". Ensure messages for later days appear as turns advance.
  </verify>
  <done>
    The game world feels reactive to the player's performance and has a complete narrative timeline.
  </done>
</task>

</tasks>

<verification>
- Text in Chat and Forum is bolded using text-shadow.
- Large gains trigger "Tendies" posts.
- Large losses trigger "Loss Porn" posts.
- Day 5-10 events appear sequentially.
</verification>

<success_criteria>
- Readability improved on Phone UI.
- Narrative extended to Day 10.
- Dynamic social triggers work correctly.
</success_criteria>

<output>
After completion, create `.planning/phases/5/5-03-SUMMARY.md`
</output>
