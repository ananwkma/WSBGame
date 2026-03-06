# Domain Pitfalls: WallStreetBets Trader Game

**Domain:** Narrative Trading Simulation
**Researched:** 2024-05-24

## Critical Pitfalls

### Pitfall 1: Over-Simulation
**What goes wrong:** Implementing a real "order book" or realistic market algorithms.
**Why it happens:** Wanting the "trading" part to be deep and realistic.
**Consequences:** Players get lost in the numbers and the narrative (the "story") gets buried. The game feels like a spreadsheet rather than a "WallStreetBets" experience.
**Prevention:** Keep the "Market Engine" purely narrative-driven. Stocks only move when "events" (Posts, Videos, Texts) happen. Use 1-3 volatile stocks rather than a full market.

### Pitfall 2: Aesthetic Performance
**What goes wrong:** Global SVG filters (especially `feColorMatrix`) can be CPU intensive on older browsers or high-resolution screens.
**Why it happens:** Applying a filter to the entire `<body>` with complex DOM elements.
**Consequences:** Laggy UI, "Guh" moments feeling un-impactful due to low FPS.
**Prevention:** Test performance early. If lag occurs, apply the filter only to the "Laptop/Phone" containers and leave the background clear. Use `will-change: transform` on moving elements.

### Pitfall 3: Tone & Toxicity
**What goes wrong:** Directly copying WSB's more toxic or offensive slang.
**Why it happens:** Aiming for "authenticity" without a filter.
**Consequences:** The game becomes unmarketable or offensive, alienating the audience.
**Prevention:** Use a "Parody" approach. Focus on the absurd (Apes, Rockets, Tendies, the Wife's Boyfriend) and avoid the controversial political or slurring slang found in the raw community.

## Moderate Pitfalls

### Pitfall 1: Pixel Blur
**What goes wrong:** Text becoming unreadable when scaled.
**Prevention:** Use specialized **Pixel Fonts** (e.g., "Silver", "Press Start 2P") and ensure they are rendered at integer sizes (e.g., 8px, 16px, 24px).

### Pitfall 2: Choice Paralysis
**What goes wrong:** Giving the player too many choices (Buy? Sell? Call? Put? Which stock?).
**Prevention:** Use the "Phone" to nudge the player. A text from a friend ("Bro, YOLO everything on $GME right now!") should narrow the player's focus.

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| UI Shell | Scaling blur. | Use `image-rendering: pixelated` and absolute unit positioning. |
| Trading Engine | Math errors. | Use integers (cents) for all balance calculations. |
| Narrative Feed | Boring content. | Use the WSB glossary to spice up the forum posts (Diamond hands, rockets, etc.). |

## Sources

- [Post-mortem of "Papers, Please"](https://www.gamedeveloper.com/design/post-mortem-lucas-pope-s-i-papers-please-i-) (Focus on narrative vs. task)
- [WSB Toxicity Reports](https://www.nytimes.com/2021/01/29/technology/wallstreetbets-reddit-gamestop.html)
- [Pixel UI Best Practices](https://medium.com/@beast_and_bird/pixel-perfect-scaling-in-the-browser-2d2c770c1e84)
