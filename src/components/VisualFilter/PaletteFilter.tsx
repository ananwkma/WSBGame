import React from 'react';

const PaletteFilter: React.FC = () => (
  <svg style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }}>
    <filter id="gb-pocket" colorInterpolationFilters="sRGB">
      {/* 1. Convert to Grayscale based on Luminance */}
      <feColorMatrix
        type="matrix"
        values="0.2126 0.7152 0.0722 0 0
                0.2126 0.7152 0.0722 0 0
                0.2126 0.7152 0.0722 0 0
                0      0      0      1 0"
      />
      {/* 2. Map Grayscale to Discrete Palette */}
      <feComponentTransfer>
        <feFuncR type="discrete" tableValues="0.106 0.439 0.659 0.878" />
        <feFuncG type="discrete" tableValues="0.106 0.420 0.624 0.859" />
        <feFuncB type="discrete" tableValues="0.094 0.400 0.580 0.796" />
      </feComponentTransfer>
    </filter>
  </svg>
);

export default PaletteFilter;
