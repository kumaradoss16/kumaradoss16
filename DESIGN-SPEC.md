# Design Specification — GitHub Profile README

**Profile:** @kumaradoss16
**Concept:** Midnight Minimal Bento × Modern Engineering Portfolio
**Deliverable:** `README.md` + `assets/hero.svg` + `assets/divider.svg` + `assets/icons/*.svg`

---

## 1. Design direction

A premium engineering portfolio rather than a badge wall. The README pairs a fixed dark editorial banner and a restrained typographic system with modular, scannable blocks: numbered sections, four focus cards, a grouped technology sheet, and table-based project and platform showcases.

The document communicates three things in the first two screens: Python backend engineering, a system and network background, and applied AI as an engineering practice. Statistics, counters, trophies, streak cards, and contribution graphs are deliberately absent.

## 2. Color system

| Token | Hex | Use |
|---|---|---|
| Background | `#0B0F14` | Hero ground, typing-animation ground |
| Surface | `#151B23` | Hero gradient start |
| Elevated Surface | `#1B2531` | Hero index panel |
| Border | `#293342` | Hairlines, panel border, divider, icon strokes |
| Primary Text | `#F1F5F9` | Name, titles, primary copy |
| Secondary Text | `#A7B2C0` | Hero tagline, supporting copy |
| Muted Text | `#778496` | Eyebrows, metadata, index numbers |
| Orange Accent | `#F37726` | Primary identity accent, role line, icons |
| Teal Accent | `#35C6B0` | Single role dot in the hero |

Orange carries the identity. Teal appears once. Technology icons keep their vendor colors by design; they are the only multicolor element.

### Contrast (WCAG)

| Pair | Ratio |
|---|---|
| `#F1F5F9` on `#0B0F14` | 17.54:1 |
| `#A7B2C0` on `#0B0F14` | 8.94:1 |
| `#778496` on `#0B0F14` | 5.06:1 |
| `#F37726` on `#0B0F14` | 6.84:1 |
| `#A7B2C0` on `#1B2531` | 7.21:1 |

All pairs pass WCAG AA for normal text.

## 3. Section structure

| # | Section | Purpose | Narrow-screen behavior |
|---|---|---|---|
| — | Hero | Name, both titles, tagline, focus index | Scales as a banner; name and tagline remain legible |
| — | Typing header | Five rotating professional identities | Centered 440×44 asset scales to container width |
| — | Link strip | GitHub, LinkedIn, Email, DevSpireHub | Wraps naturally |
| 01 | About | Five short positioning statements + factual metadata | Single column, no overflow |
| 02 | Engineering Focus | Four bento cards in a 2×2 table | Table scrolls horizontally, GitHub behavior |
| 03 | Technical Stack | Six required categories | Stacked rows; icons and chips wrap |
| 04 | Selected Projects | Six repositories in a two-column table | Table scrolls horizontally; text remains intact |
| 05 | Digital Platforms | Three clearly separated platform rows with icons | Table scrolls horizontally; rows stay distinct |
| 06 | Education | Four compact credentials | Single column |
| 07 | Connect | Five icon-labelled links | Single wrapping paragraph |

Sections are separated by one reusable divider asset, not per-section artwork.

## 4. Visual hierarchy

1. Hero name and primary title.
2. Rotating role line.
3. Section number and title.
4. Project or platform name.
5. One-sentence description.
6. Technology labels.
7. Direct link.
8. Metadata in `<sub>` and mono labels.

## 5. Assets

**Custom assets (8):**

- `assets/hero.svg` — 1000×340 identity banner: orange edge bar, grid motif, left editorial column, right focus index.
- `assets/divider.svg` — 1000×16 rule with an 88px orange segment.
- `assets/icons/github.svg`, `linkedin.svg`, `devspirehub.svg`, `nexus.svg`, `portfolio.svg` — 24×24 monoline icons, 18px in platform rows and 16px in Connect.

**Third-party images:**

- `readme-typing-svg.demolab.com` — animated role line, orange on the background color, 440×44.
- `skillicons.dev` — six grouped technology rows at a consistent 40px height.

No shields.io badges, statistics services, counters, or trophies are used. Pydantic, REST APIs, SQL, VMware, MCP, WPF, and n8n have no suitable skillicon, so they appear as native `<code>` chips instead of added badge dependencies.

## 6. Typing header

```
https://readme-typing-svg.demolab.com?font=JetBrains+Mono&weight=500&size=18
&duration=4000&pause=1200&color=F37726&background=0B0F14&center=true&vCenter=true
&width=440&height=44&lines=Python+Developer;Backend+Developer;System+%26+Network+Engineer;
Applied+AI+Engineering;Software+%26+Automation+Builder
```

- One slow, readable line at a time; the full five-line loop is 26 seconds.
- Dark ground so orange stays legible in both GitHub themes.
- `%26` encodes the ampersand in `System & Network Engineer` and `Software & Automation Builder`.
- Alt text lists all five roles for assistive technology and image-failure fallback.

## 7. GitHub compatibility

- Markdown plus GitHub-supported HTML only: `<p>`, `<a>`, `<img>`, `<table>`, `<tr>`, `<td>`, `<sub>`, `<code>`, `<strong>`, `<br/>`.
- No CSS Grid, Flexbox, JavaScript, `<style>`, iframes, or external stylesheets.
- GitHub strips arbitrary styles, so card structure is expressed through table borders, numbered labels, and the SVG banner.
- Multi-column tables scroll horizontally on narrow screens; every section above and below them fits without page-level overflow.
- Relative asset paths assume `README.md` and `assets/` are at the repository root.
- The hero is a fixed dark asset in both themes. The typing header matches its ground so the two read as one band.

## 8. Accessibility

- Every content image has descriptive alt text; dividers and decorative platform icons use empty alt text beside a text label.
- The hero SVG includes `<title>` and `<desc>`.
- All artwork text meets AA contrast.
- Links use descriptive labels (`View repository`, platform names).
- Color never carries meaning alone; every accent is paired with text.

## 9. Maintenance

1. Edit hero copy by changing the text nodes in `assets/hero.svg`; keep the 1000×340 canvas.
2. Change project copy only when the repository README supports it. No production, scale, or adoption claims.
3. Keep the six stack categories aligned with the brief; add a technology only when it reflects real project exposure.
4. Reuse `assets/divider.svg`; add a section only if it earns its place.
5. Re-number sections sequentially after structural changes.
