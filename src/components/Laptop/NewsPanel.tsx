import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import type { MarketEvent } from '../../store/types';

function eventHeadline(evt: MarketEvent): string {
  switch (evt.type) {
    case 'EARNINGS':
      return evt.priceMultiplier >= 1
        ? `EARNINGS BEAT ★ ${evt.ticker} surging after blowout quarter ★ stock up sharply`
        : `EARNINGS MISS ★ ${evt.ticker} diving after weak results ★ guidance slashed`;
    case 'FED_ANNOUNCEMENT':
      return evt.priceMultiplier >= 1
        ? 'FED SIGNALS RATE CUT ★ Powell: "we are data dependent" ★ broad market rally underway'
        : 'FED HIKES RATES ★ Powell: "inflation remains elevated" ★ broad market selloff';
    case 'MEME_FRENZY':
      return `WSB GOING WILD ★ ${evt.ticker} trending #1 on readit ★ volume 10x normal ★ degens piling in`;
    case 'INSIDER_LEAK':
      return `UNCONFIRMED: unusual ${evt.ticker} activity spotted ★ source anonymous ★ trade at own risk`;
    default:
      return 'MARKET EVENT DETECTED ★ check your positions';
  }
}

function labelFor(evt: MarketEvent): string {
  if (evt.type === 'FED_ANNOUNCEMENT') return 'MACRO';
  if (evt.type === 'MEME_FRENZY') return 'MEME';
  return 'BREAKING';
}

function accentColor(evt: MarketEvent): string {
  if (evt.type === 'FED_ANNOUNCEMENT') return '#a89f8c';
  return evt.priceMultiplier >= 1 ? '#94ba8b' : '#ba8b8b';
}

export const NewsPanel: React.FC = () => {
  const activeEvents = useGameStore((s) => s.activeEvents);
  const dismissEvent = useGameStore((s) => s.dismissEvent);

  const visible = activeEvents.filter((e) => e.type !== 'INSIDER_LEAK');

  if (visible.length > 0) {
    console.log('[NewsPanel] rendering events:', visible.map(e => ({ type: e.type, ticker: e.ticker, headline: eventHeadline(e) })));
  }

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 50, pointerEvents: 'none' }}>
      <AnimatePresence>
        {visible.map((evt) => {
          const color = accentColor(evt);
          const label = labelFor(evt);
          const text = `${eventHeadline(evt)}   ★   ${eventHeadline(evt)}`;
          return (
            <motion.div
              key={evt.id}
              initial={{ y: -32, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -32, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                pointerEvents: 'auto',
                background: '#1a1a16',
                borderBottom: `2px solid ${color}`,
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                overflow: 'hidden',
              }}
            >
              {/* Label badge */}
              <div style={{
                flexShrink: 0,
                padding: '0 8px',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                background: color,
                color: '#1a1a16',
                fontSize: '9px',
                fontWeight: 'bold',
                letterSpacing: '1px',
                fontFamily: 'monospace',
              }}>
                {label}
              </div>

              {/* Scrolling text */}
              <div style={{ flex: 1, overflow: 'hidden', height: '100%', display: 'flex', alignItems: 'center' }}>
                <div style={{
                  paddingLeft: '100%',
                  animation: 'scroll-left 16s linear infinite',
                  whiteSpace: 'nowrap',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  color,
                  fontFamily: 'monospace',
                  letterSpacing: '0.5px',
                }}>
                  {text}
                </div>
              </div>

              {/* Dismiss */}
              <button
                onClick={() => dismissEvent(evt.id)}
                style={{
                  flexShrink: 0,
                  background: 'none',
                  border: 'none',
                  borderLeft: `1px solid ${color}`,
                  color,
                  fontSize: '12px',
                  padding: '0 8px',
                  height: '100%',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                ✕
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
