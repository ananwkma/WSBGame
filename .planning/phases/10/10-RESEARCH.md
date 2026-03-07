# Phase 10: Social Expansion & GuruTube Overhaul - Research

**Researched:** 2026-03-06
**Domain:** UI Overhaul & Narrative Systems
**Confidence:** HIGH

## Summary

This phase focuses on deepening the social atmosphere of the game through a significant overhaul of the **GuruTube** component and a massive expansion of the **Narrative** content. 

GuruTube will transition from a static parody to a dynamic information hub, featuring live-updating stock tickers and performance-reactive gurus. The narrative layer will move away from fixed scripts toward a template-driven system that allows for much higher message volume and variety, making the "Ape" community feel alive and unpredictable.

**Primary recommendation:** Use CSS-driven animations for high-frequency UI elements (marquees) and a dedicated data-layer for message templates to separate narrative logic from the game store.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Framer Motion | ^10.x | UI Transitions | Smooth app opening/closing and chart animations. |
| CSS Keyframes | N/A | Marquee Loops | Highly performant for continuous horizontal scrolling. |
| SVG Primitives | N/A | Mini-Charts | Lightweight rendering that respects `image-rendering: pixelated`. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|--------------|
| Lucide React | ^0.x | Icons | Simple vector icons for UI enhancements if needed. |

## Architecture Patterns

### Recommended Project Structure
```
src/
├── data/
│   └── messageTemplates.ts  # Central repository for narrative content
├── components/
│   ├── Laptop/
│   │   ├── GuruTube.tsx      # Main overhauled component
│   │   ├── MiniChart.tsx     # New: Simplified performance graph
│   │   └── StockMarquee.tsx  # New: Scrolling ticker component
└── store/
    └── useGameStore.ts      # Logic for generating daily volume
```

### Pattern 1: Template-Driven Narrative
Instead of hardcoding strings in `nextTurn`, use a helper function that selects from a categorized library based on game state (Net Worth, Stock Performance).

**Example:**
```typescript
// src/data/messageTemplates.ts
export const WIFE_TEMPLATES = {
  POSITIVE: [
    "Honey, I'm looking at houses in the Hamptons. {amount} profit??",
    "I told my mom you're a genius! Dinner on you tonight! 🥂"
  ],
  NEGATIVE: [
    "I saw the bank statement. Please tell me it's a mistake.",
    "The mortgage check bounced. What is going on??"
  ]
};
```

### Pattern 2: Reactive Guru Sentiment
The `GuruTube` component should derive its visual state (Emoji, Chart Color) from the most recent Guru advice message in the store.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Marquee Logic | JS-based `setInterval` | CSS `translateX` animation | CSS is hardware-accelerated and won't jitter under load. |
| Complex Charts | Full D3 implementation | Simple SVG `<polyline>` | GuruTube charts are decorative; D3 overhead isn't needed here. |
| Date Formatting | Custom regex | `Intl.NumberFormat` | Standardized and handles currency/percentages correctly. |

## Common Pitfalls

### Pitfall 1: Marquee Jitter
**What goes wrong:** Marquees look "stuttery" or jump when the text content updates.
**How to avoid:** Use a fixed width for the marquee container and Ensure the animation duration is based on content length or fixed for consistency.
**Warning signs:** Visible "teleporting" of text when a new day starts.

### Pitfall 2: Filter Lag
**What goes wrong:** Adding 5-10 animated elements inside the `gb-pocket` filter might cause frame drops on low-end devices.
**How to avoid:** Keep SVG complexity low. Avoid `feGaussianBlur` or complex filters inside the components themselves. The global filter is already heavy enough.

## Code Examples

### Optimized CSS Marquee
```css
.marquee-container {
  overflow: hidden;
  white-space: nowrap;
}
.marquee-content {
  display: inline-block;
  animation: scroll-left 15s linear infinite;
}
@keyframes scroll-left {
  0% { transform: translateX(100%); }
  100% { transform: translateX(-100%); }
}
```

### Mapping Guru Emotion
```typescript
const getGuruEmoji = (performance: number) => {
  if (performance > 0.1) return '🤑';
  if (performance > 0) return '😎';
  if (performance < -0.1) return '😱';
  if (performance < 0) return '📉';
  return '😐';
};
```

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|---------|
| Fixed Array Messages | Template Library | Scalability & Variety |
| 1 Message/Day | Dynamic Volume | Higher Engagement |
| Static Icon Guru | State-Reactive Guru | World Immersion |

## Open Questions

1. **Random Contact Persistence:** Should random contacts create new permanent threads, or should they be "temporary" and disappear?
   - *Recommendation:* Add them to the `threads` object so the player can see them later, but perhaps tag them as "Random" to distinguish from main characters.
2. **Performance with 4+ Marquees:** Will multiple marquees at once (Ticker 1, Ticker 2, Breaking News) feel too "noisy"?
   - *Recommendation:* Use different speeds and slightly different background colors to separate them visually.

## Sources

### Primary (HIGH confidence)
- [MDN CSS Animations](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Animations) - Verified marquee techniques.
- [React SVG Documentation](https://reactjs.org/docs/dom-elements.html#all-supported-html-attributes) - Verified SVG attribute handling for pixel art.

### Secondary (MEDIUM confidence)
- [Framer Motion Examples](https://www.framer.com/motion/) - For chart path animations.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Core CSS/SVG is very stable.
- Architecture: HIGH - Template patterns are industry standard for RPG/Narrative games.
- Pitfalls: MEDIUM - Performance needs to be monitored on actual devices.

**Research date:** 2026-03-06
**Valid until:** 2026-04-06
