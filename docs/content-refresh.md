# Content refresh

Bandcamp and osu! are mirrored into versioned snapshots so the website remains usable when either source is unavailable. YouTube uses public feeds and official embedded players; no API keys are needed.

## Daily Bandcamp and osu! updates

`.github/workflows/refresh-content.yml` runs daily at 17:23 UTC (07:23 Hawaii time), and can be run manually from GitHub Actions. Once these changes are merged into the default branch, enable Actions and permit this workflow to push content commits. Branch protection may require an approved automation account or adapting the workflow to open pull requests.

The workflow downloads the catalog, each release's current title, purchase price and artwork, plus the public osu! profile, avatar and statistics. It runs the content tests and production checks before committing only `data/external` and `public/external`. No-change runs create no commit. A failed source or check prevents the workflow from committing changes, leaving the deployed snapshot intact. Failed scheduled runs are visible in GitHub Actions.

Run locally from the repository root:

```sh
python scripts/sync-external.py
# Or refresh just one source:
python scripts/sync-external.py --source osu
python -m unittest discover -s scripts -p 'test_*.py'
npm run check
```

The importer validates source identities and image formats and removes executable markup from osu! profile HTML. Profile edits, including removing projects or goals, are reflected directly without manually duplicating them in components. Deleted or expired screenshot URLs show an availability message. Expiring Bandcamp audio URLs are never stored: existing local excerpts remain playable, and new releases use Bandcamp's official player. The Spotify-only release stays in `data/albums.ts`.

Connect deployments to commits on the default branch so content commits reach the live site. This workflow does not publish the current working copy. GitHub Actions workflows triggered by `GITHUB_TOKEN` commits do not start other push-triggered Actions workflows; an Actions-based deployment needs an explicit deployment step or a separate supported trigger. External hosting integrations must accept bot commits. The daily schedule is best effort; GitHub may delay scheduled runs.

## YouTube

The homepage shows one recent upload per channel; `/videos` shows up to six each, including Yoru Zenaku. Artist pages share the same feed parser. Feeds revalidate every 30 minutes on site requests. Visitors must reload to see refreshed content; there is no background polling in an open tab.

When a feed is unavailable, the channel's official uploads-playlist player remains available instead of reporting that the artist has no uploads. It loads only after a click. Individual videos also have a direct YouTube link if an uploader disables embedding, a video requires sign-in, or a browser blocks the player. Embedding remains subject to YouTube's restrictions.

Server network access needs `www.youtube.com` for feeds and `i.ytimg.com` for thumbnails. Browsers need `www.youtube-nocookie.com` and YouTube's player/media destinations. CSP permits the privacy-enhanced embed frame. Bandcamp refreshes need `dystofuturemusic.bandcamp.com` and `f4.bcbits.com`; osu! needs `osu.ppy.sh`, `a.ppy.sh`, `i.ppy.sh`, and `assets.ppy.sh`.

Run parser and outage tests with `node --test scripts/youtube-feed.test.mjs` on Node 22.18+ or 24. Browser verification should cover the videos page, channel filters, click-to-play, and a direct video on an artist page. A successful iframe HTTP response alone does not prove video playback.

Initial validation passed six importer tests, four feed tests, lint, TypeScript, asset checks, and a production build. A repeated live Bandcamp/osu! sync produced identical snapshots. Browser checks confirmed catalog previews, profile content, channel filters and click-to-load player wiring without application exceptions. Full YouTube playback remains unverified in this cloud instance: the proxy denies feed requests and Chromium rejects the proxied embed certificate. Verify playback from the deployed site before treating every channel as fully working.
