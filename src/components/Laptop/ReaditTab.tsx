import React from 'react';

interface Reply {
  user: string;
  body: string;
  upvotes: string;
  time?: string;
}

const REPLIES: Reply[] = [
  {
    user: 'StockDaddy69',
    body: "bro the NEXT DAY button literally advances time, did you really buy options day 1 without even knowing that? absolute regard energy right there. also your portfolio chart updates in real time during market hours — watch the prices move, they don't need you to click anything",
    upvotes: '1.4k',
    time: '1h ago',
  },
  {
    user: 'DiamondHandsDave',
    body: "lmao 100% he's gonna load up on calls and wonder why they're worth $0 at expiry. PSA for OP: shares = you own it forever, options = ticking time bomb. calls make you rich if the stock goes up BEFORE expiry, puts make you rich if it drops. they expire at end of each day so don't baghold them overnight expecting a miracle",
    upvotes: '892',
    time: '58m ago',
  },
  {
    user: 'BoboTheBear',
    body: "if you blow up your cash there's a loan shark in your uMessage contacts who'll front you money. sounds great until you see the interest rate — it compounds every single day you advance time. borrowed $10k on day 2 and owed $60k by day 6. did not end well. but hey maybe you're built different king",
    upvotes: '734',
    time: '47m ago',
  },
  {
    user: 'PaperHandsPete',
    body: "the phone (uMessage tab) is your social life — wife texts there, she absolutely WILL send you passive aggressive messages if you're down bad. readit on your phone is the forum where WSB apes post hot takes. GuruTube on your laptop has some guy who picks stocks — not financial advice but also definitely financial advice",
    upvotes: '611',
    time: '35m ago',
  },
  {
    user: 'RetardStrength',
    body: "reminder that options expire at END OF EACH MARKET DAY. not end of the week, not at some theoretical future date — every single close. if you hold a call into market close it's gone. i cannot stress this enough. i have lost more money to this than i have to actual bad trades and that's saying something",
    upvotes: '2.1k',
    time: '22m ago',
  },
  {
    user: 'MoonMission2024',
    body: "the gurus on GuruTube give stock tips and each one has a different vibe/bias — some are perma-bulls, some are contrarians. they're useful but don't treat them as gospel. also earnings events fire on specific days for each stock and the price moves HARD — worth paying attention to the news panel when it pops up on your laptop",
    upvotes: '487',
    time: '11m ago',
  },
];

export const ReaditTab: React.FC = () => {
  return (
    <div className="phone-app-content" style={{ padding: '8px', overflowY: 'auto', height: '100%', boxSizing: 'border-box', color: '#e0dbcb' }}>
      {/* Main post */}
      <div className="forum-post" style={{ marginBottom: '12px', borderBottom: '2px solid #555', paddingBottom: '10px' }}>
        <div className="forum-post-header" style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px', flexWrap: 'wrap' }}>
          <span className="pixel-bold">u/DegenTrader</span>
          <span style={{ opacity: 0.6, fontSize: '0.75em' }}>• 2h ago</span>
          <span style={{ background: '#555', padding: '1px 5px', fontSize: '0.7em' }}>YOLO</span>
        </div>
        <div className="forum-post-title pixel-bold" style={{ fontSize: '0.9em', marginBottom: '8px' }}>
          10-day $100k to $1M YOLO challenge — day 1 let's get it
        </div>
        <div style={{ fontSize: '0.78em', lineHeight: '1.5', opacity: 0.9, marginBottom: '8px' }}>
          <p style={{ marginBottom: '6px' }}>
            Starting net worth: <strong>$100,000</strong>. Goal: <strong>$1,000,000</strong>. Timeline: 10 market days. Simple math, just 10x my money. I've been doing research (watching GuruTube for 3 days) and I feel very confident about this.
          </p>
          <p style={{ marginBottom: '6px' }}>
            My strategy: buy calls on high-volatility tickers, ride the momentum, sell before close. If a stock is green I buy calls. If it's red I buy puts. Might also use some leverage from a private lender I found in my contacts if things get tight early on. Risk management is for people who are afraid of success.
          </p>
          <p style={{ marginBottom: '6px' }}>
            Wife thinks I'm "investing in index funds" so no pressure there. Will update daily with P&L screenshots. Not taking any bearish comments seriously, I've already stress-tested this strategy in my head and it works.
          </p>
          <p style={{ opacity: 0.7, fontSize: '0.9em' }}>
            Positions: none yet. Market opens soon. Sitting in cash like a king before the slaughter begins.
          </p>
        </div>
        <div className="forum-post-footer">
          <span className="upvotes">▲ 4.2k</span>
          <span>💬 {REPLIES.length} comments</span>
          <span>🏆 14 awards</span>
        </div>
      </div>

      {/* Divider */}
      <div style={{ fontSize: '0.7em', opacity: 0.5, marginBottom: '8px' }}>— top comments —</div>

      {/* Replies */}
      {REPLIES.map((reply, i) => (
        <div
          key={i}
          className="forum-post"
          style={{
            marginBottom: '8px',
            paddingLeft: '8px',
            borderLeft: '2px solid #888',
          }}
        >
          <div className="forum-post-header" style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '3px' }}>
            <span className="pixel-bold" style={{ fontSize: '0.75em' }}>u/{reply.user}</span>
            {reply.time && <span style={{ opacity: 0.5, fontSize: '0.7em' }}>• {reply.time}</span>}
          </div>
          <div style={{ fontSize: '0.76em', lineHeight: '1.4', opacity: 0.9, marginBottom: '4px' }}>
            {reply.body}
          </div>
          <div style={{ fontSize: '0.7em', opacity: 0.6 }}>
            <span className="upvotes">▲ {reply.upvotes}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
