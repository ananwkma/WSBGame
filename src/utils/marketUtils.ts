import { HistoryPoint } from '../store/types';

/**
 * Generates plausible historical price data using a random walk algorithm.
 * 
 * @param initialPrice The starting price for the historical generation
 * @param turns Number of historical turns to generate
 * @param volatility Maximum percentage change per turn (default 0.05 or 5%)
 * @returns An array of HistoryPoint objects
 */
export const generateHistoricalData = (
  initialPrice: number,
  turns: number,
  volatility: number = 0.05
): HistoryPoint[] => {
  const history: HistoryPoint[] = [];
  let currentPrice = initialPrice;

  // We want to generate 'turns' points ending at the current price.
  // We'll work backwards or forwards. For simplicity, let's work forwards from a 
  // randomly adjusted starting point so the LAST point is roughly initialPrice.
  
  // Actually, easier: start at initialPrice and walk backwards, then reverse.
  for (let i = 0; i < turns; i++) {
    history.push({
      turn: -i, // Historical turns are negative relative to start (0)
      price: Math.max(1, Math.round(currentPrice * 100) / 100),
    });

    // Random walk: price * (1 + random(-volatility, volatility))
    const change = 1 + (Math.random() * volatility * 2 - volatility);
    currentPrice = currentPrice / change; // Go backwards
  }

  return history.reverse();
};
