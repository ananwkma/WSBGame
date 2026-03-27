# Phase 15: Live Market, Events & Polish - Context

**Gathered:** 2026-03-14
**Status:** Ready for planning

<domain>
## Phase Boundary

Replace the turn-based market loop with a continuous real-time engine, add scheduled intraday market events with narrative reactions, upgrade charts to support multiple timeframes with line/candle toggle, polish key game moments with animations and sound, and clean up branding/labelling across the UI.

New capabilities deferred to future phases: speed-up/fast-forward feature, candlestick support was approved here as a toggle.

</domain>

<decisions>
## Implementation Decisions

### Time Advancement Model

- **NEXT DAY button stays** — player manually advances the day when ready. Rename "NEXT TURN" → "NEXT DAY" everywhere in the UI.
- **Market hours are simulated** — market opens at 9:30am in-game, closes at 4pm. Day 1 starts at 6am (gives player time to explore). All other days start at 8am (3 real minutes before open to check forum/GuruTube).
- **Pre-market (8–9:30am):** Prices frozen. Window for reading/watching.
- **After market close (4pm):** Prices freeze. Player reviews day, then presses NEXT DAY.
- **Day counter stays** — "Day X of 10" persists. Game still ends after Day 10's NEXT DAY press.
- **Trading is always freely available** during market hours — no restrictions during events.
- **Debt (Loan Shark) still compounds on NEXT DAY press** — no change to compounding trigger.
- **Narrative messages (wife, guru, forum posts) spread randomly throughout the trading day** — not all fired on NEXT DAY. Some arrive mid-session at random intervals within the trading window.
- **"MARKET CLOSED" label** appears on charts when market is not live.

### Market Events

- **Event types in scope:** Earnings reports, Fed announcement, Meme stock frenzy, Insider leak / rumour.
- **Scheduling:** Hybrid — earnings events fire on fixed days (deterministic, allows player to prepare), other events (meme frenzy, insider leaks) are random each run.
- **Price move behavior:** Rapid ramp over 1–2 in-game minutes (not instant).
- **IV interaction:** Market events spike IV before/during event, then crush after — rewards/punishes options players correctly.
- **Player notification:** Three simultaneous signals:
  1. Notification indicator on laptop (badge/dot — not forced interrupt, player opens when ready)
  2. News panel on laptop (dedicated panel, slides in — try this first; fall back to ticker tape if too disruptive)
  3. Forum post(s) on readit reacting to the event
- **News panel visual treatment:** Macro events (Fed) have a distinct darker/more formal style vs single-stock events (earnings).
- **Meme frenzy:** Forum explodes with multiple simultaneous posts hyping the ticker. Outcome is random — sometimes crashes back, sometimes holds (pump-and-dump vs real news).
- **Insider leak:** Forum post only, no official announcement. Leaks have a chance of being fake (disinformation) — blindly trusting tips is risky.
- **Earnings calendar:** Shown inline on the individual stock page in Robbinghood as "X days until earnings" in smaller muted text below the stock header (e.g. below "GAMEGO INC. — $249.40"). No separate calendar tab.
- **Multiple events can stack** in one trading day.
- **Loan Shark reacts to events:** If a market event causes a major loss and player has debt, shark sends a taunting message.
- **Loan Shark dialogue improvements (separate from events but in this phase):**
  - Opening message in the Loan Shark thread subtly hints at compounding interest (so players aren't blindsided)
  - Expand dialogue pool significantly — current messages are too repetitive and robotic

### Chart Timeframe UX

- **Timeframes available:** 1-minute, 30-minute, 1-hour, Daily.
- **Switching:** Tabs above the chart — [1M] [30M] [1H] [1D].
- **Session/history toggle:** Separate toggle for "current day only" vs "full game history" — all timeframes respect this.
- **Line/candle toggle:** Located top-right of chart. Line chart is default. Candle mode available as toggle.
- **Candlestick styling:** Green (up) / red (down) candles — intentional aesthetic break from 4-color palette for chart readability.
- **Up/down candle distinction:** Green/red fill (not grayscale hollow/filled).
- **Y-axis:** Dollar values shown on axis for all views.
- **Crosshair on hover:** Pixel crosshair follows mouse showing price + timestamp tooltip.
- **Real-time updates:** Chart redraws every tick (every 2 real seconds) during live market hours.
- **Chart is laptop-only** — no chart on mobile/phone layout.
- **Stock charts (individual stock page):** Full treatment — timeframe tabs, line/candle toggle, session/history toggle.
- **Portfolio net worth chart:** Full timeframe tabs + session/history toggle. Candle mode skipped for net worth (line only) — net worth doesn't have traditional OHLC semantics.
- **Default timeframe:** Remembers last selection per user session.
- **Volume bars:** Not included — price chart only.
- **No event markers on chart** — clean chart only.

### Polish & Branding

- **Sound:** 8-bit chiptune sounds. Market open bell (9:30am) and close bell (4pm). Sound effects for key moments.
- **Micro-animations:**
  - Big gain (stock up 20%+): pixel coin particle burst
  - Big loss (stock down 20%+): pixel flame particle burst
  - Market event fires: animation cue
  - Game ending screen: pixel wipe/transition entrance
- **Label/branding updates:**
  - "NEXT TURN" → "NEXT DAY"
  - Phone label → "uPhone"
  - "CHAT" tab on phone → "uMessage"
  - "FORUM" tab on phone → "readit"
  - New laptop tab added: "readit" (the onboarding post)
- **Laptop tabs:** Three tabs — Robbinghood, GuruTube, readit.
- **Readit onboarding post:**
  - Player username: u/DegenTrader
  - Post: player announces 10-day $100k → $1M challenge
  - Replies: troll-style comments from forum users that serve as a disguised tutorial (rules of the game, tips, controls) — engaging and authentic, not instructive
  - Lives on the laptop's readit tab
- **Remove HYPE LEVEL system entirely** — hype state, hype accumulation logic, and any hype-driven UI elements should be stripped from the codebase.

### Claude's Discretion

- Exact timing of when mid-session messages arrive (random within window — Claude chooses distribution)
- Specific content of the Loan Shark expanded dialogue pool
- Exact particle effect implementation details (count, speed, spread)
- Sound effect specific samples/frequencies within the 8-bit chiptune style
- Exact format and content of readit tutorial troll replies (u/DegenTrader post replies)
- News panel exact visual design (within pixel grayscale aesthetic constraints)

</decisions>

<specifics>
## Specific Ideas

- Earnings countdown: small muted text below stock header, styled like the ticker text above it — e.g. "7 days until earnings" in a muted/secondary color
- Day 1 starts at 6am so first-time players have extra time to figure out the layout before market open at 9:30am
- Loan Shark's first/intro message should naturally weave in that interest compounds — player shouldn't be blindsided by debt growing aggressively
- News panel: try dedicated sliding panel first; if playtesting shows it's too disruptive, fall back to ticker tape
- readit onboarding post should feel like a real WSB post — troll replies disguise the tutorial as organic community reactions, not a tutorial screen

</specifics>

<deferred>
## Deferred Ideas

- Speed-up / fast-forward feature — future phase (noted for playtest feedback)
- Candlestick charts were approved as a toggle in this phase (not deferred)
- Full candlestick-only mode across all contexts — already handled by toggle

</deferred>

---

*Phase: 15-live-market-events-polish*
*Context gathered: 2026-03-14*
