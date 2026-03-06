import { useState } from 'react';
import PaletteFilter from './components/VisualFilter/PaletteFilter';
import { GameViewport } from './components/Shell/GameViewport';
import { DualViewShell } from './components/Shell/DualViewShell';
import type { FocusArea } from './components/Shell/DualViewShell';
import { Robbinghood } from './components/Trade/Robbinghood';
import { GuruTube } from './components/Apps/Laptop/GuruTube';
import { PhoneApp } from './components/Apps/Phone/PhoneApp';
import ScreenFlash from './components/Feedback/ScreenFlash';
import PopupText from './components/Feedback/PopupText';
import { EndingScreen } from './components/Feedback/EndingScreen';
import { useGameStore } from './store/useGameStore';
import './styles/pixel.css';

function App() {
  const [focus, setFocus] = useState<FocusArea>('laptop');
  const gameStatus = useGameStore((state) => state.gameStatus);
  const endingType = useGameStore((state) => state.endingType);

  return (
    <>
      <PaletteFilter />
      <GameViewport>
        <ScreenFlash />
        <PopupText />
        {gameStatus === 'ended' && endingType && (
          <EndingScreen result={endingType} />
        )}
        <DualViewShell 
          focus={focus} 
          setFocus={setFocus}
          laptopContent={
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <GuruTube />
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <Robbinghood />
              </div>
            </div>
          }
          phoneContent={<PhoneApp />}
        />
      </GameViewport>
    </>
  );
}

export default App;
