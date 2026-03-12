import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import type { EndingType } from '../../store/types';

interface EndingScreenProps {
  result: EndingType;
}

interface EndingContent {
  title: string;
  description: string;
  color: string;
  pixelArt: string[];
}

// Color map for pixel art: . = transparent
const PA_COLORS: Record<string, string> = {
  K: '#1c1c17', // near-black
  W: '#e0dbcb', // cream/off-white
  R: '#cc3333', // red
  G: '#5faa4f', // green
  Y: '#ddbb33', // yellow/gold
  O: '#cc7733', // orange/brown
  B: '#5577cc', // blue
  P: '#cc33cc', // magenta/purple
  C: '#33aacc', // cyan/water
  S: '#888877', // grey/metal
  T: '#a07830', // brown/tan/earth
};

const PIXEL_SIZE = 7;

const PixelArt: React.FC<{ grid: string[] }> = ({ grid }) => {
  const rows = grid.length;
  const cols = grid[0]?.length || 0;
  return (
    <svg
      width={cols * PIXEL_SIZE}
      height={rows * PIXEL_SIZE}
      style={{ imageRendering: 'pixelated', display: 'block', margin: '16px auto' }}
    >
      {grid.map((row, y) =>
        row.split('').map((char, x) => {
          if (char === '.') return null;
          const fill = PA_COLORS[char];
          if (!fill) return null;
          return (
            <rect
              key={`${x}-${y}`}
              x={x * PIXEL_SIZE}
              y={y * PIXEL_SIZE}
              width={PIXEL_SIZE}
              height={PIXEL_SIZE}
              fill={fill}
            />
          );
        })
      )}
    </svg>
  );
};

const ENDING_CONTENT: Record<EndingType, EndingContent> = {
  MENDYS: {
    title: "WENDY'S IS HIRING",
    description: "The market has spoken. You have been found financially unworthy. The good news: Dave's Double combo is still $8.99 and your new coworkers won't ask about your portfolio.",
    color: '#ff0000',
    pixelArt: [
      '................',
      '....RRRRRRRR....',
      '...RRRRRRRRRR...',
      '...RR......RR...',
      '...RRRRRRRRRR...',
      '...RRRRRRRRRR...',
      '.......SS.......',
      '.......SS.......',
      '.......SS.......',
      '......SSSS......',
      '.....SSSSSS.....',
      '.....SSSSSS.....',
    ],
  },

  BREAK_EVEN: {
    title: 'BREAK EVEN BABY',
    description: "After 10 days of pure psychological warfare, you ended up roughly where you started. A savings account would have done this. With less crying.",
    color: '#888888',
    pixelArt: [
      '................',
      '..KKKKKKKKKKKK..',
      '..K..........K..',
      '..K.WWWWWWWWWK..',
      '..K..........K..',
      '..K..........K..',
      '..KKKKKKKKKKKK..',
      '................',
      '....KKKKKKKK....',
      '................',
      '....KKKKKKKK....',
      '................',
    ],
  },

  SMALL_WINS: {
    title: 'SMALL WINS',
    description: "You made some money. Not 'quit your job' money. Not 'tell people at parties' money. But money. Your therapist calls this 'healthy boundaries with risk.' You call it disappointing.",
    color: '#44aa44',
    pixelArt: [
      '................',
      '...........GG...',
      '...........GG...',
      '.......GG..GG...',
      '.......GG..GG...',
      '...GG..GG..GG...',
      '...GG..GG..GG...',
      '.GG.GG.GG..GG...',
      '.GG.GG.GG..GG...',
      '.GG.GG.GG..GG...',
      '.KKKKKKKKKKKK...',
      '................',
    ],
  },

  TENDIES: {
    title: 'TENDIES',
    description: "You made real money. The kind that makes the apes on the forum seethe. Your wife's boyfriend asked if he could borrow some. You said no. Today was a good day.",
    color: '#ffaa00',
    pixelArt: [
      '......OOOOOO....',
      '.....OOOOOOOO...',
      '.....OOOOOOOO...',
      '.....OOOOO.OOO..',
      '.....OO...OOOO..',
      '......OOOOOO....',
      '.......OOOO.....',
      '.......OOOO.....',
      '.......TTTT.....',
      '........TT......',
      '........TT......',
      '........TT......',
    ],
  },

  TO_THE_MOON: {
    title: 'TO THE MOON',
    description: "Seven figures. You did it. You are a financial genius, a market wizard, a god among degenerates. Your wife is calling you. It's from a different area code. You don't care.",
    color: '#00ff00',
    pixelArt: [
      '.......WW.......',
      '......WWWW......',
      '......BWWB......',
      '......BWWB......',
      '......WWWW......',
      '.....WWWWWW.....',
      '....WWWWWWWW....',
      '..WW.WWWWWW.WW..',
      '..WW..WWWW..WW..',
      '..WW..YYYY..WW..',
      '....OYYYYYYO....',
      '....OOOOOOOO....',
    ],
  },

  HEDGE_FUND_DARLING: {
    title: 'HEDGE FUND DARLING',
    description: "Eight figures. Wall Street wants to hire you. CNBC wants to interview you. You want to post loss porn 'for old times sake.' Some things money can't fix.",
    color: '#0088ff',
    pixelArt: [
      '.....BBB........',
      '.....BWB........',
      '.....BWB........',
      '.....BWB........',
      '.BBBBBWBBBB.....',
      '.BWBBBBBBWB.....',
      '.BWBBBBBBWB.....',
      '.BWBBBBBBWB.....',
      '.BWBBBBBBWB.....',
      'BBBBBBBBBBBBBBB.',
      '................',
      '................',
    ],
  },

  WOLF_OF_WALL_STREET: {
    title: 'WOLF OF WALL STREET',
    description: "Nine figures. You are a menace. The SEC has a file on you. Your broker sends you a holiday card. You own three Roombas you've never seen. Life is noise.",
    color: '#ff00ff',
    pixelArt: [
      '..SS.......SS...',
      '.SSSK.....KSSS..',
      '.SSSSSSSSSSSSK..',
      '.SSSWWKKKWWSSK..',
      '.SSSSSSSSSSSSK..',
      '.SSSSKKKKKSSSSK.',
      '.SSSSWWWWWSSSK..',
      '.SSKKKKKKKKKSS..',
      '..KSSSSSSSSK....',
      '...KKKKKKKK.....',
      '................',
      '................',
    ],
  },

  PRIVATE_ISLAND: {
    title: 'PRIVATE ISLAND',
    description: "You bought a private island. Your wife's boyfriend lives there too. You don't care. You have a second island. You are beyond human concerns now. The forum calls you a legend. You haven't logged on in three years.",
    color: '#ffffff',
    pixelArt: [
      '....GGG.GGG.....',
      '...GGGGGGGGG....',
      '..GGGG.T.GGGG...',
      '..GGGGG.GGGG....',
      '....GGG.GGG.....',
      '.....TT.........',
      '.....TT.........',
      '.....TT.........',
      '....TTTTTT......',
      '...TTTTTTTTTT...',
      '..TTTTTTTTTTTT..',
      '.CCCCCCCCCCCCCCC',
    ],
  },

  DEBT_SPIRAL: {
    title: 'DEBT SPIRAL',
    description: "The sharks came calling. Turns out borrowing money to buy options on meme stocks has some downside. Who knew. The loan is now larger than everything you own. Mathematically, you have negative money.",
    color: '#ff4400',
    pixelArt: [
      '................',
      '....RRRRRRRR....',
      '...RR......RR...',
      '...R..RRRR..R...',
      '...R..R..R..R...',
      '...R...RRR..R...',
      '...R.......R....',
      '...RR......RR...',
      '....RRRRRRRR....',
      '..O...O...O.....',
      '...O...O..O.....',
      '....O...O.......',
    ],
  },

  EXPIRED_WORTHLESS: {
    title: 'EXPIRED WORTHLESS',
    description: "You bought options. You watched them decay. You forgot to sell. Day 11 arrived and took everything. The contracts expired worthless. So did your financial ambitions. The market doesn't care that you were 'holding for the squeeze.'",
    color: '#cc7733',
    pixelArt: [
      '................',
      '....SSSSSSSS....',
      '...SS......SS...',
      '...S.RRRRRR.S...',
      '...S.R....R.S...',
      '...S.RRRRRR.S...',
      '...S........S...',
      '...SS......SS...',
      '....SSSSSSSS....',
      '.......SS.......',
      '......SSSS......',
      '.....SSSSSS.....',
    ],
  },

  PAPER_HANDS: {
    title: 'PAPER HANDS',
    description: "You sold. You actually sold. That position you dumped for a 3% gain? It would have been worth over a million dollars today. The apes know. The forum will never forget. You will wake up at 3am about this for years.",
    color: '#ffff00',
    pixelArt: [
      '....YYYYYY......',
      '....YK..KY......',
      '....YYYYYY......',
      '...WWWWWWWW.....',
      '..WWWWWWWWWW....',
      '..WW.WW.WW.WW...',
      '..W..WW..W..W...',
      '..W..WW..W..W...',
      '..W..WW..W..W...',
      '..WWWWWWWWWWW...',
      '................',
      '................',
    ],
  },
};

export const EndingScreen: React.FC<EndingScreenProps> = ({ result }) => {
  const resetGame = useGameStore((state) => state.resetGame);
  const finalNetWorth = useGameStore((state) => state.finalNetWorth) ?? 0;
  const karma = useGameStore((state) => state.karma);
  const sharkDebt = useGameStore((state) => state.sharkDebt);
  const content = ENDING_CONTENT[result];

  return (
    <div className="ending-screen-overlay">
      <div className="ending-card" style={{ border: `4px double ${content.color}` }}>
        <h1 className="ending-title" style={{ color: content.color }}>{content.title}</h1>
        <p className="ending-description">{content.description}</p>
        <PixelArt grid={content.pixelArt} />
        <div className="ending-stats">
          <StatRow label="FINAL NET WORTH" value={`$${(finalNetWorth / 100).toLocaleString()}`} />
          <StatRow label="KARMA" value={karma.toLocaleString()} />
          {sharkDebt > 0 && (
            <div className="stat-row">
              <span className="stat-label pixel-bold">SHARK DEBT</span>
              <span className="stat-value" style={{ color: '#ba8b8b' }}>-${((sharkDebt ?? 0) / 100).toLocaleString()}</span>
            </div>
          )}
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
