# Music page release candidate

Status: prepared for review; not deployed to production.

## Included

- A layered cover-art hero on `/music`, linked to real release pages.
- Scroll-driven parallax and a vinyl motif.
- Animated archive strip, waveform decoration, and staggered release cards.
- Pause/resume control for ongoing motion and reduced-motion support.
- Responsive layouts; homepage styling and catalog behavior remain separate.

## Validation

- `npm run check`: lint, TypeScript, asset references, and production build.
- 24 Node tests and 18 Python tests passed.
- Production-build Chromium checks: parallax changes with scrolling; pause/resume and reduced-motion behavior; search, artist/format filters, pagination, and preview opening.
- No horizontal overflow at widths 320, 390, 768, and 1440 pixels.
- Desktop/mobile screenshots visually reviewed. Physical Safari/iOS was not tested.

## Excluded / pending

- Geometry Dash banner: original supplied image is not available in the execution workspace; reattachment is needed.
- Owner-only pencil editor: discussed as a future feature; authentication, save authorization, and content storage are not implemented here.
- The pre-existing iyune art scaffold is preserved separately.

## Release and rollback

Review the pull request and merge it into `main` to trigger the existing Vercel production deployment. Verify `/music`, release filtering/previews, and reduced-motion behavior after deployment. Revert the music-motion commit to restore the prior catalog header; no content or database migration is involved.
