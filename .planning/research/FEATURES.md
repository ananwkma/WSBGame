# Feature Landscape: WallStreetBets Trader Game

**Domain:** Narrative Trading Simulation
**Researched:** 2024-05-24

## Table Stakes (Required)

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Robbinghood App | Essential for "trading." | Medium | Buying/selling stocks and options. |
| r/wsb Forum | Primary narrative source. | Medium | Scrolling list of "DD" posts and memes. |
| Portfolio Tracker | Displays gains/losses. | Low | Total Net Worth, % change, and "Stonks" line graph. |
| Messages App | Direct narrative delivery. | Low | Texts from "The Wife" and "Ape Friend." |

## Differentiators (Unique)

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Loss Porn Reputation | Turn failure into "clout." | Medium | Players earn "Karma" for massive red trades, unlocking new forum ranks. |
| GuruTube Videos | Parody of "finance gurus." | High | 4-color pixel animations of gurus giving contradictory advice. |
| FOMO Meter | Psychological mechanic. | Medium | As the forum hypes a stock, the player's "FOMO" increases, impacting UI jitter or button size. |
| Wife's Boyfriend | Narrative antagonist. | Low | Character who nags you about financial responsibility, serving as a foil to the forum. |

## Anti-Features (Avoid)

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Real-time Tickers | Too stressful/technical. | Turn-based "Steps": Price updates when you read a post or finish a "Day." |
| Portfolio Diversification | Contrary to "YOLO" theme. | Focus on 1-3 highly volatile "meme stocks" at a time. |
| Complex Tax Sims | Boring, non-gameplay. | Use a simple "Tax Man" narrative ending if the player makes $1M+. |

## Feature Dependencies

```
r/wsb Posts → Sentiment Change → Market Volatility → Robbinghood Price Update → Portfolio Status → Messages Trigger
```

## MVP Recommendation

Prioritize:
1. **Robbinghood Basic Trading**: Buy/Sell logic + Portfolio line graph.
2. **r/wsb Feed**: Static posts that update stock prices.
3. **Loss Porn Mechanic**: Reward the player for "Guh" moments.

Defer: **GuruTube** (High animation cost) and **Options Trading** (Keep it to stocks first).

## Sources

- [WallStreetBets Glossary](https://www.businessofbusiness.com/articles/the-ultimate-wallstreetbets-glossary/)
- [Trading Simulator Mechanics](https://en.wikipedia.org/wiki/Stock_market_simulator)
