import React from 'react';

interface MiniChartProps {
  data: number[];
  width?: number;
  height?: number;
}

export const MiniChart: React.FC<MiniChartProps> = ({ 
  data, 
  width = 60, 
  height = 20 
}) => {
  if (!data || data.length < 2) return <div style={{ width, height }} />;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  
  const points = data.map((price, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((price - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  const isUp = data[data.length - 1] >= data[0];
  const color = isUp ? '#00ff00' : '#ff0000';

  return (
    <svg 
      width={width} 
      height={height} 
      viewBox={`0 0 ${width} ${height}`}
      style={{ 
        imageRendering: 'pixelated',
        display: 'inline-block',
        verticalAlign: 'middle',
        marginLeft: '4px'
      }}
    >
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        points={points}
      />
    </svg>
  );
};
