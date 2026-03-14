# Phase 15: Live Market, Events & Polish - Research

**Researched:** 2026-03-14
**Domain:** React/Zustand real-time game loop, OHLC chart data model, canvas/SVG animation, Web Audio API
**Confidence:** HIGH (all findings from direct codebase inspection; no external libraries needed beyond what is installed)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Time Advancement Model**
- NEXT DAY button stays — player manually advances the day when ready. Rename "NEXT TURN" → "NEXT DAY" everywhere in the UI.
- Market hours are simulated — market opens at 9:30am in-game, closes at 4pm. Day 1 starts at 6am (gives player time to explore). All other days start at 8am (3 real minutes before open to check forum/GuruTube).
- Pre-market (8–9:30am): Prices frozen. Window for reading/watching.
- After market close (4pm): Prices freeze. Player reviews day, then presses NEXT DAY.
- Day counter stays — "Day X of 10" persists. Game still ends after Day 10's NEXT DAY press.
- Trading is always freely available during market hours — no restrictions during events.
- Debt (Loan Shark) still compounds on NEXT DAY press — no change to compounding trigger.
- Narrative messages (wife, guru, forum posts) spread randomly throughout the trading day — not all fired on NEXT DAY. Some arrive mid-session at random intervals within the trading window.
- "MARKET CLOSED" label appears on charts when market is not live.

**Market Events**
- Event types in scope: Earnings reports, Fed announcement, Meme stock frenzy, Insider leak / rumour.
- Scheduling: Hybrid — earnings events fire on fixed days (deterministic, allows player to prepare), other events (meme frenzy, insider leaks) are random each run.
- Price move behavior: Rapid ramp over 1–2 in-game minutes (not instant).
- IV interaction: Market events spike IV before/during event, then crush after — rewards/punishes options players correctly.
- Player notification: Three simultaneous signals:
  1. Notification indicator on laptop (badge/dot — not forced interrupt, player opens when ready)
  2. News panel on laptop (dedicated panel, slides in — try this first; fall back to ticker tape if too disruptive)
  3. Forum post(s) on readit reacting to the event
- News panel visual treatment: Macro events (Fed) have a distinct darker/more formal style vs single-stock events (earnings).
- Meme frenzy: Forum explodes with multiple simultaneous posts hyping the ticker. Outcome is random — sometimes crashes back, sometimes holds (pump-and-dump vs real news).
- Insider leak: Forum post only, no official announcement. Leaks have a chance of being fake (disinformation) — blindly trusting tips is risky.
- Earnings calendar: Shown inline on the individual stock page in Robbinghood as "X days until earnings" in smaller muted text below the stock header. No separate calendar tab.
- Multiple events can stack in one trading day.
- Loan Shark reacts to events: If a market event causes a major loss and player has debt, shark sends a taunting message.
- Loan Shark dialogue improvements (separate from events but in this phase):
  - Opening message in the Loan Shark thread subtly hints at compounding interest
  - Expand dialogue pool significantly — current messages are too repetitive and robotic

**Chart Timeframe UX**
- Timeframes available: 1-minute, 30-minute, 1-hour, Daily.
- Switching: Tabs above the chart — [1M] [30M] [1H] [1D].
- Session/history toggle: Separate toggle for "current day only" vs "full game history" — all timeframes respect this.
- Line/candle toggle: Located top-right of chart. Line chart is default. Candle mode available as toggle.
- Candlestick styling: Green (up) / red (down) candles — intentional aesthetic break from 4-color palette for chart readability.
- Up/down candle distinction: Green/red fill (not grayscale hollow/filled).
- Y-axis: Dollar values shown on axis for all views.
- Crosshair on hover: Pixel crosshair follows mouse showing price + timestamp tooltip.
- Real-time updates: Chart redraws every tick (every 2 real seconds) during live market hours.
- Chart is laptop-only — no chart on mobile/phone layout.
- Stock charts (individual stock page): Full treatment — timeframe tabs, line/candle toggle, session/history toggle.
- Portfolio net worth chart: Full timeframe tabs + session/history toggle. Candle mode skipped for net worth (line only).
- Default timeframe: Remembers last selection per user session.
- Volume bars: Not included — price chart only.
- No event markers on chart — clean chart only.

**Polish & Branding**
- Sound: 8-bit chiptune sounds. Market open bell (9:30am) and close bell (4pm). Sound effects for key moments.
- Micro-animations:
  - Big gain (stock up 20%+): pixel coin particle burst
  - Big loss (stock down 20%+): pixel flame particle burst
  - Market event fires: animation cue
  - Game ending screen: pixel wipe/transition entrance
- Label/branding updates:
  - "NEXT TURN" → "NEXT DAY"
  - Phone label → "uPhone"
  - "CHAT" tab on phone → "uMessage"
  - "FORUM" tab on phone → "readit"
  - New laptop tab added: "readit" (the onboarding post)
- Laptop tabs: Three tabs — Robbinghood, GuruTube, readit.
- Readit onboarding post:
  - Player username: u/DegenTrader
  - Post: player announces 10-day $100k → $1M challenge
  - Replies: troll-style comments from forum users that serve as a disguised tutorial (rules of the game, tips, controls)
  - Lives on the laptop's readit tab
- Remove HYPE LEVEL system entirely — hype state, hype accumulation logic, and any hype-driven UI elements should be stripped from the codebase.

### Claude's Discretion
- Exact timing of when mid-session messages arrive (random within window — Claude chooses distribution)
- Specific content of the Loan Shark expanded dialogue pool
- Exact particle effect implementation details (count, speed, spread)
- Sound effect specific samples/frequencies within the 8-bit chiptune style
- Exact format and content of readit tutorial troll replies (u/DegenTrader post replies)
- News panel exact visual design (within pixel grayscale aesthetic constraints)

### Deferred Ideas (OUT OF SCOPE)
- Speed-up / fast-forward feature — future phase (noted for playtest feedback)
- Candlestick charts were approved as a toggle in this phase (not deferred)
- Full candlestick-only mode across all contexts — already handled by toggle
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| TRADE-13 | Live Market Clock: Stock prices update continuously on a real-time interval (2 real seconds = 1 in-game minute; 1 in-game hour = 2 real minutes). Price movement magnitude scales with per-stock volatility profile. | Real-time loop design: useEffect + setInterval in a dedicated hook; tick fires every 2000ms during market hours; per-tick price movement reuses existing minVol/maxVol/histVol profile from INITIAL_STOCKS. |
| TRADE-14 | Intraday Chart Timeframes: Charts support multiple zoom levels showing OHLC-style data: 1-minute, 30-minute, 1-hour, and daily views. | OHLC data model stored in new `intradayData` state per ticker. PriceChart.tsx replacement: new IntraChart component with timeframe tabs, candle rendering, crosshair. d3-shape already available; no new packages needed. |
| EVT-01 | Market Events: Scheduled or probabilistic intraday events (earnings, Fed announcements, meme stock frenzies) cause significant price spikes/drops and narrative reactions. | New `MarketEvent` type added to types.ts; events stored in `scheduledEvents` state; tick loop checks for pending events; earnings are deterministic (fixed day), others are probabilistic per-day seeded at NEXT DAY press. |
| UX-01 | UI & Animation Polish: Key game moments (big gains, big losses, borrowing, endings) have micro-animations and/or audio cues consistent with the pixel art aesthetic. | framer-motion already installed for particle bursts; Web Audio API (no library) for chiptune synthesis. EndingScreen gets entry animation. Hype removal: strip hype field, HYPE LEVEL bar, DualViewShell jitter. |
</phase_requirements>

---

## Summary

Phase 15 is a major architectural lift across three distinct concerns: (1) replacing the discrete turn-based price update with a continuous real-time clock, (2) adding a rich intraday chart data model with OHLC aggregation and multi-timeframe rendering, and (3) polishing labels, animations, sounds, and a new readit onboarding tab. All work is internal — no new npm packages are required. The existing stack (React 19, Zustand 5, framer-motion 12, d3-shape 3, Vite 7, TypeScript 5.9) already supports everything needed.

The single most complex task is the real-time engine. Currently `nextTurn()` is the exclusive price-update path — a monolithic 380-line function that moves all prices, computes net worth, fires narrative events, compounds debt, and decides game endings. In Phase 15, intraday price ticks must run on a `setInterval` separate from the NEXT DAY button. This means splitting `nextTurn()` into two concerns: (a) a per-tick `tickMarket()` action that only moves prices and accumulates OHLC data, and (b) a `advanceDay()` action (the new NEXT DAY button) that handles all day-end logic that currently lives in `nextTurn()`. The hype system must be fully removed at the same time because it pervades both the store and the UI.

The chart redesign is the second major concern. The existing `PriceChart.tsx` is a simple SVG line chart fed by `stock.history` (one `HistoryPoint` per turn). For Phase 15 it must render multi-timeframe OHLC data with candle/line toggle and crosshair hover. The recommended approach is to build a new `IntraChart` component alongside the old one and replace the chart call sites in Robbinghood.tsx and Portfolio view. The OHLC data model needs a new `CandlePoint` type stored in a new `intradayBars` field on `StockData` (and a parallel `netWorthBars` for the portfolio chart). This is additive — the existing `HistoryPoint[]` on stocks can stay for the daily view and can be the source for the "full game history" toggle.

**Primary recommendation:** Build the real-time engine first (splits nextTurn, removes hype), then build the new chart component, then add events, then do branding/polish cleanup in the final plan. Sequencing matters because chart rendering depends on the OHLC data that the tick loop produces.

---

## Current Codebase — Exact File Map

### Files that change in this phase

| File | Why it changes |
|------|----------------|
| `src/store/types.ts` | Add `CandlePoint`, `IntradayBar`, `MarketEvent`, `MarketEventType`, `GameTime` types; add `intradayBars`, `netWorthBars`, `marketTime`, `scheduledEvents`, `activeEvents` to `GameState`; remove `hype`; add `tickMarket`, `advanceDay` to `GameActions`; remove `nextTurn` or keep as alias |
| `src/store/useGameStore.ts` | Add `tickMarket()` action, `advanceDay()` action (replaces `nextTurn` day-end logic); add real-time tick management (interval refs are NOT in Zustand — they live in a React component/hook); remove hype logic from `buyStock`, `buyOption`, `nextTurn`; seed `scheduledEvents` at game start |
| `src/App.tsx` | Rename "NEXT TURN" button label to "NEXT DAY"; call `advanceDay` not `nextTurn`; add `useMarketClock` hook that drives `tickMarket`; add market-state label display |
| `src/components/Trade/PriceChart.tsx` | Replace or augment with `IntraChart` component — timeframe tabs, OHLC candle rendering, line mode, crosshair, "MARKET CLOSED" overlay |
| `src/components/Trade/Robbinghood.tsx` | Replace `PriceChart` with `IntraChart`; add earnings countdown below stock header; update portfolio chart |
| `src/components/Apps/Phone/PhoneApp.tsx` | Rename "PHONE v1.0" → "uPhone"; rename tab labels "CHAT" → "uMessage", "FORUM" → "readit"; remove HYPE LEVEL bar entirely |
| `src/components/Shell/DualViewShell.tsx` | Remove `hype`/`isHighHype` jitter animation entirely |
| `src/components/Laptop/LaptopBrowser.tsx` | Add third tab: "readit"; add `LaptopTab = 'ROBBINGHOOD' \| 'GURUTUBE' \| 'READIT'`; add news panel overlay/slide-in; add notification badge |
| `src/components/Laptop/ReaditTab.tsx` (NEW) | Onboarding post component: u/DegenTrader challenge post + troll tutorial replies |
| `src/components/Feedback/EndingScreen.tsx` | Add pixel wipe/fade entrance animation via framer-motion |
| `src/styles/pixel.css` | Rename `.next-turn-btn` selector (or keep and also target new label); add candle chart CSS; add particle/animation CSS |

### Files that are source-of-truth for existing logic

| File | What to understand |
|------|-------------------|
| `src/store/useGameStore.ts` lines 650–1028 | The full `nextTurn()` function — this must be split into `tickMarket()` + `advanceDay()` |
| `src/store/useGameStore.ts` lines 122–131 | `INITIAL_STOCKS` — volatility profiles (minVol, maxVol, histVol) that drive per-tick price movement |
| `src/store/types.ts` lines 42–47 | `StockData` shape — where `intradayBars` field gets added |
| `src/components/Trade/PriceChart.tsx` | Existing chart — d3-shape line generator, ResizeObserver, SVG rendering pattern to follow |
| `src/components/Apps/Phone/PhoneApp.tsx` lines 8–64 | All four branding targets: "PHONE v1.0", `PhoneTab = 'CHAT' \| 'FORUM'`, tab button labels "CHAT", "FORUM" |
| `src/components/Shell/DualViewShell.tsx` lines 25–46 | Hype jitter code to delete |

---

## Standard Stack

### Core (already installed — no new installs needed)

| Library | Version | Purpose | Notes |
|---------|---------|---------|-------|
| React | 19.2.0 | UI rendering | `useEffect` + `useRef` for interval management |
| Zustand | 5.0.11 | Game state | `tickMarket` action updates prices + OHLC bars |
| framer-motion | 12.34.5 | Animations | Particle bursts, news panel slide-in, ending screen entrance |
| d3-shape | 3.2.0 | SVG path generation | Already used in PriceChart; extend for candle geometry |
| Web Audio API | Browser-native | Chiptune sounds | No library — use `AudioContext.createOscillator()` directly |

### No New Packages Required

The project has no need for an additional charting library (recharts, lightweight-charts, etc.). The existing SVG + d3-shape pattern is sufficient for pixel-art candle charts at this scale. Adding a third-party chart library would fight the pixel aesthetic and the 4-color palette filter.

**Installation:** No new packages needed.

---

## Architecture Patterns

### Pattern 1: Real-Time Clock Hook (NOT in Zustand)

The `setInterval` that drives ticks must live in React, NOT inside Zustand. Zustand actions are synchronous state transitions; they cannot own interval lifecycle. The recommended pattern is a `useMarketClock` hook mounted in `App.tsx`.

**What:** A `useEffect` in `useMarketClock` creates one `setInterval(tickMarket, 2000)` when `gameStatus === 'playing'` and `marketIsOpen`. It clears on unmount, when the market closes, and on game end. The Zustand `tickMarket()` action is called from the interval callback via `useGameStore.getState().tickMarket()`.

**Why this pattern:** Zustand's `getState()` can be called outside of React components (it is a plain function), so the interval callback can call it directly. This avoids stale closure issues with `useCallback` and prevents the interval from re-creating on every store update.

```typescript
// Source: Zustand docs pattern — getState() outside React
// In useMarketClock.ts
import { useEffect } from 'react';
import { useGameStore } from '../store/useGameStore';

export function useMarketClock() {
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const start = () => {
      intervalId = setInterval(() => {
        const state = useGameStore.getState();
        if (state.gameStatus !== 'playing') return;
        if (!state.marketIsOpen) return;
        state.tickMarket();
      }, 2000);
    };

    start();
    return () => {
      if (intervalId !== null) clearInterval(intervalId);
    };
  }, []); // Empty deps — one interval for the lifetime of the game session
}
```

### Pattern 2: In-Game Time Model

**What:** Add a `marketTime` field to `GameState` representing the current in-game clock as minutes since midnight. On NEXT DAY press, `advanceDay()` resets `marketTime` to the appropriate start time (360 = 6am for Day 1, 480 = 8am for Days 2–10). Each `tickMarket()` call increments `marketTime` by 1 (one in-game minute per 2 real seconds). `marketIsOpen` is a derived value: `marketTime >= 570 && marketTime < 960` (9:30am = 570 min, 4:00pm = 960 min).

**Time math:**
- 1 in-game minute = 2 real seconds
- 1 in-game hour = 120 real seconds (2 minutes)
- Full trading day (9:30am–4pm = 390 in-game minutes) = 780 real seconds (13 real minutes)
- Pre-market window (8am–9:30am Day 2+ = 90 in-game minutes) = 180 real seconds (3 real minutes)
- Day 1 window (6am–4pm = 600 in-game minutes) = 1200 real seconds (20 real minutes)

```typescript
// In types.ts — add to GameState
marketTime: number;       // minutes since midnight (0-1440)
marketIsOpen: boolean;    // derived: 570 <= marketTime < 960
```

### Pattern 3: OHLC Data Model

**What:** Each `StockData` gets an `intradayBars` field — a map of candle aggregations at multiple resolutions. Each tick appends to the 1-minute bar, and 30-min/1-hour bars are derived by grouping. The daily bar is derived from the full day's 1-min bars.

```typescript
// In types.ts
export interface CandleBar {
  openTime: number;    // in-game minutes since midnight
  open: number;        // cents
  high: number;        // cents
  low: number;         // cents
  close: number;       // cents
}

// Added to StockData:
intradayBars: CandleBar[];  // all 1-min bars for the current day
// NOTE: daily bars = [one bar per day] built from stock.history
```

Timeframe aggregation (30M, 1H, 1D) is computed on-the-fly in `IntraChart` from the 1-min bars using a `groupBars(bars, intervalMinutes)` utility function. This avoids storing redundant data.

### Pattern 4: IntraChart Component Architecture

Replace the existing `PriceChart.tsx` usage with a new `IntraChart.tsx` component. Keep `PriceChart.tsx` in place for now (it may be used by MiniChart or other places), but do not render it in Robbinghood or portfolio view.

```typescript
interface IntraChartProps {
  intradayBars: CandleBar[];          // 1-min bars for current day
  dailyHistory: HistoryPoint[];       // existing daily history (one per day)
  marketTime: number;                 // current in-game minutes
  marketIsOpen: boolean;
  width: number;
  height: number;
  showCandles?: boolean;              // line=false (default), candle=true
  timeframe: '1M' | '30M' | '1H' | '1D';
  sessionOnly: boolean;               // true = today only, false = full game
}
```

The component handles its own `ResizeObserver` (same pattern as existing `PriceChart`). Candle rendering uses SVG `rect` elements for the body and `line` elements for the wick. Crosshair is a `mousemove` handler on the SVG element that updates a local `hoveredIndex` state.

### Pattern 5: Market Events Architecture

**What:** A `scheduledEvents` array in game state holds `MarketEvent` objects. Events are generated (seeded) when `advanceDay()` runs, not at game start. The tick loop checks for pending events at the current `marketTime`.

```typescript
// In types.ts
export type MarketEventType = 'EARNINGS' | 'FED_ANNOUNCEMENT' | 'MEME_FRENZY' | 'INSIDER_LEAK';

export interface MarketEvent {
  id: string;
  type: MarketEventType;
  ticker: StockTicker | null;  // null for macro events (FED)
  day: number;
  triggerTime: number;         // in-game minutes since midnight
  priceMultiplier: number;     // e.g. 1.3 for +30%
  rampMinutes: number;         // how many ticks to spread the ramp over
  fake?: boolean;              // for INSIDER_LEAK only
  fired: boolean;
  narrativeKey: string;        // key into a template pool
}
```

When `tickMarket()` finds a `MarketEvent` with `day === currentDay` and `triggerTime <= marketTime` and `!fired`, it:
1. Applies partial price ramp (rampMinutes determines how many ticks share the multiplier)
2. Sets `fired = true` on the event
3. Adds the event to `activeEvents` for the news panel to display
4. Adds IV spike to the affected ticker

### Pattern 6: Mid-Session Message Dispatch

Currently all narrative messages are dispatched in `nextTurn()` synchronously. For Phase 15, some messages must fire mid-session. The approach is to schedule them at `advanceDay()` time into a `pendingMessages` queue with a `deliverAt` time, and `tickMarket()` checks the queue and moves due messages into `threads`.

```typescript
export interface ScheduledMessage {
  message: Message;
  deliverAt: number;  // in-game minutes since midnight
  delivered: boolean;
}
// Add to GameState: pendingMessages: ScheduledMessage[]
```

### Pattern 7: Chiptune Sounds via Web Audio API

No library needed. Create a small `soundEngine.ts` utility module with a shared `AudioContext` (created lazily on first user interaction to comply with browser autoplay policy). Functions: `playMarketOpen()`, `playMarketClose()`, `playBigGain()`, `playBigLoss()`, `playBorrow()`.

```typescript
// soundEngine.ts — no imports, no dependencies
let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

export function playTone(freq: number, duration: number, type: OscillatorType = 'square') {
  const c = getCtx();
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.connect(gain);
  gain.connect(c.destination);
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.15, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
  osc.start(c.currentTime);
  osc.stop(c.currentTime + duration);
}

export function playMarketOpen() {
  playTone(523, 0.1); // C5
  setTimeout(() => playTone(659, 0.1), 120); // E5
  setTimeout(() => playTone(784, 0.2), 240); // G5
}
```

### Pattern 8: Particle Burst via framer-motion

Use framer-motion `motion.div` elements for particle bursts. Each particle is a small `div` with `initial` position at center and `animate` to a random offset, using `useAnimate` or the `variants` approach. Keep DOM elements sparse (8–12 particles per burst) to stay within the pixel art aesthetic.

```typescript
// CoinBurst.tsx — triggered when a stock gains 20%+ in a tick
// Uses framer-motion: already installed at ^12.34.5
import { motion, AnimatePresence } from 'framer-motion';
```

### Recommended File Structure for New Files

```
src/
├── hooks/
│   └── useMarketClock.ts      # setInterval wrapper driving tickMarket()
├── utils/
│   ├── marketUtils.ts         # existing — add groupBars() helper
│   └── soundEngine.ts         # NEW — Web Audio chiptune utilities
├── components/
│   ├── Trade/
│   │   ├── IntraChart.tsx     # NEW — replaces PriceChart in Robbinghood
│   │   └── PriceChart.tsx     # KEEP — still used by MiniChart/elsewhere
│   ├── Laptop/
│   │   ├── LaptopBrowser.tsx  # ADD readit tab
│   │   └── ReaditTab.tsx      # NEW — onboarding post component
│   └── Feedback/
│       └── ParticleBurst.tsx  # NEW — coin/flame particle animation
```

### Anti-Patterns to Avoid

- **Storing interval ID in Zustand:** Zustand is for serializable state. Interval IDs are not serializable and break persistence. Keep interval refs in React with `useRef`.
- **Re-creating setInterval on every render:** Use empty deps `[]` in the `useEffect` and access store state via `useGameStore.getState()` (not via hook) inside the callback.
- **Storing derived candle timeframes:** 30M, 1H, 1D bars should be computed on the fly from the 1M bar array. Storing all resolutions bloats localStorage saves.
- **Persisting `intradayBars` for previous days:** Only the current day's 1-min bars need to be live. Previous days are represented by one `HistoryPoint` per day in the existing `stock.history`. The "full game history" daily chart view reads from `stock.history`, not `intradayBars`.
- **Playing Audio before user interaction:** Browser autoplay policy blocks `AudioContext` creation until a user gesture. Create the context lazily on the first `playTone()` call, which will naturally be triggered by a user action (buy, sell, NEXT DAY).

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Chiptune synthesis | Custom sample loader, audio file import | `AudioContext.createOscillator()` — Web Audio API | No files to load; pure programmatic synthesis works perfectly for 8-bit style; zero bundle cost |
| Particle animations | Custom CSS keyframe manager | framer-motion `motion.div` with `animate` prop | framer-motion already installed; handles spring physics, variants, AnimatePresence |
| Chart path generation | Custom Bezier math | d3-shape `line()` with `curveLinear` | Already used in PriceChart.tsx; just extend it |
| Candle body/wick layout | Full charting library | SVG `rect` + `line` elements manually positioned | At pixel-art scale (max ~400px wide), manual SVG is simpler and respects the aesthetic |
| OHLC aggregation | Complex streaming algorithm | Simple `groupBars(bars, intervalMinutes)` utility | The bar array is small (max 390 1-min bars per day × 6 stocks = 2340 elements) |

**Key insight:** This codebase uses SVG for all charts and framer-motion for all animations. Stay in that lane — don't introduce a canvas-based charting library or a separate animation library.

---

## Common Pitfalls

### Pitfall 1: Stale Closure in setInterval

**What goes wrong:** If `tickMarket` is captured via `useGameStore((s) => s.tickMarket)` inside a `useEffect`, the closure holds the initial version of the function. After the store updates, the captured function may reference stale state.

**Why it happens:** `useCallback` and `useEffect` closures capture values at creation time. A `setInterval` created in a `useEffect` with `[]` deps captures the version of `tickMarket` from the first render.

**How to avoid:** Call `useGameStore.getState().tickMarket()` inside the interval callback instead of using the captured hook value. `getState()` always returns the current store state.

**Warning signs:** Prices stop updating after the first tick, or prices always move by the same amount regardless of state changes.

### Pitfall 2: localStorage Persistence of intradayBars

**What goes wrong:** The Zustand `persist` middleware currently partializes the state to exclude `lastFlash` and `popups`. If `intradayBars` is added to `GameState` and not excluded, it will bloat the localStorage save on every tick (every 2 seconds, writing potentially 2000+ data points).

**Why it happens:** Zustand persist writes the entire partialize output on every `set()` call. `tickMarket()` calls `set()` every 2 seconds.

**How to avoid:** Add `intradayBars`, `netWorthBars`, `pendingMessages`, `activeEvents`, and `marketTime` to the `partialize` exclusion list in `useGameStore.ts`. These are ephemeral intraday data that should reset on page reload anyway.

```typescript
// In useGameStore.ts partialize option:
partialize: (state) => {
  const { lastFlash, popups, intradayBars, netWorthBars,
          pendingMessages, activeEvents, marketTime, ...rest } = state;
  return rest;
},
```

**Warning signs:** Browser DevTools → Application → Local Storage shows the save growing to hundreds of KB and the game stuttering every 2 seconds.

### Pitfall 3: OHLC Bar Misalignment When Market Reopens

**What goes wrong:** If the player reloads the page mid-session or mid-day, `intradayBars` is empty but `marketTime` is partway through the day. The chart shows no data for the current day until the next tick starts building bars.

**Why it happens:** `intradayBars` is not persisted (excluded by partialize, per Pitfall 2). On reload, the store rehydrates `marketTime` from localStorage (if it is persisted) but `intradayBars` is empty.

**How to avoid:** Also exclude `marketTime` from persistence and reset it to the day's start time on every `advanceDay()` call. The real-time clock restarts from the beginning of the day's open on every page load. This is acceptable because the game session is short (13 minutes of real time per trading day).

### Pitfall 4: hype Field Removal Breaking Persistence

**What goes wrong:** After removing `hype` from `GameState`, existing localStorage saves that were created before the update will have a `hype` field. Zustand's `persist` will rehydrate this stale data, and TypeScript won't catch it at runtime.

**Why it happens:** Zustand persist does a shallow merge of persisted state into the current state shape. Old saves with `hype` will restore `hype` as an unknown property.

**How to avoid:** In the `persist` options, add a `version: 1` migration that drops the `hype` field:

```typescript
// In useGameStore persist options:
version: 1,
migrate: (persistedState: any, version: number) => {
  if (version === 0) {
    const { hype, ...rest } = persistedState;
    return rest;
  }
  return persistedState;
},
```

**Warning signs:** TypeScript errors in DualViewShell.tsx or PhoneApp.tsx after removing `hype` from types, even after code is updated.

### Pitfall 5: Market Clock Running During Ended Game

**What goes wrong:** If `useMarketClock` hook doesn't check `gameStatus === 'playing'`, the tick loop continues running after Day 10's `advanceDay()` ends the game.

**How to avoid:** The interval callback checks `state.gameStatus !== 'playing'` at the top and returns early. Additionally, `advanceDay()` sets `gameStatus: 'ended'` in Zustand, so the next tick call is a no-op.

### Pitfall 6: IV Crush Timing with Real-Time Events

**What goes wrong:** The existing IV logic in `nextTurn()` checks `eventQueue` for future `SHIFT` events to spike IV in anticipation. In the new model, this IV anticipation logic needs to run relative to the new `MarketEvent` system, not the old `SHIFT` event queue.

**How to avoid:** When designing the new `MarketEvent` scheduler, also design IV pre-event spike logic that reads from `scheduledEvents` (the new event list) in `tickMarket()`. The IV spike should begin N in-game minutes before the `triggerTime` of any upcoming event for that day.

---

## Code Examples

Verified patterns from the existing codebase:

### Existing Price Update Logic (in nextTurn — to be extracted into tickMarket)

```typescript
// Source: src/store/useGameStore.ts lines 781–788
// Per-stock price movement using minVol/maxVol
const { minVol, maxVol } = INITIAL_STOCKS[ticker];
const volatility = Math.random() * (maxVol - minVol) + minVol;
const direction = Math.random() > 0.5 ? 1 : -1;
const change = 1 + (volatility * direction);
let nextPrice = Math.round(stock.currentPrice * change);
if (nextPrice < 1) nextPrice = 1;
```

This exact logic moves to `tickMarket()`, but the amplitude should be scaled down. Currently it runs once per day (turn). In the new model it runs once per in-game minute (390 ticks per day for meme stocks). The volatility must be reduced: divide by approximately `sqrt(390)` ≈ 19.75 to keep daily variance equivalent. For meme stocks at maxVol=0.50/day, per-tick maxVol ≈ 0.025.

```typescript
// Per-tick volatility scaling formula
const TICKS_PER_DAY = 390; // 390 in-game minutes in a trading day
const perTickVol = dailyVol / Math.sqrt(TICKS_PER_DAY);
// meme stock: 0.50 / 19.75 ≈ 0.025 (2.5% max per tick)
// blue chip: 0.05 / 19.75 ≈ 0.0025 (0.25% max per tick)
```

### Existing Chart Pattern (ResizeObserver + SVG)

```typescript
// Source: src/components/Trade/PriceChart.tsx lines 19-28
// Pattern to reuse in IntraChart
const containerRef = useRef<HTMLDivElement>(null);
const [renderWidth, setRenderWidth] = useState(width);
useEffect(() => {
  const el = containerRef.current;
  if (!el) return;
  const ro = new ResizeObserver(entries => {
    const w = entries[0]?.contentRect.width;
    if (w > 0) setRenderWidth(w);
  });
  ro.observe(el);
  return () => ro.disconnect();
}, []);
```

### Existing Persist Partialize (to extend)

```typescript
// Source: src/store/useGameStore.ts lines 1033-1037
partialize: (state) => {
  const { lastFlash, popups, ...rest } = state;
  return rest;
},
// Must extend: also exclude intradayBars, netWorthBars, pendingMessages, activeEvents, marketTime
```

### Existing Zustand Actions Calling getState (pattern for interval callback)

The store already calls `get()` internally in actions. For the interval hook outside the store, use `useGameStore.getState()`:

```typescript
// Pattern: accessing store outside React (no stale closure)
setInterval(() => {
  useGameStore.getState().tickMarket();
}, 2000);
```

### OHLC Bar Accumulation Logic

```typescript
// tickMarket() must update or create the current 1-min bar
function upsertCurrentBar(bars: CandleBar[], marketTime: number, newPrice: number): CandleBar[] {
  const lastBar = bars[bars.length - 1];
  if (lastBar && lastBar.openTime === marketTime) {
    // Update existing bar for this minute
    return [...bars.slice(0, -1), {
      ...lastBar,
      high: Math.max(lastBar.high, newPrice),
      low: Math.min(lastBar.low, newPrice),
      close: newPrice,
    }];
  } else {
    // New minute — open new bar
    return [...bars, { openTime: marketTime, open: newPrice, high: newPrice, low: newPrice, close: newPrice }];
  }
}
```

### SVG Candlestick Body + Wick

```typescript
// In IntraChart.tsx — render a single candle
// body is rect between open and close; wick is a line from low to high
const isGreen = candle.close >= candle.open;
const bodyTop = yScale(Math.max(candle.open, candle.close));
const bodyBottom = yScale(Math.min(candle.open, candle.close));
const bodyHeight = Math.max(1, bodyBottom - bodyTop); // min 1px so flat candles are visible
const candleColor = isGreen ? '#94ba8b' : '#ba8b8b'; // green/red — explicit aesthetic break approved in CONTEXT.md
```

---

## Complete Hype Removal Map

Every location that must change when `hype` is removed:

| Location | Current Code | Change |
|----------|-------------|--------|
| `src/store/types.ts:127` | `hype: number; // 0-100` | Remove field from `GameState` |
| `src/store/useGameStore.ts:244` | `hype: 0,` | Remove from `getInitialState()` |
| `src/store/useGameStore.ts:310` | `const { ..., hype, ... } = get();` | Remove `hype` from destructure |
| `src/store/useGameStore.ts:330-331` | `const newHype = Math.min(100, hype + 5);` | Delete |
| `src/store/useGameStore.ts:344` | `hype: newHype,` in `buyStock` set | Delete |
| `src/store/useGameStore.ts:358` | `const { ..., hype, ... } = get();` in `buyOption` | Remove `hype` |
| `src/store/useGameStore.ts:398,424` | `newHype = Math.min(100, hype + 8); hype: newHype` in `buyOption` | Delete |
| `src/store/useGameStore.ts:858-867` | `// --- HYPE LOGIC ---` block | Delete entire block |
| `src/store/useGameStore.ts:1012` | `hype: newHype,` in final `set()` | Delete |
| `src/components/Apps/Phone/PhoneApp.tsx:12` | `const hype = useGameStore(...)` | Delete selector |
| `src/components/Apps/Phone/PhoneApp.tsx:34-46` | `.fomo-meter-container` JSX block | Delete entire HYPE LEVEL bar UI |
| `src/components/Shell/DualViewShell.tsx:25-26` | `const hype = ...; const isHighHype = hype > 80;` | Delete both lines |
| `src/components/Shell/DualViewShell.tsx:39-46` | `animate={isHighHype ? {...}}` jitter | Replace with `animate={{ x: 0, y: 0 }}` static |

---

## Complete Branding Rename Map

| Location | Current | New |
|----------|---------|-----|
| `App.tsx:27` | `NEXT TURN` (button label) | `NEXT DAY` |
| `App.tsx:20` (action name) | `nextTurn` | `advanceDay` (also update types.ts + store) |
| `pixel.css:116,134,138` | `.next-turn-btn` | keep selector or add `.next-day-btn` alias |
| `PhoneApp.tsx:22` | `PHONE v1.0` | `uPhone` |
| `PhoneApp.tsx:8` | `type PhoneTab = 'CHAT' \| 'FORUM'` | `type PhoneTab = 'UMESSAGE' \| 'READIT'` |
| `PhoneApp.tsx:57` | tab label `CHAT` | `uMessage` |
| `PhoneApp.tsx:63` | tab label `FORUM` | `readit` |
| `PhoneApp.tsx:11` | `useState<PhoneTab>('CHAT')` | `useState<PhoneTab>('UMESSAGE')` |
| `LaptopBrowser.tsx:7` | `type LaptopTab = 'ROBBINGHOOD' \| 'GURUTUBE'` | Add `'READIT'` |
| `LaptopBrowser.tsx` | two tab buttons | Add third: `readit` tab |
| `types.ts:155` | `nextTurn: () => void;` in `GameActions` | Rename to `advanceDay: () => void;` |

---

## State of the Art

| Old Approach | New Approach | Impact |
|--------------|------------------|--------|
| `nextTurn()` updates all prices in one synchronous call | `tickMarket()` per 2-second interval during market hours; `advanceDay()` for day-end logic | Prices move continuously; button is for day advancement only |
| `HistoryPoint[]` per stock (one point per turn) | `CandleBar[]` per stock (one 1-min bar per in-game minute) + existing `HistoryPoint[]` for daily view | Multi-timeframe chart possible |
| `PriceChart.tsx` SVG line with turn-based x-axis | `IntraChart.tsx` SVG chart with time x-axis, candle/line toggle, timeframe tabs | Richer chart UX |
| Events fire all at once on NEXT TURN (SHIFT type) | Events fire mid-session at specific in-game times, ramp over 1–2 minutes | More realistic event simulation |
| Narrative messages all arrive at NEXT TURN | Some arrive mid-session via `pendingMessages` queue | Immersive mid-day events |
| HYPE LEVEL bar drives phone jitter | Removed entirely | Cleaner UI; frees state slot |
| Two laptop tabs: Robbinghood, GuruTube | Three tabs: Robbinghood, GuruTube, readit | Tutorial lives naturally in game world |

---

## Open Questions

1. **Options IV during real-time ticks**
   - What we know: IV currently updates once per day in `nextTurn()` with anticipation spike / crush logic (lines 760–779). Black-Scholes pricing uses `stock.iv` which is read per-tick in `getNetWorth()`.
   - What's unclear: Should IV update on every tick (noisy) or only on market events + NEXT DAY?
   - Recommendation: Update IV on `advanceDay()` (daily decay/spike logic stays there) and spike IV immediately when a market event fires in `tickMarket()`. Do not update IV on every regular tick — it creates too much noise in options pricing.

2. **Portfolio net worth `intradayBars` source**
   - What we know: `netWorthHistory` currently stores one `NetWorthPoint` per turn. The portfolio chart needs OHLC for the "1D session" toggle.
   - What's unclear: Net worth must be recomputed each tick (cash + stock values + options - debt). This is `getNetWorth()` — a pure derived computation.
   - Recommendation: In `tickMarket()`, after updating stock prices, call `get().getNetWorth()` to get current net worth, and upsert a 1-min bar into `netWorthBars` (same shape as `CandleBar`). Net worth bars are excluded from persistence (same as `intradayBars`).

3. **Market event IV crush timing**
   - What we know: Earnings events spike IV before the event and crush after (per CONTEXT.md). Current IV crush in old system fires when the SHIFT event hits (line 773: `nextIv = baseIv`).
   - Recommendation: Pre-event IV spike: begin N=5 in-game minutes before event `triggerTime`. Post-event IV crush: runs in the same `tickMarket()` call that fires the event. Set `stock.iv = baseIv` immediately when the event fires.

---

## Sources

### Primary (HIGH confidence)
- Direct codebase inspection — `src/store/useGameStore.ts`, `src/store/types.ts`, `src/components/Trade/PriceChart.tsx`, `src/components/Apps/Phone/PhoneApp.tsx`, `src/components/Shell/DualViewShell.tsx`, `src/components/Laptop/LaptopBrowser.tsx`, `src/App.tsx`, `src/utils/marketUtils.ts` — all read in full
- `package.json` — exact dependency versions confirmed

### Secondary (MEDIUM confidence)
- Zustand v5 `getState()` pattern for calling actions outside React components — standard documented pattern, consistent with v4 and v5 API

### Tertiary (LOW confidence)
- Web Audio API `AudioContext.createOscillator()` for chiptune synthesis — well-established browser API, no library verification performed

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all libraries confirmed via package.json; no new installs
- Architecture: HIGH — all patterns derived from existing codebase, no external unknowns
- Hype removal map: HIGH — every occurrence found via grep; exhaustive list
- Branding rename map: HIGH — every occurrence found via grep; exhaustive list
- Pitfalls: HIGH — derived from actual code patterns (persistence, stale closures)
- Sound implementation: MEDIUM — Web Audio API is standard but specific chiptune frequencies are Claude's discretion

**Research date:** 2026-03-14
**Valid until:** 2026-04-14 (stable codebase, no external API dependencies)
