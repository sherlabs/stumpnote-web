# User decisions (authoritative — override any conflicting default in other spec docs)

Recorded 2026-10-04 from the repo owner, via interactive questions.

| # | Decision | Detail |
|---|----------|--------|
| D-DB | Payload database | **Neon via the Vercel Marketplace** (free tier), separate from the StumpNote app database. Provisioning that needs terms acceptance or payment is a BLOCKED step for the owner (record exact click-path in STATUS.md). |
| D-ANALYTICS | Website analytics in the Payload admin | **Use the `payload-dashboard-analytics` plugin by NouanceLabs** (https://github.com/NouanceLabs/payload-dashboard-analytics). Verify Payload 3 compatibility, supported providers and last release in S1/S6 before wiring; choose its best-supported privacy-friendly provider (cookie-less where possible). If the plugin is incompatible, document the reason in STATUS.md and fall back to a custom admin view for the same provider — do not silently switch plugins. |
| D-LEGAL | Legal values | Company details come from the owner's existing public policy at https://www.sherlabs.com/privacy (and related sherlabs.com pages). Never invent legal details. Anything not stated there (retention periods, backup purge, usage-log retention) stays a placeholder until the owner approves proposed values. |
| D-SUBMIT | App Store timing (context, not this repo) | Player 1.0 goes to App Review after a real-watch retest and the real legal pages exist. The website must not claim App Store availability until the apps are live. |

Everything else: follow docs/spec/* and the recommended defaults listed in STATUS.md "Decisions needed".
