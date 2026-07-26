# Auros — Style Reference
> Abyssal terminal with bioluminescent data orbs

**Theme:** dark

Auros operates as an abyssal fintech terminal: near-black teal canvas with bioluminescent data orbs and teal-to-pink light gradients that suggest depth, liquidity, and flow. The interface is sparse and cinematic, relying on a single custom display face (Matter) at medium weight with aggressive negative tracking to create scale without shouting. Color is rationed — achromatic whites and silvers carry almost all content, while the chromatic palette is reserved for atmospheric gradients, card surface differentiation, and one signature pill button that morphs from teal-cyan to lavender-pink. Cards float on subtle teal-tinted surface lifts (16px radius, no shadows) rather than using elevation, so the hierarchy reads as depth-of-water rather than shadow-on-paper. Components feel engineered and instrument-like: uppercase tracked labels, thin geometric arrow icons, large numerical stats in pale pink.

## Tokens — Colors

| Name | Value | Token | Role |
|------|-------|-------|------|
| Liquid Abyss | `#012624` | `--color-liquid-abyss` | Primary canvas — page background, header, hero, and the dominant dark-teal field. Establishes the deep-water atmosphere |
| Liquid Deep | `#011d1c` | `--color-liquid-deep` | Recessed surface level — footer background and deeper card panels. Reads as a half-step darker than the canvas, creating a subtle depth gradient downward |
| Liquid Kelp | `#003734` | `--color-liquid-kelp` | Raised card surface and primary button fill — the lifted surface that sits one step above the abyss. Used for feature cards, content panels, and the gradient button's origin point |
| Liquid Mist | `#edfffe` | `--color-liquid-mist` | Cool-tinted off-white for emphasized body text, section labels, and warm-light typographic moments. Carries a barely-perceptible cyan whisper that ties body text to the teal atmosphere |
| Platinum | `#ffffff` | `--color-platinum` | Pure white for headings, nav items, icon strokes, and high-contrast text. The dominant text color across all heading levels and the primary nav |
| Silver Mist | `#bbc7c6` | `--color-silver-mist` | Secondary body text, muted descriptions, and link color in resting state. Carries a faint green undertone that harmonizes with the teal canvas |
| Ash | `#f2f2f2` | `--color-ash` | Tertiary text for pull-quotes and testimonial copy. A neutral cool-gray fallback when Silver Mist's teal undertone is too colored |
| Slate Deep | `#707777` | `--color-slate-deep` | Subtle surface tint for inactive or low-emphasis backgrounds. Sits between canvas and card for very low-elevation differentiation |
| Lavender Phosphor | `#fde9ff` | `--color-lavender-phosphor` | Highlight color for large statistics, counter numbers, and emphasis figures. The pink end of the signature gradient — used sparingly as luminous punctuation on dark surfaces |
| Bioluminescent Gradient | `linear-gradient(90deg, rgb(0, 130, 124) 0%, rgb(203, 255, 252) 100%)` | `--color-bioluminescent-gradient` | Signature button and UI gradient — linear sweep from teal-cyan through pale aqua into lavender-pink. The brand's signature chromatic gesture |
| Aurora Gradient | `linear-gradient(90deg, rgb(203, 255, 252) 0%, rgb(237, 255, 254) 26.25%, rgb(255, 253, 250) 47.57%, rgb(250, 209, 255) 88.96%)` | `--color-aurora-gradient` | Supporting palette color for small decorative accents when the core palette needs contrast. |

## Tokens — Typography

### Matter — Primary display and body face — used at weight 500 for all headings (H1–H3) and oversized kinetic text (86–295px). Weight 400 for body and UI copy. Characterized by aggressive negative tracking on large sizes (-0.04em at 61px, -0.046em at 86px) and wide positive tracking on uppercase labels (0.08em at 20px, 0.12em at 12px, 0.15em at 10px). The medium-weight-only heading strategy is distinctive — no bold, no light — giving the type a uniform mechanical confidence. · `--font-matter`
- **Substitute:** Inter, DM Sans, or Satoshi for close geometric-grotesk match
- **Weights:** 400, 500
- **Sizes:** 10, 12, 13, 14, 16, 20, 24, 36, 61, 86, 96, 295px
- **Line height:** 1.0, 1.3, 1.4, 1.5
- **Letter spacing:** -0.046em at 86px, -0.04em at 61px, -0.02em at 24px, 0.08em uppercase at 20px, 0.12em uppercase at 12px, 0.15em uppercase at 10px

### Arial — Secondary fallback for interactive UI elements (nav, buttons, hero micro-copy, footer). Only appears at 14px.
- **Substitute:** system-ui, -apple-system, sans-serif

### Type Scale

| Role | Size | Line Height | Letter Spacing | Token |
|------|------|-------------|----------------|-------|
| caption | 10px | 1.4 | 1.5px | `--text-caption` |
| body | 16px | 1.4 | — | `--text-body` |
| subheading | 24px | 1.3 | -0.48px | `--text-subheading` |
| heading | 36px | 1 | — | `--text-heading` |
| heading-lg | 61px | 1 | -2.44px | `--text-heading-lg` |
| display | 96px | 1 | -3.84px | `--text-display` |

## Tokens — Spacing & Shapes

**Base unit:** 4px · **Density:** spacious

### Border Radius
| Element | Value |
|---------|-------|
| cards | 16px |
| small | 6px |
| buttons | 6px |

### Layout
- **Page max-width:** 1440px
- **Section gap:** 68px
- **Card padding:** 36-48px
- **Element gap:** 20px

## Components

- **Gradient Pill Button** — Primary CTA. Filled button with gradient background, 6px radius, 32px vertical / 22px horizontal padding, uppercase 14px text.
- **Ghost Navigation Link** — transparent, uppercase 12px, white active / silver inactive.
- **Surface Card** — `#003734`-equivalent background, 16px radius, 36px padding, no shadow. Feature blocks/content panels.
- **Recessed Card** — deepest surface, 16px radius, 120px vertical padding. Footer-adjacent/CTA panels.
- **Feature Row Card** — transparent, 16px radius, heading + body + 32x32 arrow icon button, used for service/feature listing rows.
- **Arrow Icon Button** — 32×32, 6px radius, semi-transparent dark fill, diagonal arrow icon, "go to" trigger beside card titles.
- **Uppercase Section Label** — eyebrow/kicker, 12-20px, uppercase, wide tracking.
- **Hero Headline** — 61-96px, weight 500, line-height 1.0, tight tracking.
- **Oversized Kinetic Text** — 86-295px section-spanning display text.
- **Statistic Counter** — large glowing number (accent color) + small uppercase label below.
- **Navigation Bar** — full-width, transparent, ~80px height, logo left / nav center / CTA right.
- **Geometric Molecule Illustration** — decorative flat circle/connector diagram, optional, skip if not on-brand.
- **Particle Sphere Visual** — hero background animation, optional, skip if not on-brand / too heavy for mobile web.

## Do's and Don'ts (structural, adapt colors to our brand)

### Do
- Use a single, small surface-color stack (2-3 tonal steps) for background differentiation instead of drop shadows.
- Reserve the strongest accent/gradient exclusively for primary CTAs, not backgrounds or decoration.
- Keep one heading weight only (no bold/light mixing at display sizes) for a clean, confident look.
- Apply uppercase tracked labels to section eyebrows.
- Keep card radii consistent (pick one value, e.g. 16-20px) and a smaller radius for buttons/small elements.
- Use line-height 1.0 for large display text, 1.4-1.5 for body text.

### Don't
- Do not use drop shadows for elevation — use surface-color steps instead.
- Do not mix more than one heading weight at display sizes.
- Do not apply the signature accent gradient to large background areas — CTA-only.
- Do not invent fake stats/testimonials — placeholder and label clearly until real data exists.

## Layout

Full-bleed canvas with a max content width (~1440px or less for a smaller product site). Hero: centered text stack (eyebrow → headline → subtext → CTA), full or near-full viewport height. Sections separated by generous vertical gaps (60-70px+), alternating base/recessed surface tones. Feature/service section can use an asymmetric two-column layout (cards left, illustration/visual right) or a simple 3-4 card row — pick whichever fits our shorter feature list better. Footer as a recessed, deep-padding CTA well.

## Agent Prompt Guide (adapt hex values to our brand palette before using)

**Component prompt patterns to follow (structure only — replace all colors below with our brand tokens):**
1. Primary Action Button: brand-accent background, contrasting text, small radius (6-12px), compact pill padding.
2. Feature card: brand-surface background, consistent radius, generous padding; heading + body + optional arrow-icon "go to" trigger top-right.
3. Statistics block: 2-4 columns, large number in accent color, label below in uppercase tracked small text.

## Similar Brands (for tone reference only, not to copy)
Wintermute, Jump Crypto, Galaxy Digital, Flowdesk — all dark-canvas, minimal-decoration, type-driven institutional sites. Useful only as "restrained, confident, data-forward" tone reference, not as visual source (crypto-finance tone doesn't map directly to a personal AI assistant product — soften accordingly).
