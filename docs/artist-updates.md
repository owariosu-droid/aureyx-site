# Publishing artist updates

Each artist now has a large profile, a gallery where supplied, and an update feed.

## One-time setup

Enable Issues in owariosu-droid/aureyx-site on GitHub. Create these labels:

- artist:lyrlvst
- artist:iyune
- artist:dysto
- artist:yoru-zenaku
- artist:grimvex

Public repository reads work without a token. If rate limits become a problem, set ARTIST_UPDATES_GITHUB_TOKEN in Vercel to a fine-grained token with read-only Issues access to this repository. Never put a token in a NEXT_PUBLIC variable. Redeploy after adding an environment variable.

## Write and publish

1. Click “Submit an update” on the artist's profile and sign in to GitHub.
2. Replace the suggested title with the post title. Replace the body with your message, dragging photos into the editor to upload them. Plain text and Markdown formatting work; GitHub image uploads work too. Remove the instructional text before submitting.
3. Submit the issue. A maintainer verifies the author and content, then adds the matching artist label to approve publication. Do not label unverified submissions.
4. The latest 30 open, labelled issues are shown, newest first. The site refreshes on visits after a five-minute cache interval; a further refresh may be needed while regeneration finishes. No code edit or deployment is needed for posts.

Edit an issue to change a post. Close it or remove its artist label to unpublish it after the cache refresh. Authors can edit their approved posts, so only approve trusted artists. Issues and attachments are public on GitHub even before publication on the site. Comments remain on GitHub and are not displayed in the feed. Raw HTML is not rendered, except uploaded image tags are converted to safe image Markdown.
