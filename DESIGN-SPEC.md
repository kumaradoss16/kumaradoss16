# Design Specification — GitHub Profile README

**Profile:** @kumaradoss16
**Concept:** Midnight Editorial × Modern Bento Grid
**Deliverable:** `README.md` + `assets/hero.svg` + `assets/divider.svg`

---

## 1. Design direction

A premium engineering portfolio rather than a badge wall. The README pairs a dark editorial banner and restrained typography with modular information blocks: a numbered section structure, compact focus cards, a spec-sheet stack, and a two-column project grid.

The design communicates backend credibility, systems maturity, and product-building range. Applied AI is presented as a supporting engineering interest, not as research or ML specialization.

## 2. Color system

| Token | Hex | Use in the README |
|---|---|---|
| Midnight | `#0B0F14` | Hero ground, analytics image background |
| Deep Surface | `#111821` | Hero index panel |
| Elevated Surface | `#17212D` | Hero grid lines, badge chips |
| Border | `#263342` | Hairlines, hero panel border, divider |
| Primary Text | `#F1F5F9` | Name, card titles, primary copy |
| Secondary Text | `#B8C3D1` | Descriptions |
| Muted Text | `#8291A3` | Metadata, eyebrow labels |
| Signal Orange | `#F37726` | Identity accent, rules, hero index marker |
| Soft Orange | `#FFAA70` | Reserved for secondary emphasis |
| Technical Teal | `#35C6B0` | Reserved for a single technical status accent |
| Editorial Blue | `#7CA8D8` | Reserved |

Orange is the only recognizable accent. Teal and blue are not used in the current build, so the palette stays disciplined. Technology icons keep their own brand colors, which is intentional and limited to the stack section.

### Contrast (WCAG)

| Pair | Ratio |
|---|---|
| `#F1F5F9` on `#0B0F14` | 17.54:1 |
| `#B8C3D1` on `#0B0F14` | 10.77:1 |
| `#8291A3` on `#0B0F14` | 5.97:1 |
| `#F37726` on `#0B0F14` | 6.84:1 |
| `#8291A3` on `#111821` | 5.55:1 |

All passes meet WCAG AA for normal text.

## 3. Typography

| Layer | Direction |
|---|---|
| Name | Inter / Segoe UI / system sans, 66px bold (SVG) |
| Eyebrow labels | JetBrains Mono / Consolas / monospace, 11–16px, tracked |
| Positioning line | Inter 20px, `#B8C3D1` |
| Section headings | GitHub-rendered H2, `01 / About` numbering |
| Card titles | Bold body text or H3 for featured projects |
| Metadata | `<sub>` labels and `<code>` chips |
| Descriptions | GitHub body text, compact sentences |

No custom font is loaded by the README. The SVG uses a system font stack; GitHub body text uses GitHub's own typography. This avoids renderer-specific font dependencies.

## 4. Layout map

| Section | Treatment | Narrow-screen behavior |
|---|---|---|
| Hero | 1000×340 SVG, full width | Scales as a banner; name remains legible |
| 01 About | Single column + compact facts block | Fits without horizontal scroll |
| 02 Engineering Focus | 2×2 pipe table (bento cards) | Table scrolls horizontally, GitHub behavior |
| 03 Technical Stack | Six grouped icon rows | Icons wrap within the row |
| 04 Selected Projects | Two featured entries + two 2×2 grids | Featured entries stack; grids scroll horizontally |
| 05 Digital Platforms | Three-column link cards | Table scrolls horizontally, GitHub behavior |
| 06 GitHub Analytics | Two full-width dynamic cards | Fits without scroll |
| 07 Closing | Blockquote + identity line + links | Fits without scroll |

Sections are separated by the same 16px divider asset (orange-tipped hairline). The divider is reused, not recreated per section.

## 5. Visual hierarchy

1. Hero name and role.
2. Section number and title.
3. Card or project title.
4. One-sentence value proposition.
5. Technology chips.
6. Repository or platform link.
7. Metadata in `<sub>` and mono labels.

The eye should resolve identity, focus, stack, and work within the first two screens.

## 6. Asset strategy

**Custom assets (2):**

- `assets/hero.svg` — identity banner. Editorial left column, mono index panel on the right, grid motif, orange edge bar.
- `assets/divider.svg` — reusable section rule with an 88px orange segment.

**Third-party images:**

- `skillicons.dev` for language and framework icons, grouped by category and limited to six per row.
- `shields.io` flat-square badges in the Midnight surface color for technologies without a suitable icon (Pydantic, REST APIs, SQL, WebView2, WPF, n8n).
- `github-profile-summary-cards` for live contribution and language data.

**Deliberately excluded:** star/fork/user counters, trophies, typing headers, snake animations, fake terminal output, proficiency bars, and large badge walls.

## 7. GitHub compatibility decisions

- No CSS Grid, Flexbox, JavaScript, `<style>`, iframes, or external stylesheets.
- Markdown plus GitHub-supported HTML only: `<p>`, `<a>`, `<img>`, `<table>`, `<sub>`, `<code>`, `<br/>`.
- GitHub strips background-color styling, so "bento" surfaces are expressed through table structure, borders, numbered labels, and the SVG banner rather than CSS cards.
- GitHub does not reflow multi-column tables. To avoid page-level overflow on phones, About, Stack, and Analytics are single-column; the designed grids (Focus and Projects) and the platform cards remain tabular and scroll horizontally on very narrow screens.
- Relative asset paths assume `README.md` and `assets/` sit at the repository root.
- The hero is a fixed dark banner in both GitHub themes. This is intentional brand artwork, not a theme-aware image.

## 8. Accessibility

- Every content image has descriptive alt text; dividers use empty alt text.
- The hero SVG includes `<title>` and `<desc>`.
- All text/background pairs in the artwork meet AA contrast.
- Links use descriptive labels (`View repository`, project names, platform names).
- Color is never the only carrier of meaning.

## 9. Maintenance

1. Update hero copy by editing text nodes in `assets/hero.svg`; keep the 1000×340 canvas and left/right split.
2. If a stats service fails, replace or remove its `<img>`; the README does not depend on any stats image for its structure.
3. Keep project descriptions aligned with each repository's README. Do not add production, scale, or adoption claims.
4. Reuse `assets/divider.svg` between sections rather than adding new artwork.
5. Keep the section numbering sequential if a section is added or removed.
