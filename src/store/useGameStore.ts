import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { GameStore, StockTicker, GameEvent, EndingType, StockData } from './types';
import { generateHistoricalData, calculateBS } from '../utils/marketUtils';

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

const INITIAL_STOCKS: Record<StockTicker, { price: number, iv: number }> = {
  '$GAME': { price: 10000, iv: 1.5 },
  '$POPC': { price: 5000, iv: 0.8 },
  '$APE': { price: 2500, iv: 3.0 },
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

export const generateOptionsChain = (ticker: StockTicker, currentPrice: number, iv: number, heldOptions: any[] = []) => {
  const roundTo = 500; // $5.00 increments
  const t = 3/252; // Options in the chain are 3DTE by default
  
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
    const callBS = calculateBS('CALL', currentPrice, strike, t, iv);
    const callPrice = callBS.price;
    const callGreeks = {
      delta: callBS.delta,
      gamma: callBS.gamma,
      theta: callBS.theta,
      vega: callBS.vega,
    };

    const putBS = calculateBS('PUT', currentPrice, strike, t, iv);
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
    turn: 1,
    day: 1,
    hype: 0,
    karma: 0,
    threads: initialThreads,
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
        iv: INITIAL_STOCKS['$GAME'].iv,
        history: generateHistoricalData(INITIAL_STOCKS['$GAME'].price, 20).map(p => ({ ...p, turn: p.turn + 1 })),
      },
      '$POPC': {
        ticker: '$POPC',
        currentPrice: INITIAL_STOCKS['$POPC'].price,
        iv: INITIAL_STOCKS['$POPC'].iv,
        history: generateHistoricalData(INITIAL_STOCKS['$POPC'].price, 20).map(p => ({ ...p, turn: p.turn + 1 })),
      },
      '$APE': {
        ticker: '$APE',
        currentPrice: INITIAL_STOCKS['$APE'].price,
        iv: INITIAL_STOCKS['$APE'].iv,
        history: generateHistoricalData(INITIAL_STOCKS['$APE'].price, 20).map(p => ({ ...p, turn: p.turn + 1 })),
      },
    } as Record<StockTicker, StockData>,
    gameStatus: 'playing' as const,
    endingType: null as EndingType | null,
    lastFlash: null as { type: any; timestamp: number } | null,
    popups: [] as any[],
    netWorthHistory: [{ turn: 1, value: 10000000 }], // Start with initial cash
    tradeHistory: [],
    costBasis: {
      '$GAME': 0,
      '$POPC': 0,
      '$APE': 0,
    } as Record<StockTicker, number>,
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
        const { cash, stocks, day, tradeHistory, hype, triggerFlash, addPopup } = get();
        const stock = stocks[ticker];
        const tInitial = 3/252; // New options are 3DTE
        
        // Use premium from UI if available, otherwise calculate it
        const premiumPerUnit = greeks.premium !== undefined 
          ? greeks.premium 
          : calculateOptionPrice(stock.currentPrice, strikePrice, type, stock.iv, tInitial);
          
        const totalCost = premiumPerUnit * amount;

        if (cash >= totalCost) {
          const tradeId = Math.random().toString(36).substring(7);
          const newOption = {
            id: tradeId,
            ticker,
            type,
            strikePrice,
            amount,
            expiryDay: day + 3, // 3DTE
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

          set((state) => ({
            cash: state.cash - totalCost,
            optionsHoldings: [...state.optionsHoldings, newOption],
            tradeHistory: [tradeEntry, ...state.tradeHistory],
            hype: newHype,
          }));

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
          const tRemaining = Math.max(0.0001, (option.expiryDay - day) / 252);
          const marketValuePerUnit = calculateOptionPrice(stock.currentPrice, option.strikePrice, option.type, stock.iv, tRemaining);
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
              return { ...o, amount: o.amount - amount };
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
        const { cash, holdings, stocks, optionsHoldings, day } = get();
        const stockValue = (Object.keys(holdings) as StockTicker[]).reduce((total, ticker) => {
          return total + (stocks[ticker].currentPrice * holdings[ticker]);
        }, 0);
        
        const optionsValue = optionsHoldings.reduce((total, option) => {
          const stock = stocks[option.ticker];
          const tRemaining = Math.max(0.0001, (option.expiryDay - day) / 252);
          const marketValue = calculateOptionPrice(stock.currentPrice, option.strikePrice, option.type, stock.iv, tRemaining);
          return total + (marketValue * option.amount);
        }, 0);

        return cash + stockValue + optionsValue;
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
        const { turn, day, stocks, eventQueue, cash, holdings, optionsHoldings, karma, triggerFlash, addPopup, processEvents, getNetWorth } = get();
        
        const prevNetWorth = getNetWorth();

        if (day >= 10) {
          const finalNetWorth = getNetWorth();
          let ending: EndingType = 'MENDYS';
          if (finalNetWorth >= 100000000) ending = 'MOON';
          else if (karma >= 50000 || finalNetWorth <= 0) ending = 'LEGEND';

          set({ gameStatus: 'ended', endingType: ending });
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

          const volatility = Math.random() * 0.4 + 0.1;
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
          const tRemaining = Math.max(0.0001, (option.expiryDay - nextDayNum) / 252);
          const marketValue = calculateOptionPrice(stock.currentPrice, option.strikePrice, option.type, stock.iv, tRemaining);
          return total + (marketValue * option.amount);
        }, 0);

        const netWorth = nextCash + stockValue + optionsValue;
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

        // GURU
        const predictionTicker = getRandomTicker();
        const nextStockState = nextStocks[predictionTicker];
        const prevPrice = stocks[predictionTicker].currentPrice;
        const willMoonGuru = nextStockState.currentPrice > prevPrice;
        const isRightGuru = Math.random() < 0.7;
        const adviceMoonGuru = isRightGuru ? willMoonGuru : !willMoonGuru;

        const guruPhrases = adviceMoonGuru 
          ? [`My charts say ${predictionTicker} breakout tomorrow. 🚀`, `Whales accumulating ${predictionTicker}.`, `${predictionTicker} bullish cross.`, `Tip: ${predictionTicker} to the moon!`, `Ignore FUD, ${predictionTicker} is UP.`]
          : [`${predictionTicker} looking weak. 📉`, `Massive dump coming for ${predictionTicker}.`, `Stay away from ${predictionTicker}.`, `SELL ${predictionTicker}!`, `Bear flag on ${predictionTicker}.` ];

        const guruMessage = { 
          id: `guru-${nextTurnNum}`, 
          sender: 'Crypto Guru', 
          text: guruPhrases[Math.floor(Math.random() * guruPhrases.length)],
          day: nextDayNum
        };

        if (newThreads['Crypto Guru']) {
          newThreads['Crypto Guru'].messages = [guruMessage, ...newThreads['Crypto Guru'].messages];
        }

        // WIFE SENTIMENT
        const performance = netWorth / 10000000; // relative to starting $100k
        let wifeText = "Hope you're having a good day at 'work', honey!";
        if (performance > 1.2) {
          const positives = [
            "Honey, I'm so proud of you! I'm looking at houses in the Hamptons.",
            "Did you see that new Tesla? I think it would look great in our driveway.",
            "I told my mom you're a financial genius. Don't make me a liar!",
            "Dinner is on me tonight! (Well, technically on your gains lol)"
          ];
          wifeText = positives[Math.floor(Math.random() * positives.length)];
        } else if (performance < 0.8) {
          const negatives = [
            "I saw the bank account. Please tell me it's a mistake.",
            "The mortgage check bounced. What is going on??",
            "My sister said she saw you looking at 'loss porn' on Reddit. What does that even mean?",
            "We need to talk. Now."
          ];
          wifeText = negatives[Math.floor(Math.random() * negatives.length)];
        }

        const wifeMessage = {
          id: `wife-day-${nextDayNum}`,
          sender: 'Wife',
          text: wifeText,
          day: nextDayNum
        };

        if (newThreads['Wife']) {
          newThreads['Wife'].messages = [wifeMessage, ...newThreads['Wife'].messages];
        }

        // FORUM
        const dailyForumPosts: any[] = [];
        const users = ['ApeLord', 'DiamondHands420', 'StonkMaster', 'TendieKing', 'BagHolder99', 'MoonMission', 'CramerInverse', 'PaperHandsLarry', 'YOLO_God', 'DeepValueHunter', 'StonkEnthusiast', 'LossPornConnoisseur'];

        for (let i = 0; i < 5; i++) {
          const postTicker = getRandomTicker();
          const pNextStock = nextStocks[postTicker];
          const pPrevPrice = stocks[postTicker].currentPrice;
          const willMoonForum = pNextStock.currentPrice > pPrevPrice;
          const isRightForum = Math.random() < 0.6; // 60% accurate
          const adviceMoonForum = isRightForum ? willMoonForum : !willMoonForum;

          const forumPhrases = adviceMoonForum
            ? [`Just bought ${postTicker}. YOLO!`, `${postTicker} is basically free.`, `${postTicker} to $1000!`, `Short squeeze on ${postTicker}!!`, `All in on ${postTicker}. LFG.`]
            : [`Who else is bagholding ${postTicker}? 🤡`, `${postTicker} is dead?`, `Bad picks on ${postTicker}.`, `Selling ${postTicker} for gum.`, `🐻 Gang was right about ${postTicker}.` ];

          dailyForumPosts.push({
            id: `forum-${nextTurnNum}-${i}`,
            user: users[Math.floor(Math.random() * users.length)],
            title: forumPhrases[Math.floor(Math.random() * forumPhrases.length)],
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
          forumPosts: [...dailyForumPosts, ...newForumPosts],
          netWorthHistory: [...state.netWorthHistory, { turn: nextTurnNum, value: netWorth }],
          tradeHistory: [...newTradeEntries, ...state.tradeHistory],
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
