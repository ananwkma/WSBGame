# Technology Stack

**Project:** WallStreetBets Trader Game
**Researched:** 2024-05-24

## Recommended Stack

### Core Framework
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| React + Vite | Latest | UI-driven Game | Fast refresh, component-based for the "multi-app" laptop feel. |
| CSS Modules | - | Pixel-perfect UI | Precise control over layout and "8x8 tile" alignment. |

### Visual Identity (4-color Grayscale)
| Technique | Purpose | Details |
|-----------|---------|---------|
| SVG Filter | 2-bit Palette | Use `feColorMatrix` to force all DOM elements into 4 shades. |
| Pixel Palettes | Colors | Pocket-style: `#E0DBCB`, `#A89F94`, `#706B66`, `#2B2B26`. |
| CSS Filter | Blur & Crisp | `image-rendering: pixelated;` for sharp edges. |

### State & Narrative
| Technology | Purpose | Implementation |
|------------|---------|----------------|
| React Context | Global Game State | Manage `$ Balance`, `Stock Prices`, and `Reputation`. |
| JSON | Content Storage | Store `GuruTube` scripts and `r/wsb` post data for narrative events. |

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Engine | React + Vite | GB Studio | While authentic, GB Studio is restrictive for "Internet simulation" UI (forms, text, scrolling). |
| Canvas vs DOM | DOM + CSS | HTML5 Canvas | DOM is easier for "Windowed" OS UIs (laptop/phone). |

## Installation & Setup

```bash
# Core
npm create vite@latest wsb-trader -- --template react
npm install framer-motion # For window animations

# Global 4-color SVG Filter (Put in index.html)
<svg style="display: none;">
  <filter id="pocket-palette">
    <feColorMatrix type="matrix" values="
       0.33 0.33 0.33 0 0
       0.33 0.33 0.33 0 0.2
       0.1  0.1  0.1  0 0
       0    0    0    1 0" />
  </filter>
</svg>

# Global CSS
body {
  filter: url(#pocket-palette);
  image-rendering: pixelated;
  background-color: #E0DBCB; /* Lightest shade */
}
```

## Sources

- [DMG/Pocket Palette Hex Codes](https://www.designpieces.com/palette/game-boy-colour-palette-hex-and-rgb-codes/)
- [SVG Color Matrix Tutorial](https://css-tricks.com/color-filters-can-stay-within-css-thanks-to-svg/)
- [React for Retro UI Patterns](https://github.com/react-retro/ui)
