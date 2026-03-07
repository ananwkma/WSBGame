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
    "You're a disgrace. I'm taking everything that's left, which is nothing.",
    "My lawyer will be in touch. Don't bother coming home.",
    "How could you be so selfish? We had a life.",
    "The bank called. They're taking the house. I hope you're proud.",
    "I'm staying with Chad. He actually has a job.",
    "You're pathetic. Staring at red lines while our life burns down.",
    "I hope your 'diamond hands' can hold all the tears I've cried.",
    "My mom was right about you. You're a loser.",
    "I'm selling your computer to pay for the kids' shoes.",
    "Don't even try to apologize. There's nothing left to save.",
    "I'm changing the locks. Find a bridge to live under.",
    "The repo man is outside. I told him where you keep the keys.",
    "You gambled our future on a meme. I hope it was worth it.",
    "I'm done. I'm just done.",
    "Is this a joke to you? We're homeless!",
    "I'm taking the dog. You can't even feed yourself.",
    "I hope you enjoy your 'loss porn'. It's the only thing you have left.",
    "You ruined us. I never want to see your face again.",
    "I'm blocking your number. Goodbye, loser.",
    "Chad says he can get you a job washing his car. Think about it.",
  ],
  BROKE: [
    "I saw the bank statement. We have $40 left.",
    "I'm using the last of our savings to buy groceries. What happened?",
    "The credit card was declined at the pharmacy. Explain this.",
    "How could you do this to us? We had a future.",
    "I'm looking for a second job. You should do the same.",
    "We're eating ramen again tonight. Is this the 'tendies' you promised?",
    "The electricity bill is overdue. We're going to be in the dark soon.",
    "I had to borrow money from my parents. It was humiliating.",
    "You're obsessed with those charts. It's a sickness.",
    "The kids need new clothes. We don't have the money. Fix it.",
    "I'm selling my old clothes. It's the only way we're eating this week.",
    "Stop talking about 'the moon'. We can't even afford the bus.",
    "Every time I look at our account, I want to scream.",
    "You promised me a better life. This is a nightmare.",
    "I'm tired of pretending everything is okay. It's not.",
    "Are you even trying to find a real job? Or just gambling?",
    "I saw you looking at the market at 3 AM. Go to sleep.",
    "We're drowning and you're just watching the water rise.",
    "I can't even look at you right now. Just... stop.",
    "You're throwing our lives away for a screenshot.",
    "The landlord called again. I told him we'd have it soon. I lied.",
    "I'm so stressed I can't breathe. Please stop this.",
    "I don't know who you are anymore. This isn't you.",
    "Is this what success looks like? Because it feels like failure.",
    "I'm going to my mom's for a few days. I need space.",
  ],
  STRUGGLING: [
    "No more 'investing'. Get a job at Wendy's.",
    "We can't afford the heater this month. Wear a sweater.",
    "I'm selling my jewelry on eBay. Thanks for that.",
    "Is this ever going to end? I'm exhausted.",
    "Stop looking at those charts and go find some real work.",
    "The credit card debt is piling up. How are we going to pay this?",
    "I'm working overtime just to keep us afloat. What are you doing?",
    "Every time you say 'buy the dip', I want to cry.",
    "We're one bad week away from being broke. Do you even care?",
    "I saw your 'DD'. It looks like a five-year-old wrote it.",
    "Stop listening to those people on the internet. They don't care about us.",
    "I'm skipping my gym membership. We need the money for rent.",
    "Is this a hobby or a suicide mission? Tell me.",
    "I'm tired of being the only adult in this relationship.",
    "You're gambling with our security. It's not a game.",
    "The anxiety is killing me. Please, just sell everything.",
    "I saw the 'margin call' email. What does that even mean?",
    "You're chasing losses and it's scaring me.",
    "We haven't been out to dinner in months. I miss our life.",
    "I'm worried we're never going to recover from this.",
    "You're throwing good money after bad. Stop it.",
    "I don't recognize our bank statement. It's all red.",
    "Are you really going to gamble the last of our rent money?",
    "I'm so disappointed in you. You were supposed to be better than this.",
    "I hope your internet friends are going to pay our bills.",
  ],
  WORRIED: [
    "I'm skipping lunch to save money. Happy?",
    "Why are we always on the edge? I can't sleep anymore.",
    "I saw your 'loss porn' folder. It's not funny, it's our life.",
    "We need a miracle, not a 'short squeeze'.",
    "Every time your phone buzzes, I get a panic attack.",
    "I saw the balance drop again. When does it stop?",
    "You're spending all day in that 'forum'. It's not healthy.",
    "I'm worried we're going to lose everything. Tell me I'm wrong.",
    "You're so distracted. You're not even here when you're here.",
    "Let's just take the loss and move on. Please.",
    "I'm starting to dread the sound of the opening bell.",
    "You promised me this was a 'sure thing'. It doesn't look like it.",
    "I saw your browser history. 'How to tell wife I lost everything'?",
    "Is there any money left for the car payment?",
    "I'm so tired of the roller coaster. I just want off.",
    "You're betting our future on a meme stock. Think about that.",
    "I don't think I can handle another 'red day'.",
    "Why won't you just listen to me for once?",
    "I'm scared to check the mail. Are there more notices?",
    "You're acting like a different person when the market is down.",
    "I miss when we didn't have to talk about money every single day.",
    "Is this really worth the stress? Tell me it's worth it.",
    "I'm worried you're losing more than just money.",
    "Let's just put it all in an index fund and forget about it.",
    "I can't live like this anymore. Something has to change.",
  ],
  CONCERNED: [
    "Why is the credit card declined? Answer me.",
    "I'm worried about the kids' college fund. Did you touch it?",
    "You're acting strange. Is everything okay with the money?",
    "Let's just put what's left into a savings account. Please.",
    "I don't trust this 'market' of yours anymore.",
    "I saw a transfer I didn't recognize. What's 'Robbinghood'?",
    "You're being very secretive with your phone lately.",
    "I'm worried you're getting in over your head.",
    "Let's talk to a financial advisor. A real one.",
    "I saw your 'position' on that stock. It's way too much.",
    "Are we actually okay, or are you just telling me what I want to hear?",
    "I'm worried you're addicted to the rush, not the money.",
    "Why are you always so tense at 9:30 AM?",
    "I'm starting to feel like I can't trust you with our savings.",
    "You said we'd be ahead by now. We're not.",
    "Let's just take a break from the market for a month.",
    "I saw your 'ape' friends talking about 'HODL'. It sounds like a cult.",
    "I'm concerned that you're losing your perspective.",
    "Is this the life you wanted? Because it's not the one I wanted.",
    "I'm worried about what happens if this next trade fails.",
    "You're spending more time with your 'community' than with us.",
    "I'm starting to feel like I'm second to your portfolio.",
    "Let's just be honest about where we are. No more hiding.",
    "I'm concerned that you're chasing a dream that doesn't exist.",
    "We need to have a serious talk about our future. Tonight.",
  ],
  BASELINE: [
    "Hope your little game is going okay. Milk's out.",
    "Hope you're having a good day at 'work', honey!",
    "Don't forget to pick up milk on your way back from the 'moon'.",
    "Are you still staring at those lines on the screen? Dinner's ready.",
    "How's the 'investing' going? Seen any big moves today?",
    "Pick up some eggs on your way home. The 'good' ones.",
    "The lawn needs mowing. Put the phone down for an hour.",
    "I'm going to the mall. Need anything?",
    "Your mom called. She wants to know if you're coming for Sunday dinner.",
    "Did you see that thing on the news? The market seems crazy.",
    "I'm thinking about painting the guest room. What do you think?",
    "Don't spend all day in your office. The weather is nice.",
    "I saw your friend Dave today. He asked about your 'stocks'.",
    "Are we still on for dinner with the Millers on Friday?",
    "I'm tired of hearing about '{ticker}'. Let's talk about something else.",
    "I hope you're not getting too stressed. It's just money.",
    "The car needs an oil change. Can you take it in tomorrow?",
    "I saw you made a few bucks today. Nice job.",
    "I'm going to yoga. There's leftovers in the fridge.",
    "Don't stay up too late staring at the pre-market.",
    "Did you remember to pay the water bill?",
    "I'm thinking of starting a garden. We have the space.",
    "I hope you're having fun with your 'hobby'.",
    "Is it a green day or a red day? You look neutral.",
    "I'm just happy you're not losing our house. Keep it up.",
  ],
  COMFORTABLE: [
    "Did you actually make money today? Really?",
    "I saw the balance is up. Maybe we can finally get that new couch?",
    "You seem less stressed. Market treating you well?",
    "Let's go out for a decent dinner tonight. Nothing fancy.",
    "I'm starting to think you might actually know what you're doing.",
    "I saw a nice coffee machine today. I think we should get it.",
    "The account is looking pretty healthy. Good job, honey.",
    "Maybe we can take a small trip this weekend? Somewhere nice.",
    "I'm impressed. You've been consistently green lately.",
    "I saw you bought more {ticker}. Is that the 'alpha' you talk about?",
    "Let's upgrade our Netflix to the 4K plan. We can afford it.",
    "I'm glad your hard work is finally paying off.",
    "I told my friends you're quite the savvy investor.",
    "Maybe we should start a college fund for the kids with these gains?",
    "I saw a nice rug for the living room. It's a bit pricey, but...",
    "You're acting like a pro. I like this version of you.",
    "Let's celebrate your latest win with some sushi.",
    "I'm starting to feel more secure about our future. Thank you.",
    "What's the next big play? I'm actually interested now.",
    "I saw you mention 'theta' today. You sound so smart.",
    "Let's get the 'good' wine tonight. The one in the wooden box.",
    "I'm thinking about that SUV again. The one with the heated seats.",
    "You've really turned things around. I'm proud of you.",
    "Don't get too cocky, but... you're doing great.",
    "I saw your P/L today. That's a lot of commas!",
  ],
  WELL_OFF: [
    "I saw a nice SUV today. We should look at it.",
    "Honey, I'm thinking about that vacation we talked about.",
    "You're doing great! I told my mom you're a 'trader' now.",
    "The neighbors asked how we're affording the new deck. I just winked.",
    "Let's upgrade the TV. I think we've earned it.",
    "I'm looking at cruises. The Mediterranean looks beautiful.",
    "I just bought those premium shoes I wanted. No guilt!",
    "You're crushing it! Let's go to that steakhouse with the valet parking.",
    "I'm so glad we didn't listen to my mom about your 'gambling'.",
    "The account balance is getting serious. Are we 'rich' yet?",
    "I'm thinking about hiring a cleaning service once a week.",
    "You have such a 'money' vibe lately. I love it.",
    "Let's get the kitchen remodeled. I've already picked out the granite.",
    "I saw you made a year's salary in a week. That's insane!",
    "I told the girls at brunch that my husband is a market wizard.",
    "We should start looking at that country club membership.",
    "I'm so proud of how far you've come. You really have the touch.",
    "Let's buy that piece of art we saw. It would look great in the foyer.",
    "I just realized we haven't worried about a bill in months. Thank you.",
    "What's your secret? Is it the charts or just intuition?",
    "I saw you're up 50% this month. Let's go celebrate!",
    "I'm looking at first-class upgrades for our next flight.",
    "You're making this look easy. Maybe I should start trading too?",
    "I just realized our 'emergency fund' is now a 'lifestyle fund'.",
    "I love seeing you succeed. You deserve all of this.",
  ],
  RICH: [
    "Honey! Let's go to that fancy steakhouse!",
    "I'm looking at first-class tickets to Hawaii. What do you think?",
    "We should start looking at bigger houses. This place is getting small.",
    "I just bought that designer bag I wanted. We can afford it now!",
    "You're a genius! How did you pick that stock?",
    "I'm telling everyone at the club about your latest 'ten bagger'.",
    "Let's get a personal trainer. We need to stay fit for our new lifestyle.",
    "I saw a beautiful Porsche today. Just saying.",
    "The bank called to offer us a private banker. We've made it!",
    "I just booked a spa day for myself. And a spa week for next month.",
    "You're acting like a total boss. I love the confidence.",
    "Let's host a party and show off a little. We've earned it.",
    "I'm looking at summer homes. Something by the water?",
    "Your 'loss porn' days are definitely over. This is 'gain porn' now!",
    "I'm so happy I stuck with you through the 'Wendy's' phase.",
    "Let's buy that Peloton we talked about. And the one for the guest room.",
    "I told my sister she should ask you for stock tips. She's so jealous.",
    "You've got the Midas touch, honey. Everything you buy turns to gold.",
    "I'm thinking of starting a small business. With your backing, of course.",
    "Let's upgrade our wedding rings. Something with more... sparkle.",
    "I saw your account balance. I had to count the zeros three times!",
    "You're my favorite billionaire-in-training.",
    "I'm so glad we can finally breathe. You did it.",
    "Let's go to Vegas and bet it all on... wait, no, stay at the screen.",
    "I love you and your brilliant, money-making brain.",
  ],
  MILLIONAIRE: [
    "I'm telling everyone you're a genius.",
    "We're millionaires! I can't believe it! Should I quit my job?",
    "I just booked a week at the Ritz. Pack your bags, millionaire!",
    "Is it time to buy that boat you always wanted?",
    "My sister is so jealous right now. I love it.",
    "I just put a down payment on that mansion with the 6-car garage.",
    "We're actual millionaires. I'm going to say it until it sinks in.",
    "I just quit my job with a very satisfying email. Thank you, honey!",
    "Let's fly to Paris for the weekend. Just because we can.",
    "I'm looking at custom watches. You need something that screams 'success'.",
    "Your name is going to be on a building one day, isn't it?",
    "I just bought a horse. I've always wanted a horse.",
    "We should start a charitable foundation. 'The [Your Name] Fund for Tendies'.",
    "I'm so glad I didn't leave you for Chad back in the day.",
    "You're the king of Wall Street. In our house, at least.",
    "I just realized we never have to look at a price tag again.",
    "Let's get a driver. I'm tired of dealing with traffic.",
    "I'm looking at private islands. Just for research, obviously.",
    "You've changed our lives forever. I'm so proud of you.",
    "Is this real life? Or am I still dreaming of $10k?",
    "I saw you're up $200k today. That's more than we used to make in years.",
    "Let's buy a vineyard. I've always liked wine.",
    "You're a legend, honey. A literal legend.",
    "I'm so happy I can finally buy my parents that house I promised.",
    "I love our 'new money' life. It's much better than the old one.",
  ],
  MULTI_MILLIONAIRE: [
    "I just ordered a custom walk-in closet. Love you!",
    "Let's buy a vacation home in the Hamptons. Or maybe Aspen?",
    "I'm looking at private schools for the kids. Only the best.",
    "You should start a hedge fund. You're better than those Wall Street guys.",
    "I think we need a full-time chef. What do you think?",
    "I just bought a penthouse in the city. It has a helipad!",
    "We're so rich it's actually getting a little scary. I love it.",
    "I'm thinking of buying a professional sports team. A small one?",
    "I just spent $50k on a rug. It's hand-woven by monks. Or something.",
    "You're not just a trader, you're a force of nature.",
    "Let's hire a personal assistant. I'm tired of managing our 5 houses.",
    "I saw a yacht that makes our neighbor's boat look like a bathtub.",
    "I'm getting bored of the Hamptons. Let's try St. Barts this year.",
    "You've surpassed every expectation I ever had. You're incredible.",
    "I just bought a rare diamond. It's an 'investment', right?",
    "Let's host a gala for the symphony. We'll be the guests of honor.",
    "I'm thinking of commissioning a statue of you for the foyer.",
    "Our net worth has its own zip code now.",
    "I'm so glad we have 'fuck you' money now. It's very liberating.",
    "Let's buy a jet. I'm tired of waiting for NetJets to have a plane ready.",
    "I saw you're making $1M a day now. That's just... wow.",
    "I'm looking at castles in Scotland. Imagine the Christmas photos!",
    "You're a titan of industry, honey. At least in my eyes.",
    "I just realized our taxes are more than our old net worth. Crazy.",
    "I love our life. I love you. I love everything right now.",
  ],
  DECA_MILLIONAIRE: [
    "Let's buy the house next door for my parents.",
    "I saw a beautiful yacht today. It's only $15 million. A steal!",
    "Do we really need to fly commercial anymore? Let's look at NetJets.",
    "I'm donating a wing to the local hospital. Our name will be on it!",
    "I love our new life. You're my hero.",
    "I just bought a small office building. Just for your 'trading'.",
    "We're officially 'old money' now. Even though we just made it.",
    "I'm thinking of buying a news network. To make sure they say nice things about you.",
    "Let's get a security detail. We're getting too famous for the mall.",
    "I just bought a rare Ferrari. The one that only has 5 in the world.",
    "You're a legend on the street. They call you 'The Oracle of [Your Town]'.",
    "I'm looking at islands in the Maldives. Let's build a resort for our friends.",
    "Our wealth is starting to feel like a video game. How high can we go?",
    "I just commissioned a portrait of us by a world-famous artist.",
    "Let's buy a skyscraper. Just to put our name on the top.",
    "I'm bored of the yacht. Let's get a bigger one with a submarine.",
    "I just donated $10M to save the whales. Or the turtles. I forget.",
    "You're the smartest man I know. And definitely the richest.",
    "I love that we can change people's lives with a signature.",
    "Let's buy a professional soccer team in Europe. It looks fun.",
    "I saw you're worth $75M today. Let's go for $100M by Friday!",
    "I'm looking at property on the moon. Just in case.",
    "You've conquered the market. What's next?",
    "I just bought a historical landmark. I'm going to turn it into a spa.",
    "I'm so proud to be Mrs. [Your Last Name]. You're a giant.",
  ],
  CENT_MILLIONAIRE: [
    "Is a private jet too much? I don't care.",
    "I'm thinking about buying an island. A small one.",
    "Our accountant says we're making more in interest than we can spend.",
    "Let's host a gala for charity. We can invite the governor.",
    "I just bought a vintage Ferrari. It matches your eyes.",
    "I'm thinking of buying a small tech company. Just to see how it works.",
    "We're so rich we're actually starting to get invited to Davos.",
    "I just bought a Picasso. I think it looks nice in the bathroom.",
    "Let's buy a winery in Tuscany. I want our own label.",
    "You're not just rich, you're 'systemically important' now.",
    "I'm looking at mega-yachts. The ones with two helipads.",
    "I just donated $50M to my university. They're renaming the library.",
    "Our net worth is a nine-figure number. It looks so beautiful on paper.",
    "I'm bored of this country. Let's buy a villa in every time zone.",
    "You're a financial god, honey. Truly.",
    "I just bought a collection of rare watches. They're like little pieces of art.",
    "Let's start our own space agency. 'Wife-X'?",
    "I'm thinking of buying a professional basketball team. I like the jerseys.",
    "We're basically royalty now. Without the annoying traditions.",
    "I saw you made $50M on a single trade. I'm going to go buy a diamond.",
    "I love that our biggest problem is 'where to park the third jet'.",
    "Let's buy a medieval castle and modernize it. High-speed internet for your charts!",
    "You've won the game of life. I'm just happy to be your co-op partner.",
    "I just realized our kids' kids will never have to work. Good job.",
    "I love you. And I really, really love your portfolio.",
  ],
  BILLIONAIRE: [
    "I'm bored. Should we buy a small country?",
    "The yacht is finally ready. See you in Monaco!",
    "I'm thinking of starting a space program. Why let Elon have all the fun?",
    "We're billionaires. Does anything even matter anymore?",
    "I love you more than all our billions. (But the billions are nice too).",
    "I just bought a professional sports league. Not just a team, the whole league.",
    "We're so rich we can literally move markets with a tweet. Don't do it.",
    "I'm thinking of buying a small moon. Is that possible yet?",
    "I just donated a billion to end world hunger. Or at least make a dent.",
    "You're a living legend. A titan of the modern age.",
    "I'm bored of Earth. Let's go to the space station for the weekend.",
    "I just bought a newspaper. To make sure they write 'Billionaire' before your name.",
    "Our wealth is now a force of nature. We're beyond money.",
    "I'm thinking of buying a small mountain range. I like the view.",
    "You've reached the top of the leaderboard. King of the world!",
    "I just bought a rare manuscript by Leonardo da Vinci. It's my new bedtime story.",
    "Let's build a city. A smart city. With our name on every street.",
    "I'm so rich I'm starting to forget what things cost. What's a gallon of milk, $100?",
    "We're billionaires. We can do anything. We ARE anything.",
    "I saw you're the #1 trader in the world today. I'm so proud.",
    "I love that we can change the course of history with a wire transfer.",
    "Let's buy a small ocean. I want my own private sea.",
    "You're a god among men, honey. A very wealthy god.",
    "I just realized we have more money than 50 countries combined. Wow.",
    "I love you. To the moon and back. In our own rocket.",
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
