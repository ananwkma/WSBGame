---
phase: 1
plan: 01
type: execute
wave: 1
depends_on: []
files_modified: [package.json, src/App.tsx, src/components/VisualFilter/PaletteFilter.tsx, src/styles/pixel.css, src/main.tsx]
autonomous: true
requirements: [TECH-01, VIS-01]

must_haves:
  truths:
    - "Screen renders exclusively using the 4-color Game Boy Pocket palette (#E0DBCB, #A89F94, #706B66, #2B2B26)"
    - "React application is running with Vite and TypeScript"
  artifacts:
    - path: "src/components/VisualFilter/PaletteFilter.tsx"
      provides: "SVG feColorMatrix and feComponentTransfer for palette enforcement"
    - path: "src/styles/pixel.css"
      provides: "Global pixel-rendering and root filter application"
  key_links:
    - from: "src/styles/pixel.css"
      to: "src/components/VisualFilter/PaletteFilter.tsx"
      via: "filter: url(#gb-pocket)"
      pattern: "filter:.*url"
---

<objective>
Initialize the React/TypeScript project and implement the global 4-color visual filter that defines the game's aesthetic.

Purpose: To establish the foundational technical stack and visual "feel" before building layout or gameplay.
Output: A running React app with mandatory 4-color palette enforcement and pixel-rendering styles.
</objective>

<execution_context>
@C:/Users/ananW/.gemini/get-shit-done/workflows/execute-plan.md
@C:/Users/ananW/.gemini/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/1/RESEARCH.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Project Scaffolding (Vite + React + TS)</name>
  <files>package.json, src/App.tsx, src/main.tsx</files>
  <action>
    Initialize a new Vite project with React and TypeScript.
    Clean up default boilerplate (Vite/React logos, default CSS).
    Install no extra dependencies yet (standard React/TS).
    Ensure the dev server runs and serves a clean App component.
  </action>
  <verify>Run `npm run dev` and confirm "App" text is visible in browser.</verify>
  <done>Vite project structure is present and default boilerplate is removed.</done>
</task>

<task type="auto">
  <name>Task 2: Global 4-Color Palette Filter</name>
  <files>src/components/VisualFilter/PaletteFilter.tsx, src/styles/pixel.css, src/App.tsx</files>
  <action>
    Implement the `GamePaletteFilter` component using the discrete palette mapping from RESEARCH.md.
    - Darkest (#2B2B26): 0.169, 0.169, 0.149
    - Dark (#706B66): 0.439, 0.420, 0.400
    - Light (#A89F94): 0.659, 0.624, 0.580
    - Lightest (#E0DBCB): 0.878, 0.859, 0.796
    
    Add global styles in `pixel.css`:
    - Apply `image-rendering: pixelated` and `image-rendering: crisp-edges` to #root.
    - Apply `filter: url(#gb-pocket)` to #root.
    - Set body background to #2B2B26.
    
    Wire `GamePaletteFilter` into `App.tsx`.
  </action>
  <verify>
    Create a test div with varying grayscale colors (black, 33% gray, 66% gray, white).
    Confirm in browser that colors are mapped to the 4 Game Boy Pocket colors and no intermediate colors exist.
  </verify>
  <done>Entire screen is palette-enforced and shows sharp pixel rendering.</done>
</task>

</tasks>

<verification>
Run the dev server and visually confirm that any color placed on screen is automatically remapped to one of the four defined palette colors.
</verification>

<success_criteria>
1. Project starts successfully with Vite/React/TS.
2. SVG filter is active and correctly mapping luminosity to the target hex codes.
3. No anti-aliasing artifacts on UI elements (all pixels are sharp).
</success_criteria>

<output>
After completion, create `.planning/phases/1/1-01-SUMMARY.md`
</output>
