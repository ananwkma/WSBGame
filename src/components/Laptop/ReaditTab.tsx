import React from 'react';

interface Reply {
  user: string;
  body: string;
  upvotes: string;
}

const REPLIES: Reply[] = [
  {
    user: 'StockDaddy69',
    body: "bro the NEXT DAY button literally advances time, did you really buy options day 1 without even knowing that? absolute regard energy right there",
    upvotes: '1.4k',
  },
  {
    user: 'DiamondHandsDave',
    body: "lmao 100% he's gonna load up on calls and wonder why they're worth $0 at expiry — shares = you own it forever, options = ticking time bomb, learn the difference king",
    upvotes: '892',
  },
  {
    user: 'BoboTheBear',
    body: "if you get margin called and run out of cash there's a guy in your messages who'll lend you money... just know the interest makes credit cards look like a savings account, godspeed",
    upvotes: '734',
  },
  {
    user: 'PaperHandsPete',
    body: "don't forget to check ur phone (uMessage tab) — wife texts there and she WILL know if you're down, also readit on your phone is different from this one lmaooo",
    upvotes: '611',
  },
  {
    user: 'RetardStrength',
    body: "reminder that options expire at end of EACH day my guy, you hold that call into close and it's confetti, don't be me circa last Tuesday",
    upvotes: '2.1k',
  },
  {
    user: 'MoonMission2024',
    body: "GuruTube gurus on the laptop give you stock tips but like 40% of the time they're just pumping their own bags, use it as one signal among many unless you enjoy donating money",
    upvotes: '487',
  },
];

export const ReaditTab: React.FC = () => {
  return (
    <div className="phone-app-content" style={{ padding: '8px', overflowY: 'auto', height: '100%', boxSizing: 'border-box' }}>
      {/* Main post */}
      <div className="forum-post" style={{ marginBottom: '12px', borderBottom: '2px solid #555', paddingBottom: '10px' }}>
        <div className="forum-post-header" style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
          <span className="pixel-bold">u/DegenTrader</span>
          <span style={{ opacity: 0.6, fontSize: '0.75em' }}>• 2h ago</span>
          <span style={{ background: '#555', padding: '1px 5px', fontSize: '0.7em' }}>YOLO</span>
        </div>
        <div className="forum-post-title pixel-bold" style={{ fontSize: '0.9em', marginBottom: '8px' }}>
          10-day $100k to $1M YOLO challenge — day 1 let's get it 🚀🚀🚀
        </div>
        <div style={{ fontSize: '0.78em', lineHeight: '1.4', opacity: 0.9, marginBottom: '8px' }}>
          Started with $100,000 in cash and I'm turning it into $1M in 10 days or I'm literally a financial retard.
          Going full degen — options, margin, whatever it takes. Wife doesn't know yet. Updates daily.
          Don't tell me to diversify or I will actually start crying.
        </div>
        <div className="forum-post-footer">
          <span className="upvotes">▲ 4.2k</span>
          <span>💬 {REPLIES.length} comments</span>
          <span>🎁 Give Award</span>
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
