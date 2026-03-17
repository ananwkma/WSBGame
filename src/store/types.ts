export type StockTicker = '$GAME' | '$POPC' | '$APE' | '$GOOGO' | '$APPO' | '$BERG';

export type OptionType = 'CALL' | 'PUT';

export interface OptionContract {
  id: string;
  ticker: StockTicker;
  type: OptionType;
  strikePrice: number;
  amount: number;
  expiryDay: number;
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  premiumPaid: number; // total premium paid for the contract in cents
}

export type TradeType = 'BUY' | 'SELL' | 'OPTION_BUY' | 'OPTION_SELL' | 'OPTION_EXPIRY';

export interface TradeEntry {
  id: string;
  type: TradeType;
  ticker: string;
  amount: number;
  price: number; // execution price in cents (for options, this is per share)
  totalValue: number; // amount * price (total premium or cost)
  day: number;
  realizedPL?: number; // profit/loss in cents, for SELL/EXPIRY
}

export interface HistoryPoint {
  turn: number;
  price: number;
}

export interface NetWorthPoint {
  turn: number;
  value: number;
}

export interface StockData {
  ticker: StockTicker;
  currentPrice: number;
  history: HistoryPoint[];
  iv: number;
}

export type FeedbackType = 'positive' | 'negative' | 'neutral';

export type WifeBracket = 
  | 'BANKRUPT' 
  | 'BROKE' 
  | 'STRUGGLING' 
  | 'WORRIED' 
  | 'CONCERNED' 
  | 'BASELINE' 
  | 'COMFORTABLE' 
  | 'WELL_OFF' 
  | 'RICH' 
  | 'MILLIONAIRE' 
  | 'MULTI_MILLIONAIRE' 
  | 'DECA_MILLIONAIRE' 
  | 'CENT_MILLIONAIRE' 
  | 'BILLIONAIRE';

export type GameStatus = 'playing' | 'ended';
export type EndingType =
  | 'MENDYS'
  | 'BREAK_EVEN'
  | 'SMALL_WINS'
  | 'TENDIES'
  | 'TO_THE_MOON'
  | 'HEDGE_FUND_DARLING'
  | 'WOLF_OF_WALL_STREET'
  | 'PRIVATE_ISLAND'
  | 'DEBT_SPIRAL'
  | 'EXPIRED_WORTHLESS'
  | 'PAPER_HANDS';

export interface PopupItem {
  id: string;
  text: string;
  type: FeedbackType;
  x: number;
  y: number;
}

export type GameEventType = 'MESSAGE' | 'POST' | 'SHIFT' | 'GURU';

export interface Message {
  id: string;
  sender: string;
  text: string;
  day: number;
}

export interface Thread {
  contactName: string;
  avatar: string;
  lastReadDay: number;
  messages: Message[];
}

export interface ForumPost {
  id: string;
  user: string;
  title: string;
  upvotes: number;
}

export interface GameEvent {
  type: GameEventType;
  day: number;
  payload: Message | ForumPost | any;
}

export interface CandleBar {
  openTime: number;   // in-game minutes since midnight
  open: number;       // cents
  high: number;       // cents
  low: number;        // cents
  close: number;      // cents
}

export type MarketEventType = 'EARNINGS' | 'FED_ANNOUNCEMENT' | 'MEME_FRENZY' | 'INSIDER_LEAK';

export interface MarketEvent {
  id: string;
  type: MarketEventType;
  ticker: string | null;   // null for macro events (FED_ANNOUNCEMENT)
  day: number;
  triggerTime: number;     // in-game minutes since midnight
  priceMultiplier: number; // e.g. 1.3 for +30%, 0.7 for -30%
  rampMinutes: number;     // ticks to spread the ramp over (1 or 2)
  fake?: boolean;          // INSIDER_LEAK only — fake leaks do nothing
  fired: boolean;
  narrativeKey: string;    // key into event template pool
}

export interface ScheduledMessage {
  message: Message;
  deliverAt: number;  // in-game minutes since midnight
  delivered: boolean;
}

export interface GameState {
  cash: number; // in cents
  sharkDebt: number; // separate high-interest debt
  isMarginCall: boolean; // groundwork for margin mechanics
  holdings: Record<StockTicker, number>;
  optionsHoldings: OptionContract[];
  stocks: Record<StockTicker, StockData>;
  turn: number;
  day: number;
  currentDay: number;
  karma: number; // Reddit-style points
  threads: Record<string, Thread>;
  forumPosts: ForumPost[];
  eventQueue: GameEvent[];
  lastFlash: { type: FeedbackType; timestamp: number } | null;
  popups: PopupItem[];
  gameStatus: GameStatus;
  endingType: EndingType | null;
  finalNetWorth: number | null; // settled net worth at game end (intrinsic option value, not BS)
  peakOpportunityCost: number; // peak hypothetical settled value of sold positions at game-end (cents)
  netWorthHistory: NetWorthPoint[];
  tradeHistory: TradeEntry[];
  costBasis: Record<StockTicker, number>;
  guruPrediction: {
    ticker: StockTicker;
    sentiment: 'BULLISH' | 'BEARISH';
    day: number;
    wasCorrect: boolean | null;
  } | null;
  marketTime: number;         // minutes since midnight (0–1440); resets each day
  marketIsOpen: boolean;      // derived: 570 <= marketTime < 960
  bigGainTicker: string | null;  // ticker that gained 20%+ in last tick; cleared each tick
  bigLossTicker: string | null;  // ticker that lost 20%+ in last tick; cleared each tick
  netWorthTriggerFiredToday: boolean; // true if 10%+ swing wife message already fired today
  intradayBars: Record<string, CandleBar[]>;    // 1-min bars per ticker, current day only
  previousDayBars: Record<string, CandleBar[]>;  // 1-min bars from the last completed trading day (keyed by ticker)
  netWorthBars: CandleBar[];  // 1-min net worth bars, current day only
  scheduledEvents: MarketEvent[];   // seeded at advanceDay time for the upcoming day
  activeEvents: MarketEvent[];      // events fired today, consumed by news panel
  pendingMessages: ScheduledMessage[]; // mid-session messages queue
}

export interface GameActions {
  buyStock: (ticker: StockTicker, amount: number) => void;
  sellStock: (ticker: StockTicker, amount: number) => void;
  buyOption: (ticker: StockTicker, type: OptionType, amount: number, strikePrice: number, greeks: { delta: number, gamma: number, theta: number, vega: number, premium?: number }) => void;
  sellOption: (optionId: string, amount: number) => void;
  getNetWorth: () => number;
  tickMarket: () => void;
  advanceDay: () => void;
  dismissEvent: (id: string) => void;
  processEvents: () => { newThreads: Record<string, Thread>; newForumPosts: ForumPost[] };
  triggerFlash: (type: FeedbackType) => void;
  addPopup: (text: string, type: FeedbackType, x?: number, y?: number) => void;
  removePopup: (id: string) => void;
  resetGame: () => void;
  getOpportunityCost: () => number;
  setThreadRead: (sender: string) => void;
  borrowFromShark: (amount: number) => void;
  repayShark: () => void;
}

export type GameStore = GameState & GameActions;
