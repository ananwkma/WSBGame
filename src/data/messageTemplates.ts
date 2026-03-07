export type TemplateCategory = 'WIFE' | 'GURU' | 'APES' | 'BROKERAGE';
export type PerformanceTier = 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';

export interface TemplateContext {
  ticker?: string;
  amount?: string;
  percentage?: string;
  netWorth?: string;
}

export const MESSAGE_TEMPLATES: Record<TemplateCategory, Record<PerformanceTier, string[]>> = {
  WIFE: {
    POSITIVE: [
      "Honey, I'm so proud of you! I'm looking at houses in the Hamptons.",
      "Did you see that new Tesla? I think it would look great in our driveway.",
      "I told my mom you're a financial genius. Don't make me a liar!",
      "Dinner is on me tonight! (Well, technically on your gains lol)",
      "I just bought that designer bag I wanted. We can afford it now, right?",
    ],
    NEGATIVE: [
      "I saw the bank account. Please tell me it's a mistake.",
      "The mortgage check bounced. What is going on??",
      "My sister said she saw you looking at 'loss porn' on Reddit. What does that even mean?",
      "We need to talk. Now.",
      "Are we going to be able to pay rent this month? I'm getting worried.",
    ],
    NEUTRAL: [
      "Hope you're having a good day at 'work', honey!",
      "Don't forget to pick up milk on your way back from the 'moon'.",
      "Are you still staring at those lines on the screen? Dinner's ready.",
      "How's the 'investing' going? Seen any big moves today?",
      "Just saw a commercial for some stock app. Made me think of you.",
    ],
  },
  GURU: {
    POSITIVE: [
      "My charts were 100% accurate. Who else is printing money today? 🤑",
      "We called the bottom perfectly. I hope you guys followed my lead.",
      "Gains on gains! This is why you subscribe to the inner circle.",
      "The whales are finally doing what I predicted. Easy money.",
      "Pure technical analysis wins again. The signals were all there.",
    ],
    NEGATIVE: [
      "Market manipulation at its finest. They're trying to shake us out!",
      "A temporary setback. My long-term thesis remains unchanged.",
      "The algorithm is doing something weird today. Stay calm.",
      "Who's still holding? Only the strongest hands will survive this.",
      "They want your shares. Don't let them have it for cheap.",
    ],
    NEUTRAL: [
      "Volatility is a gift. Learn to trade it.",
      "Watching the 15-minute candles closely. Something is brewing.",
      "The trend is your friend until the end.",
      "Remember: risk management is everything.",
      "Sideways action is just consolidation before the next leg up.",
    ],
  },
  APES: {
    POSITIVE: [
      "TO THE MOON! 🚀🚀🚀",
      "LFG! {ticker} is literally free money right now.",
      "I just sold my car for more {ticker}. YOLO!",
      "Hedge funds are literally crying on TV right now. WE ARE WINNING!",
      "Who else is diamond handing with me? 💎🙌",
    ],
    NEGATIVE: [
      "Who else is bagholding {ticker}? 🤡",
      "Is {ticker} dead? I'm down 90%.",
      "Buy the dip! It's a fire sale!",
      "My wife's boyfriend says I'm a genius for holding. I think he's lying.",
      "GUH. {ticker} is hurting me.",
    ],
    NEUTRAL: [
      "Just another day in the casino. 🎰",
      "Wait, you guys still have money left?",
      "Apes together strong! 🦍🦍🦍",
      "What's the move for tomorrow? $GAME or $POPC?",
      "I don't even know what {ticker} does, I just like the stock.",
    ],
  },
  BROKERAGE: {
    POSITIVE: [
      "Your account has reached a new all-time high! Great job.",
      "You have been upgraded to Gold Status. Enjoy your 'perks'.",
      "Interest rates on your cash balance have increased.",
    ],
    NEGATIVE: [
      "WARNING: Your account is approaching margin maintenance requirements.",
      "Margin Call: Please deposit funds or liquidate positions immediately.",
      "Your recent trades have been flagged for high volatility. Trade carefully.",
    ],
    NEUTRAL: [
      "Scheduled maintenance tonight. Expect some 'glitches'.",
      "New features added to the platform. Check them out!",
      "Your monthly statement is ready for review.",
    ],
  },
};

export const GURU_PREDICTIONS = {
  BULLISH: [
    "My charts say {ticker} breakout tomorrow. 🚀",
    "Whales accumulating {ticker}. Get in before it's too late.",
    "{ticker} bullish cross on the daily. Target: the moon.",
    "Tip: {ticker} is about to explode. Don't say I didn't warn you.",
    "Ignore FUD, {ticker} is going UP.",
  ],
  BEARISH: [
    "{ticker} looking weak. 📉",
    "Massive dump coming for {ticker}. Take profits now.",
    "Stay away from {ticker}. The trend is breaking.",
    "SELL {ticker}! The squeeze is over.",
    "Bear flag on {ticker}. Preparing for a deep dive.",
  ],
};

export function getRandomTemplate(category: TemplateCategory, tier: PerformanceTier, context: TemplateContext = {}): string {
  const templates = MESSAGE_TEMPLATES[category][tier];
  let template = templates[Math.floor(Math.random() * templates.length)];
  
  // Replace placeholders
  Object.entries(context).forEach(([key, value]) => {
    if (value) {
      template = template.replace(new RegExp(`{${key}}`, 'g'), value);
    }
  });
  
  return template;
}

export function getRandomPrediction(sentiment: 'BULLISH' | 'BEARISH', ticker: string): string {
  const templates = GURU_PREDICTIONS[sentiment];
  let template = templates[Math.floor(Math.random() * templates.length)];
  return template.replace(/{ticker}/g, ticker);
}
