---
phase: 3
plan: 01
type: execute
wave: 1
depends_on: [2-03]
files_modified: [src/store/types.ts, src/store/useGameStore.ts, src/data/narrative.ts]
autonomous: true
requirements: [NARR-01, ECON-02]

must_haves:
  truths:
    - "Game state includes an event queue for turn-based narrative progression"
    - "Day counter and Hype Meter (0-100) are implemented in the store"
    - "Initial scripted events for Days 1-3 are available in data"
  artifacts:
    - path: "src/store/types.ts"
      provides: "New types for GameEvent, Message, ForumPost, and NarrativeState"
    - path: "src/data/narrative.ts"
      provides: "Scripted message and post content for early game"
---

<objective>
Establish the narrative event engine and the necessary state structures to drive the game's story and FOMO.

Purpose: To provide the "brain" for the turn-based narrative progression.
Output: A functional event engine in the Zustand store that can trigger and process scripted events.
</objective>

<tasks>

<task type="auto">
  <name>Task 1: Define Narrative Types</name>
  <files>src/store/types.ts</files>
  <action>
    Add the following to `src/store/types.ts`:
    - `GameEvent`: { type: 'MESSAGE' | 'POST' | 'SHIFT' | 'GURU'; day: number; payload: any }
    - `Message`: { sender: string; text: string; id: string }
    - `ForumPost`: { user: string; title: string; upvotes: number; id: string }
    - Update `GameState` and `GameActions` with `eventQueue`, `day`, `hype`, `messages`, and `forumPosts`.
  </action>
  <verify>Check types compile correctly in the store.</verify>
  <done>Narrative types are defined and integrated into the store interface.</done>
</task>

<task type="auto">
  <name>Task 2: Implement Event Engine in Store</name>
  <files>src/store/useGameStore.ts</files>
  <action>
    Update `useGameStore.ts`:
    - Initialize `day: 1`, `hype: 0`, `messages: []`, `forumPosts: []`, and `eventQueue: []`.
    - Implement `processEvents()` action that filters the `eventQueue` for the current day and pushes them to `messages` or `forumPosts`.
    - Update `nextTurn()` to increment `day` and call `processEvents()`.
  </action>
  <verify>Call `nextTurn()` and verify that new messages/posts appear in the store arrays.</verify>
  <done>Event engine is functional and processes turn-based events.</done>
</task>

<task type="auto">
  <name>Task 3: Seed Scripted Narrative Data</name>
  <files>src/data/narrative.ts</files>
  <action>
    Create `src/data/narrative.ts`:
    - Export `INITIAL_EVENTS`: Array of `GameEvent` objects for Days 1, 2, and 3.
    - Day 1: Message from Ape Friend ("Buy $GAME!"), Post on r/wsb ("$GAME TO THE MOON").
    - Day 2: Message from Wife ("How are the finances?"), Post on r/wsb ("Loss Porn is coming").
    - Day 3: Guru Advice ("$GAME is a sell... NOT").
  </action>
  <verify>Confirm `INITIAL_EVENTS` is imported and used to populate the initial `eventQueue` in the store.</verify>
  <done>Narrative data is seeded and driving the early game flow.</done>
</task>

</tasks>

<success_criteria>
1. `day` increments and triggers new narrative content.
2. `messages` and `forumPosts` arrays populate correctly in the store.
3. The event engine is ready for UI integration.
</success_criteria>
