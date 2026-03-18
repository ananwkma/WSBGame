import { useState } from 'react';
import PaletteFilter from './components/VisualFilter/PaletteFilter';
import { GameViewport } from './components/Shell/GameViewport';
import { DualViewShell } from './components/Shell/DualViewShell';
import type { FocusArea } from './components/Shell/DualViewShell';
import { LaptopBrowser } from './components/Laptop/LaptopBrowser';
import { PhoneApp } from './components/Apps/Phone/PhoneApp';
import ScreenFlash from './components/Feedback/ScreenFlash';
import PopupText from './components/Feedback/PopupText';
import { DayCounter } from './components/Feedback/DayCounter';
import { EndingScreen } from './components/Feedback/EndingScreen';
import { useGameStore } from './store/useGameStore';
import { useMarketClock } from './hooks/useMarketClock';
import './styles/pixel.css';

function formatMarketTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

const SPEEDS = [1, 2, 5] as const;
type ClockSpeed = typeof SPEEDS[number]; // 1 | 2 | 5

function App() {
  const [focus, setFocus] = useState<FocusArea>('laptop');
  const [clockSpeed, setClockSpeed] = useState<ClockSpeed>(1);
  const gameStatus = useGameStore((state) => state.gameStatus);
  const endingType = useGameStore((state) => state.endingType);
  const advanceDay = useGameStore((state) => state.advanceDay);
  const marketTime = useGameStore((state) => state.marketTime);
  const marketIsOpen = useGameStore((state) => state.marketIsOpen);

  const cycleSpeed = () => {
    setClockSpeed(prev => SPEEDS[(SPEEDS.indexOf(prev) + 1) % SPEEDS.length]);
  };

  useMarketClock(clockSpeed);

  return (
    <>
      <PaletteFilter />
      <GameViewport>
        <DayCounter />
        <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '14px', zIndex: 500 }}>
          <button
            className="next-turn-btn"
            style={{ position: 'static', opacity: marketTime < 960 ? 0.4 : 1, cursor: marketTime < 960 ? 'not-allowed' : 'pointer' }}
            disabled={marketTime < 960}
            onClick={() => { advanceDay(); setClockSpeed(1); }}
          >
            NEXT DAY
          </button>
          <div style={{
            background: '#1a1a16',
            border: '2px solid #706b66',
            padding: '4px 10px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px',
            boxShadow: 'inset 0 0 6px #000',
          }}>
            <div style={{
              fontSize: '26px',
              fontFamily: '"Courier New", Courier, monospace',
              fontWeight: 'bold',
              letterSpacing: '3px',
              color: marketIsOpen ? '#94ba8b' : '#706b66',
              textShadow: marketIsOpen ? '0 0 8px #94ba8b88' : 'none',
              lineHeight: 1,
            }}>
              {formatMarketTime(marketTime)}
            </div>
            <div style={{
              fontSize: '9px',
              letterSpacing: '2px',
              color: marketIsOpen ? '#94ba8b' : '#555',
              fontFamily: '"Courier New", Courier, monospace',
              textTransform: 'uppercase',
            }}>
              {marketIsOpen ? '● MARKET OPEN' : '○ MARKET CLOSED'}
            </div>
            <button
              className="next-turn-btn"
              style={{ position: 'static', fontSize: '10px', padding: '3px 8px', marginTop: '2px' }}
              onClick={cycleSpeed}
            >
              {clockSpeed}x
            </button>
          </div>
        </div>
        <ScreenFlash />
        <PopupText />
        {gameStatus === 'ended' && endingType && (
          <EndingScreen result={endingType} />
        )}
        <DualViewShell
          focus={focus}
          setFocus={setFocus}
          laptopContent={<LaptopBrowser />}
          phoneContent={<PhoneApp focus={focus} setFocus={setFocus} />}
        />
      </GameViewport>
    </>
  );
}

export default App;
