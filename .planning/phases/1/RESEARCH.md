# Phase 1: Core Shell & Visual Filter - Research

**Researched:** 2026-03-03
**Domain:** SVG Filters, CSS Pixel Art Rendering, React Vite Setup
**Confidence:** HIGH

## Summary
The game's 4-color aesthetic can be achieved globally using a single SVG filter applied to the root container via CSS. The most precise method for palette enforcement without anti-aliasing is combining `feColorMatrix` (for grayscale conversion) with `feComponentTransfer` (using `type="discrete"` or `type="table"` for palette remapping). This ensures that every pixel on screen is mapped to exactly one of the four specified Game Boy Pocket colors.

**Primary recommendation:** Use a global SVG `<filter>` with `feComponentTransfer` applied to the `#root` or a main wrapper div using `filter: url(#game-palette)`.

## User Constraints
*   **VIS-01:** Entire game must render using 4-color "Game Boy Pocket" palette (#E0DBCB, #A89F94, #706B66, #2B2B26).
*   **VIS-03:** Pixel-perfect rendering using `image-rendering: pixelated`.
*   **TECH-01:** React + Vite setup.

## Standard Stack
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 18+ | UI Framework | Project requirement |
| Vite | Latest | Build Tool | Project requirement |
| SVG Filters | W3C | Color Mapping | Hardware accelerated, global application |

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   ├── VisualFilter/       # Global SVG Filter component
│   │   ├── PaletteFilter.tsx
│   │   └── PaletteFilter.css
├── styles/
│   └── pixel.css           # Global pixel-rendering rules
└── App.tsx                 # Root application wrapper
```

### Pattern 1: Discrete Palette Mapping
Use `feComponentTransfer` with `type="discrete"` to map the luminosity of the screen to the four specific hex codes.

**Normalized Palette Values (0-1 range):**
- Darkest (#2B2B26): R: 0.169, G: 0.169, B: 0.149
- Dark (#706B66): R: 0.439, G: 0.420, B: 0.400
- Light (#A89F94): R: 0.659, G: 0.624, B: 0.580
- Lightest (#E0DBCB): R: 0.878, G: 0.859, B: 0.796

## Common Pitfalls
*   **Anti-aliasing artifacts:** If the source assets are not pixel-aligned or if the browser applies smoothing, the filter might pick up "intermediate" colors.
    *   **Solution:** Use `image-rendering: pixelated` and `shape-rendering: crispEdges`.
*   **Performance:** Applying a complex SVG filter to the entire body can be heavy on mobile or low-end hardware.
    *   **Solution:** Ensure `color-interpolation-filters="sRGB"` is set to avoid linear RGB overhead.

## Code Examples

### Global Palette Filter (React)
```tsx
const GamePaletteFilter = () => (
  <svg style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }}>
    <filter id="gb-pocket" colorInterpolationFilters="sRGB">
      <feColorMatrix
        type="matrix"
        values="0.2126 0.7152 0.0722 0 0
                0.2126 0.7152 0.0722 0 0
                0.2126 0.7152 0.0722 0 0
                0      0      0      1 0"
      />
      <feComponentTransfer>
        <feFuncR type="discrete" tableValues="0.169 0.439 0.659 0.878" />
        <feFuncG type="discrete" tableValues="0.169 0.420 0.624 0.859" />
        <feFuncB type="discrete" tableValues="0.149 0.400 0.580 0.796" />
      </feComponentTransfer>
    </filter>
  </svg>
);
```

### CSS Scaling & Pixelation
```css
#root {
  filter: url(#gb-pocket);
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.game-viewport {
  aspect-ratio: 16 / 10;
  height: 90%;
  max-width: 100%;
}
```
