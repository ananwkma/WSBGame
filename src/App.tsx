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

const DEBUG = import.meta.env.DEV;

function skipTime(minutes: number) {
  const tickMarket = useGameStore.getState().tickMarket;
  for (let i = 0; i < minutes; i++) {
    tickMarket();
  }
}

function App() {
  const [focus, setFocus] = useState<FocusArea>('laptop');
  const gameStatus = useGameStore((state) => state.gameStatus);
  const endingType = useGameStore((state) => state.endingType);
  const advanceDay = useGameStore((state) => state.advanceDay);
  const marketTime = useGameStore((state) => state.marketTime);
  const marketIsOpen = useGameStore((state) => state.marketIsOpen);

  useMarketClock();

  return (
    <>
      <PaletteFilter />
      <GameViewport>
        <DayCounter />
        <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '14px', zIndex: 500 }}>
          <button className="next-turn-btn" style={{ position: 'static' }} onClick={advanceDay}>
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
          </div>
          {DEBUG && (
            <div style={{ display: 'flex', gap: '4px' }}>
              <button className="next-turn-btn" style={{ position: 'static', fontSize: '10px', padding: '3px 7px' }} onClick={() => skipTime(5)}>
                +5m
              </button>
              <button className="next-turn-btn" style={{ position: 'static', fontSize: '10px', padding: '3px 7px' }} onClick={() => skipTime(60)}>
                +1h
              </button>
            </div>
          )}
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
          phoneContent={<PhoneApp />}
        />
      </GameViewport>
    </>
  );
}

export default App;
