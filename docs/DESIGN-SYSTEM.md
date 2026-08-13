# Design System - Hacker House Goa Builder Network

This document defines the branding guidelines, visual styling tokens, typography, layouts, and animations based on the three official Hacker House Goa 2026 visual reference images.

## 1. Design Tokens (CSS Variables)

We define our design token variables in `src/styles/tokens.css` to enable consistent, branded theme execution:

```css
:root {
  /* Color Palette */
  --hh-green: #005C38;       /* Deep dark tropical green ocean/sky */
  --hh-green-dark: #003D24;  /* Shadow/background green */
  --hh-green-light: #02804F; /* High-contrast outline green */
  --hh-yellow: #FFD400;      /* Sunset yellow / signboard blocks */
  --hh-pink: #FF0A78;        /* Neon magenta / accent brush */
  --hh-white: #FFFFFF;
  --hh-ink: #111111;         /* Comic-like solid outline and shadow ink */

  /* Spacing */
  --hh-space-xs: 0.25rem;
  --hh-space-sm: 0.5rem;
  --hh-space-md: 1rem;
  --hh-space-lg: 1.5rem;
  --hh-space-xl: 2rem;

  /* Outlines and Borders (Retro Print Style) */
  --hh-border-width: 3px;
  --hh-box-shadow: 4px 4px 0px 0px var(--hh-ink);
  --hh-box-shadow-hover: 2px 2px 0px 0px var(--hh-ink);
}
```

---

## 2. Typography Rules

Based on **Reference Image 3**, we implement a strong typographic contrast between headings and functional UI components.

1. **Major Headings (Festival Poster Style)**:
   - Font Family: `Playfair Display` (Google Fonts serif).
   - Character: Tall, elegant, editorial, display serif, uppercase.
   - Example Class: `font-serif text-5xl uppercase tracking-tight text-hh-yellow`
2. **Body & Form UI (Clean readability)**:
   - Font Family: `Outfit` or `Inter` (Google Fonts sans-serif).
   - Character: Flat, modern, low-weight, wide aperture.
3. **Metadata / Accents (Hacker Terminal Style)**:
   - Font Family: `JetBrains Mono` or default monospace.
   - Character: All-caps, spacing, technical details.

---

## 3. UI Element Layout Rules

- **Brutalism & Signboard Motifs**: 
  Buttons and containers should feel like the wooden directional signboards in the illustration (bright yellow or pink blocks with thick black outlines and offset drop shadows).
  ```html
  <button class="bg-hh-yellow text-hh-ink font-bold border-3 border-hh-ink shadow-[4px_4px_0px_0px_rgba(17,17,17,1)] active:translate-y-1 active:translate-x-1 active:shadow-none transition-all duration-100">
    CREATE YOUR BUILDER ID
  </button>
  ```
- **Irregular Borders & Paper Textures**: 
  Section dividers are stylized waves or zigzags (SVG paths) instead of flat lines.

---

## 4. Animation Guidelines (Framer Motion)

- **Landing Hero**:
  - Gentle, infinite vertical floating for sun (`sun.png`) and boats (`boat.png`).
  - Swaying rotation anchor for palm branches (`palm.png`).
- **Generation & Connection Celebrations**:
  - A slide-in assemble effect for the profile photo into the Builder ID card frame.
  - Satisfying scale-up stamp effect for connection success cards.
- **Respect Motion Preferences**:
  - All motion variants should wrap within `@media (prefers-reduced-motion: no-preference)` to respect accessibility.
