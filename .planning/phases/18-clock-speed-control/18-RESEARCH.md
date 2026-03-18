# Phase 18: Clock Speed Control - Research

**Researched:** 2026-03-18
**Domain:** React interval management, Zustand state, in-game clock scaling
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Three levels cycling in order: 1x → 2x → 5x → back to 1x
- Always visible and available to all players — not gated behind `?debug` or DEV mode
- Replaces the existing `+5m` / `+1h` DEV-only buttons (those are removed)
- Everything fires normally, just faster — market events, messages, sounds all trigger at the sped-up rate (no suppression)
- Single button next to the market clock
- Button label shows current speed (e.g. `2x`)
- Clicking cycles to the next level
- Speed resets to 1x when NEXT DAY is pressed

### Claude's Discretion
- Exact tick interval math (how `useMarketClock` scales the interval)
- Button styling / pixel art treatment consistent with existing clock display
- Whether speed persists across page refreshes (likely no — start fresh each session)

### Deferred Ideas (OUT OF SCOPE)
- None — discussion stayed within phase scope
</user_constraints>

---

## Summary

Phase 18 adds a clock speed multiplier that accelerates how fast the real-time market clock ticks. The implementation touches exactly three places: `useMarketClock.ts` (interval math), `App.tsx` (UI button + debug button removal), and `useGameStore.ts` / `advanceDay` (speed reset on day change).

The current `useMarketClock` hook creates a single fixed `setInterval` at 2000ms. The hook has no external dependencies (`[]` dep array), so it never re-creates the interval. To support variable speed, the interval must be torn down and re-created whenever the multiplier changes. React's `useEffect` with the multiplier as a dependency handles this cleanly: when multiplier changes, the cleanup function clears the old interval and the effect body starts a new one at `BASE_MS / multiplier`.

Speed state can live entirely in `App.tsx` as local React state (`useState`). The multiplier only affects the interval timing — `tickMarket()` itself is untouched. Market events, messages, and sounds all live inside `tickMarket()`, so they automatically fire at the sped-up rate with zero additional code. Speed resets to 1x by resetting local state in the NEXT DAY `onClick` handler alongside the existing `advanceDay()` call.

**Primary recommendation:** Store `clockSpeed` as local `useState` in `App.tsx`. Pass it to `useMarketClock` as an argument. In `useMarketClock`, include it in the `useEffect` dependency array and compute `interval = 2000 / clockSpeed`. Remove the `DEBUG` guard from the +5m/+1h buttons and delete those buttons entirely.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React useState | (project React) | Local UI state for speed level | Speed is UI-only; doesn't need to survive page reload or be consumed by store |
| React useEffect | (project React) | Re-creates setInterval when speed changes | The only correct way to react to prop/state changes inside an effect |
| Zustand (existing) | (project version) | advanceDay reset hook | Store already owns advanceDay; no new store state needed |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| TypeScript const union | — | `type ClockSpeed = 1 \| 2 \| 5` | Narrows valid multiplier values, eliminates invalid states |

**Installation:** No new packages required.

---

## Architecture Patterns

### Recommended Project Structure

No new files required. Changes are confined to:

```
src/
├── hooks/
│   └── useMarketClock.ts     — accepts speed param, dep-array change
├── App.tsx                   — useState for speed, speed button UI, debug removal
└── store/
    └── useGameStore.ts       — advanceDay: already exists, no change needed
```

Speed resets in `App.tsx` `onClick` for NEXT DAY — no store action required because the speed is local state.

### Pattern 1: Parameterized Interval Hook

**What:** Accept the speed multiplier as a parameter. Include it in `useEffect` deps. Re-create the interval at `BASE_MS / speed` on every speed change.

**When to use:** Any time a `setInterval` duration must be variable.

**Example:**
```typescript
// src/hooks/useMarketClock.ts
import { useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';

const BASE_INTERVAL_MS = 2000; // 2 real seconds = 1 in-game minute at 1x

export function useMarketClock(speed: 1 | 2 | 5 = 1) {
  useEffect(() => {
    const intervalId = setInterval(() => {
      const state = useGameStore.getState();
      if (state.gameStatus !== 'playing') return;
      state.tickMarket();
    }, BASE_INTERVAL_MS / speed);

    return () => clearInterval(intervalId);
  }, [speed]); // Re-creates interval when speed changes
}
```

Key: adding `speed` to the dep array is the only change to the hook body. The old `[]` empty dep array meant "one interval per mount" — correct at 1x but incompatible with variable speeds.

### Pattern 2: Local Speed State with Cycle-on-Click

**What:** `useState` for the current multiplier in `App.tsx`. A `const SPEEDS` tuple drives cycling with modulo.

**When to use:** When UI state doesn't need persistence, store sync, or cross-component sharing.

**Example:**
```typescript
// App.tsx (inside App component)
const SPEEDS = [1, 2, 5] as const;
type ClockSpeed = typeof SPEEDS[number]; // 1 | 2 | 5

const [clockSpeed, setClockSpeed] = useState<ClockSpeed>(1);

const cycleSpeed = () => {
  setClockSpeed(prev => {
    const idx = SPEEDS.indexOf(prev);
    return SPEEDS[(idx + 1) % SPEEDS.length];
  });
};

// Reset in NEXT DAY handler:
const handleNextDay = () => {
  advanceDay();
  setClockSpeed(1);
};

// Pass to hook:
useMarketClock(clockSpeed);
```

### Pattern 3: Speed Button UI Placement

**What:** A small pixel-style button placed inside the existing clock container `<div>` (the dark bordered box with `background: '#1a1a16'`).

**When to use:** UI elements that belong spatially near the clock.

**Example:**
```typescript
// Inside the clock container div, below the status text:
<button
  className="next-turn-btn"
  style={{ position: 'static', fontSize: '10px', padding: '3px 8px', marginTop: '4px' }}
  onClick={cycleSpeed}
>
  {clockSpeed}x
</button>
```

Using `.next-turn-btn` class gives the pixel-art look (border, box-shadow, hover/active states) consistent with existing buttons. No new CSS needed.

### Anti-Patterns to Avoid

- **Storing speed in Zustand:** Speed is purely UI behavior. Adding it to the store would require a migration version bump, persist exclusion boilerplate, and cross-component subscriptions — all unnecessary overhead for local state.
- **Using `useRef` to store the interval ID inside a non-dep-array effect:** The existing code already does this correctly via `clearInterval` in cleanup. Changing to `[speed]` deps is sufficient — don't switch to a `useRef` approach.
- **Suppressing events at higher speeds:** The locked decision says fire everything normally. Any `if (speed > 1) return` guard inside `tickMarket` would violate this requirement.
- **Fractional/non-integer interval math:** `2000 / 5 = 400ms`, `2000 / 2 = 1000ms` — both are exact integers. No rounding needed.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Interval cleanup on speed change | Manual ref + clearInterval juggling | `useEffect` with `[speed]` dep array | React's cleanup function already handles teardown correctly |
| Speed persistence across refresh | localStorage write/read | Don't persist — local state resets naturally | Locked decision: start fresh each session |
| Speed cycling logic | Switch statement | Modulo index into `SPEEDS` array | Cleaner, easier to extend if a 10x ever gets added |

**Key insight:** The market clock drives all events through `tickMarket()`. There is nothing inside the events, messages, or sounds subsystems that needs to know the current speed — they just respond to being called more frequently.

---

## Common Pitfalls

### Pitfall 1: Stale Closure in setInterval

**What goes wrong:** If `speed` is captured in the `setInterval` callback closure (not in the dep array), the interval always runs at the initial speed regardless of what the user clicks.

**Why it happens:** The original hook uses `[]` deps deliberately to create one persistent interval. Adding speed to the callback without adding to deps creates a stale closure.

**How to avoid:** Add `speed` to the `useEffect` dependency array. The existing `useGameStore.getState()` pattern (not subscribing to state) means there are no other stale closure issues in this hook.

**Warning signs:** Clicking the speed button shows the label change (React re-renders) but market time still advances at the old rate.

### Pitfall 2: Double Interval on Hot Reload

**What goes wrong:** In development, React StrictMode double-invokes effects. Two intervals can run simultaneously, doubling the tick rate unexpectedly.

**Why it happens:** StrictMode mounts → unmounts → remounts in dev to expose cleanup bugs. The cleanup function `() => clearInterval(intervalId)` already handles this correctly in the existing code.

**How to avoid:** No change needed — the existing cleanup pattern handles StrictMode correctly. The `[speed]` dep approach keeps this property.

**Warning signs:** Market advances at 2x the expected rate in dev but not in production.

### Pitfall 3: Forgetting Speed Reset on NEXT DAY

**What goes wrong:** Player presses NEXT DAY at 5x; next day starts at 5x, which may feel jarring (or unintended per spec).

**Why it happens:** `advanceDay` is a store action; `clockSpeed` is local state. The two are not linked automatically.

**How to avoid:** Wrap the NEXT DAY `onClick` in a local `handleNextDay` function that calls both `advanceDay()` and `setClockSpeed(1)`.

**Warning signs:** After pressing NEXT DAY, the speed button still shows `5x` and the clock runs fast from the start of the new session.

### Pitfall 4: Removing DEBUG Guard While Keeping IS_DEBUG_MODE Variable

**What goes wrong:** `IS_DEBUG_MODE` is used only for the NEXT DAY gate (`opacity: (marketTime < 960 && !IS_DEBUG_MODE)`). If the +5m/+1h buttons are removed, the `IS_DEBUG_MODE` variable becomes unused, triggering a TypeScript unused-variable warning (or error in strict mode).

**Why it happens:** The `DEBUG` and `IS_DEBUG_MODE` declarations are at module scope. Removing the buttons removes the only consumers of `DEBUG` but `IS_DEBUG_MODE` is still used in the NEXT DAY disabled logic.

**How to avoid:** After deleting the `{DEBUG && (...)}` block, check if `IS_DEBUG_MODE` is still used in the NEXT DAY button (it is). Remove the `DEBUG` constant declaration; keep `IS_DEBUG_MODE` only if still needed. Or remove `IS_DEBUG_MODE` too and simplify the NEXT DAY gate to `disabled={marketTime < 960}` — which aligns with Phase 16's decision that the gate is always on (not debug-bypassed).

**Warning signs:** `tsc --noEmit` fails with "variable declared but its value is never read."

### Pitfall 5: Button Placement Breaking the Clock Layout

**What goes wrong:** Adding a button inside the existing clock container `<div>` may cause layout reflow if the container has fixed dimensions or `alignItems: 'center'` that cuts off the button.

**Why it happens:** The clock container uses `display: 'flex', flexDirection: 'column', alignItems: 'center'` with no explicit height. Adding a third child (button) extends the container vertically.

**How to avoid:** Place the speed button inside the clock container div as a third child. The container already stretches to fit its children. Test that the button appears cleanly below the "● MARKET OPEN" status line. Alternatively, place the button as a sibling row next to the clock text (a nested row flex div) for a tighter layout.

---

## Code Examples

### Complete useMarketClock.ts After Change

```typescript
// src/hooks/useMarketClock.ts
import { useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';

const BASE_INTERVAL_MS = 2000;

export function useMarketClock(speed: 1 | 2 | 5 = 1) {
  useEffect(() => {
    const intervalId = setInterval(() => {
      const state = useGameStore.getState();
      if (state.gameStatus !== 'playing') return;
      state.tickMarket();
    }, BASE_INTERVAL_MS / speed);

    return () => clearInterval(intervalId);
  }, [speed]);
}
```

### App.tsx Speed State + NEXT DAY Handler Pattern

```typescript
// Inside App() function, alongside existing useState for focus:
const SPEEDS = [1, 2, 5] as const;
type ClockSpeed = typeof SPEEDS[number];
const [clockSpeed, setClockSpeed] = useState<ClockSpeed>(1);

const cycleSpeed = () => {
  setClockSpeed(prev => SPEEDS[(SPEEDS.indexOf(prev) + 1) % SPEEDS.length]);
};

const handleNextDay = () => {
  advanceDay();
  setClockSpeed(1);
};

// Hook call changes from:
//   useMarketClock();
// to:
useMarketClock(clockSpeed);
```

### Speed Button JSX (inside clock container)

```tsx
// Add as third child inside the existing dark clock container div:
<button
  className="next-turn-btn"
  style={{ position: 'static', fontSize: '10px', padding: '3px 8px', marginTop: '2px' }}
  onClick={cycleSpeed}
>
  {clockSpeed}x
</button>
```

### Debug Block Removal

```tsx
// DELETE the entire block (lines 89–98 in current App.tsx):
// {DEBUG && (
//   <div style={{ display: 'flex', gap: '4px' }}>
//     <button ...>+5m</button>
//     <button ...>+1h</button>
//   </div>
// )}

// Also DELETE the skipTime function and DEBUG/IS_DEBUG_MODE constants
// (verify IS_DEBUG_MODE usage in NEXT DAY gate before removing)
```

---

## Current Code Inventory

| Item | File | Lines | Notes |
|------|------|-------|-------|
| `useMarketClock` hook | `src/hooks/useMarketClock.ts` | 1–14 | Hardcoded 2000ms interval, `[]` dep array |
| Clock display container | `src/App.tsx` | 58–88 | Dark bordered box with time + status |
| NEXT DAY button | `src/App.tsx` | 50–57 | Uses `advanceDay` from store |
| DEBUG guard + skip buttons | `src/App.tsx` | 24–32, 89–98 | `DEBUG = import.meta.env.DEV` + `IS_DEBUG_MODE` |
| `advanceDay` action | `src/store/useGameStore.ts` | 1139+ | Resets marketTime, seeds new day events |
| `tickMarket` action | `src/store/useGameStore.ts` | (existing) | All events, messages, sounds fire here |

The `skipTime()` function in App.tsx (lines 27–32) calls `tickMarket()` in a synchronous loop. It is only used by the debug buttons. It should be deleted along with the buttons.

---

## Interval Math Reference

| Speed | Interval | Real seconds per in-game minute | In-game minutes per real minute |
|-------|----------|-------------------------------|--------------------------------|
| 1x | 2000ms | 2.0s | 30 |
| 2x | 1000ms | 1.0s | 60 |
| 5x | 400ms | 0.4s | 150 |

At 5x: a full trading day (570–960 = 390 in-game minutes) completes in 390 × 0.4s = 156 real seconds (~2.6 minutes).

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|-----------------|--------|
| Fixed 2000ms interval, `[]` deps | `[speed]` dep, `BASE_MS / speed` interval | Interval tears down cleanly on speed change |
| `+5m`/`+1h` DEV-only buttons | Player-facing speed toggle | Feature visible to all players, no debug guard needed |

---

## Open Questions

1. **Should `IS_DEBUG_MODE` be fully removed or kept for the NEXT DAY gate?**
   - What we know: `IS_DEBUG_MODE` currently bypasses the `marketTime < 960` gate on NEXT DAY. Phase 16 locked this gate as always-on. The debug bypass is arguably already vestigial.
   - What's unclear: Whether there's any playtesting workflow that relies on `?debug` URL param to skip the gate.
   - Recommendation: Remove `IS_DEBUG_MODE` and `DEBUG` constants entirely. Simplify NEXT DAY `disabled` to `marketTime < 960`. This aligns with Phase 16's intent and eliminates dead code.

2. **Speed button position — inside clock box vs. sibling row?**
   - What we know: Clock container is a flex column with two children (time string, status label). Adding a third child (button) extends the box height.
   - What's unclear: Whether this makes the right-side HUD look too tall.
   - Recommendation: Add as third child inside the clock container, with `marginTop: 2px`. If visual review shows the box is too tall, move the button to a separate sibling row below the clock box.

---

## Sources

### Primary (HIGH confidence)
- Direct source code read: `src/hooks/useMarketClock.ts` — full hook implementation confirmed
- Direct source code read: `src/App.tsx` — clock UI, NEXT DAY button, debug buttons all confirmed
- Direct source code read: `src/store/useGameStore.ts` — advanceDay signature and body confirmed
- Direct source code read: `src/store/types.ts` — GameState and GameActions types confirmed
- Direct source code read: `src/styles/pixel.css` — `.next-turn-btn` styles confirmed

### Secondary (MEDIUM confidence)
- React docs (training knowledge, stable API): `useEffect` cleanup pattern with dep array — well-established React pattern, not API-version-sensitive

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new libraries; all patterns verified directly in source
- Architecture: HIGH — hook signature change and state location confirmed by reading actual files
- Pitfalls: HIGH — identified directly from reading the existing code (stale closure, IS_DEBUG_MODE variable, skipTime function)
- Interval math: HIGH — exact integer arithmetic, no rounding issues

**Research date:** 2026-03-18
**Valid until:** 2026-04-18 (stable React patterns; no external dependency risk)
