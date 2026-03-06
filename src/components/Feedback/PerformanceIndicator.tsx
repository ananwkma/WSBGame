import React from 'react';
import { formatCurrency } from '../../utils/marketUtils';

interface PerformanceIndicatorProps {
  value?: number; // In cents
  percent?: number; // In percentage (e.g., 5.25 for 5.25%)
  showAmount?: boolean;
  showPercent?: boolean;
  inline?: boolean;
  forceSign?: boolean;
}

export const PerformanceIndicator: React.FC<PerformanceIndicatorProps> = ({
  value,
  percent,
  showAmount = true,
  showPercent = true,
  inline = false,
  forceSign = true,
}) => {
  // Determine if positive or negative. Prefer value if both provided.
  const isPositive = (value !== undefined ? value : (percent || 0)) >= 0;
  const color = isPositive ? '#94ba8b' : '#ba8b8b';
  const prefix = isPositive && forceSign ? '+' : isPositive ? '' : '-';

  const displayPercent = percent !== undefined ? `${prefix}${Math.abs(percent).toFixed(2)}%` : '';
  const displayAmount = value !== undefined ? `${prefix}${formatCurrency(value)}` : '';

  return (
    <span
      className="performance-indicator"
      style={{
        color,
        fontSize: 'inherit',
        display: inline ? 'inline' : 'inline-block',
        marginLeft: inline ? '4px' : '0',
        fontWeight: 'bold',
      }}
    >
      {showAmount && value !== undefined && (
        <span className="amount">{displayAmount}</span>
      )}
      {showAmount && value !== undefined && showPercent && percent !== undefined && (
        <span className="separator" style={{ margin: '0 4px' }}> </span>
      )}
      {showPercent && percent !== undefined && (
        <span className="percent">({displayPercent})</span>
      )}
    </span>
  );
};
