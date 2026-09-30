# Imported v2 appearance → approved resource conversation

Source: `imports/candidate-copilot-maquette-v2/index.html` and its README. Selection recorded in the latest `.memlog.md`: retain **v2 colors, fonts and overall style**, but apply them to `.working/wireframe-resources-2026-09-30.html`. The checkpoint's older “tokens not finalized” wording does not negate that later style selection.

## Existing palette (exact source CSS)

| Role in v2 | Value |
|---|---|
| Warm page / paper | `--paper:#f3f0e8` |
| Main ink / user bubble / profile avatar | `--ink:#19211d` |
| Muted metadata | `--muted:#68716c` |
| Structural rules | `--line:#d4d2c9` |
| Action / assistant badge / accents | `--green:#1d5b44` |
| Action hover | `--green-dark:#174a38` |
| Badge lettering / chip hover | `--mint:#c9f2dc` |
| Warm card surface | `--white:#fbfaf6` |
| Small footer separators | `--orange:#e96f45` (not needed in this conversation) |
| Input / primary-button / user text white | CSS `white` = `#ffffff` (distinct from `--white`) |

Existing supporting values, not a new palette:
- Card border `#cbc9bf`; card/head separators `#e0ded6`, chat-head separator `#e1dfd7`, prompt-row separator `#e8e5dd`.
- Assistant bubble / prompt hover `#edf3ee`; navigation hover `#e7e4dc`.
- Chip border `#d2d5ce`, chip text `#36423b`; prototype badge border `#9ec7b3`.
- Composer border `#d6d3ca`, focused border `#7fa792`, placeholder `#929792`.
- Lead `#4e5752`, aside prose `#59625d`; sources border `#d3dfd6`, source text `#67736c`.
- Typing dots `#799082`, decorative menu dots `#8a918d`; landing status dot `#45a675`, halo `#d9eadf` (not imported into this conversation).
- Card shadow `--shadow:0 24px 70px rgba(37,48,42,.10)`; primary shadow `0 9px 24px rgba(29,91,68,.18)`; input-focus ring `0 0 0 3px rgba(29,91,68,.09)`.

## Fonts, roles and exact loading mechanism

```css
@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Manrope:wght@400;500;600;700&family=Newsreader:opsz,wght@6..72,400;6..72,500&display=swap');
```

| Family / requested weights | Source role and fallback declaration |
|---|---|
| **Manrope** 400, 500, 600, 700 | Body, answers, inputs, controls; `Manrope,system-ui,sans-serif`. Body defaults to 400; chips/navigation 600; brand/titles/primary 700. Controls inherit typography. |
| **Newsreader** 400, 500; optical-size axis 6..72 | Literary headings, prompt text, proof titles; `Newsreader,Georgia,serif`. Hero/aside headings 400; emphasized hero/proof titles 500. Source avatar declares just `Newsreader`, without explicit fallbacks. |
| **DM Mono** 400, 500 | Eyebrows, small metadata, location, source lines, badges. Source declares `'DM Mono'` alone: **no explicit monospace fallback stack**. Missing family therefore falls back to the browser's generic/default font, not necessarily monospace. Most metadata computes to 400; the source brand mark can inherit 700 although 700 was not requested. |

The preview preserves the import URL, family names and these stacks, including the source's missing generic fallbacks. No renamed fonts, extra families, bundled files or dependencies. `display=swap` allows temporary fallback; offline/blocked Google delivery cannot guarantee the selected typefaces. V2's `<em>` uses italic styling but the import requests normal faces only; this pass adds no italic-face request. Exact hero scale/letter spacing is not a requirement for this conversation.

## Surface and component observations

Warm flat paper, off-white cards, fine neutral rules, deep-green actions and quiet mint highlights; no gradient. Source card/chat radius `22px` (`18px` on its small chat), primary `12px`, prompt/composer `14px`, send `10px`, assistant badge `8px`, chips/badges `99px`. Assistant bubble `5px 15px 15px 15px`; user bubble `15px 5px 15px 15px`. Rounded profile avatar is ink/off-white; assistant badge is green/mint. Soft card elevation, modest input focus ring, subtle hover surfaces; typography carries hierarchy rather than decoration. V2 includes gentle hover movement and typing animation; this preview preserves the approved wireframe's reduced-motion-aware waiting behavior, not v2 navigation transitions.

## Interpretive resource mapping — illustrative pending feedback

V2 has no multi-resource selection or historical resource scope. These are **new component mappings, not user-approved exact tokens**:
- Active resources use v2's compact pill language: `#edf3ee`, green lettering, `#9ec7b3` border, individual minus; mint hover. Their single horizontally scrolling row stays above the text. Retained 44px minimum interactive targets are wireframe measures, not measurements extracted from v2.
- Historical scope uses smaller off-white/green DM Mono pills with `#d3dfd6` borders inside the assistant bubble, immediately before reply/waiting/error. They wrap and have no removal controls. No band or global label when empty. These are authorized-resource labels, **not passage citations**; actual citation/excerpt interactions remain outside this preview.
- Library maps to the off-white prompt/chat card (`22px`, `#cbc9bf`, exact card shadow); project names borrow Newsreader prompt typography. Immediate toggles borrow mint chips and green controls. Sheet/privacy backdrops reuse the exact card-shadow tint `rgba(37,48,42,.10)` in a new role, not an approved overlay-opacity token.
- Compact top identity borrows the source profile avatar and Newsreader hierarchy; guide borrows card borders and radius `14px`. Source prose remains Manrope. Resource access maps to the source secondary chip, Send to the green action. No extra palette.

## Chosen appearance ≠ v2 layout, copy or dimensions

Keep approved wireframe disposition and unchanged simulation: identity visible at the top on mobile too; manually collapsible guide outside transcript; centered `620px` reading column; lower-left resource access; fixed-flex composer; available-right-margin library or overlay sheet without chat-width changes; immediate 1:1 selection, immutable turn snapshots and editable next-turn draft/selection while waiting. No Apply, upload, automatic send, marketing sidebar, skills/contact block or landing coverage. Illustrative candidate/project/answer copy is retained and explicitly marked provisional. Exact sizes, copy, new component mappings and runtime contracts remain unapproved. No source artifacts or product files were edited.

## Measured rendering / limits

Evidence: `.working/style-validation-2026-09-30/` (`browser-results.json`, `font-results.json`, screenshots and reproducible headless script).

Inherited Google stylesheet and font requests returned **HTTP 200**. At 1360px, 390px and 320px, Chrome reported custom-font glyph rendering for **Manrope**, **Newsreader** and **DM Mono**, not just matching computed-family strings. Internal platform names were `Manrope ExtraLight` / `Manrope-ExtraLight`, `Newsreader 16pt` / `Newsreader16pt-Regular`, and `DM Mono` / `DMMono-Regular`; these variable-font/internal names are not new chosen families or evidence of a CSS weight change. FontFace entries loaded for Manrope 400/600/700, Newsreader 400/500 and DM Mono 400. Manrope 500, DM Mono 500 and unused language subsets remained unloaded: available/requested does not mean rendered. Captures were taken after the fonts-ready check.

Headless Chromium checked desktop/narrow-desktop/320/390 geometry, active single-row overflow and keyboard scrolling, historical wrapping, library focus/Escape, reading-position preservation, add/remove 1:1, actual send/wait/success/error snapshot/draft preservation, bounded draft growth, privacy scaffold and demo controls. No physical device, touch, virtual keyboard, screen-reader, backend, persistence or runtime-recovery validation. Font delivery remains environment-dependent; fallback alone would not prove selected typography.
