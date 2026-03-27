# Phase 3: Narrative Events & Messaging - Research

**Researched:** 2026-03-03
**Domain:** Game State, Narrative Systems, Chat UI, Social Simulation
**Confidence:** HIGH

## Summary
Phase 3 focuses on the "Echo Chamber" of the game. This requires a robust, turn-based **Event Engine** that can trigger market shifts, text messages, and forum posts simultaneously. The UI must maintain the 4-color pixel art aesthetic while providing tactile, high-impact feedback for "Hype" and "FOMO."

## 1. Event Engine (Zustand + Event Queue)
A centralized system is needed to manage the sequence of narrative events that occur when a turn progresses.
- **State Structure:** `eventQueue: GameEvent[]` in the Zustand store.
- **Processing:** A `processEvents()` action that executes events one by one (e.g., show message -> update market -> unlock next day).
- **Event Types:** `MESSAGE`, `FORUM_POST`, `MARKET_SHIFT`, `GURU_ADVICE`, `ENDING_TRIGGER`.

## 2. Pixel-Art Chat & Forum UI
The phone and laptop views need specialized components for social simulation.
- **Chat (Phone):** Use `border-image` for pixelated speech bubbles. Messages should have distinct "Sender" styles (Wife, Friend, Unknown).
- **r/wsb Forum (Phone):** A vertical scrolling list of "Posts." Each post has a title, user, and "Upvote" count (Karma).
- **GuruTube (Laptop):** A simplified video player UI. Instead of video, use 2-frame sprite animations (2-5fps) to simulate retro video quality.

## 3. "FOMO Meter" & Hype Jitter
Hype is a core mechanic that affects the UI's stability.
- **Hype Level:** A 0-100 value in the store driven by forum activity and market gains.
- **Visual Jitter:** Use `framer-motion` to apply a random `x`/`y` shake to the `GameViewport` or specific app windows when hype is high (>80).
- **Artifacts:** High hype can trigger CSS "glitch" filters (e.g., `feOffset` in SVG) for a "degenerate" trading feel.

## 4. Narrative Endings & Progression
- **Endings:** Triggered based on `Net Worth` and `Karma` (total upvotes on your loss porn).
- **Thresholds:**
    - **Moon Millionaire:** Net Worth > $1,000,000.
    - **Community Legend:** Net Worth < $0 AND Karma > 1,000.
    - **Mendy's Employee:** Net Worth < $0 AND Karma < 1,000.

## Pitfalls to Avoid
- **Over-simulation:** Don't build a real AI chat. Use scripted message chains triggered by turn count or portfolio milestones.
- **Performance:** Avoid constant re-renders during "Jitter." Throttle the shake effect to 30fps or use CSS transforms instead of React state.
- **Anti-aliasing:** Ensure all pixel bubbles and icons use `image-rendering: pixelated`.

## Code Example: Simple Hype Shake (Framer Motion)
```tsx
const HypeContainer = ({ hype, children }) => {
  const isHyped = hype > 80;
  return (
    <motion.div
      animate={isHyped ? { x: [-1, 1, -1, 1, 0], y: [1, -1, 1, -1, 0] } : {}}
      transition={{ repeat: Infinity, duration: 0.1 }}
    >
      {children}
    </motion.div>
  );
};
```
