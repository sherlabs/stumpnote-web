**Effective date:** {{EFFECTIVE_DATE}}  
**Last updated:** {{LAST_UPDATED}}  
**Policy version:** {{POLICY_VERSION}}

StumpNote helps cricketers reflect on their game. This policy explains what we collect, why, who handles it, how long we keep it, and the choices you have. It covers the StumpNote player app (iPhone, Apple Watch, Android) and the StumpNote web app, and the StumpNote Coach and StumpNote Parent apps, which use the same accounts and backend.

We have tried to write this in plain language. If something is unclear, contact us at {{PRIVACY_CONTACT_EMAIL}}.

## 1. Who we are

StumpNote is operated by {{COMPANY_LEGAL_NAME}} (ABN/company number {{COMPANY_ABN}}), of {{COMPANY_ADDRESS}} ("StumpNote", "we", "us"). We are the controller of the personal information described here.

Privacy contact: {{PRIVACY_CONTACT_EMAIL}}.

## 2. The short version

- You write or speak journal entries about your cricket. We store them and use AI to find patterns and help you plan training.
- AI is provided by Google (Gemini and Google Cloud Text-to-Speech) and runs through our servers. The app asks your permission before any AI feature sends your data, and you can withdraw it any time in Profile, AI data sharing. AI can be wrong. It is not medical advice.
- Health data from Apple Health or Health Connect is optional and only used if you allow it. The Apple Watch app saves your workouts and heart rate to Apple Health.
- Coaches, captains and parents only see what the sharing rules and your choices allow.
- We do not sell your personal information. We do not use it for advertising and we do not track you across other companies' apps or sites.
- Young players are protected by an age gate, guardian-managed profiles and extra safeguards (section 8).
- You can delete your account inside the app.

## 3. What we collect

### 3.1 Information you give us

- **Account details:** email address, name, sign-in method. If you use Sign in with Apple or Google we receive the identifier and the name and email that Apple or Google share with us. Apple may give us a private relay email address.
- **Age:** a date of birth (entered at sign-up, used to apply the age gate) and, in the profile, birth year or date of birth. A guardian creating a managed profile supplies the child's name and birth year.
- **Profile and cricket information:** playing role, batting and bowling style, age group, team and league details, goals and focus areas, drills, training and game plans, scorecards, opposition notes.
- **Journal content:** match and training entries, notes, reflections, mood and confidence check-ins, game-day notes, readiness answers, and injury or condition records you log.
- **Voice recordings:** audio you record in the app for journal entries, mood check-ins, game-day notes, coach-session notes, playbook dictation or profile setup. We store the audio where a feature needs it and a transcript derived from it.
- **Photos and videos:** video clips you record or upload, and images such as scorecard screenshots. The app can also save watermarked session videos to your photo library when you ask it to.
- **Team and coaching information:** teams you join or manage, roles (player, captain, vice-captain, coach, guardian), invites, squad and match plans, coach notes you write about players you coach, and private feedback.
- **Questions you ask the AI coach** and the answers returned.

### 3.2 Health and fitness information (optional)

If you grant permission, the app reads from Apple Health (iPhone) or Health Connect (Android): sleep, heart rate, resting heart rate, heart-rate variability, step count, active energy, walking/running distance, body weight, respiratory rate, blood oxygen, and workouts. On Android the app also declares permission for body temperature, VO2 max and exercise sessions. We use daily summaries to estimate readiness and recovery. These are stored in your account.

**Apple Watch app.** When you record a session on the watch, the watch starts a workout, reads live heart rate and active energy, and measures wrist motion to detect swings and bowling actions. A finished workout (with its duration, heart rate and active energy) is **saved to Apple Health**, so it shows in Fitness and Health. Very short or cancelled sessions are discarded. A summary of the session (discipline, wrist side, timing and motion-derived metrics, device model) is sent to your StumpNote account.

You can revoke Health permissions at any time in iOS Settings or Health Connect. Derived values already stored stay until you delete them or your account.

Using health data in AI context is controlled by a profile setting, off by default for minors. Device health data is never used as AI context for guardian-managed child accounts.

### 3.3 Purchases

If you subscribe, Apple (or Google) handles payment. We and RevenueCat receive your subscription status, product, entitlements and purchase history, linked to your StumpNote user ID. We never receive your card details.

### 3.4 Device and technical information

- **Push notification tokens** (iOS, Android or browser) stored with your user ID, platform and app variant, if you allow notifications.
- **Analytics (adult accounts):** screens viewed, feature usage events, app version, device and operating system type, and an identifier tied to your account, collected by Firebase Analytics (Google). This is switched off by default and is not collected for managed, under-18 or junior accounts.
- **Service logs and metering:** per AI request, the feature name, model, token counts, a computed cost and your user ID; monthly counts of video uploads and voice transcriptions for plan limits; and request logs for debugging and abuse prevention. These record counts and sizes, not the content of your entries.
- **Consent records:** when a guardian consents or re-consents, we store the policy version, type of consent and time.

### 3.5 What we do not collect

We do not collect precise or coarse location, contacts, phone numbers, financial or card details, advertising identifiers, or browsing history from other apps or sites. We do not run advertising SDKs. We do not use crash-reporting SDKs.

## 4. How we use your information

| Purpose                  | Examples                                                                                                                                 |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Provide the app          | Store your journal, clips and plans; show insights; sync between devices; run teams and coach sharing                                    |
| Personalise AI           | Build a compact "player memory" summary (form, patterns, mood trend, injuries, optional readiness) so insights, drills and plans fit you |
| Voice and video features | Transcribe voice entries, analyse technique clips, generate spoken Mindset sessions                                                      |
| Readiness and recovery   | Combine optional health data with check-ins to estimate readiness                                                                        |
| Subscriptions            | Verify entitlements and manage limits                                                                                                    |
| Notifications and alerts | Reminders, coach and team events, guardian alerts about injuries or mood check-ins that a guardian is permitted to see                   |
| Safety and security      | Prevent abuse, enforce plan limits, protect minors, respond to crisis language in mood support by showing support resources              |
| Improve the app          | Aggregate analytics for adult accounts, debugging                                                                                        |
| Legal                    | Comply with law, resolve disputes                                                                                                        |

Legal bases where GDPR or UK GDPR applies: contract (providing the app), consent (health data, AI processing of your content, analytics, notifications), legitimate interests (security, fair-use limits, improving the product) and legal obligation. {{LEGAL_REVIEW}}

## 5. Who processes your information (sub-processors)

We use these providers to run StumpNote. Each only receives what it needs.

| Provider                                         | What for                                                                        | Data involved                                                                                   | Location                                    |
| ------------------------------------------------ | ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------- |
| **Supabase** (on Amazon Web Services)            | Database, authentication, file storage, server functions                        | All account, profile, journal, audio, video, health-summary, team and consent data              | South Asia (Mumbai, India)                  |
| **Google Cloud: Gemini API**                     | AI analysis, insights, transcription, structured extraction, technique analysis | Text, audio, images and video you submit to AI features, plus the compact player-memory summary | Google infrastructure; may be outside India |
| **Google Cloud Text-to-Speech**                  | Spoken Mindset audio and voice previews                                         | Text of scripts generated for you                                                               | As above                                    |
| **Google Firebase Analytics**                    | Product analytics (adult accounts only)                                         | Usage events, device/OS, app version, account identifier                                        | Google infrastructure                       |
| **Google Firebase Cloud Messaging**              | Delivering push notifications                                                   | Device push token, notification content                                                         | Google infrastructure                       |
| **Google Sign-In / Sign in with Apple**          | Optional login                                                                  | Identifier, name and email you choose to share                                                  | Google / Apple                              |
| **RevenueCat**                                   | Subscription status and entitlements                                            | User ID, purchase and subscription records                                                      | RevenueCat infrastructure (US)              |
| **Apple** (App Store, HealthKit on device, APNs) | Billing, health source, notifications                                           | Handled by Apple under its own policies                                                         | Apple                                       |
| **Google Play and Health Connect**               | Android billing and health source                                               | As above                                                                                        | Google                                      |
| **Vercel**                                       | Hosting the StumpNote web app                                                   | Standard web request logs (IP address, browser)                                                 | Vercel infrastructure                       |
| **Stripe (via RevenueCat Web Billing)**          | Web card payments. **Future: only if web billing is switched on**               | Payment handled by Stripe; we receive status only                                               | Stripe                                      |

{{LEGAL_REVIEW: confirm each provider's data processing terms, transfer mechanism and sub-processor list.}}

We share information with a service provider only to operate the app, with a coach, captain or guardian only as described in section 7, with authorities when the law requires it, and in a sale or restructure of our business with notice to you. We do not sell your personal information and we do not share it for cross-context behavioural advertising.

## 6. AI processing

- **What goes to AI.** Nothing is sent to an AI provider until you allow it in the app's AI consent sheet (and you can withdraw in Profile, AI data sharing). When you use an AI feature, our servers send the relevant content (your text, audio, images or video) and a compact summary of your profile to Google's Gemini API, and for spoken sessions the script text to Google Cloud Text-to-Speech. Calls are made from our backend, not directly from your phone, and logged by us for cost and abuse control.
- **Consent.** Before clips or journal-based AI features are used, the app shows a consent sheet that says what is sent. You can decline and keep using the non-AI parts of the app.
- **Player memory.** To make AI personal, we maintain cached summaries of your cricket: form, patterns, mood and confidence trends, injuries or conditions, goals, and, only if you enable it, health-derived readiness. Teams have an equivalent summary. These are deleted with your account.
- **AI can make mistakes.** Insights, plans, drills and transcriptions may be wrong, incomplete or out of date. They are guidance for reflection and training. **They are not medical, psychological or professional advice.** If you are injured or unwell, see a qualified professional. If you feel unsafe, contact local emergency services or a helpline. Mood support shows support resources when it detects distress.
- **Safeguards.** Mindset and playbook scripts are checked by deterministic rules (for example, no breath-holding, no outcome promises, no diagnosis). Drills respect your logged injuries. Younger players get age-appropriate guidance and bowling-load limits, and AI never asks juniors about alcohol.
- **No automated decisions with legal effect.** AI output is advisory. You decide what to act on.
- **Training and retention by AI providers.** We do not sell your content. We do not allow our providers to use your content for their own advertising. Whether Google uses API content to train its models, and how long it retains it for abuse monitoring, depends on Google's terms for the tier we use; we will describe this precisely once confirmed. {{LEGAL_REVIEW: verify Google's data-use and retention terms for the Gemini API tier in use before stating any no-training commitment.}} We do not currently use your content to train our own models. If that changes we will tell you first and ask for any consent required.

## 7. Sharing with coaches, captains, teams and guardians

Nothing is shared by default beyond the rules below. Access is enforced in our database, not just in the app.

- **Coaches.** A coach you accept (or who accepts you) can view the player data relevant to coaching you, such as journal insights, plans and watch sessions. Coach-triggered AI features use the player's data. Links need acceptance and can be ended.
- **Captains and team members.** Team features show team-related information to members and the captain as needed (squad, match plans, team insights).
- **Team pulse.** Team readiness and watch "pulse" views are aggregates. Below three tracked players only banded ranges are shown, never exact per-player figures, and no individual's value leaves the pulse function.
- **Guardians (parents).** A guardian linked to a young player sees three groups of information, each with its own switch: cricket, wellbeing and growth. These default to on. Only the player can change them, and not while the account is guardian-managed. A guardian can end a link. Guardians receive alerts after an injury log or mood check-in, subject to those switches, opt-outs and quiet hours. A child's private wellbeing entries are not shown if wellbeing sharing is off.
- **Everyone else.** Other users cannot see your entries, clips, health data or AI summaries.

## 8. Children and young people

- **Age gate.** Before any account is created (email, Apple or Google), a neutral date-of-birth screen runs. People under 13 cannot create their own account, and we collect no identity or email from them at that point. The minimum age for a self-managed account is 13.
- **Guardian-managed profiles (under 18).** A parent or guardian can create a managed profile for a child (up to 10 children) in the StumpNote Parent app, attesting that they are the child's guardian. We record that consent with the policy version. The guardian governs the account: they can review, correct, export and delete the child's data and withdraw optional consents. We rely on the guardian's attestation. {{LEGAL_REVIEW: verifiable parental consent method.}}
- **Linking an existing player.** A teen can invite a guardian to link. Players aged 13 and over who were guardian-managed take over their own account on claiming it; younger children stay under guardian governance.
- **Re-consent.** When this policy changes materially, guardians are asked to re-consent in the Parent app.
- **Junior protections.** For managed, under-18 and junior accounts: analytics is off; device health data is excluded from the profile and from AI context; heart-rate-derived AI lines require a setting that is off by default for minors; AI uses age-appropriate language, applies bowling-load limits and never asks about alcohol; Mindset personalisation stays off until the guardian turns it on; we do not use children's content for advertising, to sell, or to train our own models.
- **Parent-operated devices.** If a child's account is used on a parent's phone, the phone's Health data belongs to the parent and is never used for the child.
- **Coaches and clubs.** A coach or club that manages a junior player's information must hold appropriate parental authority. The guardian keeps the rights above.

## 9. Retention and deletion

- **While your account exists** we keep your data so the app works.
- **Delete account.** In the player app go to {{DELETE_ACCOUNT_PATH}}. In StumpNote Coach use Home, Account, Delete account; in StumpNote Parent use Settings, Delete account. Deletion is immediate in our active systems. It removes your profile, journal entries, transcripts, coach notes, goals, plans, clips, thumbnails and reels, voice-note audio, Mindset audio, watch sessions, health summaries, AI chat history, player memory (summaries, weakness analyses, daily briefs, search embeddings), subscriptions records held by us, push tokens, consent-linked profile data, and your sign-in. Storage files are removed on a best-effort basis alongside the database rows. Health data the Apple Watch app already saved to Apple Health is yours and is not removed with your StumpNote account: delete it in the Health app. Deleting a guardian account also deletes the child profiles that guardian created and manages alone; a child with their own sign-in, or who is also linked to another guardian, keeps their data and only that guardian's link ends.
- **Backups.** Encrypted backups may hold copies for up to {{BACKUP_PURGE_DAYS}} days before they expire.
- **Processors.** We instruct our processors to delete data they hold for us. Apple and Google keep their own records under their own policies (for example, purchase records and data in Apple Health on your device, which our deletion does not touch).
- **Anything kept longer.** Limited records we are required to keep for tax, accounting, fraud prevention or legal claims, and de-identified usage and cost metering. AI usage and request logs are kept for up to {{USAGE_LOG_RETENTION}}.
- **Analytics.** Firebase Analytics data is kept for the retention period configured in our Firebase project (up to 14 months) {{LEGAL_REVIEW: confirm configured retention}}.
- **Health data.** Disconnecting Health stops further collection. Values already synced remain until you delete them or your account.
- **Cannot sign in?** Email {{PRIVACY_CONTACT_EMAIL}}. A guardian can request deletion of a managed child's profile the same way.

## 10. Your rights

Depending on where you live (including under the Australian Privacy Act 1988 and its Australian Privacy Principles, the GDPR and UK GDPR, and the California Consumer Privacy Act), you may have the right to:

- access the personal information we hold about you;
- correct it (most of it you can edit in the app);
- export it in a usable form;
- delete it (in the app, or by email);
- object to or restrict some processing, including profiling by player memory (we will reset it on request);
- withdraw consent at any time (for health, AI processing, notifications or analytics) without affecting earlier processing;
- not be discriminated against for exercising your rights; and
- complain to your privacy regulator. In Australia that is the Office of the Australian Information Commissioner (oaic.gov.au); in the EU/UK, your local data protection authority.

To use a right, email {{PRIVACY_CONTACT_EMAIL}}. We will verify your identity (a guardian for a managed child) and reply within the time the law requires, normally 30 days. {{LEGAL_REVIEW: confirm for each jurisdiction served.}}

## 11. Security

- Traffic between the app, our servers and our providers uses TLS (HTTPS).
- Data and files stored in Supabase are encrypted at rest by the platform.
- Sign-in uses signed tokens. Database access is controlled by row-level security so each user reaches only their own records, plus data deliberately shared as described in section 7.
- Video clips and Mindset audio are stored in private buckets and served through time-limited signed links.
- No system is perfectly secure. If a breach affecting you occurs we will notify you and regulators as the law requires.

## 12. International transfers

Our primary database and files are in Mumbai, India. Our providers (Google, RevenueCat, Firebase, Vercel, Apple) operate globally, including in the United States, and you may use StumpNote from anywhere. Where the law requires, we rely on appropriate safeguards such as standard contractual clauses or equivalent terms with these providers. For Australian users, we take reasonable steps under APP 8 to make sure overseas recipients handle information consistently with the APPs. {{LEGAL_REVIEW}}

## 13. Cookies and the web app

The StumpNote web app does not use advertising cookies. It uses browser storage (local storage and, if you enable browser notifications, a service worker and a push token) to keep you signed in, remember settings and deliver notifications you opt into. Hosting providers log standard request information (IP address, browser type) for security and reliability. Firebase Analytics runs in the web app for adult accounts as described in section 3.4. You can clear site data and block notifications in your browser at any time. {{LEGAL_REVIEW: confirm web analytics and cookie-consent requirements for EU/UK visitors.}}

## 14. Changes to this policy

We may update this policy. We will post the new version here with a new "Last updated" date. For material changes we will tell you in the app, and ask guardians of managed children to re-consent.

## 15. Contact

{{COMPANY_LEGAL_NAME}}, {{COMPANY_ADDRESS}}
Email: {{PRIVACY_CONTACT_EMAIL}}
Governing law: {{GOVERNING_LAW}}

---

## Appendix A: Data map

| Data                                                                                                         | Where stored                                                                 | Processors                                                                                    | Purpose                                       | Retention                                                              |
| ------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------- | ---------------------------------------------------------------------- |
| Email, name, sign-in identifiers                                                                             | Supabase Auth                                                                | Supabase; Apple or Google if used to sign in                                                  | Account, sign-in, support                     | Until account deletion                                                 |
| Date of birth / birth year, age group, guardian link                                                         | Supabase Postgres                                                            | Supabase                                                                                      | Age gate, minor safeguards, guardian features | Until account deletion                                                 |
| Cricket profile, goals, plans, drills, scorecards                                                            | Supabase Postgres                                                            | Supabase; Google Gemini when AI features run                                                  | Core features, personalisation                | Until account deletion                                                 |
| Journal entries, mood and readiness check-ins, injury/condition records                                      | Supabase Postgres                                                            | Supabase; Google Gemini (insights)                                                            | Reflection, insights, readiness               | Until account deletion                                                 |
| Voice recordings and transcripts                                                                             | Supabase Storage and Postgres                                                | Supabase; Google Gemini (transcription)                                                       | Voice journaling, coach notes                 | Until deleted or account deletion                                      |
| Video clips, thumbnails, reels, scorecard images                                                             | Supabase Storage                                                             | Supabase; Google Gemini (analysis)                                                            | Technique review                              | Until deleted or account deletion                                      |
| Mindset audio and scripts                                                                                    | Supabase Storage and Postgres                                                | Supabase; Google Gemini; Google Cloud TTS                                                     | Guided sessions                               | Until deleted or account deletion                                      |
| AI player memory (summaries, weakness analyses, daily briefs, embeddings)                                    | Supabase Postgres (dossier and analysis tables)                              | Supabase; Google Gemini (embeddings and generation)                                           | Personalised AI                               | Until account deletion or reset on request                             |
| Ask-the-coach questions and answers                                                                          | Supabase Postgres                                                            | Supabase; Google Gemini                                                                       | AI coach                                      | Until account deletion                                                 |
| Health summaries (sleep, HR, HRV, steps, energy, distance, weight, respiratory rate, blood oxygen, workouts) | Source: Apple Health / Health Connect on device. Daily summaries in Supabase | Supabase; Google Gemini only if you allow health in AI context and the account is not a minor | Readiness and recovery                        | Until disconnect and delete, or account deletion                       |
| Watch workout and heart rate                                                                                 | Apple Health on device and watch; session summary in Supabase                | Apple; Supabase                                                                               | Training load, swing metrics, Fitness rings   | Apple Health: your device. Supabase: until deleted or account deletion |
| Team, squad, coach links, notes                                                                              | Supabase Postgres                                                            | Supabase                                                                                      | Team and coaching features                    | Until account deletion or link removed                                 |
| Guardian sharing switches, notifications, consent ledger                                                     | Supabase Postgres                                                            | Supabase                                                                                      | Guardian features, consent proof              | Until account deletion {{LEGAL_REVIEW: consent ledger retention}}      |
| Subscription status and purchase history                                                                     | RevenueCat; subscription tables in Supabase; Apple/Google                    | RevenueCat; Apple; Google                                                                     | Entitlements and billing                      | Until account deletion; Apple/Google keep their own records            |
| Push tokens (platform, app variant)                                                                          | Supabase                                                                     | Google FCM; Apple APNs                                                                        | Notifications                                 | Until sign-out removal, token refresh, or account deletion             |
| Analytics events and account identifier (adult accounts only)                                                | Firebase Analytics                                                           | Google                                                                                        | Product analytics                             | Per Firebase setting {{LEGAL_REVIEW}}                                  |
| AI usage and metering logs                                                                                   | Supabase                                                                     | Supabase                                                                                      | Cost, fair-use limits, abuse prevention       | Up to {{USAGE_LOG_RETENTION}}                                          |
| Request logs                                                                                                 | Supabase                                                                     | Supabase                                                                                      | Debugging, security                           | Up to {{USAGE_LOG_RETENTION}}                                          |
| Web request logs                                                                                             | Vercel                                                                       | Vercel                                                                                        | Hosting and security                          | Per Vercel retention                                                   |
