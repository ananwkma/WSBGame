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
    body: "bro the NEXT DAY button literally advances time 💀 did you really buy options day 1 without even knowing that?? absolute regard energy right there 🦍. also your portfolio chart updates in real time during market hours — watch the prices move, they don't need you to click anything 📈",
    upvotes: '1.4k',
    time: '1h ago',
  },
  {
    user: 'DiamondHandsDave',
    body: "lmao 💎🙌 100% he's gonna load up on calls and wonder why they're worth $0 at expiry. PSA for OP: shares = you own it forever, options = ticking time bomb 💣. calls make you rich if stock goes up BEFORE expiry, puts if it drops. they expire on day 11 so don't baghold them into the void expecting a miracle 🙏",
    upvotes: '892',
    time: '58m ago',
  },
  {
    user: 'BoboTheBear',
    body: "if you blow up your cash there's a loan shark in your uMessage contacts who'll front you money 🦈. sounds great until you see the interest rate — it compounds EVERY. SINGLE. DAY. borrowed $10k on day 2 and owed $60k by day 6 💸💸💸. did not end well. but hey maybe you're built different king 👑",
    upvotes: '734',
    time: '47m ago',
  },
  {
    user: 'PaperHandsPete',
    body: "the phone (uMessage tab) is your social life 📱 — wife texts there, she absolutely WILL send passive aggressive messages if you're down bad 😬. readit on your phone is where WSB apes post hot takes 🦍. GuruTube on your laptop has some guy who picks stocks — not financial advice but also definitely financial advice 🤡",
    upvotes: '611',
    time: '35m ago',
  },
  {
    user: 'RegardStrength',
    body: "‼️ REMINDER ‼️ options expire on DAY 11 when your challenge ends. not end of each day, not end of week — day 11 🔔. so yes you CAN baghold them, but if you're holding at expiry, they gone 🪦. i can''t stress this enough. i've lost more money to theta decay than to actual bad trades and that's sayin something 😭📉",
    upvotes: '2.1k',
    time: '22m ago',
  },
  {
    user: 'MoonMission2024',
    body: "gurus on GuruTube give stock tips and each has a different vibe 🔮 — some perma-bulls, some contrarians. useful but don't treat as gospel 📖. also earnings events fire on specific days for each stock and the price moves HARD 🚀🔥 — watch the news panel when it pops up on your laptop, that's your alpha 🧠",
    upvotes: '487',
    time: '11m ago',
  },
];

export const ReaditTab: React.FC = () => {
  return (
    <div style={{ display: 'flex', height: '100%', color: '#e0dbcb', boxSizing: 'border-box', fontFamily: 'inherit', fontSize: '15px' }}>

      {/* Sidebar — left */}
      <div style={{
        width: '207px',
        flexShrink: 0,
        overflowY: 'auto',
        padding: '10px 8px',
        borderRight: '1px solid #444',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        fontSize: '0.78em',
      }}>

        {/* Profile card */}
        <div style={{ background: '#2b2b26', border: '1px solid #555', padding: '8px' }}>
          <div style={{ fontSize: '0.72em', opacity: 0.5, marginBottom: '5px', letterSpacing: '0.08em' }}>MY PROFILE</div>
          <div className="pixel-bold" style={{ fontSize: '0.92em', color: '#a8c8a0', marginBottom: '2px' }}>u/DegenTrader</div>
          <div style={{ fontSize: '0.72em', opacity: 0.55, marginBottom: '8px' }}>that's you 🫵</div>
          <div style={{ borderTop: '1px solid #444', paddingTop: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ opacity: 0.6 }}>karma</span>
              <span className="pixel-bold">4.2k</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ opacity: 0.6 }}>cake day</span>
              <span>Oct 3</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ opacity: 0.6 }}>posts</span>
              <span>1</span>
            </div>
          </div>
        </div>

        {/* Community card */}
        <div style={{ background: '#2b2b26', border: '1px solid #555', padding: '8px' }}>
          <div style={{ fontSize: '0.72em', opacity: 0.5, marginBottom: '5px', letterSpacing: '0.08em' }}>r/WallStreetBets</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ opacity: 0.6 }}>members</span>
              <span>14.2M</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ opacity: 0.6 }}>online</span>
              <span style={{ color: '#a8c8a0' }}>● 42k</span>
            </div>
          </div>
          <div style={{ marginTop: '7px', fontSize: '0.76em', opacity: 0.6, lineHeight: '1.4' }}>
            Like 4chan found a Bloomberg terminal.
          </div>
        </div>

        {/* Rules stub */}
        <div style={{ background: '#2b2b26', border: '1px solid #555', padding: '8px' }}>
          <div style={{ fontSize: '0.72em', opacity: 0.5, marginBottom: '5px', letterSpacing: '0.08em' }}>RULES</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', opacity: 0.65, lineHeight: '1.35' }}>
            <div>1. Positions or ban</div>
            <div>2. No paper trading</div>
            <div>3. Losses &gt; gains</div>
            <div>4. YOLO or go home</div>
          </div>
        </div>

        {/* My communities — fills remaining space */}
        <div style={{ background: '#2b2b26', border: '1px solid #555', padding: '8px', flex: 1 }}>
          <div style={{ fontSize: '0.72em', opacity: 0.5, marginBottom: '7px', letterSpacing: '0.08em' }}>MY COMMUNITIES</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
            {[
              { sub: 'r/wallstreetbets', dot: '#a8c8a0', members: '14.2M' },
              { sub: 'r/smallstreetbets', dot: '#a8c8a0', members: '312k' },
              { sub: 'r/GAME', dot: '#c8a8a0', members: '89k' },
              { sub: 'r/POPC', dot: '#c8a8a0', members: '54k' },
              { sub: 'r/DOGE', dot: '#c8c8a0', members: '2.1M' },
              { sub: 'r/Superstonk', dot: '#a8c8a0', members: '780k' },
              { sub: 'r/thetagang', dot: '#a0b8c8', members: '230k' },
              { sub: 'r/investing', dot: '#a0b8c8', members: '2.4M' },
              { sub: 'r/pennystocks', dot: '#c8a8a0', members: '445k' },
              { sub: 'r/options', dot: '#a0b8c8', members: '1.1M' },
              { sub: 'r/CryptoMoonShots', dot: '#c8c8a0', members: '670k' },
              { sub: 'r/lostmywifesmoney', dot: '#c8a8a0', members: '18k' },
            ].map(({ sub, dot, members }) => (
              <div key={sub} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 2px', borderBottom: '1px solid #3a3a35' }}>
                <span style={{ color: dot, fontSize: '0.7em', flexShrink: 0 }}>●</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '0.8em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sub}</div>
                  <div style={{ fontSize: '0.68em', opacity: 0.45 }}>{members} members</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Main feed */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 10px 10px 8px', minWidth: 0 }}>

        {/* Main post */}
        <div className="forum-post" style={{ marginBottom: '12px', borderBottom: '2px solid #555', paddingBottom: '10px' }}>
          <div className="forum-post-header" style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '5px', flexWrap: 'wrap' }}>
            <span className="pixel-bold" style={{ fontSize: '1.15em' }}>u/DegenTrader</span>
            <span style={{ background: '#4a7c59', color: '#e0dbcb', padding: '1px 5px', fontSize: '0.7em', letterSpacing: '0.05em' }}>YOU</span>
            <span style={{ opacity: 0.6, fontSize: '0.8em' }}>• 2h ago</span>
            <span style={{ background: '#555', padding: '1px 5px', fontSize: '0.72em' }}>YOLO</span>
          </div>
          <div className="forum-post-title pixel-bold" style={{ fontSize: '1em', marginBottom: '8px' }}>
            🚀🚀 10-day $100k to $1M YOLO challenge — day 1 LFG 🦍💎
          </div>
          <div style={{ fontSize: '0.88em', lineHeight: '1.55', opacity: 0.9, marginBottom: '8px' }}>
            <p style={{ marginBottom: '7px' }}>
              Starting net worth: <strong>$100,000</strong> 💰. Goal: <strong>$1,000,000</strong> 🏆. Timeline: 10 market days. Simple math, just 10x my money. I've been doing research (watching GuruTube for 3 days straight 📺) and I feel very confident about this. Not a single doubt in my smooth brain 🧠.
            </p>
            <p style={{ marginBottom: '7px' }}>
              Strategy: buy calls on high-volatility tickers, ride the momentum, sell before close 📈🔥. If a stock is green I buy calls. If it's red I buy puts. Might also use some leverage from a private lender in my contacts if things get tight 🦈 — but that won't be necessary because I'm built different. Risk management is for people who are afraid of success 💀.
            </p>
            <p style={{ marginBottom: '7px' }}>
              Wife thinks I'm "investing in index funds" 😅 so no pressure there. Will update daily with P&L screenshots 📊. Not taking any bearish comments seriously, I've already stress-tested this strategy in my head and it absolutely works. Anyone who says otherwise is just not a visionary 👁️.
            </p>
            <p style={{ opacity: 0.7, fontSize: '0.92em' }}>
              Current positions: none yet 😤. Market opens soon. Sitting in cash like a king before the slaughter begins 👑. See you on the moon or in the poorhouse, either way it'll be a great story 🌕
            </p>
          </div>
          <div className="forum-post-footer">
            <span className="upvotes">▲ 4.2k</span>
            <span>💬 {REPLIES.length} comments</span>
            <span>🏆 14 awards</span>
          </div>
        </div>

        {/* Divider */}
        <div style={{ fontSize: '0.78em', opacity: 0.5, marginBottom: '9px' }}>— top comments —</div>

        {/* Replies */}
        {REPLIES.map((reply, i) => (
          <div
            key={i}
            className="forum-post"
            style={{
              marginBottom: '9px',
              paddingLeft: '9px',
              borderLeft: '2px solid #888',
            }}
          >
            <div className="forum-post-header" style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
              <span className="pixel-bold" style={{ fontSize: '1em' }}>u/{reply.user}</span>
              {reply.time && <span style={{ opacity: 0.5, fontSize: '0.76em' }}>• {reply.time}</span>}
            </div>
            <div style={{ fontSize: '0.85em', lineHeight: '1.5', opacity: 0.9, marginBottom: '5px' }}>
              {reply.body}
            </div>
            <div style={{ fontSize: '0.76em', opacity: 0.6 }}>
              <span className="upvotes">▲ {reply.upvotes}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
