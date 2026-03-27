---
phase: 15-live-market-events-polish
plan: "05"
subsystem: ui
tags: [react, framer-motion, web-audio-api, zustand, chiptune, particles]

# Dependency graph
requires:
  - phase: 15-01
    provides: tickMarket loop and marketTime/marketIsOpen state used as trigger points for sounds

provides:
  - Web Audio API chiptune sound engine (playMarketOpen, playMarketClose, playBigGain, playBigLoss, playBorrow)
  - Market open bell at marketTime=570 and close bell at marketTime=960
  - bigGainTicker/bigLossTicker fields in GameState for particle trigger
  - Pixel coin ($) and flame (*) particle burst component via framer-motion AnimatePresence
  - ParticleBurst overlays in Robbinghood stock detail view wired to bigGainTicker/bigLossTicker
  - EndingScreen entrance animation (opacity+scale fade-in via motion.div)
affects: [any phase touching EndingScreen, Robbinghood, tickMarket, or borrowFromShark]

# Tech tracking
tech-stack:
  added: []
  patterns: [Lazy AudioContext for browser autoplay policy compliance, transient state fields excluded from zustand persist partialize]

key-files:
  created:
    - src/utils/soundEngine.ts
    - src/components/Feedback/ParticleBurst.tsx
  modified:
    - src/store/types.ts
    - src/store/useGameStore.ts
    - src/components/Feedback/EndingScreen.tsx
    - src/components/Trade/Robbinghood.tsx

key-decisions:
  - "AudioContext created lazily on first playTone call — avoids browser autoplay policy violations before user interaction"
  - "bigGainTicker/bigLossTicker set per-tick and reset to null each tick — transient state, excluded from persist partialize"
  - "20% threshold for particle/sound trigger — mostly fires during market events (price multiplier), making events feel dramatic"
  - "ParticleBurst placed inside relative wrapper around chart container in Robbinghood stock detail view"
  - "EndingScreen outermost div (ending-screen-overlay) replaced with motion.div — no extra wrapper needed"

patterns-established:
  - "Transient display state (bigGainTicker, bigLossTicker) excluded from zustand persist partialize alongside marketTime, intradayBars etc."
  - "Sound engine imported directly into store actions — side-effect calls within set() callbacks"

requirements-completed: [UX-01]

# Metrics
duration: 15min
completed: 2026-03-14
---

# Phase 15 Plan 05: Sound Engine, Particle Bursts & EndingScreen Animation Summary

**8-bit chiptune sound engine with market bells, coin/flame pixel particle bursts on big price moves, and framer-motion EndingScreen entrance animation**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-03-14T00:00:00Z
- **Completed:** 2026-03-14T00:15:00Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Created `soundEngine.ts` with 5 Web Audio API chiptune functions using lazy AudioContext (autoplay-safe)
- Wired market open/close bells into `tickMarket` on state transitions at 570/960 minutes
- Added 20% single-tick big gain/loss detection in `tickMarket` with sound + bigGainTicker/bigLossTicker state
- Created `ParticleBurst.tsx` with animated green coin ($) and red flame (*) particles using framer-motion AnimatePresence
- Wired particle overlays into Robbinghood stock detail view tied to bigGainTicker/bigLossTicker selectors
- Added framer-motion opacity+scale entrance animation to EndingScreen

## Task Commits

Each task was committed atomically:

1. **Task 1: Sound engine and market bell hookup** - `2ab86ef` (feat)
2. **Task 2: Particle bursts and EndingScreen animation** - `e708baf` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `src/utils/soundEngine.ts` - Web Audio API chiptune engine with 5 exported functions
- `src/components/Feedback/ParticleBurst.tsx` - Animated pixel particle burst component (coin/flame)
- `src/store/types.ts` - Added bigGainTicker and bigLossTicker to GameState interface
- `src/store/useGameStore.ts` - Sound engine import, market bell calls, big move detection, playBorrow hookup, partialize exclusion
- `src/components/Feedback/EndingScreen.tsx` - motion.div entrance animation wrapper
- `src/components/Trade/Robbinghood.tsx` - ParticleBurst import, bigGainTicker/bigLossTicker selectors, overlay JSX

## Decisions Made
- AudioContext is created lazily on first `playTone` call so no autoplay policy violations occur before user interaction
- `bigGainTicker` and `bigLossTicker` are reset to null on every tick (even when market is closed), ensuring particles only fire for the one tick they're relevant
- Both fields excluded from zustand `partialize` to prevent stale particle state across sessions
- The 20% single-tick threshold is intentionally high — it almost never fires during normal trading but consistently fires when a market event price multiplier is applied, making events feel dramatic
- `ParticleBurst` placed inside a `position: relative` wrapper around the chart container in the stock detail view so particles burst from the center of that visual area

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## Next Phase Readiness
- All polish assets for Phase 15 wave 2 are complete
- Sound, particles, and EndingScreen animation are self-contained and ready
- UX-01 requirement satisfied

---
*Phase: 15-live-market-events-polish*
*Completed: 2026-03-14*
