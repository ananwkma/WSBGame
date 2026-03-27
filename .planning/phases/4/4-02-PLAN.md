---
phase: 4
plan: 02
type: execute
wave: 2
depends_on: [4-01]
files_modified: [src/components/Shell/GameViewport.tsx, src/components/Shell/Shell.css, src/App.tsx, src/components/Apps/Phone/PhoneApp.tsx, src/components/Trade/Robbinghood.tsx]
autonomous: true
requirements: [VIS-03]

must_haves:
  truths:
    - "CRT scanline filter is visible over the entire game screen"
    - "App windows open and close with smooth scale animations"
    - "The 4-color aesthetic is consistent through all visual additions"
  artifacts:
    - path: "src/styles/pixel.css"
      provides: "CRT scanline and vignette utility classes"
---

<objective>
Apply final visual polish and high-impact "pixel juice" to the game shell and transitions.

Purpose: To elevate the game's production value and solidify the retro laptop aesthetic.
Output: A polished interface with CRT filters and animated window transitions.
</objective>

<tasks>

<task type="auto">
  <name>Task 1: CRT Filter & Scanline Overlay</name>
  <files>src/styles/pixel.css, src/components/Shell/GameViewport.tsx</files>
  <action>
    Implement CRT effects:
    - Create a `.crt-filter` CSS class with a subtle horizontal linear-gradient (scanlines) and an inner glow/vignette.
    - Add a `pointer-events: none` overlay div within the `GameViewport` that applies this filter over all other content.
    - Ensure it doesn't wash out the 4-color palette.
  </action>
  <verify>Visually confirm the scanlines are visible but not distracting.</verify>
  <done>Game screen has a consistent retro CRT feel.</done>
</task>

<task type="auto">
  <name>Task 2: Window Opening/Closing Animations</name>
  <files>src/components/Apps/Phone/PhoneApp.tsx, src/components/Trade/Robbinghood.tsx</files>
  <action>
    Add Framer Motion transitions to the main app components:
    - Use `initial={{ scale: 0.9, opacity: 0 }}`, `animate={{ scale: 1, opacity: 1 }}`, and `transition={{ duration: 0.2 }}`.
    - Apply this to the main container of `PhoneApp`, `Robbinghood`, and `GuruTube`.
    - Ensure the layout doesn't "jump" during these transitions.
  </action>
  <verify>Switch between apps and focus views to confirm animations feel responsive and satisfying.</verify>
  <done>App transitions are smooth and high-quality.</done>
</task>

</tasks>

<success_criteria>
1. CRT effect enhances the immersion without blocking text.
2. Animations make the UI feel "alive" and reactive.
3. Final build is verified across different viewport sizes.
</success_criteria>
