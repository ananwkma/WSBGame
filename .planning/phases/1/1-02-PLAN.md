---
phase: 1
plan: 02
type: execute
wave: 2
depends_on: [1-01]
files_modified: [src/components/Shell/GameViewport.tsx, src/components/Shell/DualViewShell.tsx, src/components/Shell/Shell.css, src/App.tsx]
autonomous: true
requirements: [VIS-02, VIS-03, VIS-04]

must_haves:
  truths:
    - "User can switch focus between Laptop and Phone views using state"
    - "Interface scales while maintaining a fixed 16:10 internal aspect ratio"
    - "UI elements align to an 8x8 pixel grid layout"
  artifacts:
    - path: "src/components/Shell/GameViewport.tsx"
      provides: "Main container with 16:10 aspect ratio and letterboxing"
    - path: "src/components/Shell/DualViewShell.tsx"
      provides: "Split-view layout for Laptop and Phone interfaces"
  key_links:
    - from: "src/components/Shell/DualViewShell.tsx"
      to: "src/App.tsx"
      via: "React State for current focus"
      pattern: "const \[focus, setFocus\] = useState"
---

<objective>
Implement the core game shell, including responsive scaling, the dual-view layout (Laptop + Phone), and pixel-grid alignment.

Purpose: To create the physical "frame" of the game that houses all future app modules.
Output: A responsive shell that allows switching between a large Laptop view and a smaller Phone view.
</objective>

<execution_context>
@C:/Users/ananW/.gemini/get-shit-done/workflows/execute-plan.md
@C:/Users/ananW/.gemini/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/1/1-01-SUMMARY.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Responsive Game Viewport & Scaling</name>
  <files>src/components/Shell/GameViewport.tsx, src/components/Shell/Shell.css</files>
  <action>
    Create a `GameViewport` component that maintains a strict 16:10 aspect ratio.
    - Implement CSS scaling logic that ensures the viewport fits the browser window without distortion (letterboxing/pillarboxing).
    - Ensure `image-rendering: pixelated` is applied to all children of the viewport.
    - Define a CSS variable for the base 8x8 unit (e.g., `--tile-size: 8px`) for grid alignment.
  </action>
  <verify>Resize browser window and confirm viewport stays centered and maintains aspect ratio.</verify>
  <done>Viewport correctly scales and maintains 16:10 ratio.</done>
</task>

<task type="auto">
  <name>Task 2: Dual-View Shell & Focus State</name>
  <files>src/components/Shell/DualViewShell.tsx, src/components/Shell/Shell.css, src/App.tsx</files>
  <action>
    Implement `DualViewShell` with a "Laptop" area and a "Phone" area.
    - Add React state to `App.tsx` or `DualViewShell` to track `focus` ('laptop' | 'phone').
    - Create a layout where focusing on 'laptop' makes the laptop screen large (primary) and the phone secondary.
    - Focusing on 'phone' swaps the hierarchy (phone becomes primary/larger).
    - Use CSS transitions for smooth (but snappy) focus changes.
    - Ensure layout uses 8x8 grid alignment for internal component containers.
  </action>
  <verify>Click (or use temporary keys) to toggle focus and confirm the layout shifts accordingly.</verify>
  <done>Layout supports two focus modes with distinct hierarchies.</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>Core Game Shell with Dual-View Focus and SVG Palette Filter</what-built>
  <how-to-verify>
    1. Start the dev server: `npm run dev`.
    2. Confirm the entire screen uses the 4-color palette (from Plan 1-01).
    3. Confirm the 16:10 game viewport scales correctly when resizing the window.
    4. Test switching focus between 'Laptop' and 'Phone' views.
    5. Verify that UI elements are aligned to a clear pixel grid (no blurry edges or sub-pixel positioning).
  </how-to-verify>
  <resume-signal>approved</resume-signal>
</task>

</tasks>

<verification>
Perform a final visual check on multiple viewport sizes to ensure the layout remains balanced and the pixel-perfect aesthetic is maintained.
</verification>

<success_criteria>
1. User can switch focus between Laptop and Phone interfaces.
2. Aspect ratio is strictly enforced with automatic scaling.
3. 8x8 pixel grid alignment is visible in the container structures.
</success_criteria>

<output>
After completion, create `.planning/phases/1/1-02-SUMMARY.md`
</output>
