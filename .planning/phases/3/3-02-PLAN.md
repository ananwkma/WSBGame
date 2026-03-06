---
phase: 3
plan: 02
type: execute
wave: 2
depends_on: [3-01]
files_modified: [src/components/Apps/Phone/ChatApp.tsx, src/components/Apps/Phone/WsbForum.tsx, src/components/Shell/DualViewShell.tsx, src/components/Apps/Phone/Phone.css]
autonomous: true
requirements: [NARR-02, VIS-03, NARR-04]

must_haves:
  truths:
    - "Phone view features a functional ChatApp and WsbForum"
    - "UI elements in phone apps align to 8x8 pixel grid"
    - "Hype Jitter effect is visible on the phone UI when FOMO is high"
  artifacts:
    - path: "src/components/Apps/Phone/ChatApp.tsx"
      provides: "Chat interface with pixelated bubbles"
    - path: "src/components/Apps/Phone/WsbForum.tsx"
      provides: "Scrolling forum feed with reddit-style posts"
    - path: "src/components/Apps/Phone/Phone.css"
      provides: "Pixel art styling for phone app components"
---

<objective>
Implement the primary social interfaces on the Phone view to deliver narrative content and simulate the WSB "echo chamber."

Purpose: To provide the narrative delivery mechanism (chat/forum) on the phone.
Output: Functional Chat and Forum apps for the phone view with high-hype visual effects.
</objective>

<tasks>

<task type="auto">
  <name>Task 1: Build Chat App for Phone</name>
  <files>src/components/Apps/Phone/ChatApp.tsx, src/components/Apps/Phone/Phone.css</files>
  <action>
    Create `ChatApp.tsx`:
    - Display scrolling list of `messages` from the store.
    - Implement pixelated speech bubbles (using `border-image`).
    - Diffent colors for "Me" (Light) and "Sender" (Dark).
    - Maintain 8x8 grid alignment for bubble padding and margins.
  </action>
  <verify>Check messages render correctly and follow the 4-color palette.</verify>
  <done>Chat App is functional and styled for the phone view.</done>
</task>

<task type="auto">
  <name>Task 2: Build r/wsb Forum App for Phone</name>
  <files>src/components/Apps/Phone/WsbForum.tsx, src/components/Apps/Phone/Phone.css</files>
  <action>
    Create `WsbForum.tsx`:
    - Display list of `forumPosts` from the store.
    - Style as a simplified Reddit-style feed with title, user, and upvote/karma counts.
    - Use `image-rendering: pixelated` for any icons or avatars.
    - Implement scrolling behavior within the phone screen area.
  </action>
  <verify>Confirm posts are readable and scrolling works as expected.</verify>
  <done>WsbForum is functional and correctly styled.</done>
</task>

<task type="auto">
  <name>Task 3: Implement Hype Jitter Effect</name>
  <files>src/components/Shell/DualViewShell.tsx, src/components/Apps/Phone/Phone.css</files>
  <action>
    Implement "Hype Jitter":
    - Use `framer-motion` on the `phoneView` container in `DualViewShell.tsx`.
    - Apply a random `x`/`y` shake when `hype > 80` in the store.
    - Add a "FOMO Meter" (simple progress bar) to the top of the phone UI to show hype level.
  </action>
  <verify>Temporarily set hype to 100 in the store and confirm the phone UI shakes.</verify>
  <done>Visual hype feedback is implemented on the phone UI.</done>
</task>

</tasks>

<success_criteria>
1. Phone view allows toggling between Chat and Forum apps.
2. Messages and forum posts populate from the narrative event store.
3. UI remains strictly responsive and pixel-perfect.
</success_criteria>
