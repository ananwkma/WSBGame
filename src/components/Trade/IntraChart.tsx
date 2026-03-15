import React, { useRef, useState, useEffect } from 'react';
import { line, curveLinear } from 'd3-shape';
import type { CandleBar, HistoryPoint } from '../../store/types';
import { groupBars, formatCurrency } from '../../utils/marketUtils';

interface IntraChartProps {
  intradayBars: CandleBar[];          // 1-min bars for current day (from store.intradayBars[ticker])
  dailyHistory: HistoryPoint[];       // existing daily HistoryPoint[] from stock.history
  netWorthBars?: CandleBar[];         // only provided for portfolio net worth chart
  marketTime: number;
  marketIsOpen: boolean;
  showCandleToggle?: boolean;         // default true; set false for net worth chart
  ticker: string;                     // used for display only
}

type Timeframe = '1M' | '30M' | '1H' | '1D';

const CHART_HEIGHT = 160;
const PAD_LEFT = 52;
const PAD_RIGHT = 8;
const PAD_TOP = 10;
const PAD_BOTTOM = 22;

function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

export const IntraChart: React.FC<IntraChartProps> = ({
  intradayBars,
  dailyHistory,
  netWorthBars,
  marketTime,
  marketIsOpen,
  showCandleToggle = true,
  ticker,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [renderWidth, setRenderWidth] = useState(300);

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

  const [timeframe, setTimeframe] = useState<Timeframe>(() => {
    return (localStorage.getItem('chartTimeframe') as Timeframe) || '1M';
  });
  const [showCandles, setShowCandles] = useState(false);
  const [sessionOnly, setSessionOnly] = useState(true);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const handleTimeframeChange = (tf: Timeframe) => {
    setTimeframe(tf);
    localStorage.setItem('chartTimeframe', tf);
  };

  // Derive source bars
  let sourceBars: CandleBar[];
  if (timeframe === '1D' || !sessionOnly) {
    // Build daily bars from dailyHistory (one candle per historical day)
    sourceBars = dailyHistory.map((pt) => ({
      openTime: pt.turn * 960,  // approximate openTime from turn number
      open: pt.price,
      high: pt.price,
      low: pt.price,
      close: pt.price,
    }));
    // For 1D + today: also append a summary bar from intradayBars if market is open today
    if (intradayBars.length > 0) {
      const todayBar: CandleBar = {
        openTime: 570,
        open: intradayBars[0].open,
        high: Math.max(...intradayBars.map(b => b.high)),
        low: Math.min(...intradayBars.map(b => b.low)),
        close: intradayBars[intradayBars.length - 1].close,
      };
      sourceBars = [...sourceBars, todayBar];
    }
  } else {
    // Intraday: aggregate from 1-min bars
    const intervalMap: Record<Timeframe, number> = { '1M': 1, '30M': 30, '1H': 60, '1D': 390 };
    // For net worth chart use netWorthBars if provided
    const barsToUse = (netWorthBars && netWorthBars.length > 0) ? netWorthBars : intradayBars;
    sourceBars = groupBars(barsToUse, intervalMap[timeframe]);
  }

  // Y scale bounds
  const chartW = renderWidth - PAD_LEFT - PAD_RIGHT;
  const chartH = CHART_HEIGHT - PAD_TOP - PAD_BOTTOM;

  const allValues = sourceBars.length > 0
    ? sourceBars.flatMap(b => [b.high, b.low])
    : [0, 1];
  const rawMin = Math.min(...allValues);
  const rawMax = Math.max(...allValues);
  const range = rawMax - rawMin || 1;
  const yMin = rawMin - range * 0.05;
  const yMax = rawMax + range * 0.05;
  const yRange = yMax - yMin;

  // For intraday timeframes in TODAY mode, pin x to clock time so candles
  // fill the full 9:30am–4:00pm window rather than only the bars seen so far.
  const MARKET_OPEN = 570;
  const MARKET_CLOSE = 960;
  const isIntraday = timeframe !== '1D' && sessionOnly;

  const xAtTime = (openTime: number): number => {
    const t = Math.max(MARKET_OPEN, Math.min(MARKET_CLOSE, openTime));
    return PAD_LEFT + ((t - MARKET_OPEN) / (MARKET_CLOSE - MARKET_OPEN)) * chartW;
  };

  const xAt = (i: number, total: number): number => {
    if (isIntraday && sourceBars[i]) return xAtTime(sourceBars[i].openTime);
    if (total <= 1) return PAD_LEFT + chartW / 2;
    return PAD_LEFT + (i / (total - 1)) * chartW;
  };

  const yAt = (val: number): number => {
    const normalized = (val - yMin) / yRange;
    return PAD_TOP + (1 - normalized) * chartH;
  };

  // Build line path through close prices
  const lineGen = line<CandleBar>()
    .x((_, i) => xAt(i, sourceBars.length))
    .y((b) => yAt(b.close))
    .curve(curveLinear);

  const linePath = sourceBars.length >= 2 ? (lineGen(sourceBars) || '') : '';

  // Y-axis ticks (4 ticks)
  const yTicks = Array.from({ length: 4 }, (_, i) => {
    const val = yMin + (yRange * (i + 0.5)) / 4;
    return { y: yAt(val), label: formatCurrency(Math.round(val)) };
  });

  // Crosshair handlers
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (sourceBars.length === 0) return;
    const svgEl = e.currentTarget;
    const rect = svgEl.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    // Find nearest bar
    let bestIdx = 0;
    let bestDist = Infinity;
    sourceBars.forEach((_, i) => {
      const bx = xAt(i, sourceBars.length);
      const dist = Math.abs(bx - mouseX);
      if (dist < bestDist) { bestDist = dist; bestIdx = i; }
    });
    setHoveredIndex(bestIdx);
  };

  const handleMouseLeave = () => setHoveredIndex(null);

  const showCandleMode = showCandleToggle !== false && showCandles;
  const marketClosed = !marketIsOpen && intradayBars.length === 0;

  // Determine chart color (green if up, red if down)
  const chartColor = sourceBars.length < 2
    ? '#e0dbcb'
    : sourceBars[sourceBars.length - 1].close >= sourceBars[0].open
      ? '#94ba8b'
      : '#ba8b8b';

  return (
    <div style={{ width: '100%', fontFamily: 'monospace' }}>
      {/* Timeframe tabs + toggles row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '2px' }}>
          {(['1M', '30M', '1H', '1D'] as Timeframe[]).map(tf => (
            <button
              key={tf}
              onClick={() => handleTimeframeChange(tf)}
              style={{
                fontSize: '10px',
                padding: '2px 6px',
                cursor: 'pointer',
                fontFamily: 'monospace',
                border: '1px solid #706b66',
                background: timeframe === tf ? '#e0dbcb' : 'none',
                color: timeframe === tf ? '#2b2b26' : '#706b66',
                fontWeight: timeframe === tf ? 'bold' : 'normal',
              }}
            >
              {tf}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '2px', marginLeft: '4px' }}>
          {(['TODAY', 'ALL'] as const).map(mode => {
            const active = mode === 'TODAY' ? sessionOnly : !sessionOnly;
            return (
              <button
                key={mode}
                onClick={() => setSessionOnly(mode === 'TODAY')}
                style={{
                  fontSize: '10px',
                  padding: '2px 6px',
                  cursor: 'pointer',
                  fontFamily: 'monospace',
                  border: '1px solid #706b66',
                  background: active ? '#706b66' : 'none',
                  color: active ? '#e0dbcb' : '#706b66',
                }}
              >
                {mode}
              </button>
            );
          })}
        </div>

        {showCandleToggle !== false && (
          <button
            onClick={() => setShowCandles(v => !v)}
            style={{
              fontSize: '10px',
              padding: '2px 6px',
              cursor: 'pointer',
              fontFamily: 'monospace',
              border: '1px solid #706b66',
              marginLeft: 'auto',
              background: showCandles ? '#706b66' : 'none',
              color: showCandles ? '#e0dbcb' : '#706b66',
            }}
          >
            {showCandles ? 'CANDLE' : 'LINE'}
          </button>
        )}
      </div>

      {/* Chart SVG */}
      <div
        ref={containerRef}
        style={{ position: 'relative', width: '100%', height: `${CHART_HEIGHT}px` }}
      >
        <svg
          width={renderWidth}
          height={CHART_HEIGHT}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ display: 'block', cursor: 'crosshair' }}
        >
          {/* Y-axis grid lines + labels */}
          {yTicks.map((t, i) => (
            <React.Fragment key={`y-${i}`}>
              <line
                x1={PAD_LEFT} y1={t.y}
                x2={renderWidth - PAD_RIGHT} y2={t.y}
                stroke="#706b66" strokeWidth="1" strokeDasharray="2,2" opacity="0.3"
              />
              <text
                x={PAD_LEFT - 4} y={t.y + 4}
                fontSize="10" fill="#a89f8c" fontFamily="monospace"
                textAnchor="end"
              >
                {t.label}
              </text>
            </React.Fragment>
          ))}

          {/* Chart border lines */}
          <line x1={PAD_LEFT} y1={PAD_TOP} x2={PAD_LEFT} y2={PAD_TOP + chartH} stroke="#706b66" strokeWidth="1" />
          <line x1={PAD_LEFT} y1={PAD_TOP + chartH} x2={renderWidth - PAD_RIGHT} y2={PAD_TOP + chartH} stroke="#706b66" strokeWidth="1" />

          {/* Candle or line rendering */}
          {showCandleMode ? (
            <>
              {sourceBars.map((bar, i) => {
                const cx = xAt(i, sourceBars.length);
                const barColor = bar.close >= bar.open ? '#94ba8b' : '#ba8b8b';
                const yOpen = yAt(bar.open);
                const yClose = yAt(bar.close);
                const bodyTop = Math.min(yOpen, yClose);
                const bodyHeight = Math.max(1, Math.abs(yClose - yOpen));
                const barWidth = Math.max(2, Math.min(8, chartW / Math.max(sourceBars.length, 1) - 1));
                return (
                  <g key={i}>
                    {/* Wick */}
                    <line
                      x1={cx} y1={yAt(bar.high)}
                      x2={cx} y2={yAt(bar.low)}
                      stroke={barColor} strokeWidth="1"
                    />
                    {/* Body */}
                    <rect
                      x={cx - barWidth / 2}
                      y={bodyTop}
                      width={barWidth}
                      height={bodyHeight}
                      fill={barColor}
                    />
                  </g>
                );
              })}
            </>
          ) : (
            <path
              d={linePath}
              fill="none"
              stroke={chartColor}
              strokeWidth="2"
            />
          )}

          {/* Crosshair */}
          {hoveredIndex !== null && sourceBars[hoveredIndex] && (() => {
            const bar = sourceBars[hoveredIndex];
            const cx = xAt(hoveredIndex, sourceBars.length);
            const price = bar.close;
            const timeLabel = formatTime(bar.openTime);
            const tooltipText = `${formatCurrency(price)} @ ${timeLabel}`;
            const tooltipX = cx + 6 > renderWidth - 120 ? cx - 6 - 110 : cx + 6;
            return (
              <g>
                <line
                  x1={cx} y1={PAD_TOP}
                  x2={cx} y2={PAD_TOP + chartH}
                  stroke="#e0dbcb" strokeWidth="1" strokeDasharray="3,2" opacity="0.6"
                />
                <rect
                  x={tooltipX} y={PAD_TOP + 2}
                  width={110} height={16}
                  fill="#2b2b26" stroke="#706b66" strokeWidth="1"
                />
                <text
                  x={tooltipX + 4} y={PAD_TOP + 13}
                  fontSize="10" fill="#e0dbcb" fontFamily="monospace"
                >
                  {tooltipText}
                </text>
              </g>
            );
          })()}

          {/* MARKET CLOSED overlay */}
          {marketClosed && (
            <g>
              <rect
                x={PAD_LEFT} y={PAD_TOP}
                width={chartW} height={chartH}
                fill="#2b2b26" opacity="0.7"
              />
              <text
                x={PAD_LEFT + chartW / 2}
                y={PAD_TOP + chartH / 2}
                fontSize="12" fill="#706b66" fontFamily="monospace"
                textAnchor="middle" dominantBaseline="middle"
                letterSpacing="2"
              >
                MARKET CLOSED
              </text>
            </g>
          )}
        </svg>
      </div>
    </div>
  );
};
