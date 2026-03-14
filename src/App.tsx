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

function App() {
  const [focus, setFocus] = useState<FocusArea>('laptop');
  const gameStatus = useGameStore((state) => state.gameStatus);
  const endingType = useGameStore((state) => state.endingType);
  const advanceDay = useGameStore((state) => state.advanceDay);

  useMarketClock();

  return (
    <>
      <PaletteFilter />
      <GameViewport>
        <DayCounter />
        <button className="next-turn-btn" onClick={advanceDay}>
          NEXT DAY
        </button>
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
