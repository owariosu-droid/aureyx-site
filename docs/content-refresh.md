# Content refresh

Bandcamp and osu! are mirrored into versioned snapshots so the website remains usable when either source is unavailable. YouTube uses public feeds and official embedded players; no API keys are needed.

## Daily Bandcamp and osu! updates

`.github/workflows/refresh-content.yml` runs daily at 17:23 UTC (07:23 Hawaii time), and can be run manually from GitHub Actions. Once these changes are merged into the default branch, enable Actions and permit this workflow to push content commits. Branch protection may require an approved automation account or adapting the workflow to open pull requests.

The workflow uses immutable action revisions on Ubuntu 24.04, with Node 24 action runtimes. Checkout credentials are not persisted while the importer runs; the GitHub token is available only in the final commit/push step.

The workflow downloads the catalog, each release's current title, purchase price and artwork, plus the public osu! profile, avatar and statistics. It runs the content tests and production checks before committing only `data/external` and `public/external`. No-change runs create no commit. Each source refreshes independently. If one source fails, its saved snapshot stays intact and GitHub Actions records a warning and summary; the other source can still publish a validated update. If both sources fail, or validation fails, the workflow fails without committing anything.

Run locally from the repository root:

```sh
python scripts/sync-external.py
# Or refresh just one source:
python scripts/sync-external.py --source osu
python -m unittest discover -s scripts -p 'test_*.py'
npm run check
```

The importer validates source identities, HTTPS hosts, redirects, filenames and image formats, caps response sizes, retries transient network errors, and removes executable markup from osu! profile HTML. Profile edits, including removing projects or goals, are reflected directly without manually duplicating them in components. Deleted or expired screenshot URLs show an availability message. Expiring Bandcamp audio URLs are never stored. Bandcamp releases use the official live player so replaced recordings are reflected without serving old local excerpts. The importer also saves current track titles and durations for release pages. Older local excerpts remain as assets but are no longer automatically selected by the catalog. The Spotify-only release stays in `data/albums.ts`.

Connect deployments to commits on the default branch so content commits reach the live site. This workflow does not publish the current working copy. GitHub Actions workflows triggered by `GITHUB_TOKEN` commits do not start other push-triggered Actions workflows; an Actions-based deployment needs an explicit deployment step or a separate supported trigger. External hosting integrations must accept bot commits. The daily schedule is best effort; GitHub may delay scheduled runs.

## YouTube

The homepage shows one recent upload per channel; `/videos` shows up to six each, including Yoru Zenaku. Artist pages share the same feed parser. Feeds revalidate every 30 minutes on site requests. Visitors must reload to see refreshed content; there is no background polling in an open tab.

When a feed is unavailable, the channel's official uploads-playlist player remains available instead of reporting that the artist has no uploads. Native video and playlist embeds load lazily as they approach the viewport, showing YouTube’s own thumbnail and controls without an extra site play button. They do not autoplay. Individual videos also have a direct YouTube link if an uploader disables embedding, a video requires sign-in, or a browser blocks the player. Embedding remains subject to YouTube's restrictions.

Server network access needs `www.youtube.com` for feeds. Native embeds no longer depend on the site thumbnail proxy or Next.js image optimization to show video thumbnails; YouTube supplies those within the frame. The legacy thumbnail endpoint still needs `i.ytimg.com` if requested directly. Browsers need `www.youtube-nocookie.com` and YouTube's player/media destinations. CSP permits the privacy-enhanced embed frame. Bandcamp refreshes need `dystofuturemusic.bandcamp.com` and `f4.bcbits.com`; osu! needs `osu.ppy.sh`, `a.ppy.sh`, `i.ppy.sh`, and `assets.ppy.sh`.

Run parser and outage tests with `node --test scripts/youtube-feed.test.mjs` on Node 22.18+ or 24. Browser verification should cover the videos page, channel filters, native previews, and a direct video on an artist page. A successful iframe HTTP response alone does not prove video playback.

Initial validation passed six importer tests, four feed tests, lint, TypeScript, asset checks, and a production build. A repeated live Bandcamp/osu! sync produced identical snapshots. Browser checks confirmed catalog previews, profile content, channel filters and click-to-load player wiring without application exceptions. Full YouTube playback remains unverified in this cloud instance: the proxy denies feed requests and Chromium rejects the proxied embed certificate. Verify playback from the deployed site before treating every channel as fully working.


## Refresh failure on October 20, 2026

Run `39493859230` failed because the Bandcamp response lacked `data-client-items`; osu! succeeded, but the original combined command prevented either snapshot from being committed. The old logs cannot establish whether Bandcamp returned a challenge/error page or changed its markup. The Node 20 and Ubuntu migration warnings were separate from that failure.

The workflow now isolates source failures and reports retained data explicitly. A warning for Bandcamp means its catalog was preserved, not refreshed; if this persists, inspect source availability from the runner before claiming full synchronization is restored. HTTP 429 and selected transient 5xx/network errors are retried with bounded backoff. Access denials and unrecognized content are not bypassed. The manual combined command still exits nonzero when either source fails.

Security maintenance also updates Next.js within the 16.3 patch line and refreshes compatible image/source-map dependencies. Normal site markup, styling, content snapshots and successful player behavior are unchanged. Oversized, redirected, or non-raster upstream thumbnail responses are rejected using the existing fallback image.

For a GitHub-runner verification without publishing content, use **Run workflow** with **dry_run** enabled, or `gh workflow run refresh-content.yml --ref BRANCH -f dry_run=true`. This fetches both sources and runs validation but skips the commit/push step.


## New YouTube uploads and device support

Public YouTube feeds discover uploads for the configured channel IDs; page requests refresh cached feeds approximately every 30 minutes. A new upload can appear after a successful refresh without editing the site. An already open tab needs a reload. When the feed is unavailable, the native uploads-playlist embed is maintained by YouTube and is refreshed when reloaded. These features update video sections; they do not import YouTube uploads as Bandcamp/Spotify music releases or download their audio.

Device improvements preserve the gray theme and navigation structure: mobile navigation is inert when closed, scrolling unlocks when resizing to desktop, search and artwork dialogs contain keyboard focus and restore it on close, galleries support single-finger swipes, controls are larger on touch devices, and dialogs account for browser toolbars and safe-area insets. Device checks use Chromium emulation; they do not establish testing on physical iOS/Android devices or Safari.
