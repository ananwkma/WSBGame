---
phase: 14-shark-loans-debt-mechanic
plan: "01"
subsystem: game-logic
tags: [shark-loans, debt, compounding, game-loop, messaging]
dependency_graph:
  requires: []
  provides: [borrowFromShark-action, sharkDebt-compounding, SHARK-messages, Loan-Shark-thread]
  affects: [useGameStore, types, messageTemplates, DEBT_SPIRAL-ending, getNetWorth, netWorthHistory]
tech_stack:
  added: []
  patterns: [compounding-debt-local-variable, per-turn-threat-injection, debt-ratio-tiered-messaging]
key_files:
  created: []
  modified:
    - src/store/types.ts
    - src/data/messageTemplates.ts
    - src/store/useGameStore.ts
decisions:
  - newDebt computed as local variable at top of nextTurn() so it is in scope for both the day>=10 branch and the normal-turn set()
  - debtRatio uses currentNetWorth (post-debt) so ratio correctly exceeds 1.0 when debt outpaces assets
  - pickSharkMessage appends formatted debt amount on 40% of messages for flavour without always repeating it
  - Loan Shark thread seeded in getInitialState() with intro message so contact exists before borrowFromShark is ever called
metrics:
  duration: ~20min
  completed: 2026-03-10
  tasks_completed: 2
  files_modified: 3
---

# Phase 14 Plan 01: Shark Loans Debt Mechanic — Core Engine Summary

**One-liner:** Full sharkDebt game-loop engine — borrow action, 20% per-turn compounding, debt-adjusted net worth, correct DEBT_SPIRAL detection, and tiered threatening messages from the Loan Shark.

## What Was Built

### Task 1 — Types + Templates
- Added `borrowFromShark: (amount: number) => void` to `GameActions` in `types.ts`
- Added `'SHARK'` to `TemplateCategory` union in `messageTemplates.ts`
- Exported `pickSharkMessage(debtRatio: number, debtCents: number): string` with 4 escalating threat pools:
  - Mild (debtRatio < 0.25) — 5 pressure messages
  - Serious (0.25–0.75) — 5 threatening messages
  - Very threatening (0.75–1.0) — 5 alarming messages
  - "You're done" (>= 1.0) — 5 end-state messages
  - 40% chance to append formatted debt amount for context

### Task 2 — useGameStore Engine
- Imported `pickSharkMessage` from messageTemplates
- Seeded `'Loan Shark'` thread in `getInitialState()` with intro message (avatar: `🦈`)
- Implemented `borrowFromShark(amount)` action: adds amount to both `cash` and `sharkDebt`, appends confirmation message to Loan Shark thread
- Fixed `getNetWorth()` to return `cash + stockValue + optionsValue - sharkDebt`
- Computed `newDebt` as local variable at top of `nextTurn()` (before `day >= 10` branch): `Math.round(currentDebt * 1.20)` if debt > 0, else 0
- Fixed `settledNetWorth = cash + optionPayouts + stockValue - newDebt`
- Fixed DEBT_SPIRAL check to use `newDebt > settledNetWorth` (not stale `get().sharkDebt`)
- Added `sharkDebt: newDebt` to end-game `set()` call so final persisted value is compounded
- Fixed local `netWorth` variable to subtract `newDebt` so wife bracket reflects true financial standing
- Injected per-turn Loan Shark threat message into `newThreads['Loan Shark']` when `newDebt > 0`
- Added `sharkDebt: newDebt` to normal-turn `set()` so debt compounds every turn

## Commits

| Hash | Message |
|------|---------|
| 7897ee7 | feat(14-01): add borrowFromShark to GameActions and SHARK templates to messageTemplates |
| ac47898 | feat(14-01): implement sharkDebt engine in useGameStore |

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check

- [x] `src/store/types.ts` — `borrowFromShark` in GameActions
- [x] `src/data/messageTemplates.ts` — `pickSharkMessage` exported, `'SHARK'` in TemplateCategory
- [x] `src/store/useGameStore.ts` — all engine changes confirmed
- [x] `npx tsc --noEmit` — exits 0 with zero errors
- [x] Commits 7897ee7 and ac47898 exist
