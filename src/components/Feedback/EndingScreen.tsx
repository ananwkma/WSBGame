import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import type { EndingType } from '../../store/types';

interface EndingScreenProps {
  result: EndingType;
}

const ENDING_CONTENT = {
  MOON: {
    title: 'TO THE MOON',
    description: 'You did it. You are a financial genius. Your wife\'s boyfriend is finally proud of you. Enjoy the lambo.',
    color: '#00ff00', // Mapping to positive in the palette filter
  },
  LEGEND: {
    title: 'LEGENDARY STATUS',
    description: 'You lost it all, or gained enough karma to transcend humanity. You are a true degenerate. A legend.',
    color: '#ffffff', // Mapping to neutral
  },
  MENDYS: {
    title: 'WENDY\'S IS HIRING',
    description: 'The market was too much for you. Grab a spatula, those Dave\'s Doubles won\'t flip themselves.',
    color: '#ff0000', // Mapping to negative
  },
};

export const EndingScreen: React.FC<EndingScreenProps> = ({ result }) => {
  const resetGame = useGameStore((state) => state.resetGame);
  const content = ENDING_CONTENT[result];

  return (
    <div className="ending-screen-overlay">
      <div className="ending-card" style={{ border: `4px double ${content.color}` }}>
        <h1 className="ending-title" style={{ color: content.color }}>{content.title}</h1>
        <p className="ending-description">{content.description}</p>
        <div className="ending-stats">
            <StatRow label="FINAL CASH" value={`$${(useGameStore.getState().cash / 100).toLocaleString()}`} />
            <StatRow label="KARMA" value={useGameStore.getState().karma.toLocaleString()} />
        </div>
        <button className="pixel-button restart-button" onClick={resetGame}>
          RESTART GAME
        </button>
      </div>
    </div>
  );
};

const StatRow = ({ label, value }: { label: string, value: string }) => (
    <div className="stat-row">
        <span>{label}</span>
        <span>{value}</span>
    </div>
);
