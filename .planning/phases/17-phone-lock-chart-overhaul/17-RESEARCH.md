# Phase 17: Phone Lock Screen & Chart Overhaul - Research

**Researched:** 2026-03-17
**Domain:** React state-driven UI (focus management, conditional rendering, SVG chart windowing)
**Confidence:** HIGH

---

## Summary

Phase 17 has two independent sub-problems. The first is a phone lock screen: when the laptop is in focus, the phone `screenContent` renders a black overlay with optional message-preview notifications; clicking the phone dismisses the overlay by switching focus. The second is an IntraChart overhaul: the TODAY tab gains a 10M timeframe and candle support, the ALL tab gains 1H/4H timeframes, and the chart switches from a "plot all bars across the full SVG width" approach to a fixed-width sliding window that shows N bars at a time and slides left as new bars arrive.

No new libraries are required. Everything builds on existing infrastructure: the `focus`/`setFocus` prop pair already flows through `DualViewShell` → `GameViewport` → `App`; the `intradayBars` and daily `stock.history` arrays already contain all the data needed for the new timeframes; `groupBars()` in `marketUtils.ts` handles aggregation; and `framer-motion` (already a dependency) can animate the lock-screen overlay in/out. The daily-history-as-previous-day seed requires capturing yesterday's intraday closing bars at `advanceDay` time and storing them in a new store field so the chart can pre-populate at day start.

**Primary recommendation:** Treat this as two isolated change sets — LockScreen overlay in `PhoneApp.tsx` + `DualViewShell.tsx`, and IntraChart timeframe/windowing overhaul in `IntraChart.tsx` + store additions — so each can be verified independently.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| UX-03 | uPhone shows black lock screen when laptop is focused with message preview notifications on arrival; IntraChart TODAY tab has 1m/10m/30m timeframes, ALL tab has 1h/4h/1d timeframes, both supporting line and candle; chart uses a fixed-width sliding window pre-populated with previous day data each morning. | Lock screen: focus prop in DualViewShell already available; notifications: `pendingMessages` delivery in tickMarket already fires message ding; Chart: groupBars() covers all new intervals; yesterday bars stored at advanceDay time enables morning pre-population. |
</phase_requirements>

---

## Standard Stack

### Core (already in project — no new installs)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 18.x | Component rendering, state, effects | Project foundation |
| Zustand | 4.x | Global state (focus? no — focus stays local in App) | Project foundation |
| framer-motion | 6.x+ | Lock screen fade-in/out animation | Already used for entrance animations throughout |
| d3-shape | existing | SVG line path generation in IntraChart | Already imported in IntraChart.tsx |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| localStorage | browser | Persist chosen timeframe across sessions | Already used (`chartTimeframe` key) |
| ResizeObserver | browser | Chart width tracking | Already used in IntraChart |

**No new npm installs required for this phase.**

---

## Architecture Patterns

### Recommended Project Structure (changes only)

```
src/
├── components/
│   ├── Apps/Phone/
│   │   └── PhoneApp.tsx        # Add lock screen overlay, accept focus prop
│   ├── Shell/
│   │   └── DualViewShell.tsx   # Pass focus to phoneContent or expose it
│   └── Trade/
│       └── IntraChart.tsx      # Timeframe overhaul + sliding window
└── store/
    └── useGameStore.ts         # Add previousDayBars: Record<string, CandleBar[]>
```

### Pattern 1: Phone Lock Screen Overlay

**What:** A full-coverage `position: absolute` div inside `PhoneApp` that sits on top of all phone content when `focus === 'laptop'`. Clicking anywhere on it calls `setFocus('phone')` — which is identical to clicking the phone border today.

**When to use:** Whenever `focus !== 'phone'` inside `PhoneApp`.

**Data flow:**
- `App.tsx` holds `focus` state and `setFocus`. It renders `<DualViewShell focus={focus} setFocus={setFocus} phoneContent={<PhoneApp focus={focus} setFocus={setFocus} />} />`
- `PhoneApp` receives `focus` and `setFocus` as props.
- When `focus === 'laptop'`, render the lock screen overlay; otherwise render normal phone tabs.

**Lock screen overlay structure:**
```tsx
// Inside PhoneApp, when focus === 'laptop'
<motion.div
  style={{
    position: 'absolute', inset: 0,
    background: '#000',
    zIndex: 100,
    display: 'flex', flexDirection: 'column',
    justifyContent: 'flex-end', alignItems: 'center',
    paddingBottom: '16px',
    cursor: 'pointer',
  }}
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  onClick={() => setFocus('phone')}
>
  {/* Clock or branding */}
  {/* Message preview notifications (if any) */}
</motion.div>
```

**Important:** `PhoneApp` must be wrapped in `<AnimatePresence>` or use framer-motion's `exit` prop with `AnimatePresence` for a smooth fade. Since the existing phone container already uses `framer-motion`, this fits naturally.

**CRITICAL shell concern:** `DualViewShell.tsx` currently sets `pointer-events: none` on `.screenContent` for the unfocused panel (line 113-114 of Shell.css). The lock screen overlay click handler must work despite this. The fix is to add `pointer-events: auto` on the overlay element itself (inline style overrides the CSS class). Alternatively, the lock screen renders in the `phoneView` wrapper (outside `.screenContent`) — but this adds complexity. The simplest fix: override with `pointerEvents: 'auto'` on the overlay's inline style.

### Pattern 2: Message Preview Notifications on Lock Screen

**What:** While locked, new messages that arrive (via `tickMarket` delivering `pendingMessages`) should show as small preview cards on the black screen.

**Data needed:** `threads` from the store. A "new since locked" list means tracking which messages arrived while the phone was locked.

**Implementation approach:** Stateful tracking inside `PhoneApp`:
- `useRef<number>` to track `totalMessages` when phone became locked.
- When `focus` switches from `'phone'` to `'laptop'`, snapshot the current message count.
- Any messages with `message.day === currentDay` and arriving after the lock snapshot are "new while locked".
- Derived from `threads` — the latest message in each thread that appeared after the snapshot.

**Practical simplification:** Since `DualViewShell` already tracks `totalMessages` and fires the shake animation when messages arrive, `PhoneApp` can derive "messages arrived while locked" by comparing counts at lock time vs now, and showing the N most-recent messages from threads where `lastMessage.day === currentDay`.

**Notification card:**
```tsx
// Small pill at bottom of lock screen
<div style={{ background: '#1c1c17', border: '1px solid #706b66',
              padding: '6px 10px', marginBottom: '4px', width: '90%',
              fontSize: '11px', fontFamily: 'monospace' }}>
  <span style={{ color: '#706b66' }}>{thread.contactName}</span>
  <span style={{ color: '#a89f8c', marginLeft: '8px' }}>
    {lastMsg.text.slice(0, 40)}...
  </span>
</div>
```

**Show at most 3 previews** (like a real phone lock screen). Previews should only show messages that arrived AFTER the phone was locked (not old messages).

### Pattern 3: IntraChart Timeframe Overhaul

**Current state:**
- `LINE_TIMEFRAMES: ['1M', '30M', '1D']`
- `CANDLE_TIMEFRAMES: ['10M', '30M', '1D']`
- `INTERVAL_MAP: { '1M':1, '10M':10, '30M':30, '1D':390 }`
- TODAY tab (`sessionOnly=true`) shows current intraday bars.
- ALL tab (`sessionOnly=false`) shows only `1D` timeframe (the filter on line 225 hides non-1D tabs when `!sessionOnly`).

**Target state:**
- TODAY tab: `1M`, `10M`, `30M` — both LINE and CANDLE
- ALL tab: `1H`, `4H`, `1D` — both LINE and CANDLE
- Both tabs support the LINE/CANDLE toggle

**Required changes to `Timeframe` type and maps:**
```typescript
type Timeframe = '1M' | '10M' | '30M' | '1H' | '4H' | '1D';

const INTERVAL_MAP: Record<Timeframe, number> = {
  '1M': 1, '10M': 10, '30M': 30,
  '1H': 60, '4H': 240, '1D': 390
};

// TODAY tab timeframes (both line and candle)
const TODAY_TIMEFRAMES: Timeframe[] = ['1M', '10M', '30M'];
// ALL tab timeframes (both line and candle)
const ALL_TIMEFRAMES: Timeframe[] = ['1H', '4H', '1D'];
```

**Candle support for TODAY tab:** The current guard `if (!sessionOnly && tf !== '1D') return null;` suppresses timeframe buttons in ALL mode for non-1D. In the new design, ALL tab shows 1H/4H/1D. The rendering logic in `sessionOnly=false` mode currently uses `dailyHistory` with day-level `HistoryPoint` objects — this only works for `1D`. For `1H`/`4H` on the ALL tab, the source must be `previousDayBars` + today's `intradayBars` merged and grouped. See Pattern 4.

**Remove the candle/line asymmetry:** Currently line mode gets `1M`/`30M`/`1D` and candle gets `10M`/`30M`/`1D`. In the new design, both modes use the same timeframe set per tab. The `handleToggleCandles` bump from `1M` to `10M` is no longer needed.

**Default timeframe per tab:** When switching tabs, snap to a valid timeframe for that tab. E.g., entering TODAY → default `1M`; entering ALL → default `1D`. Store in `localStorage` as `chartTimeframe-TODAY` and `chartTimeframe-ALL` separately.

### Pattern 4: Fixed-Width Sliding Window

**What the user wants:** The chart shows a fixed number of bars. As new bars arrive, old bars slide off the left edge. At day start, the chart is pre-populated with the previous day's bars so the window starts full instead of empty.

**Fixed window size:** Choose N bars that fill the chart width nicely. Given typical chart widths ~300px and bar widths 3-4px with 1px gap, N ≈ 60–80 bars is a reasonable default. For TODAY/1M: ~60 visible 1-min bars (last 60 minutes). For TODAY/10M: ~20 bars. For TODAY/30M: ~13 bars. For ALL/1H: ~13 bars (multi-day). For ALL/4H: ~10 bars. For ALL/1D: ~10 bars.

**Implementation:** After grouping, take only the last N bars:
```typescript
const WINDOW_SIZE: Record<Timeframe, number> = {
  '1M': 60, '10M': 39, '30M': 13, '1H': 16, '4H': 10, '1D': 10
};

// After groupBars(), slice to window:
const windowBars = grouped.slice(-WINDOW_SIZE[timeframe]);
```

**X-axis behavior change:** With a fixed window, bars are evenly distributed across the full chart width regardless of their `openTime`. The existing `xAtTime()` function (which maps bar.openTime to an x position relative to market hours 570-960) only works for intraday TODAY views. For the windowed approach, use the uniform `xAt(i, total)` formula for ALL views and possibly for TODAY too. The tradeoff: `xAtTime` preserves real-time position (gaps between bars are proportional to time); `xAt` evenly spaces bars. The sliding window UX feels more natural with even spacing — use `xAt` for all windowed rendering.

**X-axis labels change:** With windowed even spacing, time labels must be derived from the bar's `openTime` (for intraday) or from bar position (for multi-day). Show the first bar's time and last bar's time, plus 3-4 intermediate ticks.

### Pattern 5: Previous Day Bars for Morning Pre-Population

**What:** At `advanceDay()`, capture the current day's intraday bars before resetting `intradayBars: {}`.

**Store addition:**
```typescript
// In GameState:
previousDayBars: Record<string, CandleBar[]>;  // intraday 1-min bars from last completed day

// In advanceDay(), before resetting intradayBars:
previousDayBars: state.intradayBars,  // snapshot before reset
intradayBars: {},
```

**How IntraChart uses it:** On day 1 (first day), `previousDayBars` is empty — chart starts with only live bars as they arrive. On day 2+, IntraChart receives `previousDayBars[ticker]` and prepends those bars to the current day's `intradayBars[ticker]` when rendering the sliding window. This gives the "chart starts each morning pre-populated" behavior.

**Props update for IntraChart:**
```typescript
interface IntraChartProps {
  intradayBars: CandleBar[];
  previousDayBars?: CandleBar[];  // NEW: yesterday's 1-min bars for pre-population
  dailyHistory: HistoryPoint[];
  // ... rest unchanged
}
```

**Merging logic in IntraChart for TODAY tab:**
```typescript
// Pre-populate: concat previous day bars + today bars, then window
const allTodayBars = [...(previousDayBars ?? []), ...intradayBars];
const grouped = groupBars(allTodayBars, INTERVAL_MAP[timeframe]);
const windowBars = grouped.slice(-WINDOW_SIZE[timeframe]);
```

**For ALL tab (1H/4H/1D):** The ALL tab needs multi-day bars. The `dailyHistory` `HistoryPoint[]` currently provides one point per day (close price only, no OHLC). For `1D` on ALL tab, this is fine (render daily history as synthetic flat candles). For `1H`/`4H`, the daily-level history doesn't have sub-day detail.

**Decision:** For ALL tab 1H/4H, concatenate all `previousDayBars` that were collected into `dailyIntradayArchive: Record<number, Record<string, CandleBar[]>>` (day → ticker → bars), then group them. This is more complex.

**Simpler alternative:** For ALL tab, only `1D` uses the existing `dailyHistory` approach. `1H` and `4H` ALL tab uses the past N days' intraday bars stored in an archive. However this adds significant store complexity.

**Recommended pragmatic approach:** Keep ALL tab `1D` using daily history (current behavior, works fine). For `1H`/`4H`, use `previousDayBars` + today's bars (only last 1-2 days of sub-day data). This gives a limited but functional 1H/4H view showing recent intraday detail. Label this clearly in the chart (show time range). The game only lasts 10 days so a full multi-day intraday archive is unnecessary overhead.

**Specifically for ALL tab rendering:**
- `1D`: use `dailyHistory` HistoryPoints mapped to synthetic bars (existing pattern) + today's partial bar — window to last 10 days.
- `1H`: concatenate `previousDayBars[ticker]` + `intradayBars[ticker]`, group by 60-min buckets, window to last 16 bars.
- `4H`: same concatenation, group by 240-min buckets, window to last 10 bars.

### Anti-Patterns to Avoid

- **Storing focus in Zustand:** Focus is already local to `App.tsx`. Don't add it to the store — unnecessary re-renders across all components.
- **Re-using xAtTime() for windowed ALL view:** `xAtTime` assumes bars fall within 570-960. ALL tab bars span multiple days. Use `xAt(i, total)` for uniform spacing instead.
- **Removing `previousDayBars` from persist partialize:** This field should survive page reload (player shouldn't lose yesterday's pre-population on refresh). Make sure it is NOT in the `partialize` exclusion list.
- **Showing more than 3 notification previews on lock screen:** Overwhelming. Cap at 3. Show only messages that arrived after the phone was locked (compare message timestamps / message count at lock time).
- **Breaking the `pointer-events: none` rule on `screenContent`:** The unfocused `screenContent` has `pointer-events: none` (Shell.css:113). The lock overlay needs `pointer-events: auto` explicitly to receive clicks even when the phone is unfocused.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Bar aggregation to new timeframes (1H, 4H) | Custom bucketing loop | `groupBars()` in marketUtils.ts | Already handles arbitrary intervals by bucket-floor logic |
| Smooth lock screen fade | CSS opacity transition from scratch | `framer-motion` `AnimatePresence` + `motion.div` | Already a project dependency; consistent with other animations |
| Chart line path generation | SVG path string concatenation | `d3-shape` `line()` (already imported in IntraChart) | Handles edge cases like single-point paths |

---

## Common Pitfalls

### Pitfall 1: Lock Screen Click Fires DualViewShell's `onClick` Too

**What goes wrong:** `DualViewShell` wraps `phoneView` in a `div onClick={() => setFocus('phone')}`. The lock overlay's `onClick` also calls `setFocus('phone')`. Both fire, which is fine — but the event bubbles up. No conflict here since both do the same thing. However: be careful if a future handler is added to the overlay that should NOT propagate (e.g., dismissing a preview). Use `e.stopPropagation()` on the preview dismiss buttons.

**How to avoid:** Lock overlay click calls `setFocus('phone')` — identical to the parent's behavior, so double-firing is harmless.

### Pitfall 2: Notifications Show Old Messages (Not Just New-While-Locked)

**What goes wrong:** `threads` in the store contains all messages ever received. Without tracking when the phone was locked, the lock screen will show the most recent message from each thread — including old ones from yesterday.

**How to avoid:** In `PhoneApp`, `useRef` to capture `totalMessages` (or a per-thread message count snapshot) at the moment `focus` transitions from `'phone'` to `'laptop'`. Only show messages where `messages.length > snapshot[contactName]`.

**Warning signs:** Lock screen shows messages from Day 1 on Day 5.

### Pitfall 3: `previousDayBars` Is Empty on Day 1

**What goes wrong:** `intradayBars` starts as `{}` in `getInitialState()`. `previousDayBars` will also be `{}`. On Day 1, the chart correctly shows no pre-populated bars (market hasn't run yet). After Day 1's `advanceDay()`, `previousDayBars` gets Day 1's bars. This is correct behavior but must be handled gracefully.

**How to avoid:** `IntraChart` concatenation: `[...(previousDayBars ?? []), ...intradayBars]` — spreading empty array is a no-op.

### Pitfall 4: `chartTimeframe` localStorage Key Conflict

**What goes wrong:** Existing saves store `'1M'`, `'10M'`, `'30M'`, or `'1D'` in localStorage key `chartTimeframe`. New timeframes `1H` and `4H` are valid for ALL tab but not TODAY tab. If the persisted value is `'1H'` and the user opens TODAY tab, `sanitizeTimeframe` will reject it and fall back to TODAY's first valid timeframe.

**How to avoid:** Use separate localStorage keys per tab: `chartTimeframe-TODAY` and `chartTimeframe-ALL`. Migrate the old `chartTimeframe` key at component mount (read it, write to correct key, delete old key).

### Pitfall 5: Windowed Chart Loses the "Current Price at Right Edge" Feel

**What goes wrong:** With a fixed window of 60 bars, bars accumulate from the left before sliding. If the market just opened and only 5 bars exist, those 5 bars will be spread across the full chart width (evenly spaced with xAt). This looks sparse until the window fills.

**How to avoid:** When `grouped.length < WINDOW_SIZE[timeframe]`, still use `xAt(i, total)` to spread them — this matches the existing behavior. The "slides left" effect only occurs once enough bars exist to fill the window. This is acceptable UX — identical to how TradingView handles sparse data.

### Pitfall 6: `previousDayBars` Persist Version Bump

**What goes wrong:** Existing saves don't have `previousDayBars` in the persisted state. When a save from Phase 16 is loaded, `previousDayBars` will be `undefined`, causing the spread operator to throw.

**How to avoid:** Add `previousDayBars` to `getInitialState()` with value `{}`. Bump the persist `version` to 3 and add migration branch: `if (version < 3) { state = { ...state, previousDayBars: {} }; }`.

---

## Code Examples

### Lock Screen Overlay (verified pattern from existing codebase)

```tsx
// PhoneApp.tsx — new props
interface PhoneAppProps {
  focus: FocusArea;
  setFocus: (f: FocusArea) => void;
}

// Inside PhoneApp render, wrapping everything with relative container:
// (phone-app-container already has position: relative)

{focus !== 'phone' && (
  <motion.div
    key="lock"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    style={{
      position: 'absolute', inset: 0,
      background: '#000000',
      zIndex: 100,
      cursor: 'pointer',
      pointerEvents: 'auto',    // override .screenContent pointer-events:none
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '12px 8px',
    }}
    onClick={() => setFocus('phone')}
  >
    {/* top: time/brand */}
    {/* bottom: notification previews */}
  </motion.div>
)}
```

### Notification Snapshot Tracking

```tsx
// PhoneApp.tsx — lock snapshot
const prevFocusRef = useRef<FocusArea>(focus);
const lockSnapshotRef = useRef<Record<string, number>>({});  // contactName → message count at lock time

useEffect(() => {
  if (prevFocusRef.current === 'phone' && focus !== 'phone') {
    // Phone just became locked — snapshot message counts
    const snapshot: Record<string, number> = {};
    Object.values(threads).forEach(t => {
      snapshot[t.contactName] = t.messages.length;
    });
    lockSnapshotRef.current = snapshot;
  }
  prevFocusRef.current = focus;
}, [focus, threads]);

// Derive notifications
const lockNotifications = useMemo(() => {
  if (focus === 'phone') return [];
  return Object.values(threads)
    .filter(t => t.messages.length > (lockSnapshotRef.current[t.contactName] ?? 0))
    .map(t => ({
      contactName: t.contactName,
      avatar: t.avatar,
      preview: t.messages[t.messages.length - 1]?.text ?? '',
    }))
    .slice(-3);  // most recent 3 threads with new messages
}, [focus, threads]);
```

### Timeframe / Interval Map Update

```typescript
// IntraChart.tsx
type Timeframe = '1M' | '10M' | '30M' | '1H' | '4H' | '1D';

const INTERVAL_MAP: Record<Timeframe, number> = {
  '1M': 1, '10M': 10, '30M': 30, '1H': 60, '4H': 240, '1D': 390,
};

const TODAY_TIMEFRAMES: Timeframe[] = ['1M', '10M', '30M'];
const ALL_TIMEFRAMES: Timeframe[]   = ['1H', '4H', '1D'];

const WINDOW_SIZE: Record<Timeframe, number> = {
  '1M': 60, '10M': 39, '30M': 13, '1H': 16, '4H': 10, '1D': 10,
};
```

### Sliding Window Derivation

```typescript
// IntraChart.tsx — inside component, replacing current sourceBars derivation
let sourceBars: CandleBar[];

if (!sessionOnly) {
  // ALL tab
  if (timeframe === '1D') {
    // Use existing dailyHistory approach (unchanged)
    sourceBars = dailyHistory.map(pt => ({
      openTime: pt.turn * 960, open: pt.price,
      high: pt.price, low: pt.price, close: pt.price,
    }));
    const todaySource = (netWorthBars && netWorthBars.length > 0) ? netWorthBars : intradayBars;
    if (todaySource.length > 0) {
      sourceBars = [...sourceBars, { openTime: 570, open: todaySource[0].open,
        high: Math.max(...todaySource.map(b => b.high)),
        low: Math.min(...todaySource.map(b => b.low)),
        close: todaySource[todaySource.length - 1].close }];
    }
  } else {
    // 1H / 4H: use yesterday + today bars
    const combined = [...(previousDayBars ?? []), ...intradayBars];
    sourceBars = groupBars(combined, INTERVAL_MAP[timeframe]);
  }
} else {
  // TODAY tab — pre-populate with previous day bars
  const combined = [...(previousDayBars ?? []), ...intradayBars];
  sourceBars = groupBars(combined, INTERVAL_MAP[timeframe]);
}

// Apply sliding window
const windowSize = WINDOW_SIZE[timeframe];
sourceBars = sourceBars.slice(-windowSize);
```

### Store: previousDayBars

```typescript
// types.ts — add to GameState
previousDayBars: Record<string, CandleBar[]>;  // 1-min bars from the last completed trading day

// useGameStore.ts — getInitialState()
previousDayBars: {},

// advanceDay(), inside set() call
previousDayBars: state.intradayBars,  // capture before reset
intradayBars: {},

// persist migration
if (version < 3) {
  state = { ...state, previousDayBars: {} };
}
// version: 3

// partialize: do NOT exclude previousDayBars — it should persist
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| All bars spread across full SVG width | Fixed-window N bars, slides left | Phase 17 | Chart feels like a real trading app; bars maintain consistent size |
| Line-only timeframes differ from candle timeframes | Both modes share same timeframe set per tab | Phase 17 | Simpler UX, no mode-switching timeframe bumps |
| TODAY tab shows live session only (no yesterday context) | TODAY tab pre-populated with yesterday's bars | Phase 17 | Chart starts each morning with context instead of empty |
| Phone always shows content when unfocused | Phone shows black lock screen when laptop focused | Phase 17 | Immersive dual-device simulation |

---

## Open Questions

1. **Lock screen clock display**
   - What we know: The phone header shows "uPhone" + battery/signal.
   - What's unclear: Should the lock screen show a styled clock (in-game time from `marketTime`), or just "uPhone" branding?
   - Recommendation: Show `marketTime` formatted as HH:MM AM/PM (reuse `fmtTime` logic from Robbinghood). This adds immersion with zero cost.

2. **Lock screen "slide to unlock" affordance**
   - What we know: Click anywhere on lock screen calls `setFocus('phone')`.
   - What's unclear: Should there be a visible "TAP TO UNLOCK" label?
   - Recommendation: Add a dimmed "TAP TO UNLOCK" label at the bottom, consistent with pixel aesthetic. `color: '#706b66'`, `fontSize: '10px'`, `letterSpacing: 2`.

3. **Previous day bars for net worth chart**
   - What we know: `netWorthBars` is a `CandleBar[]` in state. `advanceDay` resets `netWorthBars: []`.
   - What's unclear: Should the net worth chart also support pre-population from `previousDayBars`?
   - Recommendation: Yes — add `previousNwBars: CandleBar[]` alongside `previousDayBars` in the same store addition. `IntraChart` already accepts `netWorthBars` prop separately from `intradayBars`; pass `previousNwBars` as a new optional prop.

4. **What happens to `chartTimeframe` localStorage key migration**
   - What we know: Key `chartTimeframe` stores a Timeframe string.
   - What's unclear: Old values `1M`/`10M`/`30M` are valid TODAY tab timeframes; `1D` is valid for both tabs.
   - Recommendation: At mount, if old key exists, write its value to `chartTimeframe-TODAY` (if value is `1M`/`10M`/`30M`) or `chartTimeframe-ALL` (if `1D`). Then delete old key. This handles all existing saves gracefully.

---

## Sources

### Primary (HIGH confidence)

- Direct source inspection: `IntraChart.tsx` (full read) — verified current timeframe arrays, interval map, xAtTime logic, groupBars usage.
- Direct source inspection: `useGameStore.ts` (full read) — verified `advanceDay` resets `intradayBars: {}`, `tickMarket` bar building, `pendingMessages` delivery, persist `partialize` exclusions, persist version.
- Direct source inspection: `DualViewShell.tsx` + `Shell.css` — verified `pointer-events: none` on unfocused `.screenContent`, click handlers, focus/setFocus prop flow.
- Direct source inspection: `types.ts` — verified `GameState`, `CandleBar`, `ScheduledMessage`, `Thread` structures.
- Direct source inspection: `PhoneApp.tsx`, `ChatApp.tsx`, `MessageList.tsx` — verified current phone rendering, `threads` access pattern, `unread-dot` logic.
- Direct source inspection: `marketUtils.ts` — verified `groupBars()` implementation handles arbitrary `intervalMinutes`.

### Secondary (MEDIUM confidence)

- framer-motion AnimatePresence pattern: consistent with existing usage in `EndingScreen.tsx` and `Robbinghood.tsx` (verified in codebase).

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all confirmed from direct source reads; no new dependencies.
- Architecture (lock screen): HIGH — focus prop flow is already in place; overlay pattern is straightforward React.
- Architecture (chart window): HIGH — `groupBars` handles new intervals; `previousDayBars` store field is a minimal addition.
- Architecture (notification tracking): MEDIUM — the `useRef` snapshot approach is the right pattern but requires careful handling of the `focus` transition edge cases.
- Pitfalls: HIGH — all identified from direct code inspection of affected modules.

**Research date:** 2026-03-17
**Valid until:** 2026-04-17 (stable codebase, no external dependencies)
