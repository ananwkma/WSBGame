import React from 'react';

const PaletteFilter: React.FC = () => (
  <svg style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }}>
    <filter id="gb-pocket" colorInterpolationFilters="sRGB">
      {/* 
          1. Aggressive Saturation Matrix
          Boosts primaries (R, G, B) by exaggerating the difference between channels.
          This will make your Red (#ba8b8b) and Green (#94ba8b) "pop" significantly.
      */}
      <feColorMatrix
        type="matrix"
        values="2.2 -0.6 -0.6 0 0
                -0.6 2.2 -0.6 0 0
                -0.6 -0.6 2.2 0 0
                0    0    0   1 0"
      />
      
      {/* 
          2. Neutral Discrete Mapping
          By using identical tableValues for R, G, and B, we ensure that:
          - Grayscale/Beige inputs remain Neutral Gray (removing the yellow tint).
          - Saturated inputs (like the boosted Red/Green) pass through their respective hues.
      */}
      <feComponentTransfer>
        <feFuncR type="discrete" tableValues="0.05 0.35 0.65 0.95" />
        <feFuncG type="discrete" tableValues="0.05 0.35 0.65 0.95" />
        <feFuncB type="discrete" tableValues="0.05 0.35 0.65 0.95" />
      </feComponentTransfer>
    </filter>
  </svg>
);

export default PaletteFilter;
