# Revolution Trading Pros — Website Color & Visual Style Guide

**Version:** 1.0  
**Reference date:** October 29, 2026  
**Source of truth:** `revolution-trading-pros-homepage-preview.html` (the existing responsive HTML concept)  
**Scope:** The colors **actually used** in that HTML preview, plus implementation guidance for the eventual Svelte 5 / SvelteKit 3 website. This is a design specification, **not** a claim that the palette has been user-tested or that it improves search rankings.

---

## 1. Visual direction

**Identity:** Institutional finance × modern trading terminal × editorial confidence.

- **Primary look:** Deep near-black surfaces, disciplined graphite layers, and clean off-white text.
- **Signature color:** Electric lime (`#DCFF65`) — reserved for intentional emphasis and high-priority actions.
- **Contrast sections:** Warm ivory (`#F3F2ED`) adds visual relief, improving readability on longer pages.
- **Secondary accent:** Coral (`#FF7969`) is used sparingly, particularly to differentiate cautionary/critical information.
- **Personality:** Premium, authoritative, technical, sharp, and restrained. Avoid playful gradients, rainbow accent systems, neon saturation everywhere, or “gaming/Discord” styling.

**Core palette at a glance:** `#0B0E12` · `#11151A` · `#151A20` · `#DCFF65` · `#F3F2ED` · `#F4F5F0` · `#A0A7AD` · `#FF7969`

## 2. Canonical CSS color tokens — copied from the actual HTML

These are **exact** existing CSS custom property names and values. `--bg-soft` and `--ink` intentionally share the same HEX value.

| CSS token      | HEX       | Friendly name     | Actual/intended use                                 |
| -------------- | --------- | ----------------- | --------------------------------------------------- |
| `--bg`         | `#0B0E12` | Midnight Black    | Base background, hero, dark-page foundation         |
| `--bg-soft`    | `#11151A` | Soft Midnight     | Secondary dark areas, including the trust strip     |
| `--panel`      | `#151A20` | Graphite          | Dark cards, panels and raised surfaces              |
| `--panel2`     | `#1B2027` | Elevated Graphite | Additional depth level for dark surfaces            |
| `--line`       | `#2B313A` | Steel Border      | Standard dark-mode dividers and outlines            |
| `--off`        | `#F3F2ED` | Warm Ivory        | Light-section backgrounds                           |
| `--off2`       | `#EAE9E2` | Soft Ivory        | Alternate warm-light surface token                  |
| `--ink`        | `#11151A` | Deep Ink          | Headings, copy, buttons on ivory/lime backgrounds   |
| `--acid`       | `#DCFF65` | Electric Lime     | Brand accent, primary CTA, focus, active indicators |
| `--acid2`      | `#B9E64F` | Lime Secondary    | Secondary lime shade; keep subordinate to `--acid`  |
| `--coral`      | `#FF7969` | Signal Coral      | Select emphasis and caution-oriented labels         |
| `--text`       | `#F4F5F0` | Soft White        | Main text on dark backgrounds                       |
| `--muted`      | `#A0A7AD` | Cool Gray         | Secondary body text on dark backgrounds             |
| `--lightmuted` | `#58616B` | Slate Gray        | Secondary copy on light backgrounds                 |

### Ready-to-use CSS

```css
:root {
	--bg: #0b0e12;
	--bg-soft: #11151a;
	--panel: #151a20;
	--panel2: #1b2027;
	--line: #2b313a;

	--off: #f3f2ed;
	--off2: #eae9e2;
	--ink: #11151a;

	--acid: #dcff65;
	--acid2: #b9e64f;
	--coral: #ff7969;

	--text: #f4f5f0;
	--muted: #a0a7ad;
	--lightmuted: #58616b;
}
```

## 3. Additional colors actually present in the preview

The source contains more than a hundred one-off HEX values for illustrations, controls, hover details, chart decorations, and borders. The following are the **notable non-token colors** needed to reproduce the visible layout. They should **not** all be promoted to separate brand colors.

| HEX                   | Actual use in HTML                                                               |
| --------------------- | -------------------------------------------------------------------------------- |
| `#EFFFAE`             | Hover background on lime primary buttons                                         |
| `#CFFE57`             | Final full-width conversion banner background (brighter lime than primary token) |
| `#FAFFEC`             | Featured membership card background                                              |
| `#B3E354`             | Top accent strip on featured membership card                                     |
| `#DDF3B1`             | Featured membership badge/tag background                                         |
| `#E2E1DA`             | “Typical guru”/negative-comparison card background                               |
| `#D5D4CC`             | Border on negative-comparison card                                               |
| `#FFFFFF`             | White membership/blog card backgrounds                                           |
| `#D7D9D4`             | Membership card border on light sections                                         |
| `#12171C`             | Case-study section and some dark card bottoms                                    |
| `#191F25`             | Case-study cards                                                                 |
| `#0D1115`             | Audience/persona section                                                         |
| `#181D23` → `#12171C` | Persona card vertical gradient                                                   |
| `#12171D`             | Indicators/courses section                                                       |
| `#1A2026`             | Indicator/course card background                                                 |
| `#0F151A`             | Technical illustration area inside tool cards                                    |
| `#0B0F12`             | Mentorship section background                                                    |
| `#151A1E`             | Mentorship frame background                                                      |
| `#10151A`             | FAQ section background                                                           |
| `#10171A`             | Ebook signup form background                                                     |
| `#0A0D10`             | Footer background                                                                |
| `#9C544B`             | Negative-comparison label text                                                   |
| `#DEC3A1`             | “Evidence pending” proof/case-study status text                                  |
| `#77664A`             | Matching proof-status border                                                     |

## 4. Component color rules

### Dark sections

- **Base surface:** `var(--bg)` or the section-specific dark shade.
- **Main headlines:** `var(--text)`.
- **Secondary paragraphs:** `var(--muted)` (or section-specific cool grays).
- **Section eyebrows, line icons, section index, link emphasis:** `var(--acid)`.
- **Panel/card borders:** `var(--line)` or context-specific graphite borders.
- **Primary button:** lime background `var(--acid)` + near-black text `var(--ink)`.
- **Secondary button:** transparent background + soft-white text + subdued border; switch border/text toward lime on hover.

### Light sections

- **Section canvas:** `var(--off)`.
- **Headline and primary copy:** `var(--ink)`.
- **Secondary paragraphs:** `var(--lightmuted)`.
- **Standard membership cards:** `#FFFFFF` with `#D7D9D4` border.
- **Featured membership card:** `#FAFFEC` with `#879E46` border, `#B3E354` top accent, and `#DDF3B1` badge.
- **Light-section CTAs:** dark `var(--ink)` background and light text, unless a particular button is designated as lime-primary.

### Buttons and interaction

| State                | Background        | Text/border                                     |
| -------------------- | ----------------- | ----------------------------------------------- |
| Primary default      | `#DCFF65`         | `#11151A` text                                  |
| Primary hover        | `#EFFFAE`         | `#11151A` text                                  |
| Dark button          | `#11151A`         | White text                                      |
| Dark button hover    | `#30373E`         | White text                                      |
| Dark-outline button  | Transparent       | `#F4F5F0` text; subdued `#5A6067` border        |
| Outline hover        | Transparent       | Lime border + lime text                         |
| Light-outline button | Transparent       | `#11151A` text; `#8B9088` border                |
| Keyboard focus       | Context-dependent | **3px** solid `#DCFF65` outline; **4px** offset |
| Text selection       | `#DCFF65`         | `#11151A` text                                  |

Use lime for **the most important CTA**, not for every control. Maintain visible keyboard focus indicators.

## 5. Section-by-section website map

| Homepage area           | Main background      | Accent / treatment                                                    |
| ----------------------- | -------------------- | --------------------------------------------------------------------- |
| Announcement bar        | `#DCFF65`            | Near-black text                                                       |
| Sticky navigation       | `rgba(11,14,18,.96)` | Lime slogan and hovers; thin `#252A30` border                         |
| Hero                    | `#0B0E12`            | Lime highlighted H1 words, subtle chart grid and restrained lime glow |
| Historical case studies | `#12171C`            | `#191F25` proof cards with amber-toned evidence status                |
| Anti-guru manifesto     | `#F3F2ED`            | Muted warm-grey negative card vs near-black positive card             |
| Trader personas         | `#0D1115`            | Graphite gradient cards, lime labels                                  |
| Memberships             | `#F3F2ED`            | White cards; featured lime-tinted card                                |
| Indicators and courses  | `#12171D`            | Graphite cards and technical lime grid illustration                   |
| Private mentorship      | `#0B0F12`            | Thin muted-green frame, lime corner details                           |
| Free ebook              | `#DCFF65`            | Full-section lime with near-black text and a dark signup form         |
| Latest blog posts       | `#F3F2ED`            | White article cards with dark illustration covers                     |
| FAQs                    | `#10151A`            | Light text and lime accordion symbols                                 |
| Closing CTA banner      | `#CFFE57`            | Near-black text and dark CTA buttons                                  |
| Footer                  | `#0A0D10`            | Cool-gray legal text; lime brand details                              |

## 6. Gradients, opacity and graphical treatments

These treatments appear in the source and make the design feel more like a market terminal than a generic SaaS template.

**Hero ambient glow:**

```css
background: radial-gradient(ellipse at 83% 15%, rgba(195, 231, 83, 0.1), transparent 28%), #0b0e12;
```

**Hero grid:** 66px × 66px line grid using `rgba(255,255,255,.022)`; fades out vertically.

**Proof dossier card:** `linear-gradient(155deg, #1D242A, #12171B 68%)`, with 1px `#394149` border and subdued lime corner lines (`rgba(220,255,101,.5)`).

**Persona card:** `linear-gradient(#181D23, #12171C)`.

**Mentorship frame:** `linear-gradient(120deg, rgba(195,232,112,.07), transparent 55%), #151A1E`.

**Tool/charts illustration grid:** 32px × 32px grid using `rgba(220,255,101,.07)`.

**Sticky navigation transparency:** `rgba(11,14,18,.96)` with `backdrop-filter: blur(18px)`.

Keep all ambient effects understated: they should provide hierarchy and depth, **not compete with charts, evidence, or calls to action**.

## 7. Typography used alongside the colors

These font families are linked by the existing HTML preview:

| Purpose                         | Typeface          | Weights present in font request |
| ------------------------------- | ----------------- | ------------------------------- |
| Body copy and controls          | **DM Sans**       | 400, 500, 600, 700, 800         |
| Major headings                  | **Space Grotesk** | 400, 500, 600, 700              |
| Eyebrows, numeric/status labels | **Space Mono**    | 400, 700                        |

Fonts are not part of the color palette, but they are essential to preserving the finished design. Use a restrained number of weights and avoid decorative typefaces.

## 8. Readability/accessibility check

The following WCAG contrast ratios were calculated from the stated HEX combinations. They evaluate color contrast **only**, not the accessibility of the complete website.

| Foreground on background |    Contrast | Interpretation for normal text    |
| ------------------------ | ----------: | --------------------------------- |
| `#F4F5F0` on `#0B0E12`   | **17.65:1** | Passes AAA                        |
| `#A0A7AD` on `#0B0E12`   |  **7.94:1** | Passes AAA                        |
| `#DCFF65` on `#0B0E12`   | **17.07:1** | Passes AAA                        |
| `#11151A` on `#DCFF65`   | **16.17:1** | Passes AAA                        |
| `#11151A` on `#F3F2ED`   | **16.35:1** | Passes AAA                        |
| `#58616B` on `#F3F2ED`   |  **5.61:1** | Passes AA (not AAA)               |
| `#FF7969` on `#0B0E12`   |  **7.54:1** | Passes AAA                        |
| `#9C544B` on `#E2E1DA`   |  **4.23:1** | **Below AA for normal-size text** |

**Design QA action:** The negative-comparison label uses `#9C544B` over `#E2E1DA`, slightly below the 4.5:1 WCAG AA threshold for ordinary small text. Darken that label color or make it large enough to meet the large-text requirements. Also test each hover/focus/disabled state against its actual background; the calculations above do not certify every one-off combination.

## 9. Svelte 5 / SvelteKit 3 implementation guidance

1. Put the primary token set in one global stylesheet (for example `src/app.css`) and import that stylesheet through your root layout.
2. Use semantic tokens (`--bg`, `--text`, `--acid`) in component rules rather than scattering HEX codes.
3. Promote repeated one-off values into additional tokens **only after** auditing their actual purpose; avoid creating 100+ unrelated global variables.
4. Preserve the hierarchy: **lime = high-priority action or signal**, graphite = surface, ivory = editorial reading space, coral = restrained emphasis.
5. Keep SVG icons monochromatic and consistent in weight, defaulting to the text or accent token.
6. Maintain at least WCAG AA color contrast for normal text (4.5:1) and relevant UI boundaries (3:1), checking actual rendered states.
7. Respect reduced-motion preferences; lighting and animations are not substitutes for clear navigation and accurate content.
8. Keep claims about results or financial performance tied to authentic evidence; color and styling must not imply independently verified proof where none has been supplied.

### Example reusable component styling

```css
:root {
	color-scheme: dark;
}

body {
	background: var(--bg);
	color: var(--text);
}

.card-dark {
	background: var(--panel);
	color: var(--text);
	border: 1px solid var(--line);
}

.section-light {
	background: var(--off);
	color: var(--ink);
}

.section-light .supporting-copy {
	color: var(--lightmuted);
}

.button-primary {
	background: var(--acid);
	color: var(--ink);
}

.button-primary:hover {
	background: #efffae;
}

:focus-visible {
	outline: 3px solid var(--acid);
	outline-offset: 4px;
}
```

**Final brand rule:** Lead with **Midnight Black + Electric Lime**, build depth through **Graphite**, and introduce **Warm Ivory** as a deliberate editorial contrast. Use **Coral** only when it serves a clear communication purpose.
