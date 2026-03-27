---
phase: 1
plan: 03
type: gap_closure
wave: 1
depends_on: [1-02]
files_modified: [src/components/Shell/DualViewShell.tsx, src/components/Shell/Shell.css]
autonomous: true
requirements: [VIS-02, VIS-04]

must_haves:
  truths:
    - "User clicks on the physical laptop object to set focus to 'laptop'"
    - "User clicks on the physical phone object to set focus to 'phone'"
    - "The layout resembles a desk with distinct laptop and phone objects"
  artifacts:
    - path: "src/components/Shell/DualViewShell.tsx"
      provides: "Desk-style layout with click-to-focus"
    - path: "src/components/Shell/Shell.css"
      provides: "Visual styling for the desk background and objects"
---

<objective>
Refactor the shell to look like a desk where clicking the laptop or phone objects toggles the focus state.

Purpose: To create a more immersive "desk" experience where the user interacts with the world directly.
Output: A desk-style layout with click-to-focus on the physical laptop and phone objects.
</objective>

<tasks>

<task type="auto">
  <name>Task 1: Redesign Shell as a Desk in CSS</name>
  <files>src/components/Shell/Shell.css</files>
  <action>
    Modify `Shell.css`:
    - Add a "desk" background to the `.viewport` (using a dark color from the 4-color palette).
    - Position `.laptopView` and `.phoneView` as distinct objects on the desk.
    - When an object is NOT focused, it should look like it's sitting "on the desk" (e.g., smaller, angled, or to the side).
    - When an object IS focused, it should "zoom in" (expand) to fill the primary space while the other moves to the periphery.
    - Use transitions for the zoom/move effect.
  </action>
  <verify>Visually confirm the "desk" look and smooth transitions when focus changes.</verify>
  <done>Shell now resembles a desk with objects that zoom on focus.</done>
</task>

<task type="auto">
  <name>Task 2: Implement Click-to-Focus Logic</name>
  <files>src/components/Shell/DualViewShell.tsx</files>
  <action>
    Update `DualViewShell.tsx`:
    - Add `onClick={() => setFocus('laptop')}` to the `laptopView` container.
    - Add `onClick={() => setFocus('phone')}` to the `phoneView` container.
    - Remove the previous `<button className="focusToggle">` elements.
    - Ensure `pointer-events: none` (or similar) on the *inner* screen content when the object is NOT focused, so clicking anywhere on the object triggers the focus.
    - When an object is already focused, its internal content (the apps) should be interactable.
  </action>
  <verify>Confirm clicking the laptop focuses it, and clicking the phone focuses it.</verify>
  <done>Interaction model is now object-based click-to-focus.</done>
</task>

</tasks>

<success_criteria>
1. Interface looks like a desk with a laptop and a phone.
2. Clicking the phone focuses the phone; clicking the laptop focuses the laptop.
3. Transitions between focus states are smooth and consistent.
</success_criteria>
