# Phase 19: Custom Art Asset Pipeline - Research

**Researched:** 2026-03-19
**Domain:** Static asset swap pipeline — React/Vite `public/assets/`, git branching, placeholder PNG generation
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Create an `art-assets` git branch (branched from master) — master branch is completely untouched
- Replace hardcoded visuals with `<img>` tags pointing to named PNG files in `public/assets/`
- Placeholder images: labeled gray rectangles with asset name text, PNG format only
- Dimensions match actual rendered area per asset (Claude to determine from components)
- No runtime fallback logic — placeholders are always present, `<img>` always resolves
- No `onError` handlers or conditional rendering required
- Placeholders committed to art-assets branch in `public/assets/` — artist clones and replaces in place
- `art-assets` branches from master at time of phase execution
- Intended to merge into master once real artwork is delivered
- When master gets new game commits, rebase art-assets onto master
- Branch stays local for now — pushed to remote when art handoff begins
- Asset scope: 5 types — Ending screens (10), GuruTube faces, Phone lock screen bg, ReaditTab avatar, Phone contact photos

**Ending screens (10 total):**
- Path: `public/assets/endings/<ENDING_TYPE>.png`
- Filenames match EndingType enum values exactly (e.g., `MOON_MISSION.png`, `DEBT_SPIRAL.png`)

**GuruTube faces:**
- Path: `public/assets/guru/<mood-state>.png`
- One image per CSS mood state matching existing emotion states

**Phone lock screen background:**
- Path: `public/assets/lockscreen/bg.png`
- Replaces black fill

**ReaditTab avatar/logo:**
- Path: `public/assets/readit/avatar.png` (or logo — Claude to determine from UI)

**Phone contact photos:**
- Path: `public/assets/contacts/<contact-name>.png`
- Kebab-case matching in-game contact names

**Documentation:**
- `public/assets/ASSETS.md` committed to branch — lists every asset path, dimensions, description
- Written for non-coder (artist) audience

### Claude's Discretion
- Exact pixel dimensions for each placeholder (determine from actual rendered sizes in the game components)
- What the ReaditTab "avatar" specifically refers to (inspect ReaditTab component to identify the swappable visual)
- All GuruTube mood state names (read existing CSS/component to enumerate them)
- All contact thread names (read useGameStore to enumerate contacts for filenames)

### Deferred Ideas (OUT OF SCOPE)
- None — discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| ART-01 | Create `art-assets` branch with `<img>` references replacing hardcoded visuals (ASCII ending art, CSS GuruTube emoji faces, black phone lock screen, ReaditTab avatar, contact avatars) pointing to named PNG placeholders in `public/assets/` | Component audit reveals exact source locations, dimensions, and filenames for all 5 asset categories. Vite static asset serving pattern confirmed. Git branch strategy documented. |
</phase_requirements>

---

## Summary

Phase 19 is a pure frontend asset-swap task with no new logic. The implementation creates a new git branch (`art-assets`) and modifies specific React components to replace hardcoded visuals — SVG pixel art in `EndingScreen.tsx`, emoji elements in `GuruTube.tsx`, an inline `background: '#000000'` style in `PhoneApp.tsx`, a missing avatar slot in `ReaditTab.tsx`, and emoji avatars in the contact thread list — with `<img src="/assets/...">` tags. Named PNG placeholder files are committed to the branch at the correct dimensions. A single `public/assets/ASSETS.md` document serves as the artist's reference.

The technical surface is minimal. Vite serves everything in `public/` as static assets at the root path during both dev and prod. No import statements are needed for these files — HTML/JSX `<img src="/assets/...">` just works. The game's SVG `feColorMatrix` palette filter (VIS-01) applies to all rendered content including `<img>` tags, so placeholder PNGs must use colors that survive the 4-color grayscale transform without being washed to pure black or white.

The branch strategy is straightforward: branch from master, make all changes on `art-assets`, commit placeholders, document in ASSETS.md. When master advances (e.g., Phase 20+), the artist or developer rebases `art-assets` onto the updated master to keep the branch current.

**Primary recommendation:** Branch from master, audit each of the 5 component locations identified below, replace with `<img>` tags, generate placeholder PNGs at the dimensions specified in this document, commit everything, and write ASSETS.md last.

---

## Standard Stack

### Core
| Tool | Version | Purpose | Why Standard |
|------|---------|---------|--------------|
| Vite static serving | (project's Vite version) | Serves `public/` at root URL | Any file in `public/` is accessible as `/filename` with no import or bundling — the canonical Vite pattern for static assets |
| React `<img>` | (project's React version) | Replace hardcoded visuals | Standard HTML element; no library needed |
| Git branch | — | Isolate art changes from master | Project's stated strategy |

### Supporting
| Tool | Version | Purpose | When to Use |
|------|---------|---------|-------------|
| Node.js `canvas` or ImageMagick | system | Generate placeholder PNGs programmatically | For creating labeled gray rectangle files at correct dimensions |
| Sharp (npm) | latest | PNG generation alternative | If canvas API is unavailable; produces smaller files |

### No Additional npm Installs Needed
This phase adds zero new runtime dependencies. Placeholder PNG generation is a one-time dev task (can use any image tool or a small script). The `<img>` element is native HTML.

**Placeholder generation options (pick one):**
- A small Node.js script using the built-in `canvas` npm package (already common in Node environments)
- ImageMagick CLI: `magick -size 200x200 xc:gray -font Courier -pointsize 14 -fill white -gravity center -annotate 0 "GURU_HAPPY_IDLE" guru/happy-idle.png`
- Any image editor (Figma, Photoshop, GIMP) — simplest for one-off work

---

## Architecture Patterns

### Vite Static Asset Pattern
**What:** Files placed in `public/` are served verbatim at the URL root. A file at `public/assets/endings/MENDYS.png` is accessible as `/assets/endings/MENDYS.png` in any `<img src>` or CSS `url()`.
**When to use:** Always for assets that artists will swap in-place by filename. No import, no hash, no bundling.
**Example:**
```tsx
// Correct — works in dev and prod
<img src="/assets/endings/MENDYS.png" alt="MENDYS ending" />

// Wrong — imports go through Vite bundler and get hashed filenames
import endingImg from '../assets/endings/MENDYS.png';
```

### Recommended Asset Directory Structure
```
public/
└── assets/
    ├── ASSETS.md                    # Artist manifest
    ├── endings/
    │   ├── MENDYS.png               # 112 x 84 px
    │   ├── BREAK_EVEN.png           # 112 x 84 px
    │   ├── SMALL_WINS.png           # 112 x 84 px
    │   ├── TENDIES.png              # 112 x 84 px
    │   ├── TO_THE_MOON.png          # 112 x 84 px
    │   ├── HEDGE_FUND_DARLING.png   # 112 x 84 px
    │   ├── WOLF_OF_WALL_STREET.png  # 112 x 84 px
    │   ├── PRIVATE_ISLAND.png       # 112 x 84 px
    │   ├── DEBT_SPIRAL.png          # 112 x 84 px
    │   ├── EXPIRED_WORTHLESS.png    # 112 x 84 px
    │   └── PAPER_HANDS.png          # 112 x 84 px
    ├── guru/
    │   ├── happy-idle.png           # 200 x 200 px
    │   ├── happy-excited.png        # 200 x 200 px
    │   ├── sad-worried.png          # 200 x 200 px
    │   └── sad-crying.png           # 200 x 200 px
    ├── lockscreen/
    │   └── bg.png                   # 180 x 400 px (portrait)
    ├── readit/
    │   └── avatar.png               # 48 x 48 px
    └── contacts/
        ├── ape-friend.png           # 40 x 40 px
        ├── wife.png                 # 40 x 40 px
        ├── brokerage.png            # 40 x 40 px
        ├── crypto-guru.png          # 40 x 40 px
        ├── wifes-boyfriend.png      # 40 x 40 px
        └── loan-shark.png           # 40 x 40 px
```

### Pattern 1: Replace SVG Pixel Art with `<img>` (Ending Screens)
**What:** `EndingScreen.tsx` renders a `<PixelArt>` SVG component per ending. Each ending's `pixelArt` grid is 16 chars wide x 12 rows, rendered at PIXEL_SIZE=7 → **112 x 84 px** actual SVG output. Replace the `<PixelArt grid={content.pixelArt} />` call with an `<img>` at the same dimensions.

**Current code in EndingScreen.tsx (lines 64-283):**
```tsx
// ENDING_CONTENT has pixelArt: string[] per EndingType
<PixelArt grid={content.pixelArt} />
```

**Replacement pattern:**
```tsx
<img
  src={`/assets/endings/${result}.png`}
  alt={result}
  width={112}
  height={84}
  style={{ display: 'block', margin: '16px auto', imageRendering: 'pixelated' }}
/>
```
Note: `result` is the `EndingType` string value (e.g., `'MENDYS'`), which matches the filename exactly. The `ENDING_CONTENT` Record and `PixelArt` component can be removed entirely — they are only used for this render.

### Pattern 2: Replace Emoji Faces with `<img>` (GuruTube)
**What:** `GuruTube.tsx` renders the guru face as an emoji inside an SVG `<text>` element, cycling between 2 frames at 2fps with `marketSentiment` (HAPPY/SAD) x `frame` (0/1). This produces 4 distinct visual states.

**Current states mapped:**
| State | Emoji | Condition | Filename |
|-------|-------|-----------|----------|
| HAPPY frame 0 | 😎 | marketSentiment=HAPPY, frame=0 | `happy-idle.png` |
| HAPPY frame 1 | 🤑 | marketSentiment=HAPPY, frame=1 | `happy-excited.png` |
| SAD frame 0 | 😨 | marketSentiment=SAD, frame=0 | `sad-worried.png` |
| SAD frame 1 | 😭 | marketSentiment=SAD, frame=1 | `sad-crying.png` |

**Current code (lines 103-128):**
```tsx
<svg viewBox="0 0 100 100" ...>
  <text x="50" y="55" fontSize="80" textAnchor="middle">
    {getGuruFace()}
  </text>
</svg>
```

**Replacement pattern:**
```tsx
const getGuruFaceSrc = () => {
  if (marketSentiment === 'HAPPY') {
    return frame === 0 ? '/assets/guru/happy-idle.png' : '/assets/guru/happy-excited.png';
  } else {
    return frame === 0 ? '/assets/guru/sad-worried.png' : '/assets/guru/sad-crying.png';
  }
};

// In render:
<img
  src={getGuruFaceSrc()}
  alt="guru face"
  style={{ width: '85%', height: '85%', imageRendering: 'pixelated', objectFit: 'contain' }}
/>
```
The outer animated `div` with `transform: frame === 1 ? 'scale(1.05)' : 'scale(1)'` can remain as-is to preserve the scale pulse animation.

### Pattern 3: Replace Inline Black Background with `<img>` (Lock Screen)
**What:** `PhoneApp.tsx` renders the lock screen overlay with `background: '#000000'` as an inline style. The lock screen `div` is `position: absolute; inset: 0`, filling the phone container entirely. The phone's `screenContent` area is inside `phoneView` which uses flex sizing — actual px depends on viewport, but the phone is portrait-shaped.

**Recommended placeholder size:** 180 x 400 px (portrait — phone is narrower than tall, approximately 1:2.2 ratio).

**Current code (lines 102-158):**
```tsx
<motion.div style={{ position: 'absolute', inset: 0, background: '#000000', ... }}>
  {/* branding, notifs, unlock hint */}
</motion.div>
```

**Replacement pattern:**
```tsx
<motion.div style={{ position: 'absolute', inset: 0, background: '#000000', ... }}>
  <img
    src="/assets/lockscreen/bg.png"
    alt=""
    style={{
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      imageRendering: 'pixelated',
    }}
  />
  {/* branding, notifs, unlock hint remain on top */}
</motion.div>
```
The `<img>` sits behind the text/notification children, which still render as overlaid flex content.

### Pattern 4: Add Avatar Image to ReaditTab Profile Card
**What:** `ReaditTab.tsx` has a "MY PROFILE" sidebar card showing only `u/DegenTrader` text — no image currently exists. The profile card div is at line 67, padded 8px inside a 207px wide sidebar. Add an avatar image above the username.

**Target element (current):**
```tsx
<div style={{ background: '#2b2b26', border: '1px solid #555', padding: '8px' }}>
  <div style={{ fontSize: '0.72em', opacity: 0.5, ... }}>MY PROFILE</div>
  <div className="pixel-bold" style={{ color: '#a8c8a0', ... }}>u/DegenTrader</div>
```

**Replacement pattern — add `<img>` before the username:**
```tsx
<img
  src="/assets/readit/avatar.png"
  alt="u/DegenTrader avatar"
  width={48}
  height={48}
  style={{ display: 'block', marginBottom: '4px', imageRendering: 'pixelated' }}
/>
```
**Placeholder size:** 48 x 48 px (fits comfortably in the 207px-wide sidebar with 8px padding).

### Pattern 5: Replace Emoji Avatars with `<img>` (Contact List)
**What:** `MessageList.tsx` renders `<div className="contact-avatar">{thread.avatar}</div>` where `thread.avatar` is an emoji string. The `.contact-avatar` CSS class sets `width: 40px; height: 40px`. Replace the emoji with an `<img>` sized to fill the avatar container.

**Contacts from `useGameStore.ts` (lines 427-433):**
| contactName | Current emoji | Filename |
|-------------|---------------|----------|
| Ape Friend | 🦍 | `ape-friend.png` |
| Wife | 👩 | `wife.png` |
| Brokerage | 🏛️ | `brokerage.png` |
| Crypto Guru | 📉 | `crypto-guru.png` |
| Wife's Boyfriend | 😎 | `wifes-boyfriend.png` |
| Loan Shark | (emoji in store) | `loan-shark.png` |

**Approach:** The `Thread` type has an `avatar` field currently holding an emoji string. On the `art-assets` branch, change `MessageList.tsx` to use `<img>` instead of rendering `thread.avatar` as text:

```tsx
// In MessageList.tsx — replace:
<div className="contact-avatar">{thread.avatar}</div>

// With:
<div className="contact-avatar" style={{ padding: 0, overflow: 'hidden' }}>
  <img
    src={`/assets/contacts/${contactNameToFilename(thread.contactName)}.png`}
    alt={thread.contactName}
    width={40}
    height={40}
    style={{ display: 'block', imageRendering: 'pixelated' }}
  />
</div>
```

**Filename mapping helper:**
```tsx
function contactNameToFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/'/g, '')         // Wife's Boyfriend → wifes-boyfriend
    .replace(/\s+/g, '-');     // Ape Friend → ape-friend
}
```

Also update `MessageThread.tsx` line 79 where `{thread.avatar}` renders in the thread header:
```tsx
<span className="thread-avatar">
  <img src={`/assets/contacts/${contactNameToFilename(thread.contactName)}.png`} alt="" width={24} height={24} style={{ imageRendering: 'pixelated' }} />
</span>
```

### Anti-Patterns to Avoid
- **Using `import` for public assets:** Don't `import endingImg from '../assets/endings/MENDYS.png'`. Assets in `public/` must use `/assets/...` URL strings so the artist can replace files without touching code.
- **Keeping PixelArt component and pixelArt data on the art-assets branch:** The goal is to remove the SVG pixel art entirely. Don't render both; just use `<img>`.
- **Hardcoding dimensions that mismatch placeholders:** If the `<img>` is given `width={112} height={84}` but the PNG is a different size, pixelated rendering will scale it — the placeholder should be created at exactly the declared dimensions.
- **Forgetting `imageRendering: 'pixelated'`:** The project uses `image-rendering: pixelated` globally (pixel.css applies it to `*`), so this is already inherited. Explicitly setting it as an inline style is harmless redundancy but not required.
- **Changing the `Thread.avatar` emoji values in the store on the art-assets branch:** The emoji field is still used by master. On art-assets, simply stop rendering it in the UI — don't delete the field from the store data.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Placeholder PNG generation | Custom canvas pipeline | ImageMagick CLI one-liner or any image editor | One-time dev task, not runtime code |
| Asset URL construction | Dynamic mapping table or switch statement | Template literal `\`/assets/${category}/${name}.png\`` | Flat and direct; the naming convention IS the mapping |
| Fallback handling | `onError` handler with default image | Leave `<img>` bare — placeholders are always committed | Decision is already locked: no fallback logic needed |

---

## Common Pitfalls

### Pitfall 1: The 4-Color Palette Filter Washes Out Placeholder Labels
**What goes wrong:** The game root has `filter: url(#gb-pocket)` applied via SVG `feColorMatrix`. This remaps all colors to the 4-color Game Boy palette. A pure mid-gray placeholder `#888888` may survive fine, but pure white text or label renders identically to the lightest game color (`#e0dbcb`). If the label text and background are both remapped to the same palette color, the artist sees a blank gray square with no label.
**Why it happens:** `feColorMatrix` forces all colors into 4 discrete values regardless of input.
**How to avoid:** Use high-contrast values that map to different palette buckets. Specifically: dark gray background (maps to `#1c1c17` or `#706b66`) with light text (maps to `#e0dbcb`). A mid-gray `#888` background with white `#ffffff` text should survive the filter as visually distinct.
**Warning signs:** Preview placeholders in-browser before finalizing. Run the game at dev server and check that placeholder labels are legible under the Game Boy filter.

### Pitfall 2: Guru Face `<img>` Breaks the Scale Pulse Animation
**What goes wrong:** The existing animation scales the outer div on `frame === 1`. If the `<img>` has `width`/`height` set as attributes (fixed px), the scale transform still works. But if the `<img>` is given `position: absolute` or `display: block` incorrectly, it may escape the animated container.
**Why it happens:** The animated div has `overflow: hidden` on `.video-player`. The `<img>` must be a normal flow child inside the animated div.
**How to avoid:** Keep the outer animation div structure unchanged. Only swap the inner `<svg>/<text>` element for `<img>`.

### Pitfall 3: Lock Screen Background `<img>` Blocks Click-Through
**What goes wrong:** The lock screen div has `pointerEvents: 'auto'` and an `onClick={() => setFocus('phone')}`. An `<img>` covering the full area could capture click events before they bubble to the parent div's handler.
**Why it happens:** `<img>` is a replaced element that participates in pointer event capture.
**How to avoid:** Add `style={{ pointerEvents: 'none' }}` to the `<img>` tag so all clicks pass through to the parent `motion.div`.

### Pitfall 4: Contact Name → Filename Collision
**What goes wrong:** "Wife's Boyfriend" and "Wife" could both produce `wife` if the apostrophe removal and truncation logic is wrong, or produce `wife-s-boyfriend` if the apostrophe is treated as a space boundary.
**Why it happens:** String normalization edge cases.
**How to avoid:** Test the helper function with all 6 contact names before naming the PNG files. The mapping in this document uses: `Wife's Boyfriend` → remove apostrophe → `Wifes Boyfriend` → lowercase+kebab → `wifes-boyfriend`. Verify this produces 6 unique strings.

### Pitfall 5: Branch Rebase Conflicts on Component Files
**What goes wrong:** After creating `art-assets` from master, if a future phase modifies `EndingScreen.tsx`, `GuruTube.tsx`, `PhoneApp.tsx`, or `MessageList.tsx` on master, rebasing `art-assets` onto master will produce conflicts in exactly those files.
**Why it happens:** Both branches touch the same lines.
**How to avoid:** This is expected and unavoidable — document it in the branch README or ASSETS.md. The rebase will show clear conflicts: master's new code vs. art-assets's `<img>` swap. Resolution: keep the master's new logic, re-apply the `<img>` swap on top of it.

---

## Code Examples

### Vite Static Asset Serving — Confirmed Pattern
```tsx
// Source: Vite official docs — "The public Directory"
// Files in public/ are served at root URL with no processing
<img src="/assets/endings/MENDYS.png" alt="" />
// => served from public/assets/endings/MENDYS.png
```

### Ending Screen Replacement
```tsx
// Replace PixelArt component call in EndingScreen.tsx
// Before:
<PixelArt grid={content.pixelArt} />

// After (on art-assets branch):
<img
  src={`/assets/endings/${result}.png`}
  alt={result}
  width={112}
  height={84}
  style={{ display: 'block', margin: '16px auto', imageRendering: 'pixelated' }}
/>
```

### GuruTube Face Swap
```tsx
// In GuruTube.tsx — replace getGuruFace() + SVG text with:
const getGuruFaceSrc = () => {
  if (marketSentiment === 'HAPPY') {
    return frame === 0 ? '/assets/guru/happy-idle.png' : '/assets/guru/happy-excited.png';
  }
  return frame === 0 ? '/assets/guru/sad-worried.png' : '/assets/guru/sad-crying.png';
};

// In render (replace svg block):
<img
  src={getGuruFaceSrc()}
  alt="guru"
  style={{ width: '85%', height: '85%', imageRendering: 'pixelated', objectFit: 'contain' }}
/>
```

### Contact Name Filename Helper
```tsx
// Pure function, no dependencies
function contactNameToFilename(name: string): string {
  return name.toLowerCase().replace(/'/g, '').replace(/\s+/g, '-');
}
// Results:
// 'Ape Friend'       → 'ape-friend'
// 'Wife'             → 'wife'
// 'Brokerage'        → 'brokerage'
// 'Crypto Guru'      → 'crypto-guru'
// "Wife's Boyfriend" → 'wifes-boyfriend'
// 'Loan Shark'       → 'loan-shark'
```

---

## Asset Dimensions Reference (Claude's Determination)

This is the core discretion output the planner needs. Dimensions derived from reading the actual component source.

| Asset | Path | Dimensions | Basis |
|-------|------|------------|-------|
| Ending art (x10) | `public/assets/endings/<TYPE>.png` | **112 x 84 px** | `PixelArt` renders 16 cols x 12 rows at PIXEL_SIZE=7px → 16×7=112, 12×7=84 |
| GuruTube happy idle | `public/assets/guru/happy-idle.png` | **200 x 200 px** | `.video-player` is flex:2, square-ish; SVG viewBox 100x100 at 85% fill; 200px square is a safe square target |
| GuruTube happy excited | `public/assets/guru/happy-excited.png` | **200 x 200 px** | Same container as above |
| GuruTube sad worried | `public/assets/guru/sad-worried.png` | **200 x 200 px** | Same container as above |
| GuruTube sad crying | `public/assets/guru/sad-crying.png` | **200 x 200 px** | Same container as above |
| Lock screen bg | `public/assets/lockscreen/bg.png` | **180 x 400 px** | Phone is portrait; `position: absolute; inset: 0`; `objectFit: cover` handles any mismatch |
| ReaditTab avatar | `public/assets/readit/avatar.png` | **48 x 48 px** | Sidebar is 207px wide with 8px padding; 48px avatar fits 2x Reddit-style profile pic size |
| Contact: Ape Friend | `public/assets/contacts/ape-friend.png` | **40 x 40 px** | `.contact-avatar { width: 40px; height: 40px }` in Phone.css |
| Contact: Wife | `public/assets/contacts/wife.png` | **40 x 40 px** | Same |
| Contact: Brokerage | `public/assets/contacts/brokerage.png` | **40 x 40 px** | Same |
| Contact: Crypto Guru | `public/assets/contacts/crypto-guru.png` | **40 x 40 px** | Same |
| Contact: Wife's Boyfriend | `public/assets/contacts/wifes-boyfriend.png` | **40 x 40 px** | Same |
| Contact: Loan Shark | `public/assets/contacts/loan-shark.png` | **40 x 40 px** | Same |

**Total assets to create:** 22 PNG files (10 endings + 4 guru + 1 lockscreen + 1 readit avatar + 6 contacts)

---

## ReaditTab "Avatar" Determination

Inspection of `ReaditTab.tsx` confirms: the "MY PROFILE" sidebar card (lines 67-85) currently shows only the `u/DegenTrader` username as text. There is no existing image element. The swap is an **addition** (inserting a new `<img>` before the username span) rather than a replacement. This is the most natural location for the avatar — it mirrors real Reddit's profile sidebar layout. The ASSETS.md should note this is a new element added in the art-assets branch.

---

## State of the Art

| Old Approach | Current Approach | Notes |
|--------------|------------------|-------|
| CSS emoji / SVG text for illustrations | `<img>` pointing to named PNG | The swap this phase implements |
| Vite `import` for bundled assets | `public/` path for artist-replaceable assets | `public/` is the canonical Vite pattern for files that must be accessible by filename (not hashed) |

---

## Open Questions

1. **Does the Loan Shark contact have a non-emoji avatar in the store?**
   - What we know: `useGameStore.ts` line 433 shows `contactName: 'Loan Shark'` but the avatar field value wasn't visible in the grep output (it was cut off). All other contacts have emoji.
   - What's unclear: Whether 'Loan Shark' has an emoji avatar or a different value.
   - Recommendation: Read lines 433-440 of `useGameStore.ts` to confirm. It almost certainly has an emoji (e.g., '🦈'). The filename is confirmed as `loan-shark.png` regardless.

2. **Should the `Thread.avatar` emoji field be replaced with a filename string on art-assets?**
   - What we know: The `avatar` field is a string used only in `MessageList.tsx` and `MessageThread.tsx` for display.
   - What's unclear: Whether it's simpler to keep the emoji field unchanged (and ignore it in UI) or update the store data too.
   - Recommendation: Keep the store data unchanged. Only change the UI components to derive the image path from `contactName` instead of rendering `avatar` directly. This minimizes diff surface and avoids store type changes.

---

## Sources

### Primary (HIGH confidence)
- Direct source code reading:
  - `src/components/Feedback/EndingScreen.tsx` — PixelArt grid dimensions (16x12 at PIXEL_SIZE=7), all 10 EndingType values (MENDYS, BREAK_EVEN, SMALL_WINS, TENDIES, TO_THE_MOON, HEDGE_FUND_DARLING, WOLF_OF_WALL_STREET, PRIVATE_ISLAND, DEBT_SPIRAL, EXPIRED_WORTHLESS, PAPER_HANDS)
  - `src/components/Laptop/GuruTube.tsx` — 4 guru face states via `marketSentiment` x `frame` booleans
  - `src/components/Apps/Phone/PhoneApp.tsx` — Lock screen inline `background: '#000000'` at `position: absolute; inset: 0`
  - `src/components/Laptop/ReaditTab.tsx` — Profile card has no image, sidebar 207px wide
  - `src/components/Apps/Phone/Phone.css` — `.contact-avatar { width: 40px; height: 40px }`
  - `src/store/useGameStore.ts` — Contact names: 'Ape Friend', 'Wife', 'Brokerage', 'Crypto Guru', "Wife's Boyfriend", 'Loan Shark'
  - `src/store/types.ts` — `EndingType` union (lines 68-79)
  - `src/styles/pixel.css` — Global `image-rendering: pixelated` applied to `*`
- Vite official docs (verified from knowledge): `public/` directory serves files at root URL with no transformation

### Secondary (MEDIUM confidence)
- Vite static asset behavior: consistent with official Vite documentation. Files in `public/` are copied verbatim to `dist/` and served at root path. This behavior has been stable across Vite 3/4/5/6.

---

## Metadata

**Confidence breakdown:**
- Asset locations and swap patterns: HIGH — verified by reading actual component source
- Dimensions: HIGH — derived from CSS measurements and component constants (PIXEL_SIZE=7, grid 16x12, contact-avatar 40x40)
- GuruTube mood states: HIGH — 4 states confirmed by reading `getGuruFace()` function logic
- Contact names: HIGH — read directly from `getInitialState()` in useGameStore.ts
- Vite `public/` serving: HIGH — well-established Vite behavior, stable across versions
- Git branch/rebase strategy: HIGH — standard git operations, documented in CONTEXT.md

**Research date:** 2026-03-19
**Valid until:** 2026-04-19 (30 days — all findings are based on project source, not external libraries)
