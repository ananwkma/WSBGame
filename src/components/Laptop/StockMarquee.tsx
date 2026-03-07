import React from 'react';
import type { StockData } from '../../store/types';
import { MiniChart } from './MiniChart';

interface StockMarqueeProps {
  stocks: StockData[];
  speed?: number; // duration in seconds
}

export const StockMarquee: React.FC<StockMarqueeProps> = ({ 
  stocks, 
  speed = 30 
}) => {
  // Triple the items to ensure seamless loop
  const displayItems = [...stocks, ...stocks, ...stocks];

  return (
    <div className="stock-marquee-container">
      <div 
        className="stock-marquee-content"
        style={{ animationDuration: `${speed}s` }}
      >
        {displayItems.map((stock, i) => {
          const prevPrice = stock.history.length > 1 
            ? stock.history[stock.history.length - 2].price 
            : stock.currentPrice;
          const change = ((stock.currentPrice - prevPrice) / prevPrice) * 100;
          const color = change >= 0 ? '#00ff00' : '#ff0000';
          const sign = change >= 0 ? '+' : '';

          return (
            <div key={`${stock.ticker}-${i}`} className="marquee-item">
              <span className="marquee-ticker">{stock.ticker}</span>
              <span className="marquee-price">${(stock.currentPrice / 100).toFixed(2)}</span>
              <span className="marquee-change" style={{ color }}>
                {sign}{change.toFixed(2)}%
              </span>
              <MiniChart data={stock.history.slice(-10).map(p => p.price)} />
            </div>
          );
        })}
      </div>
    </div>
  );
};
