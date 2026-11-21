# Owner-only administration

The `/admin` page provides owner email/password login, artist biography/role editing, homepage introduction/about text, music description, Geometry Dash description, sign-out, and password changes. There is no public registration flow or navigation link. Signed-in owners see pencil links on editable pages. The login route can still be discovered; security comes from server authorization and database policies, not URL secrecy.

## Required one-time setup

1. Create a dedicated Supabase project. Under Authentication, create your own email/password user with a unique password of at least 14 characters. Choose the password in Supabase's secure dashboard, never in chat or source code. Verify/confirm your account there. Disable new user sign-ups and anonymous sign-ins. Keep the provider's authentication rate limits enabled; use a 15-minute access-token lifetime.
2. Copy that user's UUID. Replace both `YOUR_OWNER_USER_UUID` placeholders in `supabase/owner-content.sql` and run it in the project's SQL editor. The owner ID in the SQL policies must exactly match the deployment setting below. Do not use a service-role key.
3. Add these **server-only** Vercel environment settings for the production deployment:

   | Setting | Value |
   | --- | --- |
   | `SUPABASE_URL` | Your `https://PROJECT.supabase.co` project URL |
   | `SUPABASE_ANON_KEY` | The project's legacy anon/public JWT key; never a service-role key |
   | `AUREYX_OWNER_ID` | Your exact Auth user UUID |
   | `AUREYX_SITE_ORIGIN` | The canonical website origin, e.g. `https://aureyx-site.vercel.app`, without a trailing slash |

   The anon key is safe only in combination with the supplied row-level security policies. These variables are intentionally not named `NEXT_PUBLIC_*`. Do not copy production credentials into public preview deployments. For a configured preview, use a separate test project and its exact origin.
4. Redeploy, open `/admin` directly, and sign in. Save a harmless text edit, verify it as a signed-out visitor, and verify a non-owner account cannot edit. Until these settings exist, administration fails closed and public pages use their repository content.

Use only the configured canonical origin for editing; write requests from another origin are rejected. No redirect to an arbitrary `next` URL is accepted. You can change your own password in the admin panel after confirming the current password. Password changes clear the browser session and require signing in again. Forgotten-account recovery is managed in your Supabase account; this version has no public recovery or account-creation endpoint.

## How access works

- Passwords go over HTTPS to the server and Supabase Auth; the app does not store or log plaintext passwords.
- Each privileged request asks Supabase to validate the access token and checks the exact owner UUID. Expired sessions can refresh only if the refreshed account is still the owner.
- Access/refresh tokens use Secure, HttpOnly, SameSite=Strict, host-only cookies in production. Browser JavaScript never receives the tokens. The refresh cookie has a seven-day sliding maximum age.
- Mutation endpoints require same-origin JSON requests with bounded input. Owner pages and API responses are marked private/no-store and noindex.
- Authenticated database writes also require the owner's UUID through RLS. The anonymous/public key cannot insert, update, or delete content. Only published text is publicly readable.
- Revision checks prevent silent overwrites from another tab. Saves invalidate the relevant public caches. Published content uses React text rendering, not HTML injection.
- These controls do not revoke already issued access JWTs instantaneously; Supabase token expiry still applies, which is why a short access-token lifetime is recommended.

## Scope and limitations

This first version changes text only, not artist IDs/names, uploads, layout, music catalog data, or passwords of other accounts. It doesn't replace the separate music-motion release candidate or supply the missing Geometry Dash banner image. Existing files remain fallbacks if the content service is unavailable. During a service outage a page may temporarily show repository text instead of the saved override.

Validation includes owner/non-owner and forged-token tests, origin rejection, safe upstream errors, content limits, and browser checks using a mocked auth/storage provider. Real Supabase provisioning, RLS execution, password recovery settings, and deployment credentials must be verified in your own project before enabling production editing.
