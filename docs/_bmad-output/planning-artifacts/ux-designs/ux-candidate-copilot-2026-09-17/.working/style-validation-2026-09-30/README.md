# Style validation — 2026-09-30

Artifact: `../mockup-resources-v2-style-2026-09-30.html`. Headless cached Chromium 1223, Node native CDP/WebSocket, file://; no GUI, dependency installation or external research. Only the exact inherited Google Fonts stylesheet and its font resources were requested.

## Results: passed

- Source integrity: simulation JavaScript byte-identical to the approved resource wireframe; every applied CSS hex color exists in imported v2 (`source-integrity.json`).
- 1360px desktop and 900px narrow desktop; 390/320px surfaces and reviewer wrapper: no page-wide horizontal overflow. Desktop library remains in available right margin; insufficient-space library uses a sheet without chat-width/position changes.
- Immediate add/remove 1:1, no duplicate tokens, draft untouched and library stays open. Actual submit records immutable selected-resource history, selection persists across sends.
- Waiting snapshot A+B remains unchanged while draft and future D+E change; Send disabled. Success/error preserve future draft and selection; historical tokens retained, before reply, no remove controls. Empty selection has no historical band/global label.
- Active tokens form one scrolling row above text, including keyboard ArrowRight scrolling and individual 44px removal targets; historical tokens wrap at mobile widths. Identity visible on narrow screens.
- Library close/Escape restores trigger focus. Reading scrollTop=80 preserved through open/selection/close, response and privacy scaffold. Long draft bounded with internal overflow; composer remains in viewport. Guide manually collapsible. All four width controls and scenario/receive controls work.
- No uncaught JavaScript exceptions. Detailed assertions: `browser-results.json`; runnable script: `check-browser.mjs`.

## Font delivery and rendering

`font-results.json` records HTTP 200 for the exact inherited stylesheet and font resources, FontFace status and actual CDP platform-font usage at desktop/390/320 widths. **Manrope, Newsreader and DM Mono all rendered as custom fonts**, not merely declared fallbacks. Loaded used faces: Manrope 400/600/700; Newsreader 400/500; DM Mono 400. Manrope 500, DM Mono 500 and unused script subsets were not exercised/loaded. Variable-font internal platform names can differ from CSS family names; see the extraction document. No claim that every requested face rendered, or that remote fonts will work offline.

## Focused screenshots

- `desktop-multiple-margin-open.png`: selected A+B and open right-margin library.
- `narrow-desktop-sheet-open.png`: 900px overlay without chat reflow.
- `mobile-320-active-overflow.png`, `mobile-390-active-overflow.png`: single-row active overflow plus wrapping history.
- `mobile-320-waiting-fixed-scope.png`, `mobile-390-waiting-fixed-scope.png`: immutable A+B waiting versus active C+D draft.
- Additional zero/open/waiting and reviewer-control screenshots alongside these. Screenshots captured after fonts-ready inspection.

## Limits

Viewport emulation, not a physical phone. No real touch, virtual keyboard, screen-reader, persistence, backend, evidence retrieval, idempotency/recovery or actual privacy disclosures tested. Citations/excerpts are not simulated: resource-scope labels are not citations. New resource styling and inherited wireframe dimensions remain illustrative pending feedback; not product implementation.
