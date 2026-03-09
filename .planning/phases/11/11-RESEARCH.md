# Phase 11: Granular Narrative Expansion & Debt Foundation - Research

**Researched:** 2026-03-06
**Domain:** Narrative Systems, Game Economics (Margin/Debt)
**Confidence:** HIGH

## Summary

This phase focuses on two main pillars: a massive expansion of the game's narrative content through 875+ message templates and a new range-based delivery system, and the technical foundation for "Margin" and "Debt" mechanics. 

The narrative expansion moves away from binary "Positive/Negative" sentiment to a high-fidelity 14-tier wealth bracket system for the Wife character, reflecting the player's progression from bankruptcy to billionaire status. Other characters (Guru, Apes, etc.) will receive expanded 25-template pools for their existing tiers (Positive, Negative, Neutral) to reduce repetition and increase world-building depth.

The economic foundation introduces negative cash (Margin) with maintenance requirements and a "Shark Loan" system for high-interest emergency funding, complete with hostile collection events.

**Primary recommendation:** Use a structured `BRACKET_CONFIG` object for range lookups and refactor `MESSAGE_TEMPLATES` to support character-specific selection logic. Use a separate `sharkDebt` state to distinguish from standard broker margin.

## User Constraints (Hypothetical from CONTEXT.md)

### Locked Decisions
- Wife character must have 14 specific Net Worth brackets.
- 25 unique messages per bracket for the Wife (350 total).
- 25 unique messages per tier for Guru, Apes, Brokerage, IRS, Lambo, Stalker, Coworker (525 total).
- Support for negative cash/margin and loan mechanics.
- Debt collection events (e.g., "Kneecap replacement").

### Claude's Discretion
- Specific threshold values for the 14 brackets.
- Exact interest rates for Shark Loans.
- UI placement for the "Loan" app (likely a "Bank" or "Shady" app on the phone).
- Implementation details of range-based selector.

### Deferred Ideas (OUT OF SCOPE)
- Real-time stock updates (stick to turn-based).
- Full "Lambo" driving minigame.
- Marriage/Divorce mechanics beyond messaging.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Zustand | 4.x | State Management | Current project standard for game state. |
| React | 18.x | UI Rendering | Current project standard. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|--------------|
| mathjs | Optional | Complex math | If interest calculations get too complex (unlikely). |

## Architecture Patterns

### Range-Based Template Selection
Instead of passing a simple 'POSITIVE' tier, the selector will now take `netWorth` and use a lookup table.

```typescript
// Pattern for Range Lookup
const WIFE_BRACKETS = [
  { min: -Infinity, max: 0, key: 'BANKRUPT' },
  { min: 0, max: 1000000, key: 'BROKE' }, // $10k
  { min: 1000000, max: 2500000, key: 'STRUGGLING' }, // $25k
  // ...
  { min: 100000000000, max: Infinity, key: 'BILLIONAIRE' } // $1B
];

const getWifeBracket = (nw: number) => 
  WIFE_BRACKETS.find(b => nw >= b.min && nw < b.max)?.key || 'BASELINE';
```

### Margin & Debt State
```typescript
// Proposed State Additions
interface GameState {
  cash: number; // can be negative (Margin)
  sharkDebt: number; // separate high-interest debt
  loanInterestRate: number; // e.g., 0.05 per turn (5%)
}
```

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Range Overlap | Custom if/else chains | Array.find() with sorted ranges | Cleaner, easier to maintain 14+ tiers. |
| Date Formatting | Custom string hacks | Intl.NumberFormat | Handles currency formatting for huge numbers ($1B+). |

## Common Pitfalls

### Pitfall 1: Margin Death Spiral
**What goes wrong:** High interest on margin leads to negative net worth, which triggers more margin calls, making the game unplayable.
**How to avoid:** Implement a "Bailout" event (e.g., Wife's Boyfriend) that triggers once per game when bankrupt to allow the player to continue.

### Pitfall 2: Template Fatigue
**What goes wrong:** Even with 25 messages, a player might see the same one twice in a short session.
**How to avoid:** Implement a "Recently Used" buffer for each category that prevents the last 5 messages from repeating.

### Pitfall 3: Number Overflow
**What goes wrong:** Net worth exceeding $2.1B (Max Int32) if using cents.
**Why it happens:** JavaScript numbers are 64-bit floats, which can handle up to 2^53 - 1 accurately. $1B in cents is 10^11, which is well within 2^53 (~9 * 10^15). 
**Prevention:** Monitor for numbers approaching $90 Trillion. (Unlikely in this game).

## Code Examples

### Refactored `messageTemplates.ts`
```typescript
export type WifeBracket = 
  | 'BANKRUPT' | 'BROKE' | 'STRUGGLING' | 'WORRIED' | 'CONCERNED' 
  | 'BASELINE' | 'COMFORTABLE' | 'WELL_OFF' | 'RICH' | 'MILLIONAIRE' 
  | 'MULTI_MILLIONAIRE' | 'DECA_MILLIONAIRE' | 'CENT_MILLIONAIRE' | 'BILLIONAIRE';

export const WIFE_MESSAGES: Record<WifeBracket, string[]> = {
  BANKRUPT: [
    "I'm at my sister's. Don't call me.",
    "The kids are crying. You gambled away the mortgage.",
    "My boyfriend said you can sleep in his car tonight. Maybe.",
    // ... 22 more
  ],
  // ...
};
```

### Margin Calculation in `useGameStore`
```typescript
const getMarginInfo = (state: GameState) => {
  const holdingsValue = calculateHoldingsValue(state);
  const maintenanceMargin = holdingsValue * 0.25;
  const equity = state.cash + holdingsValue - state.sharkDebt;
  
  return {
    isMarginCall: equity < maintenanceMargin && state.cash < 0,
    maintenanceMargin,
    equity
  };
};
```

## Narrative Content: 14 Wife Brackets (Sample)

| Bracket | Net Worth Range | Tone | Sample Message |
|---------|-----------------|------|----------------|
| **BANKRUPT** | < $0 | Hostile | "I've filed the papers. You're a monster." |
| **BROKE** | $0 - $10k | Desperate | "I saw the bank statement. We have $40 left." |
| **STRUGGLING** | $10k - $25k | Angry | "No more 'investing'. Get a job at Wendy's." |
| **WORRIED** | $25k - $50k | Tense | "I'm skipping lunch to save money. Happy?" |
| **CONCERNED** | $50k - $75k | Suspicious | "Why is the credit card declined? Answer me." |
| **BASELINE** | $75k - $125k | Neutral | "Hope your little game is going okay. Milk's out." |
| **COMFORTABLE** | $125k - $250k | Curious | "Did you actually make money today? Really?" |
| **WELL_OFF** | $250k - $500k | Happy | "I saw a nice SUV today. We should look at it." |
| **RICH** | $500k - $1M | Excited | "Honey! Let's go to that fancy steakhouse!" |
| **MILLIONAIRE** | $1M - $5M | Elated | "I'm telling everyone you're a genius." |
| **MULTI-MILLIONAIRE** | $5M - $25M | Lavish | "I just ordered a custom walk-in closet. Love you!" |
| **DECA-MILLIONAIRE** | $25M - $100M | Power | "Let's buy the house next door for my parents." |
| **CENT-MILLIONAIRE** | $100M - $1B | Transcendent | "Is a private jet too much? I don't care." |
| **BILLIONAIRE** | > $1B | God-Tier | "I'm bored. Should we buy a small country?" |

## Open Questions

1. **Loan UI**: Should the shark loan be accessible via a new "Shady" contact or a "Loan" app?
   - *Recommendation:* A new "Shark Loan" app that only appears when cash < $10k.
2. **Margin Liquidation**: How aggressive should the broker be?
   - *Recommendation:* Give 1 turn warning, then force-sell 50% of positions.
3. **Template Storage**: Should 875+ strings stay in `messageTemplates.ts`?
   - *Recommendation:* Yes, but categorized clearly to avoid a giant unreadable block. Consider a separate file for Wife messages if the file exceeds 2000 lines.

## Sources

### Primary (HIGH confidence)
- `src/data/messageTemplates.ts` - Current implementation.
- `src/store/useGameStore.ts` - Current logic.
- Reddit r/wallstreetbets - Humor style and terminology.

### Secondary (MEDIUM confidence)
- Investopedia - Margin and Maintenance requirements logic.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Using existing project stack.
- Architecture: HIGH - Range lookup is a standard pattern.
- Content: MEDIUM - Large volume of writing required.

**Research date:** 2026-03-06
**Valid until:** 2026-04-05
