# Research Summary: WallStreetBets Trader Game

**Domain:** Narrative Trading Simulator / Retro Pixel Art
**Researched:** 2024-05-24
**Overall confidence:** HIGH

## Executive Summary

The "WallStreetBets Trader Game" is a narrative-driven simulation that blends the high-stakes, meme-heavy culture of retail trading with a 4-color grayscale "Game Boy" aesthetic. The player's experience is framed through two primary interfaces: a **Laptop Screen** (executing trades, watching "gurus") and a **Handheld Phone** (social pressure, community "DD").

Research indicates that the core appeal lies in the tension between financial survival and social belonging. By utilizing a 4-color palette, the game can achieve a distinct "lo-fi" look that masks complexity and focuses on the emotional weight of "stonks" going up or down. Technical implementation via React + Vite is highly feasible, using SVG color matrices to enforce the 2-bit aesthetic across all DOM elements.

## Key Findings

**Stack:** React + Vite using CSS `image-rendering: pixelated` and an SVG `feColorMatrix` for a global 4-color filter.
**Architecture:** A state-driven game loop where narrative events (Forum posts, Guru videos) drive market volatility and player "FOMO."
**Critical pitfall:** Over-complicating the financial simulation. The game must prioritize "meme-logic" and narrative consequences (e.g., losing money to gain "Loss Porn" reputation) over realistic market mechanics.

## Implications for Roadmap

Based on research, the following phase structure is recommended:

1. **Phase 1: The OS & Shell** - Focus on the "Laptop" and "Phone" layout. Implement the global 4-color filter and pixel-perfect scaling.
   - Addresses: Visual identity and core UI navigation.
2. **Phase 2: The Trading Engine** - Build the "Robbinghood" app. Implement stock charts (stair-step pixel lines) and portfolio state.
   - Addresses: Core gameplay loop.
3. **Phase 3: The Echo Chamber** - Build "r/wsb" and "Messages." Create the narrative event system where forum sentiment affects stock prices.
   - Addresses: Narrative depth and "Loss Porn" mechanics.
4. **Phase 4: The Gurus & Endings** - Add "GuruTube" (pixel-frame animations) and multi-ending logic based on Net Worth vs. Community Reputation.

**Phase ordering rationale:**
- The visual identity (Phase 1) is the most critical differentiator and must be verified early. The trading engine (Phase 2) provides the "game" part, while narrative (Phase 3/4) provides the "story" and replayability.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | React + CSS Filters is a proven path for pixel art web games. |
| Features | HIGH | WSB tropes are well-documented and translate easily to game mechanics. |
| Architecture | MEDIUM | Balancing narrative triggers with market randomness needs careful tuning. |
| Pitfalls | HIGH | Common mistakes in trading sims (too much math) are well-known. |

## Gaps to Address

- **Sound Design:** Research into 8-bit/Chiptune audio (specifically for UI clicks and "stonks rising" sounds) was not covered.
- **Content Writing:** The specific "Guru" scripts and "r/wsb" post templates need to be drafted to ensure they capture the authentic "degenerate" tone.
