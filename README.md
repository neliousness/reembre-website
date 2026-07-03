# Reembr landing page

Marketing site for Reembr, the location-aware leaving-checklist app.

**Direction: playful & springy** (the Family.co / Amie school): bouncy display type, grabbable floating item chips, spring-physics pop-ins, squishy buttons, an ember color-block privacy section, and confetti. Built with [Vite](https://vitejs.dev), [GSAP](https://gsap.com) (+ Draggable), [Lenis](https://lenis.darkroom.engineering), and a minimal [three.js](https://threejs.org) mote backdrop.

No emoji and no em dashes anywhere in the copy or markup. Item glyphs use a stroke-icon sprite (`#i-key`, `#i-wallet`, etc.) defined once at the top of `index.html`, matching the app's line-icon language.

## Develop

```bash
npm install
npm run dev      # dev server
npm run build    # production build, output to dist/
npm run preview  # serve the build locally
```

## Structure

- `index.html`: line-icon sprite, hero (floating chips + bouncy headline), icon marquee, how-it-works cards, "Try it" interactive phone, ember privacy block, download, footer
- `src/main.js`: springy intro, Draggable chips (elastic snap-home), squishy hovers, pop reveals, marquee, phone tilt, and the interactive leaving-flow mock (prompt, tap-to-check, done + confetti)
- `src/world.js`: minimal three.js backdrop, drifting warm motes plus a faint dashed ring
- `src/style.css`: playful system built on the app's warm ember tokens

## Fidelity contract (keep in sync with the app)

The "Try it" phone is a faithful copy of real app UI. If the app changes, update:

- Colors: `lib/design_system/tokens/app_colors.dart` (ember `#D77226`, amber `#F4A024`, cream `#FBF8F3`)
- Leaving sheet stages, copy, row styling: `lib/features/runtime/presentation/map_shell/leaving_prompt_sheet.dart`
- Map marker anatomy: `lib/design_system/widgets/place_map_marker.dart`

Display face is Bricolage Grotesque (marketing voice only); in-phone UI text stays on the system stack like the app.

## Notes

- App Store badge links to `#`; swap in the real App Store URL before launch.
- Google Play badge is intentionally a non-link "Coming soon" state.
- Honors `prefers-reduced-motion`: no springs, content visible statically.
- Location-privacy copy mirrors the non-negotiable boundary in `docs/SPEC.md` section 1; do not soften it.
