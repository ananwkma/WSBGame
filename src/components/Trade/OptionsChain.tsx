import React from 'react';
import { useGameStore, generateOptionsChain } from '../../store/useGameStore';
import type { StockTicker } from '../../store/types';

interface OptionsChainProps {
  ticker: StockTicker;
  selectedOption: { strike: number; type: 'CALL' | 'PUT' } | null;
  onSelect: (option: any) => void;
}

export const OptionsChain: React.FC<OptionsChainProps> = ({ ticker, selectedOption, onSelect }) => {
  const { stocks, optionsHoldings, day } = useGameStore();
  const stock = stocks[ticker];
  const chain = generateOptionsChain(ticker, stock.currentPrice, stock.iv, day, optionsHoldings);

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  // Group by strike
  const uniqueStrikes = Array.from(new Set(chain.map(o => o.strikePrice))).sort((a, b) => a - b);

  return (
    <div className="options-chain">
      <div className="options-header-row" style={{ display: 'flex', borderBottom: '2px solid #706b66', paddingBottom: '4px', marginBottom: '8px' }}>
        <div className="col call" style={{ flex: 1, textAlign: 'center', fontSize: '10px' }}>CALLS</div>
        <div className="col strike" style={{ width: '60px', textAlign: 'center', fontSize: '10px' }}>STRIKE</div>
        <div className="col put" style={{ flex: 1, textAlign: 'center', fontSize: '10px' }}>PUTS</div>
      </div>
      <div className="options-rows" style={{ maxHeight: '200px', overflowY: 'auto' }}>
        {uniqueStrikes.map(strike => {
          const call = chain.find(o => o.strikePrice === strike && o.type === 'CALL');
          const put = chain.find(o => o.strikePrice === strike && o.type === 'PUT');

          const isCallSelected = selectedOption?.strike === strike && selectedOption?.type === 'CALL';
          const isPutSelected = selectedOption?.strike === strike && selectedOption?.type === 'PUT';

          const ownsCall = optionsHoldings.some(o => o.ticker === ticker && o.strikePrice === strike && o.type === 'CALL');
          const ownsPut = optionsHoldings.some(o => o.ticker === ticker && o.strikePrice === strike && o.type === 'PUT');

          return (
            <div key={strike} className="strike-row" style={{ display: 'flex', borderBottom: '1px solid #3d3d38', padding: '4px 0' }}>
              <div 
                className={`option-cell call ${isCallSelected ? 'selected' : ''}`}
                onClick={() => onSelect(call)}
                style={{ 
                  flex: 1, 
                  textAlign: 'center', 
                  cursor: 'pointer', 
                  backgroundColor: isCallSelected ? '#3e4a3d' : 'transparent', 
                  border: ownsCall ? '1px solid #94ba8b' : 'none',
                  padding: '2px' 
                }}
              >
                <div className="premium" style={{ fontWeight: 'bold' }}>{call ? formatCurrency(call.premium) : '-'}</div>
                {call && (
                  <div className="greeks" style={{ fontSize: '8px', color: '#a89f8c' }}>
                    Δ{call.delta.toFixed(2)} Γ{call.gamma.toFixed(3)} Θ{call.theta.toFixed(0)} V{call.vega.toFixed(2)}
                  </div>
                )}
              </div>
              
              <div className="strike-val" style={{ width: '60px', textAlign: 'center', alignSelf: 'center', fontSize: '10px', color: '#706b66' }}>{formatCurrency(strike)}</div>
              
              <div 
                className={`option-cell put ${isPutSelected ? 'selected' : ''}`}
                onClick={() => onSelect(put)}
                style={{ 
                  flex: 1, 
                  textAlign: 'center', 
                  cursor: 'pointer', 
                  backgroundColor: isPutSelected ? '#4a3d3d' : 'transparent', 
                  border: ownsPut ? '1px solid #ba8b8b' : 'none',
                  padding: '2px' 
                }}
              >
                <div className="premium" style={{ fontWeight: 'bold' }}>{put ? formatCurrency(put.premium) : '-'}</div>
                {put && (
                  <div className="greeks" style={{ fontSize: '8px', color: '#a89f8c' }}>
                    Δ{put.delta.toFixed(2)} Γ{put.gamma.toFixed(3)} Θ{put.theta.toFixed(0)} V{put.vega.toFixed(2)}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
