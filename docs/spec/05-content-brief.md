# 05 Content brief: positioning, copy, FAQ, pricing, claims policy, SEO

Index: [README.md](./README.md). Everything in this file is publishable: it may be seeded into the CMS and rendered on the site. Where a claim is worded cautiously, the reason is "per internal review" and is not recorded here. Executed in S3 (home copy) and S4 (seed).

Sources (private repo, read-only, `origin/main` on 2026-10-04): the feature library `docs/features/*`, the subscription model doc, the privacy policy and terms drafts, the support doc, the Set A design docs.

## 1. Status vocabulary (the only four labels allowed on the site)

| Label | Meaning | Applies to |
|---|---|---|
| **Available now (web)** | Publicly reachable at https://app.stumpnote.com | Web app |
| **In the beta** | On the main branch of the app, reaching testers through TestFlight | Most features |
| **Preview** | Built, not hardware-verified | Apple Watch capture |
| **Coming soon** | Not yet released | Game-day readiness loop, Mindset focus player and takeaways, quick-log shortcut, "works for you" pattern cards, prep nudges, iOS push, 3D technique stage |

All three iOS apps are TestFlight-only. Nothing is on the App Store. "Shipped" in the product docs does not prove a build reached testers, so the site never says "available" for iOS.

## 2. Positioning

**One promise.** StumpNote builds a memory of each player that keeps learning, so every action (a brief, a drill, a game plan, an answer) is about that player.

**Category.** A voice-first cricket journal with an AI that remembers your game. Not a stats scorer, not a fixture app, not a generic chatbot.

**Hero sub-copy.**
> Talk for a minute after a session. StumpNote turns it into a journal entry, then uses everything you have logged (form, habits, injuries, goals, how you felt) so every brief, drill, plan and answer is about your game, not cricket in general.

**Differentiators (each backed by a product doc):**
- Figures are computed by the app or database. The AI only picks which numbers to show; it never writes them.
- Strengths-first framing: "focus area" and "growth edge", never "weakness" or "flaw" in AI output.
- Progress is measured from your own logged innings, with honest "still measuring" states. A focus area graduates only when the numbers show it.
- Consent and sharing are explicit. A coach link stays pending until the player accepts. Guardians see three separately switchable groups.
- One account serves player, captain, coach and parent roles.

**Problem line (home chapter 2, approved):** "Most post-match thoughts are gone by Tuesday." It is a rhetorical line, not a statistic; never attach a number to it.

**Taglines.** 1. **Your cricket, remembered.** (preferred) 2. Talk it out. Play it better. 3. The journal that learns your game.
Do not use "cricket brain", "never repeat a mistake" or "win weekends".

**Meta description (< 155 chars):** "StumpNote is a voice-first cricket journal. Talk after a session, get a personal brief, drills and game plans built from your own history."

**App Store subtitle (consistent):** "Voice-first cricket journal".

## 3. Value props by persona

| Persona | Headline | Proof points |
|---|---|---|
| Player | A minute of talking. A season of insight. | Voice entries with a review step. An AI read on every entry. A daily focus. Measured goals. Confidence bank. Mindset audio. Ask Coach grounded in your own sessions. |
| Captain / vice | Plan like you do on paper, with a squad that is not all on the app. | Name-only squad members. Private captain notes. Manual-first game plan (voice and AI optional). Field editor, IF/THEN contingencies, live over stepper. Team insights. Captain pays, members free. |
| Team member | Your role, your match card, no extra bill. | Joins by invite link. Free team access under the captain's plan. A personal match card with your overs and field. Own private journal. |
| Coach | Turn a voice memo into a session plan. | Coach mode is free for the coach. Roster and player detail. Voice session notes become structured sessions. Plans, drills and programs. Squad insights. The coach sees only what the player accepts and shares. |
| Parent / guardian | Support your junior without surveilling them. | Create a managed profile, or link a teen by invite. Recorded consent. Alerts for injuries and low-mood patterns, within the sharing switches. Private wellbeing entries stay private when that switch is off. A claim path when the child turns 13. |

Team members and coaches ride free on a captain's or player's plan. Creating a team and planning by hand are free on every tier. Free coach limits: one team and 12 active consented members.

## 4. Feature copy (22 blocks)

Format: **Title** · status · benefit · bullets · how it works · illustrative scenario (fictional personas; label visible). Copy rules are seed-time reminders for editors.

**1. Voice journal** · In the beta
- Benefit: Talk for a minute and get a structured entry instead of filling in a form.
- Captures runs, balls, dismissal, what went right and wrong, plus sleep, soreness and mood if you mention them. A review screen shows what was heard before anything is saved. At most a short follow-up or two for anything essential that is missing.
- How: Record, review, save. The entry opens and its AI read starts on its own.
- Scenario: Aarav says "Made 34 off 41, caught at cover, six overs for 1 for 28, slept badly." He checks the figures and saves.
- Rule: "about a minute of talking" is the design target, not a measured saving.

**2. AI read on every entry** · In the beta
- Benefit: A debrief without writing one.
- A verdict, a short takeaway and an analysis per discipline with an up/steady/down grade. Checks whether the playbook rules you tried worked, with a line of evidence. A suggested next-session drill.
- How: Every saved entry is analysed against your history, so the read cites your own numbers.
- Scenario: Meera corrects a 28 to 38 and the read re-runs so the verdict matches.

**3. A memory that keeps learning** · In the beta
- Benefit: Log once. Every feature knows.
- Role, styles, strengths, goals, injuries and mood feed one profile. Private conditions stay private; coaches never see what you did not share. You can set the profile up by voice.
- How: Everything you log is folded into a compact summary that each AI feature reads.
- Scenario: Priya graduates a focus area. Later advice builds on it instead of repeating it.
- Rule: say "memory" and "profile"; never "trained on your data".

**4. Ask Coach** · In the beta
- Benefit: Questions answered from your own history, not a textbook.
- Technique answers give likely causes, a fix, one drill and one mental cue. Rules and stats questions get short answers; figures are attached by the app. Suggested next steps become goals only after you review them.
- How: Type or speak a question. Answers draw on your form and the most relevant past sessions.
- Scenario: Rohan asks "why do I keep getting out early?" and gets an answer tied to his own dismissals.

**5. Daily brief and today's focus** · In the beta
- Benefit: One thing to work on today, not a dashboard.
- A single focus, what moved since last time, and a win quoted from your own notes. Real numbers only. A friendly nudge instead of invented content when you are new.
- How: Open Home and tap the focus for the full brief and earlier days.
- Scenario: Aarav's Monday focus reads "Play inside the box", from his caught-behind pattern.

**6. Measured goals and focus areas** · In the beta
- Benefit: Progress you can trust.
- Targets such as "500 season runs by 31 March", with milestone dots. Focus areas are measured from your innings; nothing is shown until there is enough data. Graduation, with a notification when you beat one.
- How: Set a target. Progress recomputes after every log.
- Scenario: Priya's "bowled" focus area graduates after enough usable innings show a clear improvement.

**7. Confidence bank** · In the beta
- Benefit: Your own proof, ready before the big day.
- Every "went right" note you logged, newest first, filterable by discipline. Fills itself from normal entries. Built only from your own words.
- How: Log as usual. Open the bank the night before a final.
- Scenario: Aarav rereads five batting wins from the last month.

**8. Insights and trends** · In the beta
- Benefit: What is actually happening across your season.
- Where your runs come from, last 5 versus previous 5, and a season read. Dismissal patterns with evidence counts (such as "5 of 11 dismissals"). A line-and-length heat grid for bowlers and batters.
- How: Four tabs: Overview, Focus areas, Trends, Weaknesses. Charts appear only when there is real data.
- Scenario: A bowler's danger map flags the costliest phase.
- Rule: the "works for you" pattern cards are Coming soon.

**9. Mindset Coach** · In the beta
- Benefit: A short spoken routine for the moment it matters.
- 1 to 5 minute sessions built around one problem you raised. The transcript is always available; audio never starts without a tap. Labelled "Created by StumpNote AI. AI can make mistakes. Not medical or psychological advice."
- How: Pick a focus, press play, listen on the bus.
- Scenario: Before a game Aarav plays "Trust your first ten balls".
- Rule: English only. For managed children, personalisation stays off until a guardian turns it on. Say "wellbeing" and "mindset", never "therapy".

**10. Playbooks and match-day prep** · In the beta
- Benefit: The right format for the moment.
- Cues, visualisations, tactical plans and routines in one library. A 5 to 10 minute prep flow assembled by rules, so it is instant and explainable. Coach suggestions arrive as suggestions and wait for your agreement.
- How: Tap "Prep for this match". Afterwards, mark what helped.
- Scenario: Priya skips the rehearsal on the bus and runs the routine at the ground.

**11. Training, drills and bowling plans** · In the beta
- Benefit: Practice aimed at a tracked weakness.
- Daily no-equipment drills, a weekly plan and rep-tracked guided net sessions. A curated library of 60 bowling plans, filterable by style and phase. Drills respect your logged injuries.
- How: Open Training. Tap Success, Edge or Miss per rep. The summary reads like "84 reps, 71% success".
- Scenario: A left-arm spinner saves a "vs set batter, middle overs" plan to the playbook.
- Rule: say "60 plans" only while the dataset stays at 60.

**12. Clips and video analysis** · In the beta
- Benefit: A second opinion on technique, anywhere.
- Technique points, a rating and a pitch map for bowling. Findings roll up into your weakness insights. Reels of up to 8 clips for sharing.
- How: Attach a clip to an entry or the Video Hub. Allow AI when the app asks. Run analysis.
- Scenario: Three clips flag "head over ball" and it shows in Aarav's weakness view.
- Rule: "AI feedback from one camera angle. It is not coaching." Never claim automatic trimming.

**13. Season Story** · In the beta
- Benefit: A shareable season recap with no work.
- Swipeable cards with one big number each, shareable as an image. "Proof" cards use measured before-and-after numbers. A team version for awards night.
- How: Unlocks at 8 logged sessions. Regenerate any time.
- Scenario: Meera shares her wickets card to the team chat.

**14. Conditions and wellbeing check-ins** · In the beta
- Benefit: Advice that respects how you actually are.
- Log injuries and illness and choose per item whether coaches can see them. Optional Apple Health snapshot. A quick mood and confidence check-in with an optional supportive reply.
- How: Log a condition. The next training plan avoids aggravating it.
- Scenario: Aarav logs a hamstring strain and his next drills are not sprint-heavy.
- Rule: "wellbeing check-ins", never "mental health tracking" or "treatment". Not medical advice. Do not mention crisis or helpline features in marketing copy at all (the support resources shown in the app are not worldwide); if the topic comes up, point to "talk to a professional or someone you trust".

**15. Game-day hub** · In the beta (readiness, plan and reflection loop: Coming soon)
- Benefit: Everything for match day in one place.
- Phase track from arrival to post-match, a toolbelt and moment notes. Voice-note a thought mid-match. Finish creates a draft journal entry.
- How: Open Gameday. Work through the phases. Tap Finish.
- Scenario: Rohan voice-logs "dropped a catch, shaking it off" between innings.
- Allowed teaser: "A 60-second readiness check-in and a plan that reflects how you slept and feel."

**16. Squad management** · In the beta
- Benefit: Plan for all eleven without waiting for everyone to install the app.
- Name-only squad members who can link to a real profile later. Invite links that expire after 72 hours. Private captain notes. Roles for captain, vice-captain and coach.
- How: Create a team. Add names. Invite those who use the app.
- Scenario: Sam adds 14 names and invites four.

**17. Manual-first game plan** · In the beta
- Benefit: Plan like you do on paper, then speed it up if you want.
- Phase fields, a bowler-by-phase matrix, batting order, matchups and notes. Warnings warn and never block. Voice and AI suggestions are optional proposals you accept or drop.
- How: Start from scratch or copy a past plan. The plan stands without any AI.
- Scenario: Sam builds a T20 plan with no mic and no AI.
- Pricing note: building a plan by hand is free. The AI helpers belong to the Team plan.

**18. Match-day live mode and fields** · In the beta
- Benefit: The plan's own words, at over nine.
- Drag-and-snap field editor with rule hints. IF/THEN contingencies that jump to the top of Live mode when they fire. A voice Live Coach that answers using your plan.
- How: Step through the overs. A fired contingency comes first.
- Scenario: "If two left-handers are in and 3 boundaries come in 2 overs, then Kunal on."

**19. Team insights and squad pulse** · In the beta
- Benefit: Turn match logs into a short list of team focus areas.
- Growth points with an improved, same or regressed record. Opposition scouting. A squad pulse that never exposes an individual; below three tracked players it shows only bands.
- How: Log a result. Insights follow.
- Scenario: "Top-order collapse in overs 4 to 8" appears with its source matches.

**20. StumpNote Coach app** · In the beta
- Benefit: Less admin, richer notes.
- Roster, player detail, session plans, drills and programs. Speak a session note and it is extracted into a structured session the player sees. Squad tab and match-day banner.
- How: Invite a player. They accept. Nothing is readable before that.
- Scenario: Coach Mehta speaks "worked on front-foot defence, head falling over, set two drills".

**21. StumpNote Parent app** · In the beta
- Benefit: Stay in the loop without reading their diary.
- Create a managed profile for your child or link a teen by invite. Guardian consent recorded, with re-consent when the policy changes. Three sharing switches: cricket, wellbeing and growth.
- How: Attest as guardian. The child's profile is created and consent recorded.
- Scenario: Anil is told "Maya logged an injury". A routine soreness does not alert.
- Rule: describe safeguards as "age-aware", never "fully protected".

**22. Web app** · Available now (web)
- Benefit: One login, desktop-grade layouts for coaches and parents.
- Player, coach and parent in one app with a role switcher. Wide master-detail layouts. Honest fallbacks: watch and some video tools are mobile-only.
- How: Open app.stumpnote.com and sign in.
- Scenario: Coach Rahul reviews a roster on a laptop.
- Rule: web purchases are not offered; plans are read-only on the web. Verify sign-up is open before launch.

**Preview and Coming soon strip** (no full blocks): Apple Watch capture (Preview: "wrist-based swing and bowling metrics, in preview"; no speed numbers, never km/h). Coming soon: readiness check-in and personal plan, Mindset live transcript and pinned takeaways, quick-log shortcut, "works for you" patterns, match-eve prep nudges, 3D technique stage. Notifications: mention only the in-app inbox.

## 5. Claims policy (enforced in content QA)

1. No medical, psychological or performance guarantees. Banned: "diagnose", "treat", "cure", "therapy", "clinically proven", "injury prevention", "guaranteed", "score more runs", "reduce injuries", "win more", "improve your average by X%". Allowed: "helps you reflect", "built for training and reflection", "aimed at your tracked weakness".
2. Required disclosure on every AI surface: "AI can make mistakes. Not medical or psychological advice." Footer: "AI-generated insights are guidance for reflection and training."
3. Time-saving claims are design targets: "designed to", never "saves X minutes".
4. AI consent wording: "the app asks your permission before AI features send your data, and you can withdraw it in Profile". Never "enforced" or "guaranteed".
5. Training-on-data: "We do not sell your data. We do not use your content to train our own models. Our AI provider's data-use terms apply." Do not write "never used to train AI" until the user confirms the provider billing tier and a lawyer clears it.
6. Juniors: allowed: age gate (13+ self sign-up; under-13 profiles guardian-managed), guardian consent records, three sharing switches, no ads, analytics off for child accounts, health-device data excluded from child AI context. Banned: "fully safe for kids", "COPPA compliant", "Kids Category", "child-safe AI".
7. Languages: "English" only. Never "any language" or a list of languages.
8. Availability: "Coming soon to the App Store", "Join the TestFlight beta". No Google Play or Android claim. Write "the App Store", never "Apple App Store". No App Store badge until live (Apple provides no coming-soon or TestFlight badge).
9. Numbers: no user counts, match counts, country counts or ratings. Do not reuse any legacy-site figures.
10. Privacy: never "private by design" as an absolute; say only what the policy says.
11. No competitor claims; never "replaces your coach".
12. Screenshots: fictional demo data only; no real names, emails or ids.
13. Contact: only `SUPPORT_EMAIL` / `PRIVACY_CONTACT_EMAIL` when set; otherwise "via the app: Profile → Help".

## 6. Pricing copy (D-14; CMS-toggleable)

Heading "Plans". Every price carries: *"Indicative. Final prices are shown in your local currency in the app before you subscribe. Subscriptions are managed through the App Store."*

| Plan | Indicative | What it adds |
|---|---|---|
| Free | $0 | 4 journal entries a month, basic dashboard, create teams and plan by hand |
| Player | $2.99/mo | Unlimited voice and manual entries, 10 video uploads a month, full insights, wellbeing check-ins, training planner and playbook |
| Pro Player | $4.99/mo | Everything in Player, 30 video uploads a month, priority video processing, advanced analytics |
| Team | $12.99/mo | Everything in Pro plus the game-plan AI helpers. The captain pays and members get team access free |
| Coach add-on | $6.99/mo | Lets a player enable coaching. The coach uses coach mode free |
| Team / Academy Coach | $19.99/mo | Lifts coach scale limits |

Lines: "Free tier works for real: 4 entries a month." "We never delete your data when you downgrade." "A 90-day trial gives Player-level access." (trial line is CMS-toggleable; show only if still true at launch). No buy or subscribe button. Link to Terms section on subscriptions and to Apple's standard EULA. Do not mention child plans. Use "Pro Player", not "Players Pro".

## 7. FAQ (20)

1. **What is StumpNote?** A voice-first cricket journal. You talk after a session, it structures the entry, and AI uses your history to give you a daily focus, drills, plans and answers about your game.
2. **Is it available now?** The web app is live at app.stumpnote.com. The iPhone apps are in TestFlight beta and are coming to the App Store. Join the beta or the waitlist.
3. **Which devices?** Web today. iPhone and Apple Watch (preview) are in beta. We have not announced Android availability.
4. **Does the AI send my journal to someone?** Only after you say yes. The app asks before an AI feature sends data to Google (Gemini, and Google Cloud Text-to-Speech for spoken sessions). You can withdraw in Profile, AI data sharing.
5. **Is my data used to train AI?** We do not sell your data, and we do not use your content to train our own models. How our AI provider treats API content depends on its terms. See the Privacy Policy.
6. **Is this medical advice?** No. StumpNote is for reflection and training. AI can make mistakes. If you are injured or struggling, talk to a professional or someone you trust.
7. **Can my coach or parent read my journal?** Only what the sharing rules and your choices allow. A coach link stays pending until you accept. Guardians see three groups you control.
8. **Can I use it without voice?** Yes. You can create entries manually with the detailed form.
9. **What if I have not logged much?** Features show honest empty states. Some insights need a minimum amount of data.
10. **Does it work without a watch or Apple Health?** Yes. Health data and the watch are optional.
11. **How does the watch work?** The watch app records swings, deliveries and heart rate. It is a preview, and the speeds are wrist-motion measures, not bat or ball speed.
12. **What do I pay?** There is a free tier. Paid plans are monthly subscriptions through the App Store. See Plans for indicative prices.
13. **Do my teammates need to pay?** No. Team members added by a captain get team access free under the captain's plan.
14. **Do coaches pay?** The coach's 1-on-1 coach mode is free. A player can add a Coach add-on for themselves.
15. **Can I plan a match without AI?** Yes. Creating a team and building a game plan by hand are free. The AI helpers need the Team plan.
16. **My child is under 13.** A parent or guardian creates and manages the profile in the StumpNote Parent app. Self sign-up is 13 and over.
17. **What can parents see?** Three groups with their own switches: cricket, wellbeing and growth. A child's private wellbeing entries are not shown when wellbeing sharing is off.
18. **How do I delete my account?** In the app: Profile (avatar, top right), Account, Delete account. Coach: Home, Account, Delete account. Parent: Settings, Delete account. See the Account deletion page. Cancel any subscription with Apple first.
19. **Where is my data stored?** In our database and file storage hosted on Supabase (Mumbai, India). Some providers operate globally. See the Privacy Policy.
20. **How do I get help or report a bug?** Use the Support page. Include the app, your device and OS version, and what you were doing.

No FAQ about languages, Android, user numbers or "does it make me better".

## 8. Privacy summary (home chapter and `/security` header)

- You write or speak journal entries about your cricket. We store them and use AI to find patterns and help you plan training.
- AI runs through our servers using Google's services. The app asks permission before any AI feature sends your data, and you can withdraw it any time. AI can be wrong. It is not medical advice.
- Health data from Apple Health is optional. (The legal pages are rendered verbatim from the policy and may mention Android and Health Connect because the policy covers those code paths; do not repeat that in marketing copy, see claims policy 8.)
- Coaches, captains and parents only see what the sharing rules and your choices allow.
- We do not sell your personal information. We do not use it for advertising and we do not track you across other companies' apps or sites.
- Young players get an age gate, guardian-managed profiles and age-aware safeguards. (Never write "protected", "safe for kids" or "built for juniors first".)
- You can delete your account inside the app.

## 9. Social proof policy

No fabricated quotes, ratings, user counts, press mentions or logos (consumer-review rules prohibit fake or AI-generated testimonials). The `testimonials` collection requires `consentGiven`, `permissionDate` and `approved`; the homepage slot renders only when a consented, approved record exists. Fictional personas appear only inside labelled "Illustrative scenario" blocks. No testimonials about juniors without verified guardian consent. App Store rating widget stays off until live.

## 10. SEO

| Intent cluster | Page |
|---|---|
| cricket journal app; cricket diary app | `/`, `/features/journal` |
| cricket mental game; cricket mindset app; cricket confidence | `/features/mindset`, `/features/confidence-bank` |
| cricket coaching app; cricket player development | `/coaches` |
| cricket captain app; cricket game plan app; field placement planner | `/captains` |
| junior cricket app for parents; youth cricket development | `/parents` |
| cricket training app; cricket drills; bowling plans | `/features/training` |
| cricket batting analysis; cricket video analysis | `/features/clips` |
| cricket analytics app; cricket stats tracker | `/features/insights` |

Brand variants: "StumpNote", "Stump Note", "StumpNote Coach", "StumpNote Parent". Structured data: `Organization` (name only until the entity is confirmed), `SoftwareApplication` per app without `aggregateRating`, `offers` or `installUrl` until live; `FAQPage` on `/support` only. Canonical host `stumpnote.com`; `noindex` on notice-mode pages, `/admin`, `/api`, `/lab`. One `h1` per page. Volumes are unmeasured; validate in a keyword tool before treating as targets.

## 11. Brand usage reminders

Trademark line in the footer or `/legal`: "Apple, App Store, Apple Watch and TestFlight are trademarks of Apple Inc. Google and Gemini are trademarks of Google LLC." Use Apple and Google names only in plain text, never their logos or badges (no badge until an app is live).

Use "StumpNote" on the site (keep "Stump Note" as a keyword variant). Mark `public/brand/stumpnote-mark.svg`. Design tokens in [02-design.md](./02-design.md). Screenshots only from synthetic data; label game-day-first screens "Coming soon".
