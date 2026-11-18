# Security maintenance

The public artist publishing page and GitHub-issue submission/feed integration have been removed. Artist pages no longer fetch issue bodies or use an updates token.

Next.js and its ESLint configuration are updated to 16.4.6. Production dependencies report no known advisories in the npm audit run for this change. Inline event attributes, form submissions, remote image redirects, local-IP image access, and SVG optimization are blocked. Microphone permission remains enabled only on the pitch-detector and BPM-finder routes. The self-hosted BPM worker remains allowed.

Next.js static pages still require inline bootstrap scripts; the CSP retains script-src unsafe-inline. This is a practical hardening pass, not an independent security audit.

An upstream picomatch ReDoS advisory remains in developer-only lint/build tooling and is propagated through several dependency entries. npm audit fix was applied without forcing a Next.js downgrade; no patched picomatch release is currently offered by the registry. These packages are not in the production dependency audit. Recheck with npm audit when updating developer tooling.
