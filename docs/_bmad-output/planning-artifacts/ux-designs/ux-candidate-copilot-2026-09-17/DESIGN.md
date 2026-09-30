---
name: Candidate Copilot
status: draft
approval: sketch-approved
description: Approved warm-paper UX sketch; copy and implementation details remain evolving.
sources:
  - ../../briefs/brief-candidate-copilot-2026-09-10/brief.md
  - ../../prds/prd-candidate-copilot-2026-09-11/prd.md
  - ../../architecture/architecture-candidate-copilot-2026-09-11/ARCHITECTURE-SPINE.md
  - ../../architecture/architecture-candidate-copilot-2026-09-11/RUNTIME-CONTRACTS.md
  - .memlog.md
  - .working/visual-style-v2-reference.md
updated: 2026-09-30
colors:
  paper: '#f3f0e8'
  ink: '#19211d'
  muted: '#68716c'
  line: '#d4d2c9'
  green: '#1d5b44'
  green-dark: '#174a38'
  mint: '#c9f2dc'
  warm-white: '#fbfaf6'
  white: '#ffffff'
  assistant-surface: '#edf3ee'
  card-border: '#cbc9bf'
  resource-border: '#9ec7b3'
  source-border: '#d3dfd6'
  composer-border: '#d6d3ca'
  focus-border: '#7fa792'
typography:
  body:
    fontFamily: 'Manrope, system-ui, sans-serif'
  editorial:
    fontFamily: 'Newsreader, Georgia, serif'
  metadata:
    fontFamily: 'DM Mono'
---

# Candidate Copilot — Design Sketch

> **APPROVED SKETCH / rough draft.** Retain the approved layout and v2 appearance. Copy evolves intentionally; exact component sizing and incomplete implementation details are not ratified. This is not a production-ready specification.

## Brand & Style

Warm paper, intimate literary/CV character, clear sections and minimal chrome: an invitation to explore documented work, not a cold SaaS or persuasive AI persona. Typography and generous reading space carry the hierarchy.

The [styled resource preview](.working/mockup-resources-v2-style-2026-09-30.html) is the approved appearance applied to the [resource wireframe](.working/wireframe-resources-2026-09-30.html). The [v2 import](imports/candidate-copilot-maquette-v2/index.html) supplies the visual language only; its copy, sidebar, mobile identity hiding and extra landing content are not inherited. [Exact extraction](.working/visual-style-v2-reference.md) preserves provenance; [EXPERIENCE.md](EXPERIENCE.md) defines behavior.

## Colors

All tokens above are source-derived v2 values used in the approved styled preview, not a new palette.

- `{colors.paper}` is the canvas; `{colors.warm-white}` is the quiet card/dialog surface. `{colors.white}` is the distinct input and primary-action/user-text white.
- `{colors.ink}` carries primary text, candidate badge and user messages; `{colors.muted}` supports metadata. `{colors.line}` separates major regions.
- `{colors.green}` carries actions, assistant identity and resource emphasis; `{colors.green-dark}` is its action hover. `{colors.mint}` supplies quiet selected/hover highlights and assistant badge lettering.
- `{colors.assistant-surface}` carries answers and active resource pills. `{colors.card-border}`, `{colors.resource-border}`, `{colors.source-border}` and `{colors.composer-border}` retain the reference's subtle structural distinctions; `{colors.focus-border}` derives from its input focus treatment.
- Do not invent status palettes, a red error theme or alternate color modes. Error differentiation still needs readable text and controls, not color alone.

## Typography

- `{typography.body.fontFamily}`: prose, long answers, input and controls.
- `{typography.editorial.fontFamily}`: literary headings, landing question text, candidate name and library project names.
- `{typography.metadata.fontFamily}`: small metadata, location and historical scope tokens; preserve the reference family without claiming an adopted fallback stack.

The reference loads Manrope 400/500/600/700, Newsreader 400/500 and DM Mono 400/500 via Google Fonts. Remote delivery and fallback behavior need implementation consideration. No type-size ramp, hero scale or letter-spacing contract is approved here.

## Layout & Spacing

Two-step light landing → dedicated central conversation. The landing's entry card contains 2–3 questions plus a distinct free-entry option; no standalone start button, skills band or project showcase.

Conversation order: compact identity, collapsible guide outside the transcript, generous reading column, always-visible bottom composer. Identity remains on mobile and scrolls, rather than sticking. Preserve comfortable reading width and margins; no permanent presentation sidebar.

Resource/source panels use available right-margin space without covering, shifting or reflowing chat; insufficient space uses a bottom-sheet overlay, even on desktop. Active tokens occupy one horizontal scrolling row above input inside the composer; historical tokens wrap on mobile. Composer grows to a bounded cap. Exact widths, gaps, caps, breakpoints and keyboard geometry remain deferred; no spacing scale is invented.

## Elevation & Depth

Warm tonal layering, fine neutral borders and the reference's soft card shadow distinguish surfaces. Composer focus uses the subtle green-tinted reference ring. No dramatic elevation or gradient treatment. Shadow dimensions and overlay opacity are reference examples, not ratified tokens.

## Shapes

Rounded cards/composer, compact pills, circular candidate badge and small rounded assistant badge preserve v2's softness. Conversation bubbles retain asymmetric corners. Mobile citation circles overlap by approximately one third. Exact radii and target/component dimensions remain unresolved, despite approval of the overall appearance.

## Components

Names match [EXPERIENCE.md](EXPERIENCE.md#component-patterns); rules describe appearance, not final dimensions.

| Component | Visual rule |
|---|---|
| Entry card | Warm-white card with fine card border; editorial question rows and a visibly distinct free-entry option. |
| Candidate identity | Ink circular badge with warm-white lettering; editorial name, body function and metadata location, wrapping/stacking on mobile. |
| Usage guide | Quiet warm-white bordered rounded block; concise body text, clear disclosure summary. |
| Conversation turn | Ink/white user bubble; assistant-surface answer with source-border, green/mint generic badge and three small waiting dots. Readable long body text. |
| Composer | White rounded input surface with composer-border and focus-border treatment; green/white Send and discreet pill-like lower-left resource access. |
| Active resource token | Compact assistant-surface/green pill with resource-border and individual minus; mint hover. One scrolling row, no wrapped or collapsed representation. |
| Historical resource token | Smaller warm-white/green metadata pill with source-border, inside answer before content; no removal affordance. |
| Resource library | Warm-white rounded card/sheet with card-border and soft depth; editorial names, short factual body descriptions and green/mint selection controls. |
| Citation token | Discreet passage-local source affordance: desktop file-title token, mobile one group of overlapping circles, at most three plus +N. Detailed citation styling is not shown in the approved resource preview. |
| Source viewer | Readable file/section/excerpt surface, right-margin panel or bottom sheet; follows quiet card language. Detailed visual treatment remains deferred. |
| Privacy dialog | Warm-white rounded dialog with card-border; clear body text and deletion-request control. Preview is a scaffold, not approved disclosure content. |

## Do's and Don'ts

| Do | Don't |
|---|---|
| Retain the approved v2 palette/fonts and current wireframe disposition | Reopen palette/layout selection or adopt purple-gradient AI tropes |
| Give long answers space and preserve reading position | Shift chat to make room for panels or pull scrolled-up readers down |
| Keep identity and complete functionality on mobile | Restore v2's hidden mobile profile or permanent sidebar |
| Distinguish editable context, immutable turn scope and actual citations | Treat resource tokens as evidence citations |
| Let copy evolve while keeping source trust boundaries | Ratify placeholder claims, measured mock dimensions or incomplete privacy disclosures |
