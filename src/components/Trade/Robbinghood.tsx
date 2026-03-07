import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useGameStore, calculateOptionPrice } from '../../store/useGameStore';
import type { StockTicker } from '../../store/types';
import { PriceChart } from './PriceChart';
import { SwipeConfirm } from './SwipeConfirm';
import { OptionsChain } from './OptionsChain';
import { PerformanceIndicator } from '../Feedback/PerformanceIndicator';
import { formatCurrency, calculatePercentChange } from '../../utils/marketUtils';
import './Robbinghood.css';

type Tab = 'Portfolio' | 'Trade' | 'History';

export const Robbinghood: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('Portfolio');
  const [selectedStock, setSelectedStock] = useState<StockTicker | null>(null);
  const [tradeAmount, setTradeAmount] = useState<number>(1);
  const [tradeMode, setTradeMode] = useState<'STOCK' | 'OPTION'>('STOCK');
  const [selectedOptionData, setSelectedOptionData] = useState<any>(null);
  
  const { 
    cash, holdings, stocks, 
    buyStock, sellStock, sellOption, buyOption, 
    getNetWorth, netWorthHistory, optionsHoldings,
    costBasis, tradeHistory, day
  } = useGameStore();

  // Reset trade amount when selection changes
  React.useEffect(() => {
    setTradeAmount(1);
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
              <div className="robbinghood-value">{formatCurrency(netWorth)}</div>
              <PerformanceIndicator value={dailyPerformance.value} percent={dailyPerformance.percent} />
            </div>
            <div className="robbinghood-stat">
              <div className="robbinghood-label">Buying Power</div>
              <div className="robbinghood-value">{formatCurrency(cash)}</div>
            </div>

            <div className="chart-container" style={{ width: '100%', height: '100px', backgroundColor: '#2b2b26', margin: '12px 0', border: '2px solid #706b66' }}>
               <PriceChart 
                 history={liveNetWorthHistory} 
                 width={300} 
                 height={100} 
               />
            </div>
            
            <div className="robbinghood-label" style={{ marginTop: '12px', display: 'block' }}>Holdings</div>
            <ul className="robbinghood-list">
              {Object.entries(holdings).map(([ticker, amount]) => {
                if (amount === 0) return null;
                const price = stocks[ticker as StockTicker].currentPrice;
                const basis = costBasis[ticker as StockTicker];
                const profit = (price - basis) * amount;
                const profitPercent = calculatePercentChange(price, basis);
                
                return (
                  <li key={ticker} className="robbinghood-list-item" onClick={() => { setActiveTab('Trade'); setSelectedStock(ticker as StockTicker); }} style={{ cursor: 'pointer' }}>
                    <div style={{ flex: 1 }}>
                      <span className="ticker">{ticker}</span>
                      <div className="price" style={{ fontSize: '10px', color: '#a89f8c' }}>{amount} shares @ {formatCurrency(basis)}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="price">{formatCurrency(price * amount)}</div>
                      <PerformanceIndicator value={profit} percent={profitPercent} showAmount={false} />
                    </div>
                  </li>
                );
              })}
              {optionsHoldings.map((opt) => {
                const stock = stocks[opt.ticker];
                const tRemaining = Math.max(0.0001, (opt.expiryDay - day) / 252);
                const currentPremium = calculateOptionPrice(stock.currentPrice, opt.strikePrice, opt.type, stock.iv, tRemaining);

                return (
                  <li key={opt.id} className="robbinghood-list-item">
                    <div style={{ flex: 1 }}>
                      <span className="ticker" style={{ color: opt.type === 'CALL' ? '#94ba8b' : '#ba8b8b' }}>
                        {opt.ticker} {opt.type} {formatCurrency(opt.strikePrice)}
                      </span>
                      <div className="price" style={{ fontSize: '10px', color: '#a89f8c' }}>{opt.amount} ctrs (Exp Day {opt.expiryDay})</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="price">
                        {formatCurrency(opt.amount * currentPremium)}
                      </div>
                      <div style={{ fontSize: '10px', color: '#706b66' }}>IV: {(stock.iv * 100).toFixed(0)}%</div>
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
                            <PerformanceIndicator percent={changePercent} showAmount={false} />
                          </div>
                       </li>
                     );
                   })}
                 </ul>
               </>
             ) : (
               <div className="stock-details">
                 <button className="back-btn" onClick={() => { setSelectedStock(null); setSelectedOptionData(null); }}>← BACK</button>
                 <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '8px 0' }}>
                   <h2 style={{ margin: 0 }}>{selectedStock} - {formatCurrency(currentPrice)}</h2>
                   {selectedStock && (
                     <PerformanceIndicator 
                       percent={calculatePercentChange(
                         stocks[selectedStock].currentPrice, 
                         stocks[selectedStock].history.length > 1 
                           ? stocks[selectedStock].history[stocks[selectedStock].history.length - 2].price 
                           : stocks[selectedStock].currentPrice
                       )} 
                       showAmount={false} 
                     />
                   )}
                   {selectedStock && (
                     <span style={{ fontSize: '12px', color: '#a89f8c', marginLeft: 'auto', fontWeight: 'bold' }}>
                       IV: {(stocks[selectedStock].iv * 100).toFixed(0)}%
                     </span>
                   )}
                 </div>
                 
                 <div style={{ marginBottom: '12px', padding: '8px', backgroundColor: '#3d3d38', border: '1px solid #706b66' }}>
                   <div style={{ fontSize: '10px', color: '#706b66', marginBottom: '4px' }}>YOUR POSITIONS</div>
                   <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                     <span>SHARES: {holdings[selectedStock] || 0}</span>
                     <span>OPTIONS: {
                       optionsHoldings.filter(o => o.ticker === selectedStock).reduce((sum, o) => sum + o.amount, 0)
                     } CTRS</span>
                   </div>
                   {optionsHoldings.filter(o => o.ticker === selectedStock).length > 0 && (
                     <div style={{ marginTop: '4px', fontSize: '10px', color: '#a89f8c' }}>
                       {optionsHoldings.filter(o => o.ticker === selectedStock).map(o => (
                         <div key={o.id}>{o.type} ${ (o.strikePrice/100).toFixed(2) } ({o.amount}x) - Exp Day {o.expiryDay}</div>
                       ))}
                     </div>
                   )}
                 </div>

                 <div className="chart-container" style={{ width: '100%', height: '120px', backgroundColor: '#2b2b26', marginBottom: '16px', border: '2px solid #706b66' }}>
                    <PriceChart 
                      history={stocks[selectedStock].history} 
                      width={300} 
                      height={120} 
                    />
                 </div>
                 
                 <div className="trade-controls">
                    <div style={{ marginBottom: '16px' }}>
                      <div className="robbinghood-label">Mode: {tradeMode}</div>
                      <div className="toggle-group" style={{ marginBottom: '12px' }}>
                        <button 
                          className={`toggle-btn ${tradeMode === 'STOCK' ? 'active' : ''}`}
                          onClick={() => { setTradeMode('STOCK'); setTradeAmount(1); setSelectedOptionData(null); }}
                        >
                          STOCK
                        </button>
                        <button 
                          className={`toggle-btn ${tradeMode === 'OPTION' ? 'active' : ''}`}
                          onClick={() => { setTradeMode('OPTION'); setTradeAmount(1); }}
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
                          min="1" 
                          value={tradeAmount} 
                          onChange={(e) => setTradeAmount(Math.max(1, parseInt(e.target.value) || 1))}
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
                          <SwipeConfirm label={`SWIPE TO BUY ${tradeAmount} SHARES`} onConfirm={handleBuy} />
                          <SwipeConfirm label={`SWIPE TO SELL ${tradeAmount} SHARES`} onConfirm={handleSell} />
                        </>
                      ) : (
                        <>
                          <SwipeConfirm 
                            label={selectedOptionData ? `SWIPE TO BUY ${tradeAmount} ${selectedOptionData.type}S` : 'SELECT AN OPTION'} 
                            onConfirm={handleBuy} 
                            disabled={!selectedOptionData}
                          />
                          {heldOptionAmount > 0 && (
                            <SwipeConfirm 
                              label={`SWIPE TO SELL ${tradeAmount} ${selectedOptionData?.type}S`} 
                              onConfirm={handleSell} 
                              disabled={!selectedOptionData || heldOptionAmount < tradeAmount}
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
