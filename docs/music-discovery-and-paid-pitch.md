# Discovery and paid pitch service

Implemented: browser-local saved releases, a dedicated listening list, direct links to previews/free listening/tools, and next-step links after using the pitch checker. No account, additional analytics, timed pop-ups, or forced playback are required.

Research consulted:
- Nielsen Norman Group: https://www.nngroup.com/articles/recognition-and-recall/ — visible choices and saved items reduce reliance on remembering titles and navigating from scratch.
- Google Web Vitals: https://web.dev/articles/vitals — preserve loading, responsiveness and visual stability rather than adding expensive retention effects.
- Stripe fulfillment: https://docs.stripe.com/checkout/fulfillment — paid access requires verified fulfillment; a checkout redirect or browser flag is not proof of payment.

These principles inform the changes; they do not establish a measured retention increase. Evaluate return visits, listening-list usage and successful tool-to-music navigation before further changes.

## Paid pitch option: owner decisions needed

Confirm the actual paid service/features, price, currency and one-time versus recurring billing. Supply a checkout product/link or choose a payment provider. Keep basic pitch detection free unless the owner chooses otherwise.

Recommended presentation: a small optional offer below the working checker, showing the full price and billing frequency before checkout. Do not imply the checker needs payment to start, hide charges or use fake urgency.

If this sells software access, implement server-verified payment fulfillment and authenticated entitlement storage before unlocking premium features. Never use localStorage, a query parameter or the checkout success page as authorization. If this sells a personal service instead, define delivery and contact details before accepting payment.

The existing microphone stays local, permission-based and free. No payment is accepted and no premium access is claimed by this release.
