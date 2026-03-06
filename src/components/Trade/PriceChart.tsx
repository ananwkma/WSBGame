import React, { useMemo } from 'react';
import { line, curveLinear } from 'd3-shape';
import type { HistoryPoint } from '../../store/types';

interface PriceChartProps {
  history: HistoryPoint[];
  width: number;
  height: number;
}

export const PriceChart: React.FC<PriceChartProps> = ({ history, width, height }) => {
  const pathData = useMemo(() => {
    if (history.length < 2) return '';

    const minPrice = Math.min(...history.map((p) => p.price));
    const maxPrice = Math.max(...history.map((p) => p.price));
    const priceRange = maxPrice - minPrice || 100; // avoid divide by zero

    const padding = 10;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const xScale = (index: number) => padding + (index / (history.length - 1)) * chartWidth;
    const yScale = (price: number) => {
      const normalized = (price - minPrice) / priceRange;
      return padding + (1 - normalized) * chartHeight;
    };

    const lineGenerator = line<HistoryPoint>()
      .x((_, i) => xScale(i))
      .y((p) => yScale(p.price))
      .curve(curveLinear);

    return lineGenerator(history) || '';
  }, [history, width, height]);

  return (
    <svg width={width} height={height}>
      {/* Grid lines (optional, but good for pixel feel) */}
      <line x1="0" y1={height - 1} x2={width} y2={height - 1} stroke="#706b66" strokeWidth="2" />
      <line x1="1" y1="0" x2="1" y2={height} stroke="#706b66" strokeWidth="2" />
      
      {/* The Price Line */}
      <path
        d={pathData}
        fill="none"
        stroke="#e0dbcb" // palette: lightest
        strokeWidth="2"
      />
    </svg>
  );
};
