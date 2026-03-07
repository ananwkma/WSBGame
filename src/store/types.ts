export type StockTicker = '$GAME' | '$POPC' | '$APE';

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

export type GameStatus = 'playing' | 'ended';
export type EndingType = 'MOON' | 'LEGEND' | 'MENDYS';

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

export interface GameState {
  cash: number; // in cents
  holdings: Record<StockTicker, number>;
  optionsHoldings: OptionContract[];
  stocks: Record<StockTicker, StockData>;
  turn: number;
  day: number;
  hype: number; // 0-100
  karma: number; // Reddit-style points
  threads: Record<string, Thread>;
  forumPosts: ForumPost[];
  eventQueue: GameEvent[];
  lastFlash: { type: FeedbackType; timestamp: number } | null;
  popups: PopupItem[];
  gameStatus: GameStatus;
  endingType: EndingType | null;
  netWorthHistory: NetWorthPoint[];
  tradeHistory: TradeEntry[];
  costBasis: Record<StockTicker, number>;
  guruPrediction: {
    ticker: StockTicker;
    sentiment: 'BULLISH' | 'BEARISH';
    day: number;
    wasCorrect: boolean | null;
  } | null;
}

export interface GameActions {
  buyStock: (ticker: StockTicker, amount: number) => void;
  sellStock: (ticker: StockTicker, amount: number) => void;
  buyOption: (ticker: StockTicker, type: OptionType, amount: number, strikePrice: number, greeks: { delta: number, gamma: number, theta: number, vega: number, premium?: number }) => void;
  sellOption: (optionId: string, amount: number) => void;
  getNetWorth: () => number;
  nextTurn: () => void;
  processEvents: () => void;
  triggerFlash: (type: FeedbackType) => void;
  addPopup: (text: string, type: FeedbackType, x?: number, y?: number) => void;
  removePopup: (id: string) => void;
  resetGame: () => void;
  setThreadRead: (sender: string) => void;
}

export type GameStore = GameState & GameActions;
