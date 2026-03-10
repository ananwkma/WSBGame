---
phase: 14-shark-loans-debt-mechanic
plan: "02"
subsystem: UI
tags: [shark-loans, debt, ui, portfolio, ending-screen, messaging]
dependency_graph:
  requires: ["14-01"]
  provides: ["SharkLoanPanel", "SHARK DEBT portfolio row", "SHARK DEBT ending stat"]
  affects: ["src/components/Apps/Phone/MessageThread.tsx", "src/components/Trade/Robbinghood.tsx", "src/components/Feedback/EndingScreen.tsx"]
tech_stack:
  added: []
  patterns: ["inline sub-component", "conditional rendering", "Zustand selector"]
key_files:
  created: []
  modified:
    - src/components/Apps/Phone/MessageThread.tsx
    - src/components/Apps/Phone/Phone.css
    - src/components/Trade/Robbinghood.tsx
    - src/components/Feedback/EndingScreen.tsx
decisions:
  - SharkLoanPanel defined as non-exported inline component in MessageThread.tsx before main component
  - SHARK DEBT row placed after Buying Power stat and before chart in Portfolio tab
  - EndingScreen uses existing StatRow pattern with inline style for custom color on debt value
metrics:
  duration: "~10 minutes"
  completed: "2026-03-10"
  tasks_completed: 2
  files_modified: 4
---

# Phase 14 Plan 02: Shark Loan UI Summary

Player-facing shark debt UI across three surfaces: inline borrow panel in Loan Shark SMS thread with 4 preset amounts, red SHARK DEBT liability row in Robbinghood Portfolio tab, and SHARK DEBT stat row on the EndingScreen.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Add SharkLoanPanel to MessageThread.tsx | f985c4e | MessageThread.tsx, Phone.css |
| 2 | Add SHARK DEBT row to Robbinghood Portfolio and EndingScreen | 50c17b9 | Robbinghood.tsx, EndingScreen.tsx |

## What Was Built

**SharkLoanPanel (MessageThread.tsx)**
- Inline React component defined before `MessageThread`, reads `borrowFromShark`, `sharkDebt`, and `gameStatus` from store
- Renders below `.thread-messages` only when `thread.contactName === 'Loan Shark'`
- Shows OUTSTANDING debt display in red when `sharkDebt > 0`
- Four preset borrow buttons: $10k / $25k / $50k / $100k (amounts in cents: 1000000 / 2500000 / 5000000 / 10000000)
- All buttons disabled when `gameStatus === 'ended'`
- CSS added to Phone.css: `.shark-loan-panel`, `.shark-debt-display`, `.shark-borrow-label`, `.shark-borrow-buttons`, `.shark-borrow-btn` with disabled/hover states

**SHARK DEBT row in Robbinghood.tsx**
- `sharkDebt` destructured from `useGameStore()`
- Conditional `<div className="robbinghood-stat">` inserted after Buying Power row and before chart
- Renders `-$X` in `#ba8b8b` red; hidden when `sharkDebt === 0`

**SHARK DEBT stat in EndingScreen.tsx**
- `sharkDebt` read via selector: `useGameStore((state) => state.sharkDebt)`
- Conditional `<div className="stat-row">` with existing markup pattern added after KARMA row
- Uses inline `color: '#ba8b8b'` for red styling, formats value as `(sharkDebt ?? 0) / 100`
- Hidden when `sharkDebt === 0`

## Decisions Made

- SharkLoanPanel defined as non-exported inline component above `MessageThread` — keeps borrow logic co-located with Loan Shark thread without polluting the broader component tree
- SHARK DEBT placed after Buying Power (not before) so positive liquid stats appear first; debt liability follows logically
- EndingScreen uses inline `<div className="stat-row">` with child spans rather than the `StatRow` helper component, matching the plan spec's explicit markup and allowing custom inline styles on individual spans

## Deviations from Plan

None - plan executed exactly as written.

## Verification

- `npx tsc --noEmit` exits 0 (confirmed twice, once per task)
- `SharkLoanPanel` present in MessageThread.tsx (lines 5 and 87)
- `sharkDebt` present in Robbinghood.tsx (lines 34, 160, 163)
- `sharkDebt` present in EndingScreen.tsx (lines 269, 281, 284)
- `borrowFromShark` present in MessageThread.tsx (lines 6 and 28)

## Self-Check: PASSED

Files exist:
- src/components/Apps/Phone/MessageThread.tsx - FOUND
- src/components/Apps/Phone/Phone.css - FOUND
- src/components/Trade/Robbinghood.tsx - FOUND
- src/components/Feedback/EndingScreen.tsx - FOUND

Commits exist:
- f985c4e - FOUND
- 50c17b9 - FOUND
