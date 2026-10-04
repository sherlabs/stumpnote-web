# 06 Legal pages: plan, placeholder mechanism, notice mode, version sync

Index: [README.md](./README.md). Decision D-13 in [00-overview.md](./00-overview.md). CMS fields in [03-cms-model.md](./03-cms-model.md) section 1.8. Executed in S5 ([brief](../ops/stages/S5-legal-seo-quality.md)).

Rule: never invent a legal fact. Unknown values stay as visible placeholders in the CMS and the page renders in notice mode. The user supplies the values; a lawyer clears the review markers.

## 1. Pages and sources

| Route | Source (private repo, read-only) | State |
|---|---|---|
| `/privacy` | `docs/PRIVACY_POLICY.md`, text after the first `---` (the review block above it is never imported) | Draft, awaiting values and lawyer review |
| `/terms` | `docs/TERMS_OF_USE.md` | Draft |
| `/support` | `docs/SUPPORT.md` | Draft |
| `/account-deletion` | Support "Delete your account" + Privacy section on deletion | To draft from those sources; must state that deleting a Parent account also deletes child profiles the guardian solely manages |
| `/cookies` | Privacy section on cookies and the web app + this site's own behaviour (cookieless analytics, admin session cookie) | To draft; no source page exists |
| `/data-safety` | Privacy Appendix A (data map) | To draft as a plain-language summary labelled as such, never as "our App Store privacy label" (user decision pending) |
| `/legal` | index | New |
| `/privacy/history`, `/privacy/v/[policyVersion]` (and `/terms/...`) | Payload versions | New |

Footer also links Apple's standard EULA (https://www.apple.com/legal/internet-services/itunes/dev/stdeula/).

Import rule: render from the markdown sources, not from the diverged HTML pages in the app repo. Section links such as `[Privacy Policy](/privacy)` resolve on the new host. The draft footer note disappears when no placeholder remains.

## 2. Rendering mechanism (port of the app repo's legal renderer, `src/lib/legal/render.ts`)

Three behaviours plus a gate, all unit-tested:

1. **Substitution.** Replace `{{KEY}}` with the value from the `legal-values` global, HTML-escaped. An empty value counts as unset and the token stays as `{{KEY}}`.
2. **Review markers.** `{{LEGAL_REVIEW: free text}}` markers are text, not values. They are stripped only when `LEGAL_REVIEW_DONE` is `yes`. Until then they count as placeholders.
3. **Notice mode.** If any `{{...}}` remains after substitution, the route renders the minimal notice instead of the draft: heading, "This page is being finalised. It will be published here once complete.", a contact line (support email if set, else "via the app: Profile → Help"), and `noindex`. Placeholder text and highlighted draft marks are never shown in production.
4. **Strict gate.** With `LEGAL_STRICT=1` (production), publishing a `legal-pages` document that still has placeholders is rejected in a `beforeValidate` hook with a clear message. Drafts can still be saved.

Rendering: markdown → HTML server-side (remark, GitHub-flavoured, no raw HTML), max measure 64ch, system fonts allowed, no motion, `@media print` stylesheet (plain text, expanded links, no nav).

## 3. Versioning and the `POLICY_VERSION` sync

Payload `legal-pages` has drafts and versions. A published version is immutable; edits create a new version. `/privacy/history` lists prior published versions with effective dates; `/privacy/v/[policyVersion]` renders exactly that version.

`POLICY_VERSION` drives guardian re-consent in the Parent app via the app database's `policy_versions` table. Fixed order for any material change:

1. A lawyer approves the text.
2. In Payload, create a new draft with the new `policyVersion` and `effectiveDate`.
3. Publish the Payload page. The page must be live before the app asks anyone to consent to it.
4. Only then insert the matching `policy_versions` row in the app database (an app-repo migration, user-approved). Guardians are prompted to re-consent.
5. Keep the previous version reachable at `/privacy/v/{policyVersion}`.

Never bump the database row first. The `beforeChange` hook requires `policyVersion` non-empty and different from the previous published version for `privacy` and `terms`.

## 4. Placeholder list (the `legal-values` global; mirrors the app repo's legal config)

**Source of values (owner decision D-LEGAL in [USER-DECISIONS.md](./USER-DECISIONS.md)):** the owner's existing public policy at `https://www.sherlabs.com/privacy` and related sherlabs.com pages. In S5 the agent reads those pages, extracts only the facts they state (typically entity name, address, contact mailbox, governing law), and writes them into `STATUS.md` under "Decisions needed" as a proposal with the source URL per value. Nothing is entered into the `legal-values` global or published until the owner approves. Values the pages do not state (retention period, backup purge window, usage-log retention, policy version, dates, DPO) stay empty placeholders until the owner approves proposed values.

| Key | Meaning | Default |
|---|---|---|
| `COMPANY_LEGAL_NAME` | Legal entity that operates StumpNote ("SherLabs" is only the App Store brand) | empty |
| `COMPANY_ABN` | ABN or company number, if Australian | empty |
| `COMPANY_ADDRESS` | Registered or postal address | empty |
| `PRIVACY_CONTACT_EMAIL` | Monitored privacy mailbox, not a personal address | empty |
| `SUPPORT_EMAIL` | Monitored support mailbox | empty |
| `GOVERNING_LAW` | Governing law and jurisdiction (legal call) | empty |
| `EFFECTIVE_DATE` | Date the policy and terms take effect | empty |
| `LAST_UPDATED` | Date of last change | empty |
| `POLICY_VERSION` | Must match the latest `policy_versions` row (section 3) | empty |
| `RETENTION_PERIOD` | Time to finish account-deletion cleanup | empty |
| `BACKUP_PURGE_DAYS` | Database backup window for the plan in use (verify in the provider dashboard) | empty |
| `USAGE_LOG_RETENTION` | How long AI usage and request logs are kept | empty |
| `DELETE_ACCOUNT_PATH` | In-app deletion path | "Profile, then Delete account" |
| `LEGAL_REVIEW` | Analytics-retention wording to publish (legal/product call) | empty |
| `DPO_OR_REPRESENTATIVE` | Only if an EU/UK representative or DPO is required | empty |
| `LEGAL_REVIEW_DONE` | `yes` once a lawyer has cleared the review markers | empty |

Until `COMPANY_LEGAL_NAME` is set, the footer reads "© 2026 StumpNote" with no entity claim.

## 5. Canonical host and redirects

`stumpnote.com` becomes the canonical host for all legal routes. `app.stumpnote.com/{privacy,terms,support}` must keep resolving forever (old app builds carry those URLs): the app repo later turns its rewrites into **308 redirects** to `stumpnote.com`, switched on only after the new pages return 200 with real content. That change, the App Store Connect URL updates (Support, Marketing, Privacy Policy URLs) and the legacy `sherlabs.com` page redirects are user-owned follow-ups, listed in `STATUS.md`.

## 6. Analytics and the waitlist (new disclosures)

- The privacy draft's own checklist asks to confirm the marketing site adds no analytics before publishing. With PostHog cookieless (D-06): draft `/cookies`; add a "Marketing site" row to the data map; state that the only cookie is the admin session cookie (strictly necessary); no Google Analytics or advertising tags.
- The waitlist form collects email, optional persona and consent. Add a "Website and waitlist" section to the policy, a clear consent line on the form (stored verbatim per record), and an unsubscribe/deletion route (support email or the in-app path). Mark new wording `{{LEGAL_REVIEW: ...}}` until cleared. Collect no age or children's data.

## 7. Content QA for legal pages (S5 acceptance)

- [ ] Each route renders notice mode with `noindex` while any placeholder remains, and the full page otherwise.
- [ ] No `{{` appears in any rendered HTML in production (Playwright scans the DOM).
- [ ] `LEGAL_STRICT=1` blocks publish with placeholders (unit test on the hook).
- [ ] Review block above the first `---` of the privacy source is not imported (test on the importer).
- [ ] Version history lists only published versions; `/privacy/v/<x>` renders the exact body.
- [ ] Print stylesheet verified; links expanded.
- [ ] Footer EULA link present; copyright line without entity until confirmed.
