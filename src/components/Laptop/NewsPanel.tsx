import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import type { MarketEvent } from '../../store/types';

function eventHeadline(evt: MarketEvent): string {
  switch (evt.type) {
    case 'EARNINGS':
      return evt.priceMultiplier >= 1
        ? `${evt.ticker} EARNINGS BEAT — stock surging`
        : `${evt.ticker} EARNINGS MISS — stock dumping`;
    case 'FED_ANNOUNCEMENT':
      return evt.priceMultiplier >= 1
        ? 'FED SIGNALS RATE CUT — broad market rally'
        : 'FED HIKES RATES — broad market selloff';
    case 'MEME_FRENZY':
      return `${evt.ticker} GOING VIRAL — WSB piling in`;
    case 'INSIDER_LEAK':
      return `${evt.ticker} unusual activity — unconfirmed report`;
    default:
      return 'MARKET EVENT';
  }
}

function isMacro(evt: MarketEvent): boolean {
  return evt.type === 'FED_ANNOUNCEMENT';
}

export const NewsPanel: React.FC = () => {
  const activeEvents = useGameStore((s) => s.activeEvents);
  const dismissEvent = useGameStore((s) => s.dismissEvent);

  const visible = activeEvents.filter((e) => e.type !== 'INSIDER_LEAK');

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 50, pointerEvents: 'none' }}>
      <AnimatePresence>
        {visible.map((evt) => (
          <motion.div
            key={evt.id}
            initial={{ y: -48, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -48, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{
              pointerEvents: 'auto',
              background: isMacro(evt) ? '#1a1a16' : '#2b2b26',
              borderBottom: `2px solid ${isMacro(evt) ? '#a89f8c' : evt.priceMultiplier >= 1 ? '#94ba8b' : '#ba8b8b'}`,
              padding: '6px 10px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                fontSize: '9px',
                letterSpacing: '1px',
                color: isMacro(evt) ? '#a89f8c' : '#706b66',
                fontFamily: 'monospace',
              }}>
                {isMacro(evt) ? 'MACRO' : evt.type === 'MEME_FRENZY' ? 'MEME' : 'BREAKING'}
              </span>
              <span style={{ fontSize: '11px', fontWeight: 'bold', letterSpacing: '0.5px' }}>
                {eventHeadline(evt)}
              </span>
            </div>
            <button
              onClick={() => dismissEvent(evt.id)}
              style={{
                background: 'none',
                border: '1px solid #706b66',
                color: '#706b66',
                fontSize: '10px',
                padding: '1px 6px',
                cursor: 'pointer',
                fontFamily: 'inherit',
                flexShrink: 0,
              }}
            >
              ✕
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
