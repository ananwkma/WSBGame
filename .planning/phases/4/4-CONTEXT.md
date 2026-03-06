# Phase 4: Polish & Endings - Context

**Created:** 2026-03-05
**Status:** LOCKED

## 1. Game Endings
The game reaches its conclusion after **10 Days** (Turns).
- **Triggers:** A `checkEndings()` function runs at the end of Day 10 in `nextTurn()`.
- **Endings UI:** A fullscreen, high-contrast overlay that displays the final result with thematic pixel art (e.g., a moon icon or a fast-food cap).
- **Persistence:** Add a "RESTART GAME" button to the ending screen that resets the store.

## 2. Persistence (Zustand)
- **Middleware:** Use the `persist` middleware to save the state to `localStorage`.
- **Key:** `wsb-trader-save`.
- **Excluded:** Do not persist temporary UI states like `activeTab` or `popups`.

## 3. Visual Polish (Scanlines & Transitions)
- **CRT Effect:** Add a global `.crt-overlay` component that applies horizontal scanlines and a slight inner glow/vignette to the `GameViewport`.
- **Animations:** Use `Framer Motion` for app window transitions:
  - `initial: { scale: 0.9, opacity: 0 }`
  - `animate: { scale: 1, opacity: 1 }`
  - `exit: { scale: 0.9, opacity: 0 }`

## 4. Requirement Mapping
- **ECON-04**: 3 Ending states implemented.
- **VIS-03 (Polish)**: CRT filter and window animations.
- **TECH-03**: Auto-save/localStorage persistence.
