# Phase 2: Trading Engine & UI - Research (Enhanced)

**Researched:** 2026-03-03
**Domain:** Desk View Layout, React Transitions, Pixel Art Styling
**Confidence:** HIGH

## Summary

This research focuses on transitioning the "Dual View" shell into a more immersive "Desk View" where the player interacts with physical objects (Laptop, Phone) on a pixel-art desk. The core recommendation is to use **Framer Motion** for shared element transitions (zoom/swap) and **Absolute Positioned Hotspots** for the interaction layer.

**Primary recommendation:** Use Framer Motion `layout` and `AnimatePresence` to handle the zoom transition between "Desk View" (wide) and "Device Focus" (zoomed).

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **Structure:** Tabbed Navigation (Portfolio, Trade, History).
- **Execution:** Interactive Swipe/Hold confirm mechanic.
- **Feedback:** Screen Flashes (Green/Red) and Visual Text Popups ("TO THE MOON!", "GUH").
- **Volatility:** Asset prices swing between 10% and 50% per turn.
- **Guru Advice:** Inverse Indicator (70% wrong, 30% right).
- **Turn Loop:** "Next Day" button triggers market update and price history logging.
- **Assets:** Stocks Only ($GAME, $POPC, $APE).
- **Starting State:** $100,000 in cash, zero holdings.
- **Precision:** Store all currency/prices in cents (integers).
- **Metrics:** Track Total Net Worth (Cash + Market Value).
- **History:** Maintain price history array for Stair-Step Charts.

### Claude's Discretion
- State management library choice (Zustand vs Context).
- Chart implementation details (D3 vs hand-rolled).
- Specific volatility algorithm implementation.

### Deferred Ideas (OUT OF SCOPE)
- Options (Calls/Puts) - Deferred to Phase 3.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| VIS-02 | Switching focus between Laptop and Phone views | Transition logic and mapping clicks to focus states. |
| TRADE-01 | Robbinghood App Interface | Integration of the app UI into the zoomed phone view. |
| TECH-02 | Global State Management | Zustand for managing focus and game state. |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Framer Motion | 11.0+ | Layout Transitions | Handles "Magic Motion" zoom/swap with simple props. |
| Zustand | 4.5+ | Focus State | Synchronizes focus across disparate UI components. |

## Architecture Patterns

### Desk View Layout (8x8 Grid)
The desk is represented as a background container with absolute hotspots.
```typescript
// Pattern: Hotspot Mapping
const DeskHotspots = () => {
  const setFocus = useGameStore(s => s.setFocus);
  return (
    <div className="desk-container">
      <div className="laptop-hotspot" onClick={() => setFocus('laptop')} />
      <div className="phone-hotspot" onClick={() => setFocus('phone')} />
    </div>
  );
};
```

### Transition Pattern: Zoom & Swap
Using Framer Motion's `layoutId` to animate the device from its position on the desk to full-screen.
```typescript
// Pattern: Shared Element Transition
<motion.div 
  layoutId="phone-device"
  className={focus === 'phone' ? 'fullscreen' : 'on-desk'}
>
  <PhoneContent />
</motion.div>
```

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Zoom Interpolation | Manual CSS Keyframes | Framer Motion `layout` | Handles mid-animation interruptions and complex easing perfectly. |
| Pixel Collisions | Physics Engine | Grid-based absolute positioning | 8x8 grid is deterministic and easier to style in CSS. |

## Common Pitfalls

### Pitfall 1: Sub-pixel Blurring during Zoom
**What goes wrong:** Browser interpolates positions during transition, causing the pixel art to blur.
**How to avoid:** Use `image-rendering: pixelated` and ensure the scale animation uses discrete steps or very fast durations. Framer Motion's `layout` can sometimes cause blurring if `transform: scale` is used; prefer animating `width/height` if performance allows, or accept brief blurring for "juice".

### Pitfall 2: Click Hijacking
**What goes wrong:** Elements inside the laptop/phone (buttons) are hard to click when the device is "small" on the desk.
**How to avoid:** Disable pointer-events on internal content when not focused, or use the entire device as a single button when in 'desk' mode.

## Code Examples

### 4-Color Grayscale Desk Styling (CSS)
```css
/* Using the global SVG filter from Phase 1 */
.desk-surface {
  background: #666; /* Maps to mid-gray in GBP palette */
  border-top: 8px solid #999; /* Highlights */
  height: 64px; /* 8 tiles */
  width: 100%;
}

.hotspot {
  cursor: pointer;
  transition: filter 0.1s steps(2);
}

.hotspot:hover {
  filter: brightness(1.2);
}
```

## Sources

### Primary (HIGH confidence)
- Framer Motion Docs: [Layout Animations](https://www.framer.com/motion/layout-animations/)
- Phase 1 Research: SVG Palette Mapping.

## Metadata
**Confidence breakdown:**
- Standard stack: HIGH
- Architecture: HIGH
- Pitfalls: MEDIUM

**Research date:** 2026-03-03
**Valid until:** 2026-09-03
