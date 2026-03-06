# Phase 1: Global Color Mapping & Pixel Art Scaling - Research

**Researched:** 2024-05-24
**Domain:** SVG Filters, CSS Pixel Art Rendering, React Integration
**Confidence:** HIGH

## Summary

This research focuses on achieving a global Game Boy Pocket-style 4-color aesthetic using SVG filters applied via CSS. The technique ensures that any content rendered within the root container (including sprites, text, and UI) is mapped to a specific 4-color palette without anti-aliasing artifacts.

**Primary recommendation:** Use an SVG `<filter>` with `feComponentTransfer` (discrete) to posterize the grayscale value, followed by `feColorMatrix` to map those levels to the Game Boy Pocket hex codes.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| SVG Filters | W3C | Color Mapping | High performance, hardware accelerated, works on DOM elements. |
| CSS3 | Latest | Pixel Rendering | `image-rendering` property is the standard for disabling interpolation. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|--------------|
| React | 18+ | UI Management | Standard for the project. |
| Vite | 5+ | Build Tool | Standard for the project. |

## Architecture Patterns

### SVG Palette Mapping Pattern
The filter works by taking the luminance of the input and mapping it to 4 discrete steps.

```xml
<svg style="display: none;">
  <filter id="gb-pocket-filter" color-interpolation-filters="sRGB">
    <!-- 1. Convert to grayscale -->
    <feColorMatrix type="matrix" values="0.33 0.33 0.33 0 0 0.33 0.33 0.33 0 0 0.33 0.33 0.33 0 0 0 0 0 1 0"/>
    
    <!-- 2. Map to 4 discrete levels -->
    <feComponentTransfer>
      <feFuncR type="discrete" tableValues="0.16 0.44 0.65 0.88" />
      <feFuncG type="discrete" tableValues="0.16 0.42 0.62 0.86" />
      <feFuncB type="discrete" tableValues="0.15 0.40 0.58 0.80" />
    </feComponentTransfer>
  </filter>
</svg>
```

### Root Application
Apply the filter to the top-level container in your React app.

```css
.game-root {
  filter: url(#gb-pocket-filter);
  image-rendering: pixelated; /* Chrome/Edge/Firefox */
  image-rendering: crisp-edges; /* Safari */
}
```

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Color Mapping | Manual Canvas Pixel Loop | SVG Filter | SVG filters are hardware accelerated and apply to all DOM elements, not just canvas. |
| Scaling | Window Resize Listeners | CSS `aspect-ratio` & `object-fit` | Modern CSS handles fixed aspect ratios more efficiently. |

## Common Pitfalls

### Pitfall 1: Blur from Anti-Aliasing
**What goes wrong:** Content looks "soft" even with pixel art.
**How to avoid:** Use `image-rendering: pixelated` on the root. Ensure the SVG filter uses `color-interpolation-filters="sRGB"` to avoid linear gamma shifts that create unintended mid-tones.

### Pitfall 2: Filter Performance
**What goes wrong:** High CPU usage on mobile.
**How to avoid:** Keep the filter chain short. `feComponentTransfer` is very efficient.

## Code Examples

### Fixed Aspect Ratio Viewport Scaling
```css
/* Container that keeps 160x144 (GB) aspect ratio */
.viewport-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
}

.game-screen {
  aspect-ratio: 160 / 144;
  width: 100%;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
```

## Sources

### Primary (HIGH confidence)
- MDN: `feComponentTransfer` - [Documentation](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feComponentTransfer)
- MDN: `image-rendering` - [Documentation](https://developer.mozilla.org/en-US/docs/Web/CSS/image-rendering)

## Metadata
**Confidence breakdown:**
- Standard stack: HIGH
- Architecture: HIGH
- Pitfalls: MEDIUM

**Research date:** 2024-05-24
**Valid until:** 2024-12-24
