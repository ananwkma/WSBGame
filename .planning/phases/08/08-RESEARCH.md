# Phase 08: Messaging Overhaul & Chart Fix - Research

**Researched:** 2026-03-05
**Domain:** UI/UX, State Management (Zustand), Financial Charting
**Confidence:** HIGH

## Summary
This phase focuses on two critical UX improvements: fixing the misleading "green line" on the net worth chart when the user is overall in a loss, and transforming the flat chat system into a modern threaded messaging interface.

**Primary recommendation:** Restructure the `messages` state in `useGameStore` into a `threads` record keyed by sender. This enables unread badges, contact lists, and message history sorting while maintaining high performance. Update the chart logic to color based on the *starting* net worth ($100,000) rather than the previous turn.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| NARR-02 | Messages App: Direct message threads | Research into "Threaded" state pattern and Master-Detail UI structure. |
| TRADE-04 | Charts: Stair-step pixel line graphs | Diagnosis and fix for chart color logic (relative to initial capital). |
</phase_requirements>

## User Constraints (from CONTEXT.md)

*No CONTEXT.md found for Phase 08. Researching based on requirements.*

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Zustand | 4.5.x | State Management | Current project standard for game state. |
| Framer Motion | 10.x | Animations | Standard for smooth transitions between List and Detail views. |
| D3-shape | 3.x | Chart Generation | Used by `PriceChart.tsx` for SVG paths. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Lucide React | ^0.294.0 | Icons | For "unread" dots, back arrows, and contact avatars. |

## Architecture Patterns

### State Restructuring (The "Threaded" Pattern)
Move from a flat array to a map of threads for O(1) lookups and easier sorting.

**Current State (Flat):**
```typescript
messages: [ { id: 'm1', sender: 'Wife', text: '...' }, ... ]
```

**Recommended State (Threaded):**
```typescript
threads: {
  'Wife': {
    contactName: 'Wife',
    avatar: '👩',
    lastReadDay: 1,
    messages: [
      { id: 'm1', sender: 'Wife', text: '...', day: 1 },
      { id: 'm2', sender: 'Wife', text: '...', day: 2 }
    ]
  }
}
```

### UI Navigation: Master-Detail
The `ChatApp` component should act as a controller switching between:
1. `MessageList`: List of all contacts with snippets and unread counts.
2. `MessageThread`: Scrollable history of a specific contact with input (if applicable).

### Auto-Sorting Logic
The `MessageList` should be derived from `threads` and sorted by:
`Math.max(...thread.messages.map(m => m.day))`

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Time/Date Logic | Manual string parsing | `day` index | The game uses a discrete "Day" system; stick to it for consistency. |
| Chart Colors | Hardcoded hexes | Shared palette | Use the project's CSS variables for consistency. |

## Common Pitfalls

### Pitfall 1: Misleading Chart Color
**What goes wrong:** The chart shows green even if the user is bankrupt, as long as the last turn was a tiny gain.
**How to avoid:** Always compare the current point with the *starting* capital ($100k) or the *first* point in the history array for "All-Time" views.

### Pitfall 2: Unread Badge Sync
**What goes wrong:** User opens a thread, but the "unread" dot in the list doesn't disappear immediately.
**How to avoid:** Update `lastReadDay` in the store immediately upon selecting the thread.

### Pitfall 3: Separator Logic
**What goes wrong:** "New Messages" separator appears above messages the user *just* read.
**How to avoid:** Capture the `lastReadDay` into a local variable *before* updating it in the store, and use that local variable to render the separator.

## Code Examples

### Fixed Chart Color Logic (`PriceChart.tsx`)
```typescript
// Recommendation: Compare against the FIRST point in history (the start)
const chartColor = useMemo(() => {
  if (color) return color;
  if (history.length < 2) return '#e0dbcb';
  
  const getValue = (p: any) => p.price !== undefined ? p.price : p.value;
  const current = getValue(history[history.length - 1]);
  const initial = getValue(history[0]); // Comparison point
  
  return current >= initial ? '#94ba8b' : '#ba8b8b';
}, [history, color]);
```

### Thread Selection Logic
```typescript
const openThread = (contactId: string) => {
  const currentDay = useGameStore.getState().day;
  // Mark as read immediately
  setThreadRead(contactId, currentDay);
  setSelectedThread(contactId);
};
```

## Dynamic Social Content Logic

### Wife's Mood Templates
```typescript
const WIFE_TEMPLATES = {
  POSITIVE: [
    "Honey, I'm so proud of you! I'm looking at houses in the Hamptons.",
    "The kids are so happy, they want to know when we're getting the boat!",
    "I'm booking us a 5-star dinner tonight. You're my hero!",
  ],
  NEGATIVE: [
    "I saw the bank account. Please tell me it's a mistake.",
    "My mother was right about you. We're going to lose everything.",
    "The mortgage check bounced. I'm staying at my sister's tonight.",
  ]
};
```

## Open Questions

1. **Avatar Source:** Do we want pixel-art avatars or simple emoji/initials?
   - *Recommendation:* Use Emoji for now to stay within the "Phone" aesthetic without needing new assets.
2. **"New Message" Separator Auto-Clear:** Should the separator disappear after the user exits the thread?
   - *Recommendation:* Yes. It should only show messages that arrived *since the last time* they opened the thread.

## Sources

### Primary (HIGH confidence)
- `src/store/useGameStore.ts` - Verified current flat state implementation.
- `src/components/Trade/PriceChart.tsx` - Verified color logic.
- `src/components/Apps/Phone/ChatApp.tsx` - Verified current rendering logic.

### Secondary (MEDIUM confidence)
- Google Search: "React threaded chat UI pattern unread badges separator best practices" - Confirmed "Sticky Date" and "Jump to Unread" patterns.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Using existing project tools.
- Architecture: HIGH - Master-detail and record-based state are robust.
- Pitfalls: MEDIUM - Separator timing can be tricky.

**Research date:** 2026-03-05
**Valid until:** 2026-04-05
