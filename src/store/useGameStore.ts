import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { GameStore, StockTicker, GameEvent, EndingType, StockData } from './types';
import { generateHistoricalData } from '../utils/marketUtils';

const INITIAL_EVENTS: GameEvent[] = [
// ... (rest of INITIAL_EVENTS)
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

const INITIAL_STOCKS: Record<StockTicker, { price: number }> = {
  '$GAME': { price: 10000 },
  '$POPC': { price: 5000 },
  '$APE': { price: 2500 },
};

// --- FINANCIAL UTILITIES ---

export const calculateDelta = (price: number, strike: number, type: 'CALL' | 'PUT') => {
  const moneyness = (price - strike) / (strike * 0.2);
  const delta = 1 / (1 + Math.exp(-2 * moneyness));
  return type === 'CALL' ? delta : delta - 1;
};

export const calculateGamma = (price: number, strike: number) => {
  const moneyness = (price - strike) / (strike * 0.2);
  const delta = 1 / (1 + Math.exp(-2 * moneyness));
  const pdf = delta * (1 - delta);
  return (pdf * 2) / (strike * 0.2);
};

export const calculateTheta = (price: number, strike: number) => {
  const moneyness = (price - strike) / (strike * 0.2);
  const extrinsic = Math.exp(-Math.pow(moneyness, 2) * 2) * (strike * 0.05);
  return -extrinsic; // Decay per day
};

export const calculateOptionPrice = (price: number, strike: number, type: 'CALL' | 'PUT') => {
  const intrinsic = type === 'CALL' ? Math.max(0, price - strike) : Math.max(0, strike - price);
  const moneyness = (price - strike) / (strike * 0.2);
  const extrinsic = Math.exp(-Math.pow(moneyness, 2) * 2) * (strike * 0.05);
  return Math.max(1, Math.floor(intrinsic + extrinsic));
};

export const generateOptionsChain = (ticker: StockTicker, currentPrice: number) => {
  const strikes = [
    Math.round(currentPrice * 0.9),
    Math.round(currentPrice * 1.0),
    Math.round(currentPrice * 1.1),
  ];

  return strikes.flatMap((strike) => {
    const callPrice = calculateOptionPrice(currentPrice, strike, 'CALL');
    const callGreeks = {
      delta: calculateDelta(currentPrice, strike, 'CALL'),
      gamma: calculateGamma(currentPrice, strike),
      theta: calculateTheta(currentPrice, strike),
    };

    const putPrice = calculateOptionPrice(currentPrice, strike, 'PUT');
    const putGreeks = {
      delta: calculateDelta(currentPrice, strike, 'PUT'),
      gamma: calculateGamma(currentPrice, strike),
      theta: calculateTheta(currentPrice, strike),
    };

    return [
      { ticker, type: 'CALL' as const, strikePrice: strike, premium: callPrice, ...callGreeks },
      { ticker, type: 'PUT' as const, strikePrice: strike, premium: putPrice, ...putGreeks },
    ];
  });
};

const getInitialState = () => ({
  cash: 10000000, // $100,000.00
  turn: 1,
  day: 1,
  hype: 0,
  karma: 0,
  messages: INITIAL_EVENTS.filter(e => e.day === 1 && (e.type === 'MESSAGE' || e.type === 'GURU')).map(e => e.payload),
  forumPosts: INITIAL_EVENTS.filter(e => e.day === 1 && e.type === 'POST').map(e => e.payload),
  eventQueue: INITIAL_EVENTS,
  holdings: {
    '$GAME': 0,
    '$POPC': 0,
    '$APE': 0,
  } as Record<StockTicker, number>,
  optionsHoldings: [] as any[],
  stocks: {
    '$GAME': {
      ticker: '$GAME',
      currentPrice: INITIAL_STOCKS['$GAME'].price,
      history: generateHistoricalData(INITIAL_STOCKS['$GAME'].price, 20).map(p => ({ ...p, turn: p.turn + 1 })),
    },
    '$POPC': {
      ticker: '$POPC',
      currentPrice: INITIAL_STOCKS['$POPC'].price,
      history: generateHistoricalData(INITIAL_STOCKS['$POPC'].price, 20).map(p => ({ ...p, turn: p.turn + 1 })),
    },
    '$APE': {
      ticker: '$APE',
      currentPrice: INITIAL_STOCKS['$APE'].price,
      history: generateHistoricalData(INITIAL_STOCKS['$APE'].price, 20).map(p => ({ ...p, turn: p.turn + 1 })),
    },
  } as Record<StockTicker, StockData>,
  gameStatus: 'playing' as const,
  endingType: null as EndingType | null,
  lastFlash: null as { type: any; timestamp: number } | null,
  popups: [] as any[],
  netWorthHistory: [{ turn: 1, value: 10000000 }],
});

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      ...getInitialState(),

      // --- ACTIONS ---
      resetGame: () => {
        set(getInitialState());
        localStorage.removeItem('wsb-trader-save');
      },

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
        const { cash, stocks, holdings, triggerFlash, addPopup } = get();
        const cost = stocks[ticker].currentPrice * amount;

        if (cash >= cost) {
          set({
            cash: cash - cost,
            holdings: {
              ...holdings,
              [ticker]: holdings[ticker] + amount,
            },
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
        const premiumPerUnit = calculateOptionPrice(stocks[ticker].currentPrice, strikePrice, type);
        const totalCost = premiumPerUnit * amount;

        if (cash >= totalCost) {
          const newOption = {
            id: Math.random().toString(36).substring(7),
            ticker,
            type,
            strikePrice,
            amount,
            expiryDay: day + 1,
            ...greeks,
          };

          set((state) => ({
            cash: state.cash - totalCost,
            optionsHoldings: [...state.optionsHoldings, newOption],
          }));

          triggerFlash('positive');
          addPopup(`${type} OPTION BOUGHT!`, 'positive');
        } else {
          triggerFlash('negative');
          addPopup('NOT ENOUGH CASH FOR PREMIUM', 'negative');
        }
      },

      getNetWorth: () => {
        const { cash, holdings, stocks, optionsHoldings } = get();
        const stockValue = (Object.keys(holdings) as StockTicker[]).reduce((total, ticker) => {
          return total + (stocks[ticker].currentPrice * holdings[ticker]);
        }, 0);
        
        const optionsValue = optionsHoldings.reduce((total, option) => {
          const currentPrice = stocks[option.ticker].currentPrice;
          const marketValue = calculateOptionPrice(currentPrice, option.strikePrice, option.type);
          return total + (marketValue * option.amount);
        }, 0);

        return cash + stockValue + optionsValue;
      },

      sellStock: (ticker, amount) => {
        const { cash, stocks, holdings, triggerFlash, addPopup } = get();
        
        if (holdings[ticker] >= amount) {
          const revenue = stocks[ticker].currentPrice * amount;
          set({
            cash: cash + revenue,
            holdings: {
              ...holdings,
              [ticker]: holdings[ticker] - amount,
            },
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

      processEvents: () => {
        const { day, eventQueue, messages, forumPosts } = get();
        const currentEvents = eventQueue.filter((e) => e.day === day);
        
        if (currentEvents.length === 0) return;

        const newMessages = [...messages];
        const newForumPosts = [...forumPosts];

        currentEvents.forEach((event) => {
          if (event.type === 'MESSAGE' || event.type === 'GURU') {
            newMessages.unshift(event.payload);
          } else if (event.type === 'POST') {
            newForumPosts.unshift(event.payload);
          }
        });

        set({
          messages: newMessages,
          forumPosts: newForumPosts,
        });
      },

      nextTurn: () => {
        const { turn, day, stocks, eventQueue, cash, holdings, optionsHoldings, karma, triggerFlash, addPopup, processEvents, getNetWorth } = get();
        
        // Calculate prevNetWorth for social triggers
        const prevNetWorth = getNetWorth();

        // End game check
        if (day >= 10) {
          const finalNetWorth = getNetWorth();

          let ending: EndingType = 'MENDYS';
          if (finalNetWorth >= 100000000) { // $1M
            ending = 'MOON';
          } else if (karma >= 50000 || finalNetWorth <= 0) {
            ending = 'LEGEND';
          }

          set({ 
            gameStatus: 'ended',
            endingType: ending
          });
          return;
        }

        const nextTurnNum = turn + 1;
        const nextDayNum = day + 1;
        const nextStocks = { ...stocks };

        // 1. Regular market movement
        (Object.keys(nextStocks) as StockTicker[]).forEach((ticker) => {
          const stock = nextStocks[ticker];
          const volatility = Math.random() * 0.4 + 0.1; // 10% to 50%
          const direction = Math.random() > 0.5 ? 1 : -1;
          const change = 1 + (volatility * direction);
          
          let nextPrice = Math.round(stock.currentPrice * change);
          if (nextPrice < 1) nextPrice = 1;
          
          nextStocks[ticker] = {
            ...stock,
            currentPrice: nextPrice,
          };
        });

        // 2. Narrative SHIFT events for the new day
        const shifts = eventQueue.filter(e => e.day === nextDayNum && e.type === 'SHIFT');
        shifts.forEach(event => {
          const { ticker, delta } = event.payload;
          if (nextStocks[ticker as StockTicker]) {
            nextStocks[ticker as StockTicker].currentPrice = Math.round(nextStocks[ticker as StockTicker].currentPrice * delta);
            addPopup('HUGE MOVE!', 'positive');
          }
        });

        // 3. Options Settlement
        let settlementCash = 0;
        const expiringOptions = optionsHoldings.filter(o => o.expiryDay === nextDayNum);
        const remainingOptions = optionsHoldings.filter(o => o.expiryDay !== nextDayNum);

        expiringOptions.forEach(option => {
          const finalPrice = nextStocks[option.ticker].currentPrice;
          let payoff = 0;
          if (option.type === 'CALL') {
            payoff = Math.max(0, Math.floor(finalPrice - option.strikePrice)) * option.amount;
          } else {
            payoff = Math.max(0, Math.floor(option.strikePrice - finalPrice)) * option.amount;
          }

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

        // 4. Update history
        (Object.keys(nextStocks) as StockTicker[]).forEach((ticker) => {
          nextStocks[ticker] = {
            ...nextStocks[ticker],
            history: [...nextStocks[ticker].history, { turn: nextTurnNum, price: nextStocks[ticker].currentPrice }],
          };
        });

        // 5. Calculate Net Worth for Social Triggers & History
        const stockValue = (Object.keys(holdings) as StockTicker[]).reduce((total, ticker) => {
          return total + (nextStocks[ticker].currentPrice * holdings[ticker]);
        }, 0);
        
        const optionsValue = remainingOptions.reduce((total, option) => {
          const currentPrice = nextStocks[option.ticker].currentPrice;
          const marketValue = calculateOptionPrice(currentPrice, option.strikePrice, option.type);
          return total + (marketValue * option.amount);
        }, 0);

        const netWorth = nextCash + stockValue + optionsValue;

        let newKarma = karma;
        let extraForumPosts: any[] = [];

        // Dynamic Social Triggers
        if (prevNetWorth > 0) {
          const change = (netWorth - prevNetWorth) / prevNetWorth;
          if (change > 0.5) {
            extraForumPosts.push({
              id: `tendies-${nextDayNum}`,
              user: 'YOU',
              title: 'TENDIES SECURED! 🍗 LFG!!',
              upvotes: Math.floor(Math.random() * 50000) + 10000,
            });
            addPopup('TENDIES SECURED!', 'positive');
          } else if (change < -0.3) {
            extraForumPosts.push({
              id: `loss-${nextDayNum}`,
              user: 'YOU',
              title: 'GUH. Lost 30% today. Am I doing it right?',
              upvotes: Math.floor(Math.random() * 80000) + 20000,
            });
            addPopup('LOSS PORN!', 'negative');
          }
        }

        if (netWorth <= 0) {
          newKarma += 10000;
          addPopup('LOSS PORN: LEGENDARY STATUS', 'positive', 50, 40);
          extraForumPosts.push({
            id: `lp-${nextDayNum}`,
            user: 'YOU',
            title: 'I LOST EVERYTHING. AM I A LEGEND YET?',
            upvotes: 99999,
          });
        }

        set((state) => ({
          turn: nextTurnNum,
          day: nextDayNum,
          cash: nextCash,
          stocks: nextStocks,
          optionsHoldings: remainingOptions,
          karma: newKarma,
          forumPosts: [...extraForumPosts, ...state.forumPosts],
          netWorthHistory: [...state.netWorthHistory, { turn: nextTurnNum, value: netWorth }],
        }));
        
        processEvents();
        triggerFlash('neutral');
        addPopup('NEXT DAY', 'neutral');
      },
    }),
    {
      name: 'wsb-trader-save',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => {
        const { lastFlash, popups, ...rest } = state;
        return rest;
      },
    }
  )
);

