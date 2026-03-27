# Phase 18: Clock Speed Control - Context

**Gathered:** 2026-03-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Replace the rough `+5m`/`+1h` DEV-mode debug buttons with a proper clock speed toggle available to all players. The feature controls how fast the market clock ticks — it does not skip to a specific time. Speed resets each day.

</domain>

<decisions>
## Implementation Decisions

### Speed levels
- Three levels cycling in order: 1x → 2x → 5x → back to 1x
- No 10x or slider — three discrete steps is enough

### Access
- Always visible and available to all players — not gated behind `?debug` or DEV mode
- Replaces the existing `+5m` / `+1h` DEV-only buttons (those are removed)

### Event & message behavior at speed
- Everything fires normally, just faster — market events, messages, sounds all trigger at the sped-up rate
- No suppression of effects at higher speeds

### UI placement & form
- Single button next to the market clock
- Button label shows current speed (e.g. `2x`)
- Clicking cycles to the next level

### Reset behavior
- Speed resets to 1x when NEXT DAY is pressed

### Claude's Discretion
- Exact tick interval math (how `useMarketClock` scales the interval)
- Button styling / pixel art treatment consistent with existing clock display
- Whether speed persists across page refreshes (likely no — start fresh each session)

</decisions>

<specifics>
## Specific Ideas

- "One button next to the clock that toggles to the next speed when you press it. 1x → 2x → 5x → 1x."

</specifics>

<deferred>
## Deferred Ideas

- None — discussion stayed within phase scope

</deferred>

---

*Phase: 18-clock-speed-control*
*Context gathered: 2026-03-18*
