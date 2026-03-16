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
  chartHeight?: number;               // override chart height in px
}

type Timeframe = '1M' | '10M' | '30M' | '1D';

const DEFAULT_CHART_HEIGHT = 160;
const PAD_LEFT = 52;
const PAD_RIGHT = 8;
const PAD_TOP = 10;
const PAD_BOTTOM = 30;

const LINE_TIMEFRAMES: Timeframe[] = ['1M', '30M', '1D'];
const CANDLE_TIMEFRAMES: Timeframe[] = ['10M', '30M', '1D'];

const INTERVAL_MAP: Record<Timeframe, number> = { '1M': 1, '10M': 10, '30M': 30, '1D': 390 };

function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

function sanitizeTimeframe(tf: string | null, candle: boolean): Timeframe {
  const valid = candle ? CANDLE_TIMEFRAMES : LINE_TIMEFRAMES;
  return (valid as string[]).includes(tf ?? '') ? (tf as Timeframe) : valid[0];
}

export const IntraChart: React.FC<IntraChartProps> = ({
  intradayBars,
  dailyHistory,
  netWorthBars,
  marketTime,
  marketIsOpen,
  showCandleToggle = true,
  ticker,
  chartHeight: chartHeightProp,
}) => {
  const CHART_HEIGHT = chartHeightProp ?? DEFAULT_CHART_HEIGHT;
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

  const [showCandles, setShowCandles] = useState(false);
  const [timeframe, setTimeframe] = useState<Timeframe>(() =>
    sanitizeTimeframe(localStorage.getItem('chartTimeframe'), false)
  );
  const [sessionOnly, setSessionOnly] = useState(true);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const handleTimeframeChange = (tf: Timeframe) => {
    setTimeframe(tf);
    localStorage.setItem('chartTimeframe', tf);
  };

  const handleToggleCandles = () => {
    const next = !showCandles;
    setShowCandles(next);
    if (next && timeframe === '1M') {
      // 1M is not available in candle mode — bump to 10M
      setTimeframe('10M');
      localStorage.setItem('chartTimeframe', '10M');
    }
  };

  // Derive source bars
  let sourceBars: CandleBar[];
  if (timeframe === '1D' || !sessionOnly) {
    sourceBars = dailyHistory.map((pt) => ({
      openTime: pt.turn * 960,
      open: pt.price,
      high: pt.price,
      low: pt.price,
      close: pt.price,
    }));
    // Append today's partial bar — use netWorthBars for portfolio chart, intradayBars for stocks
    const todaySource = (netWorthBars && netWorthBars.length > 0) ? netWorthBars : intradayBars;
    if (todaySource.length > 0) {
      const todayBar: CandleBar = {
        openTime: 570,
        open: todaySource[0].open,
        high: Math.max(...todaySource.map(b => b.high)),
        low: Math.min(...todaySource.map(b => b.low)),
        close: todaySource[todaySource.length - 1].close,
      };
      sourceBars = [...sourceBars, todayBar];
    }
  } else {
    const barsToUse = (netWorthBars && netWorthBars.length > 0) ? netWorthBars : intradayBars;
    sourceBars = groupBars(barsToUse, INTERVAL_MAP[timeframe]);
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

  const lineGen = line<CandleBar>()
    .x((_, i) => xAt(i, sourceBars.length))
    .y((b) => yAt(b.close))
    .curve(curveLinear);

  const linePath = sourceBars.length >= 2 ? (lineGen(sourceBars) || '') : '';

  const yTicks = Array.from({ length: 4 }, (_, i) => {
    const val = yMin + (yRange * (i + 0.5)) / 4;
    return { y: yAt(val), label: formatCurrency(Math.round(val)) };
  });

  // X-axis labels
  const xAxisLabels: { x: number; label: string }[] = [];
  const xLabelY = PAD_TOP + chartH + 16;
  if (isIntraday) {
    // Fixed time marks: 9:30, 11:00, 12:30, 2:00, 3:30, 4:00
    [570, 660, 750, 840, 930, 960].forEach(t => {
      const h = Math.floor(t / 60);
      const m = t % 60;
      const ampm = h >= 12 ? 'p' : 'a';
      const h12 = h % 12 === 0 ? 12 : h % 12;
      const label = m === 0 ? `${h12}${ampm}` : `${h12}:${String(m).padStart(2, '0')}`;
      xAxisLabels.push({ x: xAtTime(t), label });
    });
  } else if (sourceBars.length > 0) {
    // Day labels: D1, D2, … — thin out if many bars
    const step = Math.max(1, Math.ceil(sourceBars.length / 8));
    sourceBars.forEach((_, i) => {
      if (i % step === 0 || i === sourceBars.length - 1) {
        xAxisLabels.push({ x: xAt(i, sourceBars.length), label: `D${i + 1}` });
      }
    });
  }

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (sourceBars.length === 0) return;
    const svgEl = e.currentTarget;
    const rect = svgEl.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
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

  const chartColor = sourceBars.length < 2
    ? '#e0dbcb'
    : sourceBars[sourceBars.length - 1].close >= sourceBars[0].open
      ? '#94ba8b'
      : '#ba8b8b';

  const activeTabs = showCandleMode ? CANDLE_TIMEFRAMES : LINE_TIMEFRAMES;

  // Tooltip layout
  const TOOLTIP_W = showCandleMode ? 112 : 112;
  const TOOLTIP_H = showCandleMode ? 68 : 16;
  const TOOLTIP_LINE_H = 12;

  return (
    <div style={{ width: '100%', fontFamily: 'monospace' }}>
      {/* Timeframe tabs + toggles row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '2px' }}>
          {activeTabs.map(tf => {
            if (!sessionOnly && tf !== '1D') return null;
            return (
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
            );
          })}
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
            onClick={handleToggleCandles}
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

          {/* X-axis labels */}
          {xAxisLabels.map(({ x, label }, i) => (
            <text
              key={`x-${i}`}
              x={x}
              y={xLabelY}
              fontSize="9"
              fill="#706b66"
              fontFamily="monospace"
              textAnchor="middle"
            >
              {label}
            </text>
          ))}

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
                    <line
                      x1={cx} y1={yAt(bar.high)}
                      x2={cx} y2={yAt(bar.low)}
                      stroke={barColor} strokeWidth="1"
                    />
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

          {/* Crosshair + tooltip */}
          {hoveredIndex !== null && sourceBars[hoveredIndex] && (() => {
            const bar = sourceBars[hoveredIndex];
            const cx = xAt(hoveredIndex, sourceBars.length);
            const tooltipX = cx + 6 > renderWidth - TOOLTIP_W - 8 ? cx - 6 - TOOLTIP_W : cx + 6;
            const tooltipY = PAD_TOP + 2;
            return (
              <g>
                <line
                  x1={cx} y1={PAD_TOP}
                  x2={cx} y2={PAD_TOP + chartH}
                  stroke="#e0dbcb" strokeWidth="1" strokeDasharray="3,2" opacity="0.6"
                />
                <rect
                  x={tooltipX} y={tooltipY}
                  width={TOOLTIP_W} height={TOOLTIP_H}
                  fill="#2b2b26" stroke="#706b66" strokeWidth="1"
                />
                {showCandleMode ? (
                  <>
                    <text x={tooltipX + 4} y={tooltipY + TOOLTIP_LINE_H} fontSize="10" fill="#a89f8c" fontFamily="monospace">
                      {formatTime(bar.openTime)}
                    </text>
                    <text x={tooltipX + 4} y={tooltipY + TOOLTIP_LINE_H * 2 + 2} fontSize="10" fill="#e0dbcb" fontFamily="monospace">
                      O {formatCurrency(bar.open)}
                    </text>
                    <text x={tooltipX + 4} y={tooltipY + TOOLTIP_LINE_H * 3 + 4} fontSize="10" fill="#94ba8b" fontFamily="monospace">
                      H {formatCurrency(bar.high)}
                    </text>
                    <text x={tooltipX + 4} y={tooltipY + TOOLTIP_LINE_H * 4 + 6} fontSize="10" fill="#ba8b8b" fontFamily="monospace">
                      L {formatCurrency(bar.low)}
                    </text>
                    <text x={tooltipX + 4} y={tooltipY + TOOLTIP_LINE_H * 5 + 8} fontSize="10" fill="#e0dbcb" fontFamily="monospace">
                      C {formatCurrency(bar.close)}
                    </text>
                  </>
                ) : (
                  <text x={tooltipX + 4} y={tooltipY + 13} fontSize="10" fill="#e0dbcb" fontFamily="monospace">
                    {formatCurrency(bar.close)} @ {formatTime(bar.openTime)}
                  </text>
                )}
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
