# Music page release candidate

Status: prepared for review; not deployed to production.

## Included

- A six-cover, rotating 3D merry-go-round on `/music`, linked to real release pages.
- Scroll-driven depth, sleeve backs, a glowing turntable platform, and previous/next controls.
- Animated archive strip and staggered release cards.
- Pause/resume controls, hover/focus handling, offscreen/hidden-tab suspension, and reduced-motion support.
- Responsive layouts; homepage styling and catalog behavior remain separate.

## Validation

- `npm run check`: lint, TypeScript, asset references, and production build.
- 24 Node tests and 18 Python tests passed.
- Production-build Chromium checks: auto rotation, hover pause, keyboard focus bringing a sleeve forward, previous/next selection, hidden-tab/offscreen suspension, reduced-motion navigation, real release links, search, artist filters, pagination, and preview opening.
- No horizontal overflow at widths 320, 390, 768, and 1440 pixels.
- Desktop/mobile screenshots visually reviewed. Physical Safari/iOS was not tested.

## Excluded / pending

- Geometry Dash banner: original supplied image is not available in the execution workspace; reattachment is needed.
- Owner-only pencil editor: implemented separately in draft PR #31 and requires private account/storage setup; it is not part of this visual update.
- The pre-existing iyune art scaffold is preserved separately.

## Release and rollback

Review the pull request and merge it into `main` to trigger the existing Vercel production deployment. Verify `/music`, release filtering/previews, and reduced-motion behavior after deployment. Revert the music-motion commit to restore the prior catalog header; no content or database migration is involved.
