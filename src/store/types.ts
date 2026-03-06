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
  messages: Message[];
  forumPosts: ForumPost[];
  eventQueue: GameEvent[];
  lastFlash: { type: FeedbackType; timestamp: number } | null;
  popups: PopupItem[];
  gameStatus: GameStatus;
  endingType: EndingType | null;
  netWorthHistory: NetWorthPoint[];
}

export interface GameActions {
  buyStock: (ticker: StockTicker, amount: number) => void;
  sellStock: (ticker: StockTicker, amount: number) => void;
  buyOption: (ticker: StockTicker, type: OptionType, amount: number, strikePrice: number, greeks: { delta: number, gamma: number, theta: number }) => void;
  getNetWorth: () => number;
  nextTurn: () => void;
  processEvents: () => void;
  triggerFlash: (type: FeedbackType) => void;
  addPopup: (text: string, type: FeedbackType, x?: number, y?: number) => void;
  removePopup: (id: string) => void;
  resetGame: () => void;
}

export type GameStore = GameState & GameActions;
