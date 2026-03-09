import React, { useMemo, useRef, useState, useEffect } from 'react';
import { line, curveLinear } from 'd3-shape';

interface PriceChartProps {
  history: any[]; // Can be HistoryPoint[] or NetWorthHistory point
  width: number;  // Initial/fallback width
  height: number;
  color?: string;
}

const formatCurrency = (cents: number) => {
  return `$${(cents / 100).toFixed(0)}`;
};

export const PriceChart: React.FC<PriceChartProps> = ({ history, width, height, color }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [renderWidth, setRenderWidth] = useState(width);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      const w = entries[0]?.contentRect.width;
      if (w > 0) setRenderWidth(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const chartColor = useMemo(() => {
    if (color) return color;
    if (history.length < 2) return '#e0dbcb';

    const getValue = (p: any) => p.price !== undefined ? p.price : p.value;
    const initial = getValue(history[0]);
    const current = getValue(history[history.length - 1]);

    return current >= initial ? '#94ba8b' : '#ba8b8b';
  }, [history, color]);

  const pathData = useMemo(() => {
    if (history.length < 2) return '';

    const getValue = (p: any) => p.price !== undefined ? p.price : p.value;

    const rawMin = Math.min(...history.map(getValue));
    const rawMax = Math.max(...history.map(getValue));

    const minVal = Math.floor(rawMin / 1000) * 1000;
    const maxVal = Math.ceil(rawMax / 1000) * 1000;
    const valRange = maxVal - minVal || 1000;

    const labelWidth = 68;
    const labelHeight = 24;
    const chartWidth = renderWidth - labelWidth - 10;
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
  }, [history, renderWidth, height]);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '100%' }}>
      <svg width={renderWidth} height={height}>
        {typeof pathData === 'object' && pathData.yGrid.map((g, i) => (
          <React.Fragment key={`y-${i}`}>
            <line x1="68" y1={g.y} x2={renderWidth} y2={g.y} stroke="#706b66" strokeWidth="1" strokeDasharray="2,2" opacity="0.3" />
            <text x="1" y={g.y + 4} fontSize="14px" fill="#a89f8c" fontFamily="monospace">{g.label}</text>
          </React.Fragment>
        ))}
        {typeof pathData === 'object' && pathData.xGrid.map((g, i) => (
          <React.Fragment key={`x-${i}`}>
            <line x1={g.x} y1="0" x2={g.x} y2={pathData.chartHeight + 5} stroke="#706b66" strokeWidth="1" strokeDasharray="2,2" opacity="0.3" />
            <text x={g.x - 9} y={height - 4} fontSize="14px" fill="#a89f8c" fontFamily="monospace">T{g.label}</text>
          </React.Fragment>
        ))}

        <line x1="68" y1={typeof pathData === 'object' ? pathData.chartHeight + 5 : height} x2={renderWidth} y2={typeof pathData === 'object' ? pathData.chartHeight + 5 : height} stroke="#706b66" strokeWidth="2" />
        <line x1="68" y1="0" x2="68" y2={typeof pathData === 'object' ? pathData.chartHeight + 5 : height} stroke="#706b66" strokeWidth="2" />

        <path
          d={typeof pathData === 'object' ? pathData.path : ''}
          fill="none"
          stroke={chartColor}
          strokeWidth="2"
        />
      </svg>
    </div>
  );
};
