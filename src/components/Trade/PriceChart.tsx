import React, { useMemo } from 'react';
import { line, curveLinear } from 'd3-shape';
import type { HistoryPoint } from '../../store/types';

interface PriceChartProps {
  history: any[]; // Can be HistoryPoint[] or NetWorthPoint[]
  width: number;
  height: number;
  color?: string;
}

export const PriceChart: React.FC<PriceChartProps> = ({ history, width, height, color = '#e0dbcb' }) => {
  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(0)}`;
  };

  const pathData = useMemo(() => {
    if (history.length < 2) return '';

    const getValue = (p: any) => p.price !== undefined ? p.price : p.value;

    const rawMin = Math.min(...history.map(getValue));
    const rawMax = Math.max(...history.map(getValue));
    
    // Round to nice multiples of 10
    const minVal = Math.floor(rawMin / 1000) * 1000;
    const maxVal = Math.ceil(rawMax / 1000) * 1000;
    const valRange = maxVal - minVal || 1000;

    const labelWidth = 30;
    const labelHeight = 15;
    const chartWidth = width - labelWidth - 10;
    const chartHeight = height - labelHeight - 10;

    const xScale = (index: number) => labelWidth + (index / (history.length - 1)) * chartWidth;
    const yScale = (val: number) => {
      const normalized = (val - minVal) / valRange;
      return (1 - normalized) * chartHeight + 5;
    };

    const lineGenerator = line<any>()
      .x((_, i) => xScale(i))
      .y((p) => yScale(getValue(p)))
      .curve(curveLinear);

    // Calculate grid lines
    const yDivisions = 4;
    const yGrid = Array.from({ length: yDivisions + 1 }, (_, i) => {
      const val = minVal + (valRange * i) / yDivisions;
      return { y: yScale(val), label: formatCurrency(val) };
    });

    const xDivisions = 5;
    const xGrid = Array.from({ length: xDivisions + 1 }, (_, i) => {
      const index = Math.floor((history.length - 1) * i / xDivisions);
      return { x: xScale(index), label: history[index].turn };
    });

    return { path: lineGenerator(history) || '', yGrid, xGrid, labelHeight, chartHeight };
  }, [history, width, height]);

  return (
    <div style={{ position: 'relative', width, height }}>
      <svg width={width} height={height}>
        {/* Grid lines & Labels */}
        {typeof pathData === 'object' && pathData.yGrid.map((g, i) => (
          <React.Fragment key={`y-${i}`}>
            <line x1="30" y1={g.y} x2={width} y2={g.y} stroke="#706b66" strokeWidth="1" strokeDasharray="2,2" opacity="0.3" />
            <text x="0" y={g.y + 3} fontSize="6px" fill="#706b66" fontFamily="monospace">{g.label}</text>
          </React.Fragment>
        ))}
        {typeof pathData === 'object' && pathData.xGrid.map((g, i) => (
          <React.Fragment key={`x-${i}`}>
            <line x1={g.x} y1="0" x2={g.x} y2={pathData.chartHeight + 5} stroke="#706b66" strokeWidth="1" strokeDasharray="2,2" opacity="0.3" />
            <text x={g.x - 5} y={height - 2} fontSize="6px" fill="#706b66" fontFamily="monospace">T{g.label}</text>
          </React.Fragment>
        ))}

        <line x1="30" y1={typeof pathData === 'object' ? pathData.chartHeight + 5 : height} x2={width} y2={typeof pathData === 'object' ? pathData.chartHeight + 5 : height} stroke="#706b66" strokeWidth="2" />
        <line x1="30" y1="0" x2="30" y2={typeof pathData === 'object' ? pathData.chartHeight + 5 : height} stroke="#706b66" strokeWidth="2" />
        
        {/* The Price Line */}
        <path
          d={typeof pathData === 'object' ? pathData.path : ''}
          fill="none"
          stroke={color}
          strokeWidth="2"
        />
      </svg>
    </div>
  );
};
