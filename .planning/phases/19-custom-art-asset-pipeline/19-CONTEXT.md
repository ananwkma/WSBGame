# Phase 19: Custom Art Asset Pipeline - Context

**Gathered:** 2026-03-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Create an `art-assets` git branch (branched from master) where hardcoded visual assets — ASCII ending art, CSS-only GuruTube emoji faces, black phone lock screen, ReaditTab avatar/logo, and phone contact avatars — are replaced with `<img>` tags pointing to named PNG files in `public/assets/`. Placeholder images (labeled gray rectangles) are committed to the branch at the correct dimensions. An ASSETS.md manifest documents every filename and dimension. Master branch is untouched. The branch is designed to eventually merge back to master once real art is delivered.

</domain>

<decisions>
## Implementation Decisions

### Placeholder images
- Labeled gray rectangles with asset name text (e.g., "ENDING_ART", "GURU_FACE") so artist knows exactly what to replace
- Dimensions match the actual area each asset fills — endings are portrait-ish, guru faces are square, etc. (Claude to determine per asset)
- PNG format only
- Placeholders committed to the art-assets branch in `public/assets/` — artist clones and replaces files in place

### Fallback behavior
- No runtime fallback logic needed — placeholders are always present in the branch, so `<img>` always resolves
- No `onError` handlers or conditional rendering required
- Master branch is completely untouched — all `<img>` changes live only on art-assets

### Asset scope — 5 types
1. **Ending screens** (10 total): `public/assets/endings/<ENDING_TYPE>.png` — filenames match EndingType enum values exactly (e.g., `MOON_MISSION.png`, `DEBT_SPIRAL.png`)
2. **GuruTube faces**: `public/assets/guru/<mood-state>.png` — one image per CSS mood state (e.g., `happy.png`, `sad.png`, `excited.png`) matching existing emotion states
3. **Phone lock screen background**: `public/assets/lockscreen/bg.png` — replaces black fill
4. **ReaditTab avatar/logo**: `public/assets/readit/avatar.png` (or logo — Claude to determine what makes sense from the UI)
5. **Phone contact photos**: `public/assets/contacts/<contact-name>.png` — kebab-case matching in-game contact names (e.g., `wife.png`, `loan-shark.png`, `apes.png`)

### Documentation
- `public/assets/ASSETS.md` committed to the branch — lists every asset path, expected dimensions, and description — artist's single reference, no code reading required

### Branch & merge strategy
- `art-assets` branches from master at time of phase execution
- Intended to eventually merge into master once real artwork is delivered (art-assets becomes canonical)
- When master gets new game commits after the branch is created, rebase art-assets onto master to keep it current
- Branch stays local for now — pushed to remote when art handoff begins

### Claude's Discretion
- Exact pixel dimensions for each placeholder (determine from actual rendered sizes in the game components)
- What the ReaditTab "avatar" specifically refers to (inspect ReaditTab component to identify the swappable visual)
- All GuruTube mood state names (read existing CSS/component to enumerate them)
- All contact thread names (read useGameStore to enumerate contacts for filenames)

</decisions>

<specifics>
## Specific Ideas

- Placeholders should be labeled so artist knows immediately what each file is for — no guessing from filename alone
- Ending filenames match code constants directly (MOON_MISSION not moon-mission) — simpler code, no mapping table
- ASSETS.md is the artist's document, not a dev doc — write it for a non-coder audience

</specifics>

<deferred>
## Deferred Ideas

- None — discussion stayed within phase scope

</deferred>

---

*Phase: 19-custom-art-asset-pipeline*
*Context gathered: 2026-03-19*
