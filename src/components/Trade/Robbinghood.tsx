import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import type { StockTicker } from '../../store/types';
import { PriceChart } from './PriceChart';
import { SwipeConfirm } from './SwipeConfirm';
import { OptionsChain } from './OptionsChain';
import './Robbinghood.css';

type Tab = 'Portfolio' | 'Trade' | 'History';

export const Robbinghood: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('Portfolio');
  const [selectedStock, setSelectedStock] = useState<StockTicker | null>(null);
  const [tradeAmount, setTradeAmount] = useState<number>(1);
  const [tradeMode, setTradeMode] = useState<'STOCK' | 'OPTION'>('STOCK');
  const [selectedOptionData, setSelectedOptionData] = useState<any>(null);
  const { cash, holdings, stocks, nextTurn, buyStock, sellStock, buyOption, getNetWorth, netWorthHistory, optionsHoldings } = useGameStore();

  const netWorth = getNetWorth();

  const currentPrice = selectedStock ? stocks[selectedStock].currentPrice : 0;
  
  const costPerUnit = useMemo(() => {
    if (tradeMode === 'STOCK') return currentPrice;
    if (selectedOptionData) return selectedOptionData.premium;
    return 0;
  }, [tradeMode, currentPrice, selectedOptionData]);

  const totalCost = tradeAmount * costPerUnit;

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
  };

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
            theta: selectedOptionData.theta
          }
        );
      }
    }
  };

  const handleSell = () => {
    if (selectedStock && tradeMode === 'STOCK') {
      sellStock(selectedStock, tradeAmount);
    }
  };

  return (
    <motion.div 
      className="robbinghood-container"
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <div className="robbinghood-header">
        <span className="logo" style={{ fontWeight: 'bold', fontSize: '18px' }}>ROBBINGHOOD</span>
        <button 
          onClick={nextTurn}
          style={{
            backgroundColor: '#a89f8c', // palette: gray-light
            border: '2px solid #706b66',
            padding: '2px 8px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 'bold',
            fontFamily: 'inherit'
          }}
        >
          NEXT TURN
        </button>
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
            {tab}
          </button>
        ))}
      </div>

      <div className="robbinghood-content">
        {activeTab === 'Portfolio' && (
          <div className="portfolio-view">
            <div className="robbinghood-stat">
              <div className="robbinghood-label">Net Worth</div>
              <div className="robbinghood-value">{formatCurrency(netWorth)}</div>
            </div>
            <div className="robbinghood-stat">
              <div className="robbinghood-label">Buying Power</div>
              <div className="robbinghood-value">{formatCurrency(cash)}</div>
            </div>

            <div className="chart-container" style={{ width: '100%', height: '100px', backgroundColor: '#2b2b26', margin: '12px 0', border: '2px solid #706b66' }}>
               <PriceChart 
                 history={netWorthHistory} 
                 width={300} 
                 height={100} 
                 color="#94ba8b" // Palette: green
               />
            </div>
            
            <div className="robbinghood-label" style={{ marginTop: '12px', display: 'block' }}>Holdings</div>
            <ul className="robbinghood-list">
              {Object.entries(holdings).map(([ticker, amount]) => {
                if (amount === 0) return null;
                const price = stocks[ticker as StockTicker].currentPrice;
                return (
                  <li key={ticker} className="robbinghood-list-item" onClick={() => { setActiveTab('Trade'); setSelectedStock(ticker as StockTicker); }} style={{ cursor: 'pointer' }}>
                    <span className="ticker">{ticker}</span>
                    <span className="price" style={{ fontSize: '10px', color: '#a89f8c' }}>{amount} shares</span>
                    <span className="price">{formatCurrency(price * amount)}</span>
                  </li>
                );
              })}
              {optionsHoldings.map((opt) => (
                <li key={opt.id} className="robbinghood-list-item">
                  <span className="ticker" style={{ color: opt.type === 'CALL' ? '#94ba8b' : '#ba8b8b' }}>
                    {opt.ticker} {opt.type} {formatCurrency(opt.strikePrice)}
                  </span>
                  <span className="price" style={{ fontSize: '10px', color: '#a89f8c' }}>{opt.amount} ctrs (Exp Day {opt.expiryDay})</span>
                  <span className="price">
                    {formatCurrency(opt.amount * (stocks[opt.ticker as StockTicker].currentPrice * 0.1))} {/* Simplified market value for UI */}
                  </span>
                </li>
              ))}
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
                   {Object.values(stocks).map((stock) => (
                     <li key={stock.ticker} className="robbinghood-list-item" style={{ cursor: 'pointer' }} onClick={() => setSelectedStock(stock.ticker)}>
                        <span className="ticker">{stock.ticker}</span>
                        <span className="price">{formatCurrency(stock.currentPrice)}</span>
                     </li>
                   ))}
                 </ul>
               </>
             ) : (
               <div className="stock-details">
                 <button className="back-btn" onClick={() => { setSelectedStock(null); setSelectedOptionData(null); }}>← BACK</button>
                 <h2 style={{ margin: '8px 0' }}>{selectedStock}</h2>
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
                        <SwipeConfirm 
                          label={selectedOptionData ? `SWIPE TO BUY ${tradeAmount} ${selectedOptionData.type}S` : 'SELECT AN OPTION'} 
                          onConfirm={handleBuy} 
                          disabled={!selectedOptionData}
                        />
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
             <p style={{ fontSize: '12px', color: '#706b66', marginTop: '16px' }}>
               No recent activity.
             </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};
