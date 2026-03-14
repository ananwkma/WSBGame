---
phase: 15-live-market-events-polish
plan: "02"
subsystem: ui-branding
tags: [phone, laptop, branding, readit, cleanup]
dependency_graph:
  requires: []
  provides: [phone-rebrand, readit-tab, static-shell]
  affects: [PhoneApp, DualViewShell, LaptopBrowser]
tech_stack:
  added: []
  patterns: [static-framer-motion-animate, forum-post-pattern]
key_files:
  created:
    - src/components/Laptop/ReaditTab.tsx
  modified:
    - src/components/Apps/Phone/PhoneApp.tsx
    - src/components/Shell/DualViewShell.tsx
    - src/components/Laptop/LaptopBrowser.tsx
key_decisions:
  - "Removed useGameStore entirely from DualViewShell — framer-motion animate prop set to static {x:0,y:0}"
  - "ReaditTab uses existing pixel.css classes (forum-post, pixel-bold, upvotes) — no new CSS file needed"
  - "LaptopBrowser address bar URL updated per-tab including readit URL"
metrics:
  duration: "~10 minutes"
  completed: "2026-03-14"
  tasks_completed: 2
  files_changed: 4
---

# Phase 15 Plan 02: Phone Rebranding, Shell Cleanup & ReaditTab Summary

Phone renamed uPhone/uMessage/readit with HYPE LEVEL bar removed; DualViewShell hype jitter eliminated; laptop browser gains a third readit tab with the u/DegenTrader WSB onboarding post and 6 troll tutorial replies.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Phone rebranding and hype bar/jitter removal | bde1188 | PhoneApp.tsx, DualViewShell.tsx |
| 2 | Add readit tab to laptop browser + ReaditTab | 4ce6387 | LaptopBrowser.tsx, ReaditTab.tsx (new) |

## Changes Made

### Task 1: Phone rebranding and hype bar removal

**PhoneApp.tsx:**
- `PhoneTab` type: `'CHAT' | 'FORUM'` → `'UMESSAGE' | 'READIT'`
- Default tab state: `'CHAT'` → `'UMESSAGE'`
- Removed `useGameStore` hype selector import and usage
- Removed entire `.fomo-meter-container` JSX block (HYPE LEVEL bar)
- Header label: `PHONE v1.0` → `uPhone`
- Tab labels: `CHAT` → `uMessage`, `FORUM` → `readit`
- Conditional render updated from `CHAT`/`FORUM` to `UMESSAGE`/`READIT`

**DualViewShell.tsx:**
- Removed `useGameStore` import entirely
- Removed `const hype` and `const isHighHype` lines
- Replaced conditional jitter animate with static `animate={{ x: 0, y: 0 }}`
- Removed conditional `transition` prop (no longer needed)

### Task 2: Add readit tab to laptop browser + ReaditTab

**LaptopBrowser.tsx:**
- `LaptopTab` extended: `'ROBBINGHOOD' | 'GURUTUBE' | 'READIT'`
- Added third tab button (readit with speech icon)
- Address bar URL updated to per-tab conditional (includes readit URL)
- Added `ReaditTab` AnimatePresence branch in browser content
- Imported `ReaditTab` from `./ReaditTab`

**ReaditTab.tsx (new):**
- Static WSB-style forum post by `u/DegenTrader`
- Post: "$100k to $1M YOLO challenge — day 1" with YOLO flair, 4.2k upvotes
- 6 tutorial replies embedded as organic WSB community knowledge:
  1. `u/StockDaddy69` — NEXT DAY button advances time
  2. `u/DiamondHandsDave` — shares vs options (options expire)
  3. `u/BoboTheBear` — Loan Shark mechanic warning
  4. `u/PaperHandsPete` — phone uMessage/readit vs laptop layout
  5. `u/RetardStrength` — options expire at end of each day
  6. `u/MoonMission2024` — GuruTube gurus pump their bags
- Uses existing `forum-post`, `pixel-bold`, `upvotes` CSS classes

## Deviations from Plan

None — plan executed exactly as written.

## Verification Results

1. `npx tsc --noEmit` exits 0 — no TypeScript errors
2. `grep "uPhone|uMessage|readit" PhoneApp.tsx` — all three match
3. `grep "hype|HYPE|fomo-meter" PhoneApp.tsx DualViewShell.tsx` — no results
4. `grep "READIT" LaptopBrowser.tsx` — matches type definition and conditional render
5. `ReaditTab.tsx` contains u/DegenTrader post and 6 replies

## Self-Check: PASSED

- [x] src/components/Apps/Phone/PhoneApp.tsx — modified, committed bde1188
- [x] src/components/Shell/DualViewShell.tsx — modified, committed bde1188
- [x] src/components/Laptop/LaptopBrowser.tsx — modified, committed 4ce6387
- [x] src/components/Laptop/ReaditTab.tsx — created, committed 4ce6387
