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
  ascii: string;
}

const ENDING_CONTENT: Record<EndingType, EndingContent> = {
  MENDYS: {
    title: "WENDY'S IS HIRING",
    description: "The market has spoken. You have been found financially unworthy. The good news: Dave's Double combo is still $8.99 and your new coworkers won't ask about your portfolio.",
    color: '#ff0000',
    ascii: `
   ___________
  |           |
  |  WENDY'S  |
  |___________|
  |  SPATULA  |
  |   RANK:   |
  |  ACHIEVED |
  |___________|
       |
   ____|____
  |  APRON  |
  |_________|`,
  },

  BREAK_EVEN: {
    title: 'BREAK EVEN BABY',
    description: "After 10 days of pure psychological warfare, you ended up roughly where you started. A savings account would have done this. With less crying.",
    color: '#888888',
    ascii: `
  ___     ___
 /   \\   /   \\
| +$$ | | -$$ |
 \\___/   \\___/
    |       |
    +---+---+
        |
     = $0 PL
    (you tried)`,
  },

  SMALL_WINS: {
    title: 'SMALL WINS',
    description: "You made some money. Not 'quit your job' money. Not 'tell people at parties' money. But money. Your therapist calls this 'healthy boundaries with risk.' You call it disappointing.",
    color: '#44aa44',
    ascii: `
      $$$
     $$$$$
    $$$$$$$
   ----+----
   GAINS: Y
   YACHT: N
   DIGNITY: N
   ----------
   net: fine`,
  },

  TENDIES: {
    title: 'TENDIES',
    description: "You made real money. The kind that makes the apes on the forum seethe. Your wife's boyfriend asked if he could borrow some. You said no. Today was a good day.",
    color: '#ffaa00',
    ascii: `
  [T][E][N][D]
  [I][E][S][!]
 /============\\
|   TENDIES   |
|   GAINED    |
 \\============/
    |   ||   |
    | GAINZ! |
    |________|`,
  },

  TO_THE_MOON: {
    title: 'TO THE MOON',
    description: "Seven figures. You did it. You are a financial genius, a market wizard, a god among degenerates. Your wife is calling you. It's from a different area code. You don't care.",
    color: '#00ff00',
    ascii: `
        *  .  *
      .   ___  .
     *   /   \\   *
        | 1M+ |
         \\___/
           |
       ====|====
       ROCKET GO
       BRRRRRRR
       =========`,
  },

  HEDGE_FUND_DARLING: {
    title: 'HEDGE FUND DARLING',
    description: "Eight figures. Wall Street wants to hire you. CNBC wants to interview you. You want to post loss porn 'for old times sake.' Some things money can't fix.",
    color: '#0088ff',
    ascii: `
   ___________
  | PORTFOLIO |
  |  MANAGER  |
  |___________|
  | AUM: 10M+ |
  | FEES: 2/20|
  | ALPHA: yes|
  |___________|
  [shitposting]`,
  },

  WOLF_OF_WALL_STREET: {
    title: 'WOLF OF WALL STREET',
    description: "Nine figures. You are a menace. The SEC has a file on you. Your broker sends you a holiday card. You own three Roombas you've never seen. Life is noise.",
    color: '#ff00ff',
    ascii: `
   /\\  WOLF  /\\
  /  \\  OF  /  \\
 / $$ \\ WS / $$ \\
/______\\ /______\\
|  SEC  | GAINS |
| WATCH | 100M+ |
|_______X_______|
 \\ YOLO / PRINT/
  \\____/ \\____/`,
  },

  PRIVATE_ISLAND: {
    title: 'PRIVATE ISLAND',
    description: "You bought a private island. Your wife's boyfriend lives there too. You don't care. You have a second island. You are beyond human concerns now. The forum calls you a legend. You haven't logged on in three years.",
    color: '#ffffff',
    ascii: `
  ~  [PALM]  ~
 ~~~~~~~~~~~~~~~
 ~  ISLAND OF  ~
 ~  TENDERNESS ~
 ~~~~~~~~~~~~~~~
 ~ wife's BF:  ~
 ~    also     ~
 ~    here     ~
 ~~~~~~~~~~~~~~~
 (u don't care)`,
  },

  DEBT_SPIRAL: {
    title: 'DEBT SPIRAL',
    description: "The sharks came calling. Turns out borrowing money to buy options on meme stocks has some downside. Who knew. The loan is now larger than everything you own. Mathematically, you have negative money.",
    color: '#ff4400',
    ascii: `
   $$$  DOWN  $$$
    $$  WE    $$
     $  GO    $
      \\      /
       \\    /
        \\  /  <- you
         \\/
   ________________
   |  LOAN SHARK  |
   |  is smiling  |
   |______________|`,
  },

  PAPER_HANDS: {
    title: 'PAPER HANDS',
    description: "You sold. You actually sold. That position you dumped for a 3% gain? It would have been worth over a million dollars today. The apes know. The forum will never forget. You will wake up at 3am about this for years.",
    color: '#ffff00',
    ascii: `
   ___     ___
  /   \\   /   \\
 | YOU |  |$1M+|
 |SOLD |  |GONE|
  \\___/    \\___/
     \\       /
      \\     /
    PAPER HANDS
    HAVE SPOKEN
   YOU COULD'VE`,
  },
};

export const EndingScreen: React.FC<EndingScreenProps> = ({ result }) => {
  const resetGame = useGameStore((state) => state.resetGame);
  const finalNetWorth = useGameStore((state) => state.finalNetWorth) ?? 0;
  const karma = useGameStore((state) => state.karma);
  const content = ENDING_CONTENT[result];

  return (
    <div className="ending-screen-overlay">
      <div className="ending-card" style={{ border: `4px double ${content.color}` }}>
        <h1 className="ending-title" style={{ color: content.color }}>{content.title}</h1>
        <p className="ending-description">{content.description}</p>
        {content.ascii && (
          <pre className="ending-ascii">{content.ascii}</pre>
        )}
        <div className="ending-stats">
          <StatRow label="FINAL NET WORTH" value={`$${(finalNetWorth / 100).toLocaleString()}`} />
          <StatRow label="KARMA" value={karma.toLocaleString()} />
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
