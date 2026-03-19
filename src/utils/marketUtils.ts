import type { CandleBar, HistoryPoint } from '../store/types';

/**
 * Scales implied volatility by days-to-expiry.
 * Shorter DTE = higher effective IV (mimics real gamma/vol dynamics near expiry).
 *
 * At DTE=10 (max): 1.0× base IV
 * At DTE=5:        1.5× base IV
 * At DTE=1:        1.9× base IV
 * At DTE=0:        2.0× base IV
 */
export const scaledIV = (baseIV: number, daysToExpiry: number): number => {
  const dte = Math.max(0, Math.min(10, daysToExpiry));
  return baseIV * (1 + (10 - dte) / 10);
};

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

/**
 * Formats a value in cents into a USD currency string.
 * @param cents The amount in cents.
 * @returns A formatted string like "$12.34"
 */
export const formatCurrency = (cents: number): string => {
  return `$${(Math.abs(cents) / 100).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

// Suffixes from thousand up to quadrillion; beyond quadrillion → HOLY SHIT
const COMPACT_TIERS: [number, string][] = [
  [1e15, 'q'],  // quadrillion
  [1e12, 't'],  // trillion
  [1e9,  'b'],  // billion
  [1e6,  'm'],  // million
  [1e3,  'k'],  // thousand
];

export const formatCurrencyCompact = (cents: number): string => {
  const neg = cents < 0;
  const dollars = Math.abs(cents) / 100;
  const prefix = neg ? '-$' : '$';
  if (dollars >= 1e18) return `${neg ? '-' : ''}$HOLY SHIT`;
  for (const [divisor, suffix] of COMPACT_TIERS) {
    if (dollars >= divisor) {
      const val = dollars / divisor;
      const str = val % 1 === 0 ? `${val}` : parseFloat(val.toFixed(2)).toString();
      return `${prefix}${str}${suffix}`;
    }
  }
  return `${prefix}${dollars.toFixed(2)}`;
};

/**
 * Calculates the percentage change between two values.
 * @param current Current value
 * @param previous Previous value
 * @returns Percentage change (e.g., 5.25 for 5.25%)
 */
export const calculatePercentChange = (current: number, previous: number): number => {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

/**
 * Abramowitz & Stegun approximation for Standard Normal CDF.
 * This provides a high-accuracy approximation of the cumulative distribution function
 * for the standard normal distribution, essential for Black-Scholes.
 */
export const stdNormalCDF = (x: number): number => {
  const b1 = 0.319381530;
  const b2 = -0.356563782;
  const b3 = 1.781477937;
  const b4 = -1.821255978;
  const b5 = 1.330274429;
  const p = 0.2316419;
  const c = 0.39894228;

  if (x >= 0) {
    const t = 1.0 / (1.0 + p * x);
    return (1.0 - c * Math.exp(-x * x / 2.0) * t *
      (t * (t * (t * (t * b5 + b4) + b3) + b2) + b1));
  } else {
    const t = 1.0 / (1.0 - p * x);
    return (c * Math.exp(-x * x / 2.0) * t *
      (t * (t * (t * (t * b5 + b4) + b3) + b2) + b1));
  }
};

/**
 * Standard Normal Probability Density Function (PDF).
 */
export const stdNormalPDF = (x: number): number => {
  return Math.exp(-0.5 * Math.pow(x, 2)) / Math.sqrt(2 * Math.PI);
};

/**
 * Calculates Option Price and Greeks using the Black-Scholes model.
 * 
 * @param type 'CALL' or 'PUT'
 * @param s Current Stock Price (in cents)
 * @param k Strike Price (in cents)
 * @param t Time to expiration in years (e.g., 1/252 for 1 day)
 * @param v Volatility (IV) as a decimal (e.g., 0.5 for 50%)
 * @param r Risk-free interest rate (e.g., 0.05 for 5%)
 * @returns { price, delta, gamma, theta, vega }
 */
/**
 * Aggregates 1-minute CandleBar[] into larger timeframe bars.
 * @param bars - Array of 1-minute bars sorted by openTime ascending
 * @param intervalMinutes - Aggregation interval (1, 30, 60, 390 for daily)
 */
export function groupBars(bars: CandleBar[], intervalMinutes: number): CandleBar[] {
  if (bars.length === 0) return [];
  const grouped: CandleBar[] = [];
  let current: CandleBar | null = null;

  for (const bar of bars) {
    const bucketTime = Math.floor(bar.openTime / intervalMinutes) * intervalMinutes;
    if (!current || current.openTime !== bucketTime) {
      if (current) grouped.push(current);
      current = { openTime: bucketTime, open: bar.open, high: bar.high, low: bar.low, close: bar.close };
    } else {
      current = {
        ...current,
        high: Math.max(current.high, bar.high),
        low: Math.min(current.low, bar.low),
        close: bar.close,
      };
    }
  }
  if (current) grouped.push(current);
  return grouped;
}

export const calculateBS = (
  type: 'CALL' | 'PUT',
  s: number,
  k: number,
  t: number,
  v: number,
  r: number = 0.05
) => {
  // Edge case: Expiry or near-expiry
  if (t <= 0.0001) {
    const intrinsic = type === 'CALL' ? Math.max(0, s - k) : Math.max(0, k - s);
    return {
      price: Math.max(1, Math.round(intrinsic)), // Minimum 1 cent for active options
      delta: type === 'CALL' ? (s > k ? 1 : 0) : (s < k ? -1 : 0),
      gamma: 0,
      theta: 0,
      vega: 0
    };
  }

  // Intermediate BS components
  const d1 = (Math.log(s / k) + (r + Math.pow(v, 2) / 2) * t) / (v * Math.sqrt(t));
  const d2 = d1 - v * Math.sqrt(t);

  const n_d1 = stdNormalCDF(d1);
  const n_d2 = stdNormalCDF(d2);
  const pdf_d1 = stdNormalPDF(d1);

  let price, delta, theta;
  const exp_rt = Math.exp(-r * t);

  if (type === 'CALL') {
    price = s * n_d1 - k * exp_rt * n_d2;
    delta = n_d1;
    // Theta is usually negative, representing daily decay (divided by 252)
    theta = (-(s * pdf_d1 * v) / (2 * Math.sqrt(t)) - r * k * exp_rt * n_d2) / 252;
  } else {
    price = k * exp_rt * stdNormalCDF(-d2) - s * stdNormalCDF(-d1);
    delta = n_d1 - 1;
    // Theta is usually negative, representing daily decay (divided by 252)
    theta = (-(s * pdf_d1 * v) / (2 * Math.sqrt(t)) + r * k * exp_rt * stdNormalCDF(-d2)) / 252;
  }

  const gamma = pdf_d1 / (s * v * Math.sqrt(t));
  const vega = (s * Math.sqrt(t) * pdf_d1) / 100; // Price change for 1% IV shift

  return {
    price: Math.max(1, Math.round(price)), // Ensure non-zero price and round to cents
    delta,
    gamma,
    theta,
    vega
  };
};
