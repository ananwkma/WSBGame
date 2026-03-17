import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useGameStore, calculateOptionPrice } from '../../store/useGameStore';
import type { StockTicker } from '../../store/types';
import { IntraChart } from './IntraChart';
import { SwipeConfirm } from './SwipeConfirm';
import { OptionsChain } from './OptionsChain';
import { PerformanceIndicator } from '../Feedback/PerformanceIndicator';
import { ParticleBurst } from '../Feedback/ParticleBurst';
import { formatCurrency, calculatePercentChange, scaledIV } from '../../utils/marketUtils';
import './Robbinghood.css';

type Tab = 'Portfolio' | 'Trade' | 'History';

const STOCK_NAMES: Record<string, string> = {
  '$GAME':  'GAMEGO INC.',
  '$POPC':  'POPCORNFLIX MEDIA',
  '$APE':   'PRIMATE CAPITAL',
  '$GOOGO': 'GOOGO SEARCH & CLOUD',
  '$APPO':  'APPO INC.',
  '$BERG':  'BERGSHIRE HATHAME',
};

function fmtTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

const EARNINGS_DAYS: Partial<Record<string, number>> = {
  '$GAME':  3,
  '$POPC':  5,
  '$APE':   4,
  '$GOOGO': 7,
  '$APPO':  6,
  '$BERG':  8,
};

export const Robbinghood: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('Portfolio');
  const [selectedStock, setSelectedStock] = useState<StockTicker | null>(null);
  const [tradeAmount, setTradeAmount] = useState<number>(0);
  const [tradeMode, setTradeMode] = useState<'STOCK' | 'OPTION'>('STOCK');
  const [selectedOptionData, setSelectedOptionData] = useState<any>(null);
  const [holdingsView, setHoldingsView] = useState<'daily' | 'total'>('daily');
  
  const {
    cash, holdings, stocks,
    buyStock, sellStock, sellOption, buyOption,
    getNetWorth, netWorthHistory, optionsHoldings,
    costBasis, tradeHistory, day, currentDay, sharkDebt,
    intradayBars, marketTime, marketIsOpen, netWorthBars,
    scheduledEvents, previousDayBars,
  } = useGameStore();

  const bigGainTicker = useGameStore((s) => s.bigGainTicker);
  const bigLossTicker = useGameStore((s) => s.bigLossTicker);

  // Reset trade amount when selection changes
  React.useEffect(() => {
    setTradeAmount(0);
  }, [selectedStock, selectedOptionData]);

  const netWorth = getNetWorth();
  const currentPrice = selectedStock ? stocks[selectedStock].currentPrice : 0;
  
  // Live chart history (moved to top level to avoid conditional hook call)
  const liveNetWorthHistory = useMemo(() => {
    const history = [...netWorthHistory];
    const lastPoint = history[history.length - 1];
    // Only add a live point if it's actually ahead in time
    if (!lastPoint || lastPoint.turn < day + 0.5) {
      history.push({ turn: day + 0.5, value: netWorth });
    }
    return history;
  }, [netWorthHistory, day, netWorth]);

  // Daily performance
  const dailyPerformance = useMemo(() => {
    if (netWorthHistory.length < 2) return { value: 0, percent: 0 };
    const previousNetWorth = netWorthHistory[netWorthHistory.length - 2].value;
    return {
      value: netWorth - previousNetWorth,
      percent: calculatePercentChange(netWorth, previousNetWorth)
    };
  }, [netWorth, netWorthHistory]);

  const costPerUnit = useMemo(() => {
    if (tradeMode === 'STOCK') return currentPrice;
    if (selectedOptionData) return selectedOptionData.premium;
    return 0;
  }, [tradeMode, currentPrice, selectedOptionData]);

  const totalCost = tradeAmount * costPerUnit;

  const handleBuy = () => {
    if (selectedStock) {
      if (tradeMode === 'STOCK') {
        buyStock(selectedStock, tradeAmount);
      } else if (selectedOptionData) {
        buyOption(
          selectedStock, 
          selectedOptionData.type, 
          tradeAmount, 
          selectedOptionData.strikePrice,
          {
            delta: selectedOptionData.delta,
            gamma: selectedOptionData.gamma,
            theta: selectedOptionData.theta,
            vega: selectedOptionData.vega,
            premium: selectedOptionData.premium // Pass the UI premium to avoid slippage/insufficient funds errors
          }
        );
      }
    }
  };

  const handleSell = () => {
    if (selectedStock) {
      if (tradeMode === 'STOCK') {
        sellStock(selectedStock, tradeAmount);
      } else if (selectedOptionData) {
        const heldOption = optionsHoldings.find(o => 
          o.ticker === selectedStock && 
          o.type === selectedOptionData.type && 
          o.strikePrice === selectedOptionData.strikePrice
        );
        if (heldOption) {
          sellOption(heldOption.id, tradeAmount);
        }
      }
    }
  };

  const heldOptionAmount = useMemo(() => {
    if (!selectedStock || tradeMode !== 'OPTION' || !selectedOptionData) return 0;
    return optionsHoldings.filter(o => 
      o.ticker === selectedStock && 
      o.type === selectedOptionData.type && 
      o.strikePrice === selectedOptionData.strikePrice
    ).reduce((sum, o) => sum + o.amount, 0);
  }, [selectedStock, tradeMode, selectedOptionData, optionsHoldings]);

  return (
    <motion.div 
      className="robbinghood-container"
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <div className="robbinghood-header">
        <span className="logo" style={{ fontWeight: 'bold', fontSize: '18px' }}>ROBBINGHOOD</span>
      </div>

      <div className="robbinghood-tabs">
        {(['Portfolio', 'Trade', 'History'] as Tab[]).map((tab) => (
          <button
            key={tab}
            className={`robbinghood-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => {
              setActiveTab(tab);
              if (tab !== 'Trade') setSelectedStock(null);
            }}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="robbinghood-content">
        {activeTab === 'Portfolio' && (
          <div className="portfolio-view">
            <div className="robbinghood-stat">
              <div className="robbinghood-label">Net Worth</div>
              <div className="robbinghood-value" style={netWorth < 0 ? { color: '#ba8b8b' } : undefined}>{netWorth < 0 ? `-${formatCurrency(netWorth)}` : formatCurrency(netWorth)}</div>
              <PerformanceIndicator value={dailyPerformance.value} percent={dailyPerformance.percent} />
            </div>
            <div className="robbinghood-stat">
              <div className="robbinghood-label">Buying Power</div>
              <div className="robbinghood-value">{formatCurrency(cash)}</div>
            </div>
            {sharkDebt > 0 && (
              <div className="robbinghood-stat">
                <div className="robbinghood-label">SHARK DEBT</div>
                <div className="robbinghood-value" style={{ color: '#ba8b8b' }}>-{formatCurrency(sharkDebt)}</div>
              </div>
            )}

            <div className="chart-container" style={{ width: '100%', backgroundColor: '#2b2b26', margin: '12px 0', border: '2px solid #706b66', padding: '8px' }}>
              <IntraChart
                intradayBars={[]}
                dailyHistory={liveNetWorthHistory.map((p) => ({ turn: p.turn, price: p.value }))}
                netWorthBars={netWorthBars}
                marketTime={marketTime}
                marketIsOpen={marketIsOpen}
                ticker="NET WORTH"
                showCandleToggle={false}
                chartHeight={260}
              />
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
              <div className="robbinghood-label">Holdings</div>
              <div style={{ display: 'flex', gap: '2px' }}>
                {(['daily', 'total'] as const).map(v => (
                  <button key={v} onClick={() => setHoldingsView(v)}
                    style={{ fontSize: '10px', padding: '2px 7px', cursor: 'pointer', fontFamily: 'inherit', border: '1px solid #706b66',
                      background: holdingsView === v ? '#e0dbcb' : 'none',
                      color: holdingsView === v ? '#2b2b26' : '#706b66',
                      fontWeight: holdingsView === v ? 'bold' : 'normal' }}>
                    {v === 'daily' ? '1D' : 'ALL'}
                  </button>
                ))}
              </div>
            </div>
            <ul className="robbinghood-list">
              {Object.entries(holdings).map(([ticker, amount]) => {
                if (amount === 0) return null;
                const stock = stocks[ticker as StockTicker];
                const price = stock.currentPrice;
                const basis = costBasis[ticker as StockTicker];
                const changeVal = (price - basis) * amount;
                const changePct = calculatePercentChange(price, basis);
                const color = changeVal === 0 ? '#e0dbcb' : changeVal > 0 ? '#94ba8b' : '#ba8b8b';

                return (
                  <li key={ticker} className="robbinghood-list-item" onClick={() => { setActiveTab('Trade'); setSelectedStock(ticker as StockTicker); }}
                    style={{ cursor: 'pointer', borderLeft: `3px solid ${color}` }}>
                    <div style={{ flex: 1 }}>
                      <span className="ticker" style={{ color }}>{ticker}</span>
                      <div className="price" style={{ fontSize: '10px', color }}>{amount} shares @ {formatCurrency(basis)}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="price">{formatCurrency(price * amount)}</div>
                      <PerformanceIndicator value={changeVal} percent={changePct} />
                    </div>
                  </li>
                );
              })}
              {optionsHoldings.map((opt) => {
                const stock = stocks[opt.ticker];
                const dteRemaining = Math.max(0, opt.expiryDay - day);
                const tRemaining = Math.max(0.0001, dteRemaining / 252);
                const currentPremium = calculateOptionPrice(stock.currentPrice, opt.strikePrice, opt.type, scaledIV(stock.iv, dteRemaining), tRemaining);
                const currentValue = opt.amount * currentPremium;
                const prevStockPrice = stock.history.length > 0 ? stock.history[stock.history.length - 1].price : stock.currentPrice;
                const dtePrev = dteRemaining + 1;
                const prevPremium = calculateOptionPrice(prevStockPrice, opt.strikePrice, opt.type, scaledIV(stock.iv, dtePrev), Math.max(0.0001, dtePrev / 252));
                const totalPL = currentValue - opt.premiumPaid;
                const totalPct = calculatePercentChange(currentValue, opt.premiumPaid);
                const boughtAmountToday = tradeHistory.filter(t => t.day === day && t.ticker === opt.ticker && t.type === 'OPTION_BUY').reduce((s, t) => s + t.amount, 0);
                const relevantAmount = Math.max(0, opt.amount - boughtAmountToday);
                const dailyPL = relevantAmount === 0 ? totalPL : (currentPremium - prevPremium) * relevantAmount;
                const dailyPct = relevantAmount === 0 ? totalPct : calculatePercentChange(currentPremium, prevPremium);
                const optChangeVal = holdingsView === 'daily' ? dailyPL : totalPL;
                const optChangePct = holdingsView === 'daily' ? dailyPct : totalPct;
                const color = optChangeVal === 0 ? '#e0dbcb' : optChangeVal > 0 ? '#94ba8b' : '#ba8b8b';

                return (
                  <li key={opt.id} className="robbinghood-list-item" style={{ cursor: 'pointer', borderLeft: `3px solid ${color}` }}
                    onClick={() => { setActiveTab('Trade'); setSelectedStock(opt.ticker); }}>
                    <div style={{ flex: 1 }}>
                      <span className="ticker" style={{ color }}>
                        {opt.ticker} {opt.type} {formatCurrency(opt.strikePrice)}
                      </span>
                      <div className="price" style={{ fontSize: '10px', color }}>{opt.amount} ctrs @ {formatCurrency(opt.premiumPaid / opt.amount)} avg</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="price">{formatCurrency(currentValue)}</div>
                      <PerformanceIndicator value={optChangeVal} percent={optChangePct} />
                    </div>
                  </li>
                );
              })}
              {Object.values(holdings).every(v => v === 0) && optionsHoldings.length === 0 && (
                <li className="robbinghood-list-item" style={{ color: '#706b66', fontSize: '12px' }}>
                  No holdings yet. Buy some stocks!
                </li>
              )}
            </ul>
          </div>
        )}

        {activeTab === 'Trade' && (
          <div className="trade-view">
             {!selectedStock ? (
               <>
                 <div className="robbinghood-label">Available Stocks</div>
                 <ul className="robbinghood-list">
                   {Object.values(stocks).map((stock) => {
                     const history = stock.history;
                     const prevPrice = history.length > 1 ? history[history.length - 2].price : stock.currentPrice;
                     const changePercent = calculatePercentChange(stock.currentPrice, prevPrice);
                     
                     return (
                       <li key={stock.ticker} className="robbinghood-list-item" style={{ cursor: 'pointer' }} onClick={() => setSelectedStock(stock.ticker)}>
                         <span className="ticker">{stock.ticker}</span>
                         <div style={{ textAlign: 'right' }}>
                           <span className="price">{formatCurrency(stock.currentPrice)}</span>
                           <PerformanceIndicator value={stock.currentPrice - prevPrice} percent={changePercent} />
                         </div>
                       </li>
                     );
                   })}
                 </ul>
               </>
             ) : (
               <div className="stock-details">
                 {(() => {
                   if (!selectedStock) return null;
                   const hist = stocks[selectedStock].history;
                   const prevPrice = hist.length > 0 ? hist[hist.length - 1].price : stocks[selectedStock].currentPrice;
                   const chartColor = stocks[selectedStock].currentPrice >= prevPrice ? '#94ba8b' : '#ba8b8b';
                   const changePct = calculatePercentChange(stocks[selectedStock].currentPrice, prevPrice);
                   return (
                     <>
                       <button
                         className="back-btn"
                         onClick={() => { setSelectedStock(null); setSelectedOptionData(null); }}
                         style={{ fontSize: '22px', color: chartColor, background: 'none', border: 'none', cursor: 'pointer', padding: '0 4px 4px', lineHeight: 1 }}
                       >
                         &lt;
                       </button>
                       <div style={{ margin: '4px 0 8px' }}>
                         <div style={{ fontSize: '11px', color: '#706b66', fontFamily: 'monospace' }}>{selectedStock}</div>
                         <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
                           <span style={{ fontSize: '15px', fontWeight: 'bold' }}>
                             {STOCK_NAMES[selectedStock] ?? selectedStock} &mdash; {formatCurrency(currentPrice)}
                           </span>
                           <PerformanceIndicator value={currentPrice - prevPrice} percent={changePct} />
                           <span style={{ fontSize: '11px', color: '#a89f8c', marginLeft: 'auto' }}>
                             IV: {(stocks[selectedStock].iv * 100).toFixed(0)}%
                           </span>
                         </div>
                         {EARNINGS_DAYS[selectedStock] && (
                           <div className="earnings-countdown" style={{ fontSize: '10px', opacity: 0.6, marginTop: '2px' }}>
                             {(() => {
                               const earningsDay = EARNINGS_DAYS[selectedStock]!;
                               if (earningsDay > currentDay) {
                                 const diff = earningsDay - currentDay;
                                 return `${diff} day${diff !== 1 ? 's' : ''} until earnings`;
                               }
                               if (earningsDay < currentDay) return 'Earnings passed';
                               const evt = scheduledEvents.find(e => e.type === 'EARNINGS' && e.ticker === selectedStock && e.day === currentDay);
                               return evt ? `Earnings today at ${fmtTime(evt.triggerTime)}` : 'Earnings today';
                             })()}
                           </div>
                         )}
                       </div>
                     </>
                   );
                 })()}
                 
                 {(() => {
                   const sharesHeld = holdings[selectedStock] || 0;
                   const stockOptions = optionsHoldings.filter(o => o.ticker === selectedStock);
                   if (sharesHeld === 0 && stockOptions.length === 0) return null;
                   const avgCost = costBasis[selectedStock] || 0;
                   const stockValue = sharesHeld * currentPrice;
                   const stockPL = (currentPrice - avgCost) * sharesHeld;
                   const stockPLPct = calculatePercentChange(currentPrice, avgCost);
                   // Daily color for shares
                   const hist = stocks[selectedStock].history;
                   const stockColor = stockPL === 0 ? '#e0dbcb' : stockPL > 0 ? '#94ba8b' : '#ba8b8b';
                   return (
                     <div style={{ marginBottom: '12px', padding: '8px', backgroundColor: '#2b2b26', border: '1px solid #706b66' }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                         <div style={{ fontSize: '10px', color: '#706b66', letterSpacing: '1px' }}>YOUR POSITIONS</div>
                         <div style={{ display: 'flex', gap: '2px' }}>
                           {(['daily', 'total'] as const).map(v => (
                             <button key={v} onClick={() => setHoldingsView(v)}
                               style={{ fontSize: '9px', padding: '1px 6px', cursor: 'pointer', fontFamily: 'inherit', border: '1px solid #706b66',
                                 background: holdingsView === v ? '#e0dbcb' : 'none',
                                 color: holdingsView === v ? '#2b2b26' : '#706b66',
                                 fontWeight: holdingsView === v ? 'bold' : 'normal' }}>
                               {v === 'daily' ? '1D' : 'ALL'}
                             </button>
                           ))}
                         </div>
                       </div>
                       {sharesHeld > 0 && (() => {
                         const posChangeVal = stockPL;
                         const posChangePct = stockPLPct;
                         const posColor = posChangeVal === 0 ? '#e0dbcb' : posChangeVal > 0 ? '#94ba8b' : '#ba8b8b';
                         return (
                           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: stockOptions.length > 0 ? '8px' : 0 }}>
                             <div>
                               <div style={{ fontSize: '12px', fontWeight: 'bold', color: posColor }}>{sharesHeld} SHARES</div>
                               <div style={{ fontSize: '10px', color: '#a89f8c' }}>avg {formatCurrency(avgCost)}/share</div>
                             </div>
                             <div style={{ textAlign: 'right' }}>
                               <div style={{ fontSize: '12px' }}>{formatCurrency(stockValue)}</div>
                               <PerformanceIndicator value={posChangeVal} percent={posChangePct} />
                             </div>
                           </div>
                         );
                       })()}
                       {stockOptions.map(o => {
                         const dte = Math.max(0, o.expiryDay - day);
                         const tRem = Math.max(0.0001, dte / 252);
                         const curPremium = calculateOptionPrice(stocks[selectedStock].currentPrice, o.strikePrice, o.type, scaledIV(stocks[selectedStock].iv, dte), tRem);
                         const curVal = o.amount * curPremium;
                         const totalPL = curVal - o.premiumPaid;
                         const totalPLPct = calculatePercentChange(curVal, o.premiumPaid);
                         const prevStockPrice = hist.length > 0 ? hist[hist.length - 1].price : stocks[selectedStock].currentPrice;
                         const dtePrev = dte + 1;
                         const prevPremium = calculateOptionPrice(prevStockPrice, o.strikePrice, o.type, scaledIV(stocks[selectedStock].iv, dtePrev), Math.max(0.0001, dtePrev / 252));
                         const boughtOptToday = tradeHistory.filter(t => t.day === day && t.ticker === o.ticker && t.type === 'OPTION_BUY').reduce((s, t) => s + t.amount, 0);
                         const optAtStart = Math.max(0, o.amount - boughtOptToday);
                         const optDailyPL = optAtStart <= 0 ? totalPL : (curPremium - prevPremium) * optAtStart;
                         const optDailyPct = optAtStart <= 0 ? totalPLPct : calculatePercentChange(curPremium, prevPremium);
                         const optChangeVal = holdingsView === 'daily' ? optDailyPL : totalPL;
                         const optChangePct = holdingsView === 'daily' ? optDailyPct : totalPLPct;
                         const optColor = optChangeVal === 0 ? '#e0dbcb' : optChangeVal > 0 ? '#94ba8b' : '#ba8b8b';
                         return (
                           <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '6px', paddingTop: '6px', borderTop: '1px solid #706b66' }}>
                             <div>
                               <div style={{ fontSize: '12px', fontWeight: 'bold', color: optColor }}>
                                 {o.amount}x {o.type} {formatCurrency(o.strikePrice)}
                               </div>
                               <div style={{ fontSize: '10px', color: '#a89f8c' }}>avg {formatCurrency(o.premiumPaid / o.amount)}/ctr · exp day {o.expiryDay}</div>
                             </div>
                             <div style={{ textAlign: 'right' }}>
                               <div style={{ fontSize: '12px' }}>{formatCurrency(curVal)}</div>
                               <PerformanceIndicator value={optChangeVal} percent={optChangePct} />
                             </div>
                           </div>
                         );
                       })}
                     </div>
                   );
                 })()}

                <div style={{ position: 'relative' }}>
                  <div className="chart-container" style={{ width: '100%', backgroundColor: '#2b2b26', marginBottom: '16px', border: '2px solid #706b66', padding: '8px' }}>
                    <IntraChart
                      intradayBars={intradayBars[selectedStock] || []}
                      previousDayBars={previousDayBars[selectedStock] || []}
                      dailyHistory={stocks[selectedStock].history}
                      marketTime={marketTime}
                      marketIsOpen={marketIsOpen}
                      ticker={selectedStock}
                      showCandleToggle={true}
                      chartHeight={260}
                    />
                  </div>
                  <ParticleBurst type="coin" active={bigGainTicker === selectedStock} />
                  <ParticleBurst type="flame" active={bigLossTicker === selectedStock} />
                </div>
                 
                 <div className="trade-controls">
                    <div style={{ marginBottom: '16px' }}>
                      <div className="robbinghood-label">Mode: {tradeMode}</div>
                      <div className="toggle-group" style={{ marginBottom: '12px' }}>
                        <button 
                          className={`toggle-btn ${tradeMode === 'STOCK' ? 'active' : ''}`}
                          onClick={() => { setTradeMode('STOCK'); setTradeAmount(0); setSelectedOptionData(null); }}
                        >
                          STOCK
                        </button>
                        <button 
                          className={`toggle-btn ${tradeMode === 'OPTION' ? 'active' : ''}`}
                          onClick={() => { setTradeMode('OPTION'); setTradeAmount(0); }}
                        >
                          OPTION
                        </button>
                      </div>

                      {tradeMode === 'OPTION' && (
                        <OptionsChain 
                          ticker={selectedStock} 
                          selectedOption={selectedOptionData ? { strike: selectedOptionData.strikePrice, type: selectedOptionData.type } : null}
                          onSelect={setSelectedOptionData}
                        />
                      )}
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <div className="robbinghood-label">BUYING POWER</div>
                      <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{formatCurrency(cash)}</div>
                    </div>
                    
                    <div className="input-group" style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', fontSize: '12px', color: '#706b66' }}>AMOUNT</label>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input 
                          type="number" 
                          min="0"
                          value={tradeAmount}
                          onChange={(e) => setTradeAmount(Math.max(0, parseInt(e.target.value) || 0))}
                          style={{
                            backgroundColor: '#2b2b26',
                            color: '#e0dbcb',
                            border: '2px solid #706b66',
                            padding: '4px',
                            width: '80px',
                            fontFamily: 'inherit',
                            fontSize: '16px'
                          }}
                        />
                        <button 
                          className="all-in-btn"
                          onClick={() => {
                            if (costPerUnit > 0) {
                              const affordable = Math.floor(cash / costPerUnit);
                              setTradeAmount(Math.max(1, affordable));
                            }
                          }}
                        >
                          ALL IN
                        </button>
                        <button 
                          className="all-in-btn sell-all"
                          style={{ backgroundColor: '#ba8b8b', color: '#2b2b26' }}
                          onClick={() => {
                            if (tradeMode === 'STOCK') {
                              setTradeAmount(Math.max(1, holdings[selectedStock!] || 0));
                            } else {
                              setTradeAmount(Math.max(1, heldOptionAmount));
                            }
                          }}
                        >
                          SELL ALL
                        </button>
                      </div>
                      <div className="robbinghood-label" style={{ marginTop: '8px' }}>
                        TOTAL COST: {formatCurrency(totalCost)}
                      </div>
                    </div>
                    
                    <div className="swipe-actions" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {tradeMode === 'STOCK' ? (
                        <>
                          <SwipeConfirm label={`SWIPE TO BUY ${tradeAmount} SHARES`} onConfirm={handleBuy} disabled={tradeAmount === 0 || !marketIsOpen} />
                          <SwipeConfirm label={`SWIPE TO SELL ${tradeAmount} SHARES`} onConfirm={handleSell} disabled={tradeAmount === 0 || !marketIsOpen} />
                        </>
                      ) : (
                        <>
                          <SwipeConfirm
                            label={selectedOptionData ? `SWIPE TO BUY ${tradeAmount} ${selectedOptionData.type}S` : 'SELECT AN OPTION'}
                            onConfirm={handleBuy}
                            disabled={!selectedOptionData || tradeAmount === 0 || !marketIsOpen}
                          />
                          {heldOptionAmount > 0 && (
                            <SwipeConfirm
                              label={`SWIPE TO SELL ${tradeAmount} ${selectedOptionData?.type}S`}
                              onConfirm={handleSell}
                              disabled={!selectedOptionData || tradeAmount === 0 || heldOptionAmount < tradeAmount || !marketIsOpen}
                            />
                          )}
                        </>
                      )}
                    </div>
                 </div>
               </div>
             )}
          </div>
        )}

        {activeTab === 'History' && (
          <div className="history-view">
             <div className="robbinghood-label">Recent Activity</div>
             <div className="history-list" style={{ maxHeight: '300px', overflowY: 'auto', marginTop: '8px' }}>
                {tradeHistory.map((entry) => (
                  <div key={entry.id} className="robbinghood-list-item" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '4px' }}>
                      <span className="ticker" style={{ fontSize: '12px' }}>
                        {entry.type} {entry.ticker}
                      </span>
                      <span style={{ fontSize: '10px', color: '#706b66' }}>Day {entry.day}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '10px' }}>
                      <span>{entry.amount} @ {formatCurrency(entry.price)}</span>
                      {entry.realizedPL !== undefined && (
                        <PerformanceIndicator value={entry.realizedPL} showPercent={false} />
                      )}
                    </div>
                  </div>
                ))}
                {tradeHistory.length === 0 && (
                   <p style={{ fontSize: '12px', color: '#706b66', marginTop: '16px', textAlign: 'center' }}>
                    No recent activity.
                  </p>
                )}
             </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
