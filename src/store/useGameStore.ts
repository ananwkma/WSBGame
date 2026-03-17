import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { GameStore, StockTicker, GameEvent, EndingType, StockData, CandleBar, MarketEvent, ScheduledMessage } from './types';
import { generateHistoricalData, calculateBS, scaledIV } from '../utils/marketUtils';
import { getRandomTemplate, pickSharkMessage, getGuruVideoMessage } from '../data/messageTemplates';
import type { PerformanceTier, GuruSentimentDir } from '../data/messageTemplates';
import { playMarketOpen, playMarketClose, playBigGain, playBigLoss, playBorrow, playMessageDing } from '../utils/soundEngine';

// Fixed earnings schedule (ticker → day)
const EARNINGS_SCHEDULE: Partial<Record<StockTicker, number>> = {
  '$GAME': 3, '$APE': 4, '$POPC': 5, '$APPO': 6, '$GOOGO': 7, '$BERG': 8,
};

// Forum post templates keyed by event narrativeKey
const EVENT_POSTS: Record<string, string[]> = {
  FED: [
    'BREAKING: Fed just spoke. Markets are moving. BUY BUY BUY',
    'Fed meeting dropping any minute. Position accordingly retards',
    'Powell just said something. Who cares what. Buy calls.',
    'Fed decision incoming. My puts are sweating rn',
    'Jerome Powell about to ruin or save us all. Stay tuned.',
  ],
  FED_ANNOUNCEMENT: [
    'BREAKING: Fed just spoke. Markets are moving. BUY BUY BUY',
    'Fed meeting dropping any minute. Position accordingly retards',
    'Powell just said something. Who cares what. Buy calls.',
    'Fed decision incoming. My puts are sweating rn',
    'Jerome Powell about to ruin or save us all. Stay tuned.',
  ],
  MEME_FRENZY: [
    'EVERYONE IS BUYING {ticker} RIGHT NOW. DO NOT MISS THIS',
    '{ticker} to the moon confirmed. Source: trust me bro',
    'WSB is all in on {ticker}. Are you?',
    '{ticker} printing. What are you waiting for',
    "I'm up 300% on {ticker} calls. Get in before it's too late",
    '{ticker} squeeze incoming. Short sellers crying rn.',
    'Just went all in on {ticker}. Wife is mad. Worth it.',
    '{ticker} volume through the roof. This is the one boys.',
  ],
  MEME_DUMP: [
    'lmaooo {ticker} rug pull. who bought the top?',
    '{ticker} dumping hard. should have sold earlier smh',
    '{ticker} down bad. rip to everyone who FOMO\'d in.',
    'They always dump after the pump. {ticker} bagholders explain yourselves.',
  ],
  INSIDER_LEAK: [
    'heard some stuff about {ticker} from a friend of a friend...',
    'not financial advice but {ticker} might moon soon. don\'t ask how I know',
    'unusual options activity on {ticker}. just sayin.',
    'my cousin works near the {ticker} building. things are happening.',
  ],
  EARNINGS: [
    '{ticker} earnings incoming. IV through the roof. Options gang where you at',
    'Big day for {ticker} holders. Let\'s see if the CEO delivers',
    '{ticker} reporting after close. I have 0 clue what happens but I\'m loaded up on calls.',
  ],
  EARNINGS_BEAT: [
    '{ticker} EARNINGS BEAT. LETSGOOO',
    '{ticker} crushed estimates. told you all. TOLD YOU.',
    '{ticker} printing after earnings. Bulls eating good tonight.',
  ],
  EARNINGS_MISS: [
    '{ticker} missed earnings lmao. whoever was long deserved it.',
    '{ticker} guidance slashed. puts printing. sorry not sorry.',
    '{ticker} down after earnings. who could have seen this coming (I could)',
  ],
};

// Loan Shark market taunt messages for when bearish events fire
const SHARK_TAUNT_MESSAGES = [
  "Heard the market didn't treat you well today. Funny how that works.",
  'Bad day for your portfolio. Good day for me. Clock is ticking.',
  "Market events are unpredictable, aren't they. Your debt isn't.",
  "You still owe me. Market going down doesn't change that.",
  'Market took a bite out of you today. I take a bite every day. Count on it.',
  'Rough day out there. Debt compounds smooth though. Night night.',
];

// Seed scheduled events for a given game day
function seedDayEvents(day: number): MarketEvent[] {
  const events: MarketEvent[] = [];
  let idSeq = 0;
  const id = () => `evt-d${day}-${idSeq++}`;

  // Earnings (fixed schedule)
  (Object.entries(EARNINGS_SCHEDULE) as [StockTicker, number][]).forEach(([ticker, earningsDay]) => {
    if (earningsDay === day) {
      const triggerTime = 600 + Math.floor(Math.random() * 300); // random between 10am–4pm range (600–900)
      const beat = Math.random() > 0.45; // 55% chance of beat
      events.push({
        id: id(),
        type: 'EARNINGS',
        ticker,
        day,
        triggerTime,
        priceMultiplier: beat ? 1.15 + Math.random() * 0.25 : 0.72 + Math.random() * 0.18,
        rampMinutes: 2,
        fired: false,
        narrativeKey: beat ? 'EARNINGS_BEAT' : 'EARNINGS_MISS',
      });
    }
  });

  // Random events — each run independently at low probability for days 2–9
  if (day >= 2 && day <= 9) {
    // Fed announcement (once per game, roughly day 4–7)
    if (day >= 4 && day <= 7 && Math.random() < 0.3) {
      events.push({
        id: id(),
        type: 'FED_ANNOUNCEMENT',
        ticker: null,
        day,
        triggerTime: 840 + Math.floor(Math.random() * 60), // 2–3pm
        priceMultiplier: Math.random() > 0.5 ? 1.08 : 0.93,
        rampMinutes: 2,
        fired: false,
        narrativeKey: 'FED_ANNOUNCEMENT',
      });
    }
    // Meme frenzy (random day)
    if (Math.random() < 0.25) {
      const tickers: StockTicker[] = ['$GAME', '$APE', '$POPC', '$APPO', '$GOOGO', '$BERG'];
      const ticker = tickers[Math.floor(Math.random() * tickers.length)];
      events.push({
        id: id(),
        type: 'MEME_FRENZY',
        ticker,
        day,
        triggerTime: 600 + Math.floor(Math.random() * 300),
        priceMultiplier: Math.random() > 0.4 ? 1.2 + Math.random() * 0.3 : 0.75 + Math.random() * 0.15,
        rampMinutes: 1,
        fired: false,
        narrativeKey: 'MEME_FRENZY',
      });
    }
    // Insider leak
    if (Math.random() < 0.2) {
      const tickers: StockTicker[] = ['$GAME', '$APE', '$POPC', '$APPO', '$GOOGO', '$BERG'];
      const ticker = tickers[Math.floor(Math.random() * tickers.length)];
      events.push({
        id: id(),
        type: 'INSIDER_LEAK',
        ticker,
        day,
        triggerTime: 570 + Math.floor(Math.random() * 200),
        priceMultiplier: Math.random() > 0.35 ? 1.12 : 0.88,
        rampMinutes: 1,
        fake: Math.random() < 0.4, // 40% are fake leaks
        fired: false,
        narrativeKey: 'INSIDER_LEAK',
      });
    }
  }

  return events;
}

const INITIAL_EVENTS: GameEvent[] = [
  {
    day: 1,
    type: 'MESSAGE',
    payload: {
      id: 'm1',
      sender: 'Ape Friend',
      text: 'Yo! Have you seen $GAME? It\'s literally free money right now. Buy $GAME! 🚀',
    },
  },
  {
    day: 1,
    type: 'POST',
    payload: {
      id: 'p1',
      user: 'deepfuckingvalue_clone',
      title: '$GAME TO THE MOON - My YOLO update',
      upvotes: 42069,
    },
  },
  {
    day: 2,
    type: 'MESSAGE',
    payload: {
      id: 'm2',
      sender: 'Wife',
      text: 'Hey honey, did you pay the mortgage yet? I saw some weird charges on the bank statement...',
    },
  },
  {
    day: 2,
    type: 'POST',
    payload: {
      id: 'p2',
      user: 'bear_gang_leader',
      title: 'Loss Porn is coming. $GAME is a bubble. Change my mind.',
      upvotes: -150,
    },
  },
  {
    day: 3,
    type: 'GURU',
    payload: {
      id: 'g1',
      sender: 'Crypto Guru',
      text: '$GAME is a sell... NOT! Just kidding, double down on the dips!',
    },
  },
  {
    day: 4,
    type: 'SHIFT',
    payload: {
      ticker: '$GAME',
      delta: 3.5,
    },
  },
  {
    day: 5,
    type: 'MESSAGE',
    payload: {
      id: 'm3',
      sender: 'Brokerage',
      text: 'WARNING: Your account is approaching margin maintenance requirements. Please deposit funds immediately.',
    },
  },
  {
    day: 6,
    type: 'GURU',
    payload: {
      id: 'g2',
      sender: 'Chart Master',
      text: 'The squeeze is squozen. If you\'re still holding, you\'re the exit liquidity. 📉',
    },
  },
  {
    day: 7,
    type: 'POST',
    payload: {
      id: 'p3',
      user: 'wallstreet_insider',
      title: 'Hedge funds are literally crying on TV right now. WE ARE WINNING!',
      upvotes: 12500,
    },
  },
  {
    day: 8,
    type: 'MESSAGE',
    payload: {
      id: 'm4',
      sender: 'Wife\'s Boyfriend',
      text: 'Hey champ, thanks for the new PS5! Your wife says hi. Keep trading those stonks!',
    },
  },
  {
    day: 9,
    type: 'MESSAGE',
    payload: {
      id: 'm5',
      sender: 'Ape Friend',
      text: 'This is it. The final stand. I just sold my car for more $GAME. YOLO! 🚀🚀🚀',
    },
  },
  {
    day: 10,
    type: 'POST',
    payload: {
      id: 'p4',
      user: 'MOD_BOT',
      title: 'MOON OR BUST: Day 10 Final YOLO Megathread',
      upvotes: 88888,
    },
  },
];

const INITIAL_STOCKS: Record<StockTicker, { price: number, iv: number, minVol: number, maxVol: number, histVol: number }> = {
  // Meme stocks — wild swings
  '$GAME': { price: 10000, iv: 1.5, minVol: 0.10, maxVol: 0.50, histVol: 0.20 },
  '$POPC': { price: 5000,  iv: 0.8, minVol: 0.10, maxVol: 0.50, histVol: 0.20 },
  '$APE':  { price: 2500,  iv: 3.0, minVol: 0.10, maxVol: 0.50, histVol: 0.20 },
  // Blue-chip stocks — calm, steady
  '$GOOGO': { price: 17500, iv: 0.30, minVol: 0.01, maxVol: 0.05, histVol: 0.03 },
  '$APPO':  { price: 19000, iv: 0.25, minVol: 0.01, maxVol: 0.05, histVol: 0.03 },
  '$BERG':  { price: 52000, iv: 0.20, minVol: 0.01, maxVol: 0.05, histVol: 0.03 },
};

// --- FINANCIAL UTILITIES ---

export const calculateDelta = (price: number, strike: number, type: 'CALL' | 'PUT', iv: number, t: number = 1/252) => {
  return calculateBS(type, price, strike, t, iv).delta;
};

export const calculateGamma = (price: number, strike: number, iv: number, t: number = 1/252) => {
  return calculateBS('CALL', price, strike, t, iv).gamma;
};

export const calculateTheta = (price: number, strike: number, type: 'CALL' | 'PUT', iv: number, t: number = 1/252) => {
  return calculateBS(type, price, strike, t, iv).theta;
};

export const calculateVega = (price: number, strike: number, iv: number, t: number = 1/252) => {
  return calculateBS('CALL', price, strike, t, iv).vega;
};

export const calculateOptionPrice = (price: number, strike: number, type: 'CALL' | 'PUT', iv: number, t: number) => {
  const result = calculateBS(type, price, strike, t, iv).price;
  return isNaN(result) ? 0 : result;
};

export const generateOptionsChain = (ticker: StockTicker, currentPrice: number, iv: number, currentDay: number, heldOptions: any[] = []) => {
  const roundTo = 500; // $5.00 increments
  // All options now expire at the end of the game (Day 11)
  const daysToExpiry = Math.max(1, 11 - currentDay);
  const t = daysToExpiry / 252;
  const effectiveIV = scaledIV(iv, daysToExpiry);
  
  // 1. Generate standard OTM strikes
  const otmStrikes: number[] = [];
  
  // 3 OTM Puts (below price)
  for (let i = 1; i <= 3; i++) {
    const s = Math.floor((currentPrice - (i * 1000)) / roundTo) * roundTo;
    if (s > 0) otmStrikes.push(s);
  }
  
  // 3 OTM Calls (above price)
  for (let i = 1; i <= 3; i++) {
    const s = Math.ceil((currentPrice + (i * 1000)) / roundTo) * roundTo;
    otmStrikes.push(s);
  }

  // 2. Add strikes from held positions for this ticker
  const heldStrikes = heldOptions
    .filter(o => o.ticker === ticker)
    .map(o => o.strikePrice);

  // 3. Unique and sorted
  const allStrikes = Array.from(new Set([...otmStrikes, ...heldStrikes])).sort((a, b) => a - b);

  return allStrikes.flatMap((strike) => {
    const callBS = calculateBS('CALL', currentPrice, strike, t, effectiveIV);
    const callPrice = callBS.price;
    const callGreeks = {
      delta: callBS.delta,
      gamma: callBS.gamma,
      theta: callBS.theta,
      vega: callBS.vega,
    };

    const putBS = calculateBS('PUT', currentPrice, strike, t, effectiveIV);
    const putPrice = putBS.price;
    const putGreeks = {
      delta: putBS.delta,
      gamma: putBS.gamma,
      theta: putBS.theta,
      vega: putBS.vega,
    };

    return [
      { ticker, type: 'CALL' as const, strikePrice: strike, premium: callPrice, ...callGreeks },
      { ticker, type: 'PUT' as const, strikePrice: strike, premium: putPrice, ...putGreeks },
    ];
  });
};

const getInitialState = () => {
  const initialThreads: Record<string, any> = {
    'Ape Friend': { contactName: 'Ape Friend', avatar: '🦍', lastReadDay: 1, messages: [] },
    'Wife': { contactName: 'Wife', avatar: '👩', lastReadDay: 1, messages: [] },
    'Brokerage': { contactName: 'Brokerage', avatar: '🏛️', lastReadDay: 1, messages: [] },
    'Crypto Guru': { contactName: 'Crypto Guru', avatar: '📉', lastReadDay: 1, messages: [] },
    "Wife's Boyfriend": { contactName: "Wife's Boyfriend", avatar: '😎', lastReadDay: 1, messages: [] },
    'Loan Shark': {
      contactName: 'Loan Shark',
      avatar: '🦈',
      lastReadDay: 1,
      messages: [
        { id: 'shark-intro', sender: 'Loan Shark', text: "Hey. Got your number from a mutual friend. I do short-term capital solutions. Cash up front, simple terms. 20% per day. Every day. Before you ask — yes, every day. Compounding. Call me when the market treats you bad.", day: 1 }
      ]
    },
  };

  // Populate initial messages for day 1
  INITIAL_EVENTS.filter(e => e.day === 1 && (e.type === 'MESSAGE' || e.type === 'GURU')).forEach(e => {
    const sender = e.payload.sender;
    if (initialThreads[sender]) {
      initialThreads[sender].messages.unshift({ ...e.payload, day: 1 });
    }
  });

  return {
    cash: 10000000, // $100,000.00
    sharkDebt: 0,
    peakOpportunityCost: 0,
    isMarginCall: false,
    turn: 1,
    day: 1,
    currentDay: 1,
    karma: 0,
    marketTime: 360,         // 6:00am for Day 1
    marketIsOpen: false,     // market closed at start
    bigGainTicker: null as string | null,
    bigLossTicker: null as string | null,
    netWorthTriggerFiredToday: false,
    intradayBars: {},        // empty map — keyed by ticker symbol
    netWorthBars: [],
    scheduledEvents: seedDayEvents(1),
    activeEvents: [],
    pendingMessages: [],
    threads: initialThreads,
    forumPosts: INITIAL_EVENTS.filter(e => e.day === 1 && e.type === 'POST').map(e => e.payload),
    eventQueue: INITIAL_EVENTS,
    holdings: {
      '$GAME': 0, '$POPC': 0, '$APE': 0,
      '$GOOGO': 0, '$APPO': 0, '$BERG': 0,
    } as Record<StockTicker, number>,
    optionsHoldings: [] as any[],
    stocks: (Object.keys(INITIAL_STOCKS) as StockTicker[]).reduce((acc, ticker) => {
      const s = INITIAL_STOCKS[ticker];
      acc[ticker] = {
        ticker,
        currentPrice: s.price,
        iv: s.iv,
        history: generateHistoricalData(s.price, 20, s.histVol).map(p => ({ ...p, turn: p.turn + 1 })),
      };
      return acc;
    }, {} as Record<StockTicker, StockData>),
    gameStatus: 'playing' as const,
    endingType: null as EndingType | null,
    finalNetWorth: null as number | null,
    lastFlash: null as { type: any; timestamp: number } | null,
    popups: [] as any[],
    netWorthHistory: [{ turn: 1, value: 10000000 }], // Start with initial cash
    tradeHistory: [],
    costBasis: {
      '$GAME': 0, '$POPC': 0, '$APE': 0,
      '$GOOGO': 0, '$APPO': 0, '$BERG': 0,
    } as Record<StockTicker, number>,
    guruPrediction: null,
  };
};

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      ...getInitialState(),

      // --- ACTIONS ---
      resetGame: () => {
        set(getInitialState());
        localStorage.removeItem('wsb-trader-save');
      },

      getOpportunityCost: () => get().peakOpportunityCost,

      triggerFlash: (type) => {
        set({ lastFlash: { type, timestamp: Date.now() } });
      },

      addPopup: (text, type, x = 50, y = 50) => {
        const id = Math.random().toString(36).substring(7);
        set((state) => ({
          popups: [...state.popups, { id, text, type, x, y }],
        }));
      },

      removePopup: (id) => {
        set((state) => ({
          popups: state.popups.filter((p) => p.id !== id),
        }));
      },

      buyStock: (ticker, amount) => {
        const { cash, stocks, holdings, costBasis, tradeHistory, day, triggerFlash, addPopup } = get();
        const currentPrice = stocks[ticker].currentPrice;
        const cost = currentPrice * amount;

        if (cash >= cost) {
          const currentShares = holdings[ticker];
          const currentBasis = costBasis[ticker];
          const newShares = currentShares + amount;
          const newBasis = Math.round((currentShares * currentBasis + amount * currentPrice) / newShares);

          const tradeEntry = {
            id: Math.random().toString(36).substring(7),
            type: 'BUY' as const,
            ticker,
            amount,
            price: currentPrice,
            totalValue: cost,
            day,
          };

          set({
            cash: cash - cost,
            holdings: {
              ...holdings,
              [ticker]: newShares,
            },
            costBasis: {
              ...costBasis,
              [ticker]: newBasis,
            },
            tradeHistory: [tradeEntry, ...tradeHistory],
          });
          triggerFlash('positive');
          const phrases = ['TO THE MOON!', 'LFG!', '🚀🚀🚀', 'BOUGHT!'];
          addPopup(phrases[Math.floor(Math.random() * phrases.length)], 'positive');
        } else {
          console.error('Insufficient funds for trade');
          triggerFlash('negative');
          const phrases = ['POOR DETECTED', 'GET A JOB', 'NO CASH!', 'GUH'];
          addPopup(phrases[Math.floor(Math.random() * phrases.length)], 'negative');
        }
      },

      buyOption: (ticker, type, amount, strikePrice, greeks) => {
        const { cash, stocks, day, triggerFlash, addPopup } = get();
        const stock = stocks[ticker];

        // All options now expire at the end of the game (Day 11)
        const daysToExpiry = Math.max(1, 11 - day);
        const tInitial = daysToExpiry / 252;
        
        // Use premium from UI if available, otherwise calculate it
        const premiumPerUnit = greeks.premium !== undefined 
          ? greeks.premium 
          : calculateOptionPrice(stock.currentPrice, strikePrice, type, scaledIV(stock.iv, daysToExpiry), tInitial);
          
        const totalCost = premiumPerUnit * amount;

        if (cash >= totalCost) {
          const tradeId = Math.random().toString(36).substring(7);
          const newOption = {
            id: tradeId,
            ticker,
            type,
            strikePrice,
            amount,
            expiryDay: 11, // Final Day Expiry
            premiumPaid: totalCost,
            delta: greeks.delta,
            gamma: greeks.gamma,
            theta: greeks.theta,
            vega: greeks.vega
          };

          const tradeEntry = {
            id: tradeId,
            type: 'OPTION_BUY' as const,
            ticker,
            amount,
            price: premiumPerUnit,
            totalValue: totalCost,
            day,
          };

          set((state) => {
            const existingIdx = state.optionsHoldings.findIndex(
              o => o.ticker === ticker && o.type === type && o.strikePrice === strikePrice
            );
            let updatedOptions;
            if (existingIdx >= 0) {
              const existing = state.optionsHoldings[existingIdx];
              const merged = {
                ...existing,
                amount: existing.amount + amount,
                premiumPaid: existing.premiumPaid + totalCost,
                delta: greeks.delta,
                gamma: greeks.gamma,
                theta: greeks.theta,
                vega: greeks.vega,
              };
              updatedOptions = state.optionsHoldings.map((o, i) => i === existingIdx ? merged : o);
            } else {
              updatedOptions = [...state.optionsHoldings, newOption];
            }
            return {
              cash: state.cash - totalCost,
              optionsHoldings: updatedOptions,
              tradeHistory: [tradeEntry, ...state.tradeHistory],
            };
          });

          triggerFlash('positive');
          addPopup(`${type} OPTION BOUGHT!`, 'positive');
        } else {
          triggerFlash('negative');
          addPopup('NOT ENOUGH CASH FOR PREMIUM', 'negative');
        }
      },

      sellOption: (optionId, amount) => {
        const { cash, stocks, optionsHoldings, tradeHistory, day, triggerFlash, addPopup } = get();
        const option = optionsHoldings.find(o => o.id === optionId);
        
        if (option && option.amount >= amount) {
          const stock = stocks[option.ticker];
          const dteRemaining = Math.max(0, option.expiryDay - day);
          const tRemaining = Math.max(0.0001, dteRemaining / 252);
          const marketValuePerUnit = calculateOptionPrice(stock.currentPrice, option.strikePrice, option.type, scaledIV(stock.iv, dteRemaining), tRemaining);
          const revenue = marketValuePerUnit * amount;
          
          const costBasisPerUnit = option.premiumPaid / option.amount;
          const realizedPL = (marketValuePerUnit - costBasisPerUnit) * amount;

          const tradeEntry = {
            id: Math.random().toString(36).substring(7),
            type: 'OPTION_SELL' as const,
            ticker: option.ticker,
            amount,
            price: marketValuePerUnit,
            totalValue: revenue,
            day,
            realizedPL,
          };

          const updatedOptions = optionsHoldings.map(o => {
            if (o.id === optionId) {
              const remainingAmount = o.amount - amount;
              const remainingPremiumPaid = o.premiumPaid * remainingAmount / o.amount;
              return { ...o, amount: remainingAmount, premiumPaid: remainingPremiumPaid };
            }
            return o;
          }).filter(o => o.amount > 0);

          set({
            cash: cash + revenue,
            optionsHoldings: updatedOptions,
            tradeHistory: [tradeEntry, ...tradeHistory],
          });

          triggerFlash('positive');
          addPopup('OPTION POSITION CLOSED', 'positive');
        } else {
          triggerFlash('negative');
          addPopup('INVALID SELL AMOUNT', 'negative');
        }
      },

      getNetWorth: () => {
        const { cash, holdings, stocks, optionsHoldings, day, sharkDebt } = get();
        const stockValue = (Object.keys(holdings) as StockTicker[]).reduce((total, ticker) => {
          return total + (stocks[ticker].currentPrice * holdings[ticker]);
        }, 0);

        const optionsValue = optionsHoldings.reduce((total, option) => {
          const stock = stocks[option.ticker];
          const dteRemaining = Math.max(0, option.expiryDay - day);
          const tRemaining = Math.max(0.0001, dteRemaining / 252);
          const marketValue = calculateOptionPrice(stock.currentPrice, option.strikePrice, option.type, scaledIV(stock.iv, dteRemaining), tRemaining);
          return total + (marketValue * option.amount);
        }, 0);

        return cash + stockValue + optionsValue - sharkDebt;
      },

      tickMarket: () => {
        const state = get();

        // --- DIAGNOSTIC LOGS (remove after debugging) ---
        if (state.marketTime === 360) {
          console.log('[DIAG] tickMarket called. gameStatus:', state.gameStatus, 'currentDay:', state.currentDay, 'scheduledEvents:', JSON.stringify(state.scheduledEvents));
        }
        if (state.marketTime % 60 === 0) {
          console.log('[DIAG] tick', state.marketTime, '| gameStatus:', state.gameStatus, '| currentDay:', state.currentDay, '| scheduledEvents count:', state.scheduledEvents.length, '| unfired:', state.scheduledEvents.filter(e => !e.fired).map(e => `${e.type}@${e.triggerTime}(day${e.day})`));
        }
        // -------------------------------------------------

        if (state.gameStatus !== 'playing') return;
        if (state.marketTime >= 1439) return; // freeze at 11:59 PM, wait for NEXT DAY

        const newTime = state.marketTime + 1;
        const newIsOpen = newTime >= 570 && newTime < 960; // 9:30am–4pm

        // Market open/close bell
        const wasOpen = state.marketIsOpen;
        if (!wasOpen && newIsOpen) {
          playMarketOpen();
        }
        if (wasOpen && !newIsOpen && newTime >= 960) {
          playMarketClose();
        }

        // Per-tick volatility scaling: divide daily vol by sqrt(390 ticks/day)
        const TICKS_PER_DAY = 390;
        const volScale = Math.sqrt(TICKS_PER_DAY);

        const newStocks = { ...state.stocks };
        const newIntradayBars: Record<string, CandleBar[]> = { ...state.intradayBars };

        // Big gain/loss detection — cleared each tick
        let bigGainSet: string | null = null;
        let bigLossSet: string | null = null;

        if (newIsOpen) {
          // Move prices for each stock
          Object.keys(newStocks).forEach((ticker) => {
            const stock = newStocks[ticker];
            const { minVol, maxVol } = INITIAL_STOCKS[ticker as keyof typeof INITIAL_STOCKS];
            const dailyVol = Math.random() * (maxVol - minVol) + minVol;
            const perTickVol = dailyVol / volScale;
            const direction = Math.random() > 0.5 ? 1 : -1;
            const change = 1 + (perTickVol * direction);
            let nextPrice = Math.round(stock.currentPrice * change);
            if (nextPrice < 1) nextPrice = 1;

            // Detect big single-tick moves (mostly fires during market events)
            const oldPrice = state.stocks[ticker].currentPrice;
            const pctChange = (nextPrice - oldPrice) / oldPrice;
            if (pctChange >= 0.20) {
              playBigGain();
              bigGainSet = ticker;
            } else if (pctChange <= -0.20) {
              playBigLoss();
              bigLossSet = ticker;
            }

            newStocks[ticker] = { ...stock, currentPrice: nextPrice };

            // Upsert 1-min OHLC bar
            const bars = newIntradayBars[ticker] || [];
            const lastBar = bars[bars.length - 1];
            if (lastBar && lastBar.openTime === newTime) {
              newIntradayBars[ticker] = [
                ...bars.slice(0, -1),
                { ...lastBar, high: Math.max(lastBar.high, nextPrice), low: Math.min(lastBar.low, nextPrice), close: nextPrice },
              ];
            } else {
              newIntradayBars[ticker] = [
                ...bars,
                { openTime: newTime, open: nextPrice, high: nextPrice, low: nextPrice, close: nextPrice },
              ];
            }
          });
        }

        // Check for pending event triggers
        if (import.meta.env.DEV && newIsOpen && newTime % 30 === 0) {
          const pending = state.scheduledEvents.filter(e => !e.fired && e.day === state.currentDay);
          if (pending.length > 0) console.log('[PENDING EVENTS]', `marketTime=${newTime}`, pending.map(e => `${e.type} ${e.ticker ?? 'ALL'} @${e.triggerTime}`));
        }

        // IV pre-spike: 5-minute lookahead for EARNINGS and FED events
        if (newIsOpen) {
          state.scheduledEvents.forEach((evt) => {
            if (evt.fired) return;
            if (evt.day !== state.currentDay) return;
            if (evt.type !== 'EARNINGS' && evt.type !== 'FED_ANNOUNCEMENT') return;
            const minutesAway = evt.triggerTime - newTime;
            if (minutesAway > 0 && minutesAway <= 5) {
              const spikeTargets: StockTicker[] = evt.ticker
                ? [evt.ticker as StockTicker]
                : (Object.keys(newStocks) as StockTicker[]);
              spikeTargets.forEach((ticker) => {
                const s = newStocks[ticker];
                if (!s) return;
                const maxIv = INITIAL_STOCKS[ticker as keyof typeof INITIAL_STOCKS].maxVol * 10;
                newStocks[ticker] = { ...s, iv: Math.min(s.iv + 0.05, maxIv) };
              });
            }
          });
        }

        const newScheduledEvents = state.scheduledEvents.map((evt) => {
          if (!evt.fired && evt.day === state.currentDay && evt.triggerTime <= newTime) {
            return { ...evt, fired: true };
          }
          return evt;
        });
        const newlyFired = newScheduledEvents.filter(
          (evt, i) => evt.fired && !state.scheduledEvents[i].fired
        );
        const newActiveEvents = newlyFired.length > 0
          ? [...state.activeEvents, ...newlyFired]
          : state.activeEvents;

        // Apply event effects when they fire
        let newForumPosts = state.forumPosts;
        let newThreadsFromEvents = state.threads;
        if (newlyFired.length > 0) {
          console.log('[EVENT FIRED]', newlyFired.map(e => `${e.type} ${e.ticker ?? 'ALL'} day=${e.day} triggerTime=${e.triggerTime} multiplier=${e.priceMultiplier}`));

          newlyFired.forEach((evt) => {
            // --- Price effect ---
            if (!evt.fake) {
              const tickers: StockTicker[] = evt.ticker
                ? [evt.ticker as StockTicker]
                : (Object.keys(newStocks) as StockTicker[]); // FED affects all
              tickers.forEach((ticker) => {
                const s = newStocks[ticker];
                if (!s) return;
                const shocked = Math.round(s.currentPrice * evt.priceMultiplier);
                // IV crush immediately on EARNINGS/FED fire
                const crushedIv = (evt.type === 'EARNINGS' || evt.type === 'FED_ANNOUNCEMENT')
                  ? INITIAL_STOCKS[ticker as keyof typeof INITIAL_STOCKS].iv
                  : s.iv;
                newStocks[ticker] = { ...s, currentPrice: Math.max(1, shocked), iv: crushedIv };
                // Update intraday bar for shocked price
                const bars = newIntradayBars[ticker] || [];
                const lastBar = bars[bars.length - 1];
                if (lastBar) {
                  newIntradayBars[ticker] = [
                    ...bars.slice(0, -1),
                    { ...lastBar, high: Math.max(lastBar.high, shocked), low: Math.min(lastBar.low, shocked), close: shocked },
                  ];
                }
              });
            }

            // --- Forum post injection ---
            const postPool = EVENT_POSTS[evt.narrativeKey] || EVENT_POSTS[evt.type] || [];
            if (postPool.length > 0) {
              const isMeme = evt.type === 'MEME_FRENZY' || evt.narrativeKey === 'MEME_DUMP' || evt.narrativeKey === 'MEME_FRENZY';
              const postCount = isMeme ? 2 + Math.floor(Math.random() * 2) : 1; // 2-3 for meme, 1 otherwise
              const shuffled = [...postPool].sort(() => Math.random() - 0.5);
              const picked = shuffled.slice(0, Math.min(postCount, shuffled.length));
              const replaceTicker = (t: string) => evt.ticker ? t.replace(/\{ticker\}/g, evt.ticker) : t;
              const eventPostEntries = picked.map((title, idx) => ({
                id: `evt-post-${evt.id}-${idx}`,
                user: `u/degen_${Math.random().toString(36).slice(2, 6)}`,
                title: replaceTicker(title),
                upvotes: Math.floor(Math.random() * 5000) + 100,
              }));
              newForumPosts = [...eventPostEntries, ...newForumPosts];
            }

            // --- Loan Shark taunting on bearish EARNINGS/FED when debt > 0 ---
            if (
              (evt.type === 'EARNINGS' || evt.type === 'FED_ANNOUNCEMENT') &&
              evt.priceMultiplier < 1.0 &&
              state.sharkDebt > 0
            ) {
              const taunt = SHARK_TAUNT_MESSAGES[Math.floor(Math.random() * SHARK_TAUNT_MESSAGES.length)];
              const tauntMsg = {
                id: `shark-taunt-${evt.id}`,
                sender: 'Loan Shark',
                text: taunt,
                day: state.currentDay,
              };
              const sharkThread = newThreadsFromEvents['Loan Shark'];
              if (sharkThread) {
                newThreadsFromEvents = {
                  ...newThreadsFromEvents,
                  'Loan Shark': {
                    ...sharkThread,
                    messages: [...sharkThread.messages, tauntMsg],
                  },
                };
              }
            }
          });
        }

        // Deliver any pending mid-session messages
        const newPendingMessages = state.pendingMessages.map((pm) =>
          !pm.delivered && pm.deliverAt <= newTime ? { ...pm, delivered: true } : pm
        );
        const dueMsgs = newPendingMessages.filter((pm, i) => pm.delivered && !state.pendingMessages[i].delivered);
        // Start from event-updated threads (includes any shark taunts added above)
        let newThreads = newThreadsFromEvents;
        if (dueMsgs.length > 0) {
          playMessageDing();
          newThreads = { ...newThreadsFromEvents };
          dueMsgs.forEach(({ message }) => {
            const threadEntry = newThreads[message.sender];
            if (threadEntry) {
              newThreads[message.sender] = { ...threadEntry, messages: [...threadEntry.messages, message] };
            }
          });
        }

        // Net worth bar for portfolio chart
        const currentNetWorth = get().getNetWorth();
        const nwBars = state.netWorthBars;
        const lastNwBar = nwBars[nwBars.length - 1];
        let newNetWorthBars: CandleBar[];
        if (lastNwBar && lastNwBar.openTime === newTime) {
          newNetWorthBars = [
            ...nwBars.slice(0, -1),
            { ...lastNwBar, high: Math.max(lastNwBar.high, currentNetWorth), low: Math.min(lastNwBar.low, currentNetWorth), close: currentNetWorth },
          ];
        } else {
          newNetWorthBars = [
            ...nwBars,
            { openTime: newTime, open: currentNetWorth, high: currentNetWorth, low: currentNetWorth, close: currentNetWorth },
          ];
        }

        // Net-worth swing trigger: fire one immediate wife message on 10%+ move from day open
        let netWorthTriggerFired = state.netWorthTriggerFiredToday;
        let swingScheduled = [...newPendingMessages];

        if (!state.netWorthTriggerFiredToday && newIsOpen) {
          const dayOpenNW = state.netWorthBars.length > 0 ? state.netWorthBars[0].open : 0;
          if (dayOpenNW > 0) {
            const swingPct = Math.abs(currentNetWorth - dayOpenNW) / dayOpenNW;
            if (swingPct >= 0.10) {
              netWorthTriggerFired = true;
              const swingTier: PerformanceTier = currentNetWorth > dayOpenNW ? 'POSITIVE' : 'NEGATIVE';
              const swingText = getRandomTemplate('WIFE', swingTier, { netWorth: String(Math.round(currentNetWorth)) });
              swingScheduled = [
                ...swingScheduled,
                {
                  message: {
                    id: `wife-swing-${newTime}`,
                    sender: 'Wife',
                    text: swingText,
                    day: state.day,
                  },
                  deliverAt: newTime,
                  delivered: false,
                } as ScheduledMessage,
              ];
            }
          }
        }

        set({
          marketTime: newTime,
          marketIsOpen: newIsOpen,
          stocks: newStocks,
          intradayBars: newIntradayBars,
          netWorthBars: newNetWorthBars,
          scheduledEvents: newScheduledEvents,
          activeEvents: newActiveEvents,
          pendingMessages: swingScheduled,
          threads: newThreads,
          forumPosts: newForumPosts,
          bigGainTicker: bigGainSet,
          bigLossTicker: bigLossSet,
          netWorthTriggerFiredToday: netWorthTriggerFired,
        });
      },

      dismissEvent: (id) => set((state) => ({
        activeEvents: state.activeEvents.filter((e) => e.id !== id),
      })),

      sellStock: (ticker, amount) => {
        const { cash, stocks, holdings, costBasis, tradeHistory, day, triggerFlash, addPopup } = get();
        
        if (holdings[ticker] >= amount) {
          const currentPrice = stocks[ticker].currentPrice;
          const revenue = currentPrice * amount;
          const realizedPL = (currentPrice - costBasis[ticker]) * amount;

          const tradeEntry = {
            id: Math.random().toString(36).substring(7),
            type: 'SELL' as const,
            ticker,
            amount,
            price: currentPrice,
            totalValue: revenue,
            day,
            realizedPL,
          };

          set({
            cash: cash + revenue,
            holdings: {
              ...holdings,
              [ticker]: holdings[ticker] - amount,
            },
            tradeHistory: [tradeEntry, ...tradeHistory],
          });
          triggerFlash('positive');
          const phrases = ['PAPER HANDS!', 'SECURED!', 'SOLD!', '💎 🙌?'];
          addPopup(phrases[Math.floor(Math.random() * phrases.length)], 'positive');
        } else {
          console.error('Insufficient holdings for trade');
          triggerFlash('negative');
          const phrases = ['SELL WHAT?', 'EMPTY BAGS', 'GUH', 'ERROR 404 STOCKS'];
          addPopup(phrases[Math.floor(Math.random() * phrases.length)], 'negative');
        }
      },

      setThreadRead: (sender) => {
        const { threads, day } = get();
        if (threads[sender]) {
          set({
            threads: {
              ...threads,
              [sender]: {
                ...threads[sender],
                lastReadDay: day,
              },
            },
          });
        }
      },

      repayShark: () => {
        const { cash, sharkDebt, threads, day } = get();
        if (sharkDebt <= 0) return;
        if (cash < sharkDebt) {
          // Can't afford full repayment — partial isn't offered, just block
          const rejectMsg = {
            id: `shark-reject-${day}-${Date.now()}`,
            sender: 'Loan Shark',
            text: `You're short. Come back when you got all of it. $${(sharkDebt / 100).toLocaleString()} — not a penny less.`,
            day,
          };
          set({
            threads: {
              ...threads,
              'Loan Shark': {
                ...threads['Loan Shark'],
                messages: [rejectMsg, ...threads['Loan Shark'].messages],
              },
            },
          });
          return;
        }
        const paidMsg = {
          id: `shark-repay-${day}-${Date.now()}`,
          sender: 'Loan Shark',
          text: `Smart move. Debt cleared. Don't come crawling back.`,
          day,
        };
        set({
          cash: cash - sharkDebt,
          sharkDebt: 0,
          threads: {
            ...threads,
            'Loan Shark': {
              ...threads['Loan Shark'],
              messages: [paidMsg, ...threads['Loan Shark'].messages],
            },
          },
        });
      },

      borrowFromShark: (amount) => {
        const { cash, sharkDebt, threads, day } = get();
        const netWorth = get().getNetWorth();
        if (sharkDebt + amount > netWorth + 10000000) return;
        playBorrow();
        const confirmMsg = {
          id: `shark-borrow-${day}-${Date.now()}`,
          sender: 'Loan Shark',
          text: `Done. $${(amount / 100).toLocaleString()} wired. Don't be late.`,
          day,
        };
        set({
          cash: cash + amount,
          sharkDebt: sharkDebt + amount,
          threads: {
            ...threads,
            'Loan Shark': {
              ...threads['Loan Shark'],
              messages: [confirmMsg, ...threads['Loan Shark'].messages],
            },
          },
        });
      },

      processEvents: () => {
        const { day, eventQueue, threads, forumPosts } = get();
        const currentEvents = eventQueue.filter((e) => e.day === day);
        
        if (currentEvents.length === 0) return { newThreads: threads, newForumPosts: forumPosts };

        const newThreads = { ...threads };
        const newForumPosts = [...forumPosts];

        currentEvents.forEach((event) => {
          if (event.type === 'MESSAGE' || event.type === 'GURU') {
            const sender = event.payload.sender;
            if (!newThreads[sender]) {
              newThreads[sender] = {
                contactName: sender,
                avatar: '👤',
                lastReadDay: day - 1,
                messages: [],
              };
            }
            newThreads[sender].messages = [
              { ...event.payload, day: event.day },
              ...newThreads[sender].messages,
            ];
          } else if (event.type === 'POST') {
            newForumPosts.unshift(event.payload);
          }
        });

        return { newThreads, newForumPosts };
      },

      advanceDay: () => {
        const { turn, day, stocks, eventQueue, cash, holdings, optionsHoldings, karma, triggerFlash, addPopup, processEvents, getNetWorth, guruPrediction } = get();

        const prevNetWorth = getNetWorth();

        const SHARK_INTEREST_RATE = 0.20;
        const currentDebt = get().sharkDebt;
        const newDebt = currentDebt > 0 ? Math.round(currentDebt * (1 + SHARK_INTEREST_RATE)) : 0;

        if (day >= 10) {
          // All options expire worthless on Day 11 regardless of ITM/OTM status — sell before end or lose it all
          const optionPayouts = 0;

          const stockValue = (Object.keys(holdings) as StockTicker[]).reduce((total, ticker) => {
            return total + (stocks[ticker].currentPrice * holdings[ticker]);
          }, 0);

          const settledNetWorth = cash + optionPayouts + stockValue - newDebt;

          // Compute peakOpportunityCost lazily from trade history using final settled prices
          const allTradeHistory = get().tradeHistory;

          // Stock SELL entries: compute per-ticker cumulative (all sells of same ticker) then take max across tickers
          const peakFromStocks = (Object.keys(stocks) as StockTicker[]).reduce((peak, ticker) => {
            const finalPrice = stocks[ticker].currentPrice; // stocks already at settled state here
            const tickerSells = allTradeHistory.filter(t => t.type === 'SELL' && t.ticker === ticker);
            const hypotheticalValue = tickerSells.reduce((sum, t) => sum + (finalPrice * t.amount), 0);
            return Math.max(peak, hypotheticalValue);
          }, 0);

          // Option OPTION_SELL entries: use t.totalValue as conservative proxy (strike not stored in TradeEntry)
          const peakFromOptions = allTradeHistory
            .filter(t => t.type === 'OPTION_SELL')
            .reduce((peak, t) => {
              return Math.max(peak, t.totalValue);
            }, 0);

          const computedPeakOpportunityCost = Math.max(peakFromStocks, peakFromOptions);

          // 10-ending priority cascade — all thresholds in CENTS (dollar amounts × 100)
          const BEHAVIOR_WEALTH_CEILING = 10000000; // $100,000 in cents
          const PAPER_HANDS_OPP_THRESHOLD = 100000000; // $1,000,000 in cents

          // Premium paid for options still held at game end (all expire worthless)
          const premiumLostToOptions = optionsHoldings.reduce((sum, o) => sum + o.premiumPaid, 0);
          // "Lost over half your money to expired options" = premium lost > remaining net worth
          const lostHalfToExpiredOptions = optionsHoldings.length > 0 && premiumLostToOptions > settledNetWorth;

          let ending: EndingType;

          // Priority order: DEBT_SPIRAL > EXPIRED_WORTHLESS > wealth endings > PAPER_HANDS
          if (newDebt > settledNetWorth) {
            ending = 'DEBT_SPIRAL';
          } else if (lostHalfToExpiredOptions) {
            ending = 'EXPIRED_WORTHLESS';
          } else if (settledNetWorth <= BEHAVIOR_WEALTH_CEILING) {
            if (settledNetWorth < BEHAVIOR_WEALTH_CEILING && computedPeakOpportunityCost >= PAPER_HANDS_OPP_THRESHOLD) {
              ending = 'PAPER_HANDS';
            } else if (settledNetWorth <= 8000000) {
              // ≤ $80,000
              ending = 'MENDYS';
            } else {
              // $80k–$100k (inclusive of BEHAVIOR_WEALTH_CEILING boundary)
              ending = 'BREAK_EVEN';
            }
          } else {
            // Player is above $100k — wealth bracket endings
            if (settledNetWorth < 12000000) {
              // $100k–$120k → BREAK_EVEN
              ending = 'BREAK_EVEN';
            } else if (settledNetWorth < 30000000) {
              // $120k–$300k → SMALL_WINS
              ending = 'SMALL_WINS';
            } else if (settledNetWorth < 100000000) {
              // $300k–$1M → TENDIES
              ending = 'TENDIES';
            } else if (settledNetWorth < 1000000000) {
              // $1M–$10M → TO_THE_MOON
              ending = 'TO_THE_MOON';
            } else if (settledNetWorth < 10000000000) {
              // $10M–$100M → HEDGE_FUND_DARLING
              ending = 'HEDGE_FUND_DARLING';
            } else if (settledNetWorth < 100000000000) {
              // $100M–$1B → WOLF_OF_WALL_STREET
              ending = 'WOLF_OF_WALL_STREET';
            } else {
              // $1B+ → PRIVATE_ISLAND
              ending = 'PRIVATE_ISLAND';
            }
          }

          set({
            gameStatus: 'ended',
            endingType: ending,
            finalNetWorth: settledNetWorth,
            peakOpportunityCost: computedPeakOpportunityCost,
            sharkDebt: newDebt,
          });
          return;
        }

        const nextTurnNum = turn + 1;
        const nextDayNum = day + 1;
        const nextStocks = { ...stocks };

        (Object.keys(nextStocks) as StockTicker[]).forEach((ticker) => {
          const stock = nextStocks[ticker];
          const baseIv = INITIAL_STOCKS[ticker].iv;
          let nextIv = stock.iv;

          // IV Dynamics: Anticipation spikes and post-event crush
          const futureShift = eventQueue.find(e => 
            e.type === 'SHIFT' && 
            e.payload.ticker === ticker && 
            (e.day === nextDayNum + 1 || e.day === nextDayNum + 2)
          );
          
          const currentShift = eventQueue.find(e => 
            e.type === 'SHIFT' && 
            e.payload.ticker === ticker && 
            e.day === nextDayNum
          );

          if (currentShift) {
            nextIv = baseIv; // IV Crush immediately when the event hits
          } else if (futureShift) {
            nextIv += 1.0; // IV Spike (market anticipation)
          } else {
            nextIv = Math.max(baseIv, nextIv * 0.9); // Slow decay towards base IV
          }

          const { minVol, maxVol } = INITIAL_STOCKS[ticker];
          const volatility = Math.random() * (maxVol - minVol) + minVol;
          const direction = Math.random() > 0.5 ? 1 : -1;
          const change = 1 + (volatility * direction);
          let nextPrice = Math.round(stock.currentPrice * change);
          if (nextPrice < 1) nextPrice = 1;
          
          nextStocks[ticker] = { ...stock, currentPrice: nextPrice, iv: nextIv };
        });

        const shifts = eventQueue.filter(e => e.day === nextDayNum && e.type === 'SHIFT');
        shifts.forEach(event => {
          const { ticker, delta } = event.payload;
          if (nextStocks[ticker as StockTicker]) {
            nextStocks[ticker as StockTicker].currentPrice = Math.round(nextStocks[ticker as StockTicker].currentPrice * delta);
            addPopup('HUGE MOVE!', 'positive');
          }
        });

        let settlementCash = 0;
        const expiringOptions = optionsHoldings.filter(o => o.expiryDay === nextDayNum);
        const remainingOptions = optionsHoldings.filter(o => o.expiryDay !== nextDayNum);
        const newTradeEntries: any[] = [];

        expiringOptions.forEach(option => {
          const finalPrice = nextStocks[option.ticker].currentPrice;
          let payoff = 0;
          if (option.type === 'CALL') payoff = Math.max(0, Math.floor(finalPrice - option.strikePrice)) * option.amount;
          else payoff = Math.max(0, Math.floor(option.strikePrice - finalPrice)) * option.amount;

          const realizedPL = payoff - option.premiumPaid;

          newTradeEntries.push({
            id: Math.random().toString(36).substring(7),
            type: 'OPTION_EXPIRY' as const,
            ticker: option.ticker,
            amount: option.amount,
            price: payoff / option.amount,
            totalValue: payoff,
            day: nextDayNum,
            realizedPL,
          });

          if (payoff > 0) {
            settlementCash += payoff;
            triggerFlash('positive');
            addPopup(`WINNER! ${option.ticker} ${option.type} PAYOUT: $${(payoff/100).toFixed(2)}`, 'positive');
          } else {
            triggerFlash('negative');
            addPopup(`${option.ticker} ${option.type} EXPIRED WORTHLESS`, 'negative');
          }
        });

        const nextCash = cash + settlementCash;

        (Object.keys(nextStocks) as StockTicker[]).forEach((ticker) => {
          nextStocks[ticker] = {
            ...nextStocks[ticker],
            history: [...nextStocks[ticker].history, { turn: nextTurnNum, price: nextStocks[ticker].currentPrice }],
          };
        });

        const stockValue = (Object.keys(holdings) as StockTicker[]).reduce((total, ticker) => {
          return total + (nextStocks[ticker].currentPrice * holdings[ticker]);
        }, 0);
        
        const optionsValue = remainingOptions.reduce((total, option) => {
          const stock = nextStocks[option.ticker];
          const dteRemaining = Math.max(0, option.expiryDay - nextDayNum);
          const tRemaining = Math.max(0.0001, dteRemaining / 252);
          const marketValue = calculateOptionPrice(stock.currentPrice, option.strikePrice, option.type, scaledIV(stock.iv, dteRemaining), tRemaining);
          return total + (marketValue * option.amount);
        }, 0);

        const netWorth = nextCash + stockValue + optionsValue - newDebt;
        let newKarma = karma;

        const { newThreads, newForumPosts } = processEvents();

        // 6. Generate Dynamic Social Content for the NEXT turn
        const tickers: StockTicker[] = ['$GAME', '$POPC', '$APE'];
        const getRandomTicker = () => tickers[Math.floor(Math.random() * tickers.length)];

        // GURU LOGIC
        let wasGuruCorrect = null;
        if (guruPrediction) {
          const actualPrice = nextStocks[guruPrediction.ticker].currentPrice;
          const prevPriceAtPrediction = stocks[guruPrediction.ticker].currentPrice;
          const actuallyMooned = actualPrice > prevPriceAtPrediction;
          wasGuruCorrect = guruPrediction.sentiment === 'BULLISH' ? actuallyMooned : !actuallyMooned;
        }

        const guruTier: PerformanceTier = wasGuruCorrect === true ? 'POSITIVE' : wasGuruCorrect === false ? 'NEGATIVE' : 'NEUTRAL';
        const guruCommentary = getRandomTemplate('GURU', guruTier);

        const predictionTicker = getRandomTicker();
        const prevTPrice = stocks[predictionTicker].currentPrice;
        const nextTPrice = nextStocks[predictionTicker].currentPrice;
        const priceMovePercent = prevTPrice > 0 ? (nextTPrice - prevTPrice) / prevTPrice : 0;
        const guruDirection: GuruSentimentDir = priceMovePercent >= 0.05 ? 'UP' : priceMovePercent <= -0.05 ? 'DOWN' : 'FLAT';
        const sentiment: 'BULLISH' | 'BEARISH' = guruDirection === 'DOWN' ? 'BEARISH' : 'BULLISH';
        const predictionText = getGuruVideoMessage(predictionTicker, guruDirection);

        const guruMessage = { 
          id: `guru-${nextTurnNum}`, 
          sender: 'Crypto Guru', 
          text: `${guruCommentary} ${predictionText}`,
          day: nextDayNum
        };

        if (newThreads['Crypto Guru']) {
          newThreads['Crypto Guru'].messages = [guruMessage, ...newThreads['Crypto Guru'].messages];
        }

        // Scheduled messages — delivered mid-session via tickMarket instead of at day start
        const newScheduledMessages: ScheduledMessage[] = [];

        // WIFE SENTIMENT — scheduled for random market-hours time (9:30am–4pm = 570–959)
        // Pass absolute netWorth to support the 14-tier bracket system
        // The getRandomTemplate function will handle the range logic internally
        const wifeText = getRandomTemplate('WIFE', 'NEUTRAL', { netWorth: String(netWorth) });

        const wifeMessage = {
          id: `wife-day-${nextDayNum}`,
          sender: 'Wife',
          text: wifeText,
          day: nextDayNum
        };

        const wifeDeliverAt = 570 + Math.floor(Math.random() * 390);
        newScheduledMessages.push({
          message: wifeMessage,
          deliverAt: wifeDeliverAt,
          delivered: false,
        });

        // LOAN SHARK THREAT
        if (newDebt > 0) {
          const currentNetWorth = nextCash + stockValue + optionsValue - newDebt;
          const debtRatio = currentNetWorth > 0 ? newDebt / currentNetWorth : 999;
          const sharkText = pickSharkMessage(debtRatio, newDebt);
          const sharkMsg = {
            id: `shark-${nextDayNum}`,
            sender: 'Loan Shark',
            text: sharkText,
            day: nextDayNum,
          };
          if (newThreads['Loan Shark']) {
            newThreads['Loan Shark'].messages = [sharkMsg, ...newThreads['Loan Shark'].messages];
          }
        }

        // --- ADDITIONAL MESSAGES (Plan 10-03) ---
        const potentialContacts: { name: string; avatar: string; category: any }[] = [
          { name: 'Ape Friend', avatar: '🦍', category: 'APES' },
          { name: 'Brokerage', avatar: '🏛️', category: 'BROKERAGE' },
          { name: "Wife's Boyfriend", avatar: '😎', category: 'APES' },
          { name: 'IRS Auditor', avatar: '💼', category: 'IRS' },
          { name: 'Lamborghini Dealership', avatar: '🏎️', category: 'LAMBO' },
          { name: 'Unknown Stalker', avatar: '👤', category: 'STALKER' },
          { name: 'Ex-Coworker', avatar: '👨‍💼', category: 'COWORKER' },
        ];

        // Determine how many extra messages (0 to 2, for a total of 2 to 4)
        const extraCount = Math.floor(Math.random() * 3); // 0, 1, or 2
        const shuffled = potentialContacts.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, extraCount);

        selected.forEach((contact) => {
          const nwRatio = prevNetWorth > 0 ? netWorth / prevNetWorth : 1;
          const contactTier: PerformanceTier = nwRatio > 1.5 ? 'POSITIVE' : nwRatio < 0.5 ? 'NEGATIVE' : 'NEUTRAL';
          const text = getRandomTemplate(contact.category, contactTier, { ticker: getRandomTicker() });

          // Create thread entry so tickMarket delivery can find it, but don't push message now
          if (!newThreads[contact.name]) {
            newThreads[contact.name] = {
              contactName: contact.name,
              avatar: contact.avatar,
              lastReadDay: day, // Mark as new (day before nextDayNum)
              messages: [],
            };
          }

          // Schedule message for random mid-session delivery (9:30am–4pm = 570–959)
          const contactDeliverAt = 570 + Math.floor(Math.random() * 390);
          newScheduledMessages.push({
            message: { id: `contact-${contact.name}-${nextDayNum}`, sender: contact.name, text, day: nextDayNum },
            deliverAt: contactDeliverAt,
            delivered: false,
          });
        });

        // FORUM
        const dailyForumPosts: any[] = [];
        const users = ['ApeLord', 'DiamondHands420', 'StonkMaster', 'TendieKing', 'BagHolder99', 'MoonMission', 'CramerInverse', 'PaperHandsLarry', 'YOLO_God', 'DeepValueHunter', 'StonkEnthusiast', 'LossPornConnoisseur'];

        for (let i = 0; i < 5; i++) {
          const postTicker = getRandomTicker();
          const pNextStock = nextStocks[postTicker];
          const pPrevPrice = stocks[postTicker].currentPrice;
          const pTier: PerformanceTier = pNextStock.currentPrice > pPrevPrice ? 'POSITIVE' : pNextStock.currentPrice < pPrevPrice ? 'NEGATIVE' : 'NEUTRAL';

          dailyForumPosts.push({
            id: `forum-${nextTurnNum}-${i}`,
            user: users[Math.floor(Math.random() * users.length)],
            title: getRandomTemplate('APES', pTier, { ticker: postTicker }),
            upvotes: Math.floor(Math.random() * 5000) + 100,
          });
        }

        if (prevNetWorth > 0) {
          const change = (netWorth - prevNetWorth) / prevNetWorth;
          if (change > 0.5) {
            dailyForumPosts.push({ id: `tendies-${nextDayNum}`, user: 'YOU', title: 'TENDIES SECURED! 🍗 LFG!!', upvotes: Math.floor(Math.random() * 50000) + 10000 });
            addPopup('TENDIES SECURED!', 'positive');
          } else if (change < -0.3) {
            dailyForumPosts.push({ id: `loss-${nextDayNum}`, user: 'YOU', title: 'GUH. Lost 30% today. Am I doing it right?', upvotes: Math.floor(Math.random() * 80000) + 20000 });
            addPopup('LOSS PORN!', 'negative');
          }
        }

        if (netWorth <= 0) {
          newKarma += 10000;
          addPopup('LOSS PORN: LEGENDARY STATUS', 'negative', 50, 40);
          dailyForumPosts.push({ id: `lp-${nextDayNum}`, user: 'YOU', title: 'I LOST EVERYTHING. AM I A LEGEND YET?', upvotes: 99999 });
        }

        set((state) => ({
          turn: nextTurnNum,
          day: nextDayNum,
          currentDay: nextDayNum,
          cash: nextCash,
          stocks: nextStocks,
          optionsHoldings: remainingOptions,
          karma: newKarma,
          threads: newThreads,
          sharkDebt: newDebt,
          forumPosts: [...dailyForumPosts, ...newForumPosts],
          netWorthHistory: [...state.netWorthHistory, { turn: nextTurnNum, value: netWorth }],
          tradeHistory: [...newTradeEntries, ...state.tradeHistory],
          guruPrediction: {
            ticker: predictionTicker,
            sentiment,
            day: nextDayNum,
            wasCorrect: wasGuruCorrect
          },
          // Reset intraday market state for the new day
          marketTime: 480,       // 8:00am — pre-market window before 9:30am open
          marketIsOpen: false,   // market starts closed; useMarketClock opens it
          intradayBars: {},
          netWorthBars: [],
          activeEvents: [],
          scheduledEvents: seedDayEvents(nextDayNum),
          netWorthTriggerFiredToday: false,
          pendingMessages: newScheduledMessages,
        }));
        
        triggerFlash('neutral');
        addPopup('NEXT DAY', 'neutral');
      },
    }),
    {
      name: 'wsb-trader-save',
      storage: createJSONStorage(() => localStorage),
      version: 2,
      migrate: (persistedState: any, version: number) => {
        let state = persistedState as any;
        if (version === 0) {
          const { hype, nextTurn, ...rest } = state;
          state = rest;
        }
        if (version < 2) {
          // Seed scheduledEvents for the current day if missing or empty
          const day = state.currentDay ?? state.day ?? 1;
          if (!state.scheduledEvents || state.scheduledEvents.length === 0) {
            state = { ...state, scheduledEvents: seedDayEvents(day) };
          }
        }
        return state;
      },
      partialize: (state) => {
        const { lastFlash, popups, intradayBars, netWorthBars,
                pendingMessages, activeEvents, scheduledEvents, marketTime, marketIsOpen,
                bigGainTicker, bigLossTicker, netWorthTriggerFiredToday, ...rest } = state;
        return rest;
      },
    }
  )
);
