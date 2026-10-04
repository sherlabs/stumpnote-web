import type { Page } from '@/payload-types'

/**
 * The home page as a `pages` document (slug `home`). Single source for BOTH the seed script and the code fallback
 * that renders when there is no database, so `/` never depends on the CMS being reachable.
 * Copy: docs/spec/05-content-brief.md sections 2, 3, 4, 8 and docs/spec/02-design.md section 8. No new claims.
 */
export type HomeSeed = Pick<Page, 'title' | 'slug' | 'persona' | 'hero' | 'layout'>

export const homeSeed: HomeSeed = {
  title: 'Home',
  slug: 'home',
  persona: 'player',
  hero: { type: 'none' },
  layout: [
    {
      blockType: 'hero-story',
      overline: 'Voice-first cricket journal',
      headline: 'Your cricket,\nremembered.',
      subcopy:
        'Talk for a minute after a session. StumpNote turns it into a journal entry, then uses everything you have logged (form, habits, injuries, goals, how you felt) so every brief, drill, plan and answer is about your game, not cricket in general.',
      primaryCta: { label: 'Join the beta', url: '/join' },
      secondaryCta: { label: 'Open the web app', url: 'https://app.stumpnote.com' },
      showMStroke: true,
      showPersonaChips: true,
    },
    {
      blockType: 'statement',
      text: 'Most post-match thoughts are gone by Tuesday.',
      fragments: [
        { text: 'caught at cover' },
        { text: 'slept badly' },
        { text: 'front foot was late' },
        { text: 'stay side-on' },
        { text: 'dropped a catch, shaking it off' },
        { text: 'head falling over' },
      ],
    },
    {
      blockType: 'chapter',
      anchor: 'how-it-learns',
      overline: 'How it learns',
      title: 'Log once. Every feature knows.',
      body: 'Everything you log is folded into a compact summary that each AI feature reads, so the next brief, drill or answer starts from your game.',
      demo: 'learn-stage',
      pin: true,
      steps: [
        {
          title: 'Capture',
          text: 'Talk for about a minute after a session, or fill in the detailed form. A review screen shows what was heard before anything is saved.',
        },
        {
          title: 'Memory',
          text: 'Role, styles, strengths, goals, injuries and mood feed one profile. Private conditions stay private; coaches never see what you did not share.',
        },
        {
          title: 'Insight',
          text: 'Every saved entry is analysed against your history, so the read cites your own numbers. A line-and-length heat grid shows where it happens.',
        },
        {
          title: 'Action',
          text: 'One thing to work on today, not a dashboard: a single focus, what moved since last time, and a win quoted from your own notes.',
        },
      ],
      scenario: {
        persona: 'Aarav',
        text: 'Aarav\'s Monday focus reads "Play inside the box", from his caught-behind pattern.',
      },
    },
    {
      blockType: 'persona-tabs',
      overline: "Who it's for",
      heading: 'One account. Every role.',
      personas: [],
    },
    {
      blockType: 'feature-carousel',
      overline: 'Features',
      heading: 'Everything reads the same memory.',
      features: [],
      filterByArea: 'all',
    },
    {
      blockType: 'chapter',
      anchor: 'game-day',
      overline: 'Game day',
      title: 'Everything for match day in one place.',
      body: 'A phase track from arrival to post-match, a toolbelt and moment notes. Voice-note a thought mid-match, and Finish creates a draft journal entry.',
      bullets: [
        { text: 'Voice-log a thought between innings, like "dropped a catch, shaking it off".' },
        { text: 'IF/THEN contingencies jump to the top of Live mode when they fire.' },
        { text: 'Warnings warn and never block. The plan stands without any AI.' },
      ],
      demo: 'quick-log',
      badge: 'in-beta',
      teaser: 'A 60-second readiness check-in and a plan that reflects how you slept and feel.',
      scenario: {
        persona: '',
        text: 'If two left-handers are in and 3 boundaries come in 2 overs, then Kunal on.',
      },
    },
    {
      blockType: 'chapter',
      anchor: 'mind',
      overline: 'Mind',
      title: 'A short spoken routine for the moment it matters.',
      body: 'Mindset sessions of 1 to 5 minutes, built around one problem you raised. Pick a focus, press play, listen on the bus.',
      bullets: [
        { text: 'The transcript is always available.' },
        { text: 'Audio never starts without a tap.' },
        { text: 'Built for training and reflection. Not medical or psychological advice.' },
      ],
      demo: 'kinetic-transcript',
      badge: 'in-beta',
      reverse: true,
    },
    {
      blockType: 'chapter',
      anchor: 'body',
      overline: 'Body',
      title: 'Wrist-based swing metrics, in preview.',
      body: 'An optional Apple Watch app records swings, deliveries and heart rate. Apple Health data is optional too, and the app works without a watch.',
      bullets: [
        { text: 'Swing speed as dots with a rolling median and a peak marker.' },
        { text: 'Heart rate with zone bands and a visible gap where the signal dropped.' },
      ],
      demo: 'series-chart',
      badge: 'preview',
    },
    {
      blockType: 'chapter',
      anchor: 'team',
      overline: 'Team',
      title: 'Plan for all eleven.',
      body: 'Plan without waiting for everyone to install the app. Add name-only squad members who can link to a real profile later. Invite links expire after 72 hours, and captain notes stay private.',
      bullets: [
        { text: 'Building a game plan by hand is free; the AI helpers belong to the Team plan.' },
        { text: "Team members get team access free under the captain's plan." },
        { text: 'A squad pulse never exposes an individual.' },
      ],
      demo: 'squad-grid',
      badge: 'in-beta',
      persona: 'team',
      scenario: {
        persona: '',
        text: '"Top-order collapse in overs 4 to 8" appears with its source matches.',
      },
    },
    {
      blockType: 'principles',
      overline: 'Privacy',
      heading: 'Clear about your data.',
      items: [
        {
          title: 'You decide what the AI sees',
          text: 'The app asks your permission before AI features send your data, and you can withdraw it in Profile. AI can make mistakes. It is not medical advice.',
          icon: 'KeyRound',
        },
        {
          title: 'Only what you share',
          text: 'Coaches, captains and parents only see what the sharing rules and your choices allow. Young players get an age gate, guardian-managed profiles and age-aware safeguards.',
          icon: 'Users',
        },
        {
          title: 'Not for sale',
          text: "We do not sell your personal information. We do not use it for advertising and we do not track you across other companies' apps or sites. You can delete your account inside the app.",
          icon: 'Ban',
        },
      ],
      link: { label: 'Read the privacy policy', url: '/privacy' },
    },
    { blockType: 'testimonials' },
    {
      blockType: 'cta-beta',
      heading: 'Join the beta',
      subcopy: 'The web app is live now.',
    },
  ],
}
