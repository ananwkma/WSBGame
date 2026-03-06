# Phase 4: Polish & Endings - Research

**Researched:** 2024-05-22
**Domain:** State Persistence, UI Juice, CRT Effects, Game Endings
**Confidence:** HIGH

## Summary
Phase 4 focuses on long-term engagement (persistence), narrative closure (endings), and visual "juice" (CRT effects and animations). 

**Primary recommendation:** Use Zustand's `persist` middleware for the save system, and implement the CRT effect using a lightweight CSS overlay rather than a heavy SVG displacement map to maintain 60fps performance on lower-end devices.

## User Constraints
(No CONTEXT.md was found for Phase 4, so research follows project defaults and ROADMAP.md goals.)

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| ECON-04 | Multi-Endings based on Net Worth/Karma | State-driven ending screens using a `gameStatus` enum. |
| VIS-03 | Final pixel-art polish & animations | Framer Motion window transitions and CRT scanline overlay. |
| TECH-03 | Simple local storage save system | Zustand `persist` middleware implementation. |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Zustand | 5.x | State Persistence | Built-in `persist` middleware is the industry standard for small React games. |
| Framer Motion | 12.x | UI Animations | `AnimatePresence` handles the "exit" animations for windows and modals perfectly. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|--------------|
| CSS Scanlines | N/A | CRT Polish | High-performance visual texture. |

## Architecture Patterns

### State-Driven Endings
Instead of complex routing, the game should use a `gameStatus` field in `useGameStore`:
- `playing`: Standard gameplay.
- `ended`: Game over, show specific ending overlay based on `netWorth` and `karma`.

### Recommended CRT Overlay Structure
Place the CRT filter at the root, *inside* the 4-color visual filter but *above* the game UI.
```
#root (SVG Color Matrix)
└── .crt-container
    ├── .crt-screen (Game Content)
    └── .crt-overlay (Scanlines, Flicker, Vignette)
```

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Persistence Sync | Custom `useEffect` + `localStorage.setItem` | `persist` middleware | Handles hydration, versioning, and JSON serialization automatically. |
| Modal Transitions | Custom CSS `@keyframes` | `framer-motion` | Handles interruptible animations and "exit" states (AnimatePresence). |

## Common Pitfalls

### Pitfall 1: Zustand Hydration Mismatch
**What goes wrong:** In React 19, the UI might flicker or throw errors if the local storage state differs from the initial server/client state before the first paint.
**How to avoid:** Use a `useHasHydrated` hook or check `_hasHydrated` state before rendering the game shell.

### Pitfall 2: High Frequency CRT Flicker
**What goes wrong:** Aggressive opacity flickering (0.1s) can cause eye strain or trigger photosensitivity.
**How to avoid:** Keep flicker opacity very low (0.02 range) and provide a toggle in "Settings" to disable it.

## Code Examples

### Zustand 5 Persistence
```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      // ... existing state
    }),
    {
      name: 'wsb-game-save',
      storage: createJSONStorage(() => localStorage),
      // Only persist specific keys to avoid bloat
      partialize: (state) => ({
        cash: state.cash,
        holdings: state.holdings,
        karma: state.karma,
        turn: state.turn,
        day: state.day,
      }),
    }
  )
);
```

### CSS Scanline Overlay
```css
.scanlines {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: linear-gradient(
    rgba(18, 16, 16, 0) 50%, 
    rgba(0, 0, 0, 0.1) 50%
  );
  background-size: 100% 4px; /* Pixel-perfect height */
  z-index: 100;
  pointer-events: none;
}
```

## Sources

### Primary (HIGH confidence)
- Zustand v5 Docs - Middleware: Persist
- Framer Motion Docs - AnimatePresence & Layout

## Metadata
**Confidence breakdown:**
- Standard stack: HIGH
- Architecture: HIGH
- Pitfalls: MEDIUM

**Research date:** 2024-05-22
**Valid until:** 2024-06-22
