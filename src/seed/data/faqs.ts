import { lexical } from '../lexical'
import type { LexicalRoot } from '../lexical'

/** The 20 FAQs. Source: docs/spec/05-content-brief.md section 7. No FAQ about languages, Android, user numbers or results. */
export type FaqCategory =
  'general' | 'availability' | 'privacy' | 'pricing' | 'team' | 'coach' | 'parent' | 'support'

export type FaqSeed = {
  slug: string
  question: string
  /** Plain-text answer paragraphs (also the source of the FAQ JSON-LD in S5). */
  paragraphs: string[]
  category: FaqCategory
  personas: Array<'player' | 'captain' | 'member' | 'coach' | 'parent'>
  order: number
}

export const faqSeeds: FaqSeed[] = [
  {
    slug: 'what-is-stumpnote',
    question: 'What is StumpNote?',
    paragraphs: [
      'A voice-first cricket journal. You talk after a session, it structures the entry, and AI uses your history to give you a daily focus, drills, plans and answers about your game.',
    ],
    category: 'general',
    personas: ['player'],
    order: 10,
  },
  {
    slug: 'is-it-available',
    question: 'Is it available now?',
    paragraphs: [
      'The web app is live at app.stumpnote.com. The iPhone apps are in TestFlight beta and are coming to the App Store. Join the beta or the waitlist.',
    ],
    category: 'availability',
    personas: ['player', 'coach', 'parent'],
    order: 20,
  },
  {
    slug: 'which-devices',
    question: 'Which devices?',
    paragraphs: [
      'Web today. iPhone and Apple Watch (preview) are in beta. We have not announced Android availability.',
    ],
    category: 'availability',
    personas: ['player'],
    order: 30,
  },
  {
    slug: 'ai-sends-data',
    question: 'Does the AI send my journal to someone?',
    paragraphs: [
      'Only after you say yes. The app asks before an AI feature sends data to Google (Gemini, and Google Cloud Text-to-Speech for spoken sessions). You can withdraw in Profile, AI data sharing.',
    ],
    category: 'privacy',
    personas: ['player', 'parent'],
    order: 40,
  },
  {
    slug: 'training-data',
    question: 'Is my data used to train AI?',
    paragraphs: [
      'We do not sell your data, and we do not use your content to train our own models. How our AI provider treats API content depends on its terms. See the Privacy Policy.',
    ],
    category: 'privacy',
    personas: ['player', 'parent'],
    order: 50,
  },
  {
    slug: 'is-this-medical-advice',
    question: 'Is this medical advice?',
    paragraphs: [
      'No. StumpNote is for reflection and training. AI can make mistakes. If you are injured or struggling, talk to a professional or someone you trust.',
    ],
    category: 'general',
    personas: ['player', 'parent'],
    order: 60,
  },
  {
    slug: 'coach-parent-read-journal',
    question: 'Can my coach or parent read my journal?',
    paragraphs: [
      'Only what the sharing rules and your choices allow. A coach link stays pending until you accept. Guardians see three groups you control.',
    ],
    category: 'privacy',
    personas: ['player', 'coach', 'parent'],
    order: 70,
  },
  {
    slug: 'no-voice',
    question: 'Can I use it without voice?',
    paragraphs: ['Yes. You can create entries manually with the detailed form.'],
    category: 'general',
    personas: ['player'],
    order: 80,
  },
  {
    slug: 'little-logged',
    question: 'What if I have not logged much?',
    paragraphs: ['Features show honest empty states. Some insights need a minimum amount of data.'],
    category: 'general',
    personas: ['player'],
    order: 90,
  },
  {
    slug: 'no-watch-or-health',
    question: 'Does it work without a watch or Apple Health?',
    paragraphs: ['Yes. Health data and the watch are optional.'],
    category: 'general',
    personas: ['player'],
    order: 100,
  },
  {
    slug: 'how-does-the-watch-work',
    question: 'How does the watch work?',
    paragraphs: [
      'The watch app records swings, deliveries and heart rate. It is a preview, and the speeds are wrist-motion measures, not bat or ball speed.',
    ],
    category: 'general',
    personas: ['player'],
    order: 110,
  },
  {
    slug: 'what-do-i-pay',
    question: 'What do I pay?',
    paragraphs: [
      'There is a free tier. Paid plans are monthly subscriptions through the App Store. See Plans for indicative prices.',
    ],
    category: 'pricing',
    personas: ['player', 'captain'],
    order: 120,
  },
  {
    slug: 'teammates-pay',
    question: 'Do my teammates need to pay?',
    paragraphs: [
      "No. Team members added by a captain get team access free under the captain's plan.",
    ],
    category: 'team',
    personas: ['captain', 'member'],
    order: 130,
  },
  {
    slug: 'coaches-pay',
    question: 'Do coaches pay?',
    paragraphs: [
      "The coach's 1-on-1 coach mode is free. A player can add a Coach add-on for themselves.",
    ],
    category: 'coach',
    personas: ['coach'],
    order: 140,
  },
  {
    slug: 'plan-without-ai',
    question: 'Can I plan a match without AI?',
    paragraphs: [
      'Yes. Creating a team and building a game plan by hand are free. The AI helpers need the Team plan.',
    ],
    category: 'team',
    personas: ['captain'],
    order: 150,
  },
  {
    slug: 'under-13',
    question: 'My child is under 13.',
    paragraphs: [
      'A parent or guardian creates and manages the profile in the StumpNote Parent app. Self sign-up is 13 and over.',
    ],
    category: 'parent',
    personas: ['parent'],
    order: 160,
  },
  {
    slug: 'parents-see',
    question: 'What can parents see?',
    paragraphs: [
      "Three groups with their own switches: cricket, wellbeing and growth. A child's private wellbeing entries are not shown when wellbeing sharing is off.",
    ],
    category: 'parent',
    personas: ['parent'],
    order: 170,
  },
  {
    slug: 'delete-account',
    question: 'How do I delete my account?',
    paragraphs: [
      'In the app: Profile (avatar, top right), Account, Delete account. Coach: Home, Account, Delete account. Parent: Settings, Delete account. See the Account deletion page. Cancel any subscription with Apple first.',
    ],
    category: 'privacy',
    personas: ['player', 'coach', 'parent'],
    order: 180,
  },
  {
    slug: 'where-is-data-stored',
    question: 'Where is my data stored?',
    paragraphs: [
      'In our database and file storage hosted on Supabase (Mumbai, India). Some providers operate globally. See the Privacy Policy.',
    ],
    category: 'privacy',
    personas: ['player', 'parent'],
    order: 190,
  },
  {
    slug: 'get-help',
    question: 'How do I get help or report a bug?',
    paragraphs: [
      'Use the Support page. Include the app, your device and OS version, and what you were doing.',
    ],
    category: 'support',
    personas: ['player', 'coach', 'parent'],
    order: 200,
  },
]

export function faqAnswer(f: FaqSeed): LexicalRoot {
  return lexical(...f.paragraphs)
}
