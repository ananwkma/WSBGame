import { WifeBracket } from '../store/types';

export type TemplateCategory = 'WIFE' | 'GURU' | 'APES' | 'BROKERAGE' | 'IRS' | 'LAMBO' | 'STALKER' | 'COWORKER';
export type PerformanceTier = 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';

export interface TemplateContext {
  ticker?: string;
  amount?: string;
  percentage?: string;
  netWorth?: string;
}

export const WIFE_BRACKETS: { min: number; max: number; key: WifeBracket }[] = [
  { min: -Infinity, max: 0, key: 'BANKRUPT' },
  { min: 0, max: 1000000, key: 'BROKE' }, // $10k
  { min: 1000000, max: 2500000, key: 'STRUGGLING' }, // $25k
  { min: 2500000, max: 5000000, key: 'WORRIED' }, // $50k
  { min: 5000000, max: 7500000, key: 'CONCERNED' }, // $75k
  { min: 7500000, max: 12500000, key: 'BASELINE' }, // $125k
  { min: 12500000, max: 25000000, key: 'COMFORTABLE' }, // $250k
  { min: 25000000, max: 50000000, key: 'WELL_OFF' }, // $500k
  { min: 50000000, max: 100000000, key: 'RICH' }, // $1M
  { min: 100000000, max: 500000000, key: 'MILLIONAIRE' }, // $5M
  { min: 500000000, max: 2500000000, key: 'MULTI_MILLIONAIRE' }, // $25M
  { min: 2500000000, max: 10000000000, key: 'DECA_MILLIONAIRE' }, // $100M
  { min: 10000000000, max: 100000000000, key: 'CENT_MILLIONAIRE' }, // $1B
  { min: 100000000000, max: Infinity, key: 'BILLIONAIRE' },
];

export function getWifeBracket(netWorthInCents: number): WifeBracket {
  return WIFE_BRACKETS.find(b => netWorthInCents >= b.min && netWorthInCents < b.max)?.key || 'BASELINE';
}

export const WIFE_MESSAGES: Record<WifeBracket, string[]> = {
  BANKRUPT: [
    "I've filed the papers. You're a monster.",
    "I'm at my sister's. Don't call me.",
    "The kids are crying. You gambled away the mortgage.",
    "My boyfriend said you can sleep in his car tonight. Maybe.",
    "I saw the eviction notice. I hope you're happy with your 'options'.",
  ],
  BROKE: [
    "I saw the bank statement. We have $40 left.",
    "I'm using the last of our savings to buy groceries. What happened?",
    "The credit card was declined at the pharmacy. Explain this.",
    "How could you do this to us? We had a future.",
    "I'm looking for a second job. You should do the same.",
  ],
  STRUGGLING: [
    "No more 'investing'. Get a job at Wendy's.",
    "We can't afford the heater this month. Wear a sweater.",
    "I'm selling my jewelry on eBay. Thanks for that.",
    "Is this ever going to end? I'm exhausted.",
    "Stop looking at those charts and go find some real work.",
  ],
  WORRIED: [
    "I'm skipping lunch to save money. Happy?",
    "Why are we always on the edge? I can't sleep anymore.",
    "I saw your 'loss porn' folder. It's not funny, it's our life.",
    "We need a miracle, not a 'short squeeze'.",
    "Every time your phone buzzes, I get a panic attack.",
  ],
  CONCERNED: [
    "Why is the credit card declined? Answer me.",
    "I'm worried about the kids' college fund. Did you touch it?",
    "You're acting strange. Is everything okay with the money?",
    "Let's just put what's left into a savings account. Please.",
    "I don't trust this 'market' of yours anymore.",
  ],
  BASELINE: [
    "Hope your little game is going okay. Milk's out.",
    "Hope you're having a good day at 'work', honey!",
    "Don't forget to pick up milk on your way back from the 'moon'.",
    "Are you still staring at those lines on the screen? Dinner's ready.",
    "How's the 'investing' going? Seen any big moves today?",
  ],
  COMFORTABLE: [
    "Did you actually make money today? Really?",
    "I saw the balance is up. Maybe we can finally get that new couch?",
    "You seem less stressed. Market treating you well?",
    "Let's go out for a decent dinner tonight. Nothing fancy.",
    "I'm starting to think you might actually know what you're doing.",
  ],
  WELL_OFF: [
    "I saw a nice SUV today. We should look at it.",
    "Honey, I'm thinking about that vacation we talked about.",
    "You're doing great! I told my mom you're a 'trader' now.",
    "The neighbors asked how we're affording the new deck. I just winked.",
    "Let's upgrade the TV. I think we've earned it.",
  ],
  RICH: [
    "Honey! Let's go to that fancy steakhouse!",
    "I'm looking at first-class tickets to Hawaii. What do you think?",
    "We should start looking at bigger houses. This place is getting small.",
    "I just bought that designer bag I wanted. We can afford it now!",
    "You're a genius! How did you pick that stock?",
  ],
  MILLIONAIRE: [
    "I'm telling everyone you're a genius.",
    "We're millionaires! I can't believe it! Should I quit my job?",
    "I just booked a week at the Ritz. Pack your bags, millionaire!",
    "Is it time to buy that boat you always wanted?",
    "My sister is so jealous right now. I love it.",
  ],
  MULTI_MILLIONAIRE: [
    "I just ordered a custom walk-in closet. Love you!",
    "Let's buy a vacation home in the Hamptons. Or maybe Aspen?",
    "I'm looking at private schools for the kids. Only the best.",
    "You should start a hedge fund. You're better than those Wall Street guys.",
    "I think we need a full-time chef. What do you think?",
  ],
  DECA_MILLIONAIRE: [
    "Let's buy the house next door for my parents.",
    "I saw a beautiful yacht today. It's only $15 million. A steal!",
    "Do we really need to fly commercial anymore? Let's look at NetJets.",
    "I'm donating a wing to the local hospital. Our name will be on it!",
    "I love our new life. You're my hero.",
  ],
  CENT_MILLIONAIRE: [
    "Is a private jet too much? I don't care.",
    "I'm thinking about buying an island. A small one.",
    "Our accountant says we're making more in interest than we can spend.",
    "Let's host a gala for charity. We can invite the governor.",
    "I just bought a vintage Ferrari. It matches your eyes.",
  ],
  BILLIONAIRE: [
    "I'm bored. Should we buy a small country?",
    "The yacht is finally ready. See you in Monaco!",
    "I'm thinking of starting a space program. Why let Elon have all the fun?",
    "We're billionaires. Does anything even matter anymore?",
    "I love you more than all our billions. (But the billions are nice too).",
  ],
};

export const MESSAGE_TEMPLATES: Record<Exclude<TemplateCategory, 'WIFE'>, Record<PerformanceTier, string[]>> = {
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
      "You've been invited to our private wealth management seminar.",
    ],
    NEGATIVE: [
      "WARNING: Your account is approaching margin maintenance requirements.",
      "Margin Call: Please deposit funds or liquidate positions immediately.",
      "Your recent trades have been flagged for high volatility. Trade carefully.",
      "Restriction: You are currently flagged as a pattern day trader.",
    ],
    NEUTRAL: [
      "Scheduled maintenance tonight. Expect some 'glitches'.",
      "New features added to the platform. Check them out!",
      "Your monthly statement is ready for review.",
      "Privacy policy update: We share everything with the market makers.",
    ],
  },
  IRS: {
    POSITIVE: [
      "We've noticed your recent capital gains. We look forward to your tax return.",
      "Congratulations on your success. Please remember to set aside 40% for us.",
      "Our system flagged your account for 'exceptional' profitability. Audits are fun!",
    ],
    NEGATIVE: [
      "We've noticed your significant losses. You can deduct $3,000. Maximum. Good luck.",
      "Even in poverty, you still owe us for those early gains.",
      "This is a reminder that capital losses don't pay the rent.",
    ],
    NEUTRAL: [
      "This is an automated message from the Internal Revenue Service.",
      "Please verify your identity via our extremely slow web portal.",
      "Your tax transcript is now available. It's 500 pages of nonsense.",
    ],
  },
  LAMBO: {
    POSITIVE: [
      "The Aventador you inquired about is ready for a test drive. Bring cash.",
      "We have a Huracán in 'Moon Green' that just arrived. Interested?",
      "Our platinum membership is now open to you. Welcome to the club.",
    ],
    NEGATIVE: [
      "Unfortunately, your credit application was denied. Try a used Honda?",
      "Please stop loitering in our showroom. The security is getting nervous.",
      "We've updated our pricing. You are now further away from your dream car.",
    ],
    NEUTRAL: [
      "New models for next year have been announced.",
      "Did you know: Lamborghinis were originally tractors. Just like your portfolio.",
      "Check out our new line of branded keychains. It's all you can afford right now.",
    ],
  },
  STALKER: {
    POSITIVE: [
      "I saw you bought more {ticker}. I did too. We're connected.",
      "You're doing so well. I'm watching your account from outside your window.",
      "I like the way you click the 'Buy' button. It's very firm.",
    ],
    NEGATIVE: [
      "I saw you sell. You're weak. I'm disappointed in you.",
      "Why are you crying? The screen is getting blurry. I'll bring tissues.",
      "You lost so much. Don't worry, I'll still be here when you're broke.",
    ],
    NEUTRAL: [
      "I know where you live. And I know your average cost on {ticker}.",
      "Your curtains are open. I like the new monitor.",
      "Did you feel that? That was me breathing on your neck through the internet.",
    ],
  },
  COWORKER: {
    POSITIVE: [
      "Hey, I heard you're crushing it in the market. Can I quit yet?",
      "The boss is looking for you, but I told him you're busy making millions.",
      "Lunch is on you today, Mr. Moneybags!",
    ],
    NEGATIVE: [
      "Is it true you lost your life savings? HR wants to talk about your 'distractions'.",
      "I saw your screen. Those red bars look painful. You okay, buddy?",
      "Hey, I have a spare desk in the basement if you need to hide from the debt collectors.",
    ],
    NEUTRAL: [
      "Did you finish that report? Or are you still watching the charts?",
      "Coffee break? I want to hear about this 'short squeeze' thing again.",
      "The printer is jammed. Just like your trade orders probably.",
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
  let templates: string[] = [];
  
  if (category === 'WIFE') {
    // If we call getRandomTemplate with WIFE, we default to BASELINE if netWorth context is missing
    // or we should have a specific function for WIFE.
    // The plan says: Update getRandomTemplate to handle the WIFE category separately by using getWifeBracket
    // or create a new getRandomWifeTemplate function.
    
    // If netWorth is provided in context as a string, we parse it.
    // Otherwise we might need to change the signature or provide netWorth separately.
    const netWorthCents = context.netWorth ? parseInt(context.netWorth) : 10000000; // default to $100k
    const bracket = getWifeBracket(netWorthCents);
    templates = WIFE_MESSAGES[bracket];
  } else {
    templates = (MESSAGE_TEMPLATES as any)[category][tier];
  }

  let template = templates[Math.floor(Math.random() * templates.length)];
  
  // Replace placeholders
  Object.entries(context).forEach(([key, value]) => {
    if (value) {
      template = template.replace(new RegExp(`{${key}}`, 'g'), value);
    }
  });
  
  return template;
}

export function getRandomWifeTemplate(netWorthInCents: number, context: TemplateContext = {}): string {
  const bracket = getWifeBracket(netWorthInCents);
  const templates = WIFE_MESSAGES[bracket];
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

