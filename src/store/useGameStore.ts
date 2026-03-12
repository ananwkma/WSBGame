import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { GameStore, StockTicker, GameEvent, EndingType, StockData } from './types';
import { generateHistoricalData, calculateBS, scaledIV } from '../utils/marketUtils';
import { getRandomTemplate, getRandomPrediction, pickSharkMessage } from '../data/messageTemplates';
import type { PerformanceTier } from '../data/messageTemplates';

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
        { id: 'shark-intro', sender: 'Loan Shark', text: "Heard you been losing big. I got cash, no questions asked. Fast. Easy. Hit me up.", day: 1 }
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
    hype: 0,
    karma: 0,
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
        const { cash, stocks, holdings, costBasis, tradeHistory, day, hype, triggerFlash, addPopup } = get();
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

          // Buying increases hype
          const newHype = Math.min(100, hype + 5);

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
            hype: newHype,
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
        const { cash, stocks, day, hype, triggerFlash, addPopup } = get();
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

          const newHype = Math.min(100, hype + 8); // Options are more hype

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
              hype: newHype,
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
            id: `shark-reject-${day}`,
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
          id: `shark-repay-${day}`,
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
        if (sharkDebt + amount > netWorth) return;
        const confirmMsg = {
          id: `shark-borrow-${day}`,
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

      nextTurn: () => {
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

        // --- HYPE LOGIC ---
        let newHype = get().hype;
        if (prevNetWorth > 0) {
          const nwChange = Math.abs((netWorth - prevNetWorth) / prevNetWorth);
          // High volatility in net worth increases hype
          if (nwChange > 0.1) newHype += Math.min(20, Math.floor(nwChange * 50));
        }
        // Daily decay
        newHype = Math.max(0, newHype - 10);
        if (newHype > 100) newHype = 100;

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
        const sentiment = Math.random() > 0.5 ? 'BULLISH' : 'BEARISH';
        const predictionText = getRandomPrediction(sentiment, predictionTicker);

        const guruMessage = { 
          id: `guru-${nextTurnNum}`, 
          sender: 'Crypto Guru', 
          text: `${guruCommentary} ${predictionText}`,
          day: nextDayNum
        };

        if (newThreads['Crypto Guru']) {
          newThreads['Crypto Guru'].messages = [guruMessage, ...newThreads['Crypto Guru'].messages];
        }

        // WIFE SENTIMENT
        // Pass absolute netWorth to support the 14-tier bracket system
        // The getRandomTemplate function will handle the range logic internally
        const wifeText = getRandomTemplate('WIFE', 'NEUTRAL', { netWorth: String(netWorth) });

        const wifeMessage = {
          id: `wife-day-${nextDayNum}`,
          sender: 'Wife',
          text: wifeText,
          day: nextDayNum
        };

        if (newThreads['Wife']) {
          newThreads['Wife'].messages = [wifeMessage, ...newThreads['Wife'].messages];
        }

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
          
          if (!newThreads[contact.name]) {
            newThreads[contact.name] = {
              contactName: contact.name,
              avatar: contact.avatar,
              lastReadDay: day, // Mark as new (day before nextDayNum)
              messages: [],
            };
          }

          newThreads[contact.name].messages = [
            { id: `${contact.name.toLowerCase()}-${nextDayNum}`, sender: contact.name, text, day: nextDayNum },
            ...newThreads[contact.name].messages,
          ];
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
          addPopup('LOSS PORN: LEGENDARY STATUS', 'positive', 50, 40);
          dailyForumPosts.push({ id: `lp-${nextDayNum}`, user: 'YOU', title: 'I LOST EVERYTHING. AM I A LEGEND YET?', upvotes: 99999 });
        }

        set((state) => ({
          turn: nextTurnNum,
          day: nextDayNum,
          cash: nextCash,
          stocks: nextStocks,
          optionsHoldings: remainingOptions,
          karma: newKarma,
          hype: newHype,
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
          }
        }));
        
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
