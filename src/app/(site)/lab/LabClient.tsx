'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'
import { Chapter } from '@/components/site/Chapter'
import { Logo } from '@/components/site/Logo'
import { MotionToggle } from '@/components/site/MotionToggle'
import { PersonaChips } from '@/components/site/PersonaChips'
import { usePersona } from '@/components/site/PersonaProvider'
import { Section } from '@/components/site/Section'
import { ThemeToggle } from '@/components/site/ThemeToggle'
import {
  AiMark,
  BailsLoader,
  EntryDots,
  HeroRings,
  KineticTranscript,
  MStroke,
  PitchHeatGrid,
  QuickLogStrip,
  SeriesChart,
  SquadGrid,
  VoiceNoteTyper,
} from '@/components/signature'
import { Badge, BADGE_LABELS, Button, Card, Checkbox, Field, Notice, Overline, TextLink } from '@/components/ui'
import { PERSONAS } from '@/lib/site-config'

function Cell({ id, title, children, wide }: { id: string; title: string; children: ReactNode; wide?: boolean }) {
  return (
    <div data-lab={id} className={wide ? 'md:col-span-2' : undefined}>
      <h3 className="eyebrow mb-4">{title}</h3>
      {children}
    </div>
  )
}

export function LabClient() {
  const { persona, setPersona } = usePersona()
  const [seed, setSeed] = useState(7)
  const [run, setRun] = useState(0)
  const [loopPaused, setLoopPaused] = useState(false)

  return (
    <>
      <Section tight>
        <Overline>Lab · noindex</Overline>
        <h1 className="display-2 mt-4">Every component, every state.</h1>
        <p className="body-lg measure mt-4 max-w-[56ch] text-muted">
          Review surface for the design system. Switch persona, theme, motion and data seed; each demo shows its final
          state and where it animates, a replay.
        </p>
        <div data-lab="controls" className="mt-8 flex flex-wrap items-center gap-3 rounded-3 border border-[var(--hairline-2)] bg-surface p-4">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Persona">
            {PERSONAS.map((p) => (
              <button
                key={p}
                type="button"
                aria-pressed={persona === p}
                onClick={() => setPersona(p)}
                className="min-h-11 rounded-full border border-[var(--hairline-3)] px-4 text-[14px] font-semibold capitalize text-muted aria-pressed:bg-[var(--hairline-2)] aria-pressed:text-text"
              >
                {p}
              </button>
            ))}
          </div>
          <ThemeToggle />
          <MotionToggle />
          <label className="flex items-center gap-2 text-[14px] font-semibold text-text">
            Seed
            <input
              type="number"
              value={seed}
              min={1}
              max={999}
              onChange={(e) => setSeed(Math.max(1, Number(e.target.value) || 1))}
              className="min-h-11 w-20 rounded-2 border border-[var(--hairline-3)] bg-[var(--hairline-1)] px-3 text-text"
            />
          </label>
          <Button variant="secondary" onClick={() => setRun((n) => n + 1)}>
            Replay all
          </Button>
        </div>
      </Section>

      <Section id="ui" labelledBy="ui-h" tight>
        <h2 id="ui-h" className="display-3 mb-10">UI primitives</h2>
        <div className="grid gap-12 md:grid-cols-2">
          <Cell id="buttons" title="Button">
            <div className="flex flex-wrap items-center gap-3">
              <Button arrow>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button disabled>Disabled</Button>
            </div>
          </Cell>
          <Cell id="links" title="TextLink and Overline">
            <div className="flex flex-col items-start gap-3">
              <TextLink href="/lab">Internal link</TextLink>
              <TextLink href="https://app.stumpnote.com">Open the web app</TextLink>
              <TextLink href="/lab" tone="muted">Muted link</TextLink>
              <Overline accent>Accent overline</Overline>
            </div>
          </Cell>
          <Cell id="badges" title="Badge (four labels only)">
            <div className="flex flex-wrap gap-2">
              {BADGE_LABELS.map((l) => (
                <Badge key={l} status={l} />
              ))}
            </div>
          </Cell>
          <Cell id="logo" title="Logo and AiMark">
            <div className="flex items-center gap-8">
              <Logo />
              <span className="flex items-center gap-2 text-body">
                <AiMark size={20} className="text-accent-text" /> AI label
              </span>
            </div>
          </Cell>
          <Cell id="cards" title="Card">
            <div className="grid gap-4 sm:grid-cols-2">
              <Card>
                <p className="title">Static card</p>
                <p className="body-sm mt-2 text-muted">Raised surface, hairline border.</p>
              </Card>
              <Card interactive>
                <p className="title">Interactive card</p>
                <p className="body-sm mt-2 text-muted">Lifts and picks up the persona accent.</p>
              </Card>
            </div>
          </Cell>
          <Cell id="forms" title="Field, Checkbox, Notice">
            <div className="flex flex-col gap-5">
              <Field label="Email" type="email" placeholder="you@example.com" hint="We only use this to reach you about the beta." />
              <Field label="Email with error" type="email" defaultValue="not-an-email" error="Enter a valid email address." />
              <Checkbox label="I agree to be contacted about the beta." />
              <Notice title="Notice mode">This page is being finalised. Some details are not yet published.</Notice>
            </div>
          </Cell>
          <Cell id="type" title="Type scale" wide>
            <div className="flex flex-col gap-4">
              <p className="display-1">Display 1</p>
              <p className="display-2">Display 2</p>
              <p className="display-3">Display 3</p>
              <p className="title">Title, Hanken 700</p>
              <p className="body-lg">Body large, the lead paragraph size.</p>
              <p>Body, 17px, the default reading size.</p>
              <p className="body-sm">Body small, captions and legal.</p>
              <p className="eyebrow">Overline (class .eyebrow)</p>
              <p className="mono-num">0123456789 tabular figures</p>
            </div>
          </Cell>
        </div>
      </Section>

      <Section id="site" labelledBy="site-h" tight>
        <h2 id="site-h" className="display-3 mb-10">Site shell</h2>
        <div className="grid gap-12 md:grid-cols-2">
          <Cell id="persona-chips" title="PersonaChips (re-themes the page)">
            <PersonaChips />
          </Cell>
          <Cell id="chapter" title="Chapter (stage + copy, sticky at lg)" wide>
            <Chapter
              stage={
                <div className="rounded-3 border border-[var(--hairline-2)] bg-surface p-8">
                  <MStroke mode="static" className="mx-auto w-40" />
                </div>
              }
              eyebrow={<Overline accent>Chapter</Overline>}
              title={<h3 className="display-3">Stage on one side, copy on the other.</h3>}
            >
              <p className="body-lg">Below 1024px the stage stacks above the copy. At lg and up it stays pinned while the copy scrolls.</p>
            </Chapter>
          </Cell>
        </div>
      </Section>

      <Section id="signature" labelledBy="sig-h" tight>
        <h2 id="sig-h" className="display-3 mb-10">Signature components</h2>
        <div key={run} className="grid gap-16 md:grid-cols-2">
          <Cell id="mstroke-paint" title="MStroke · paint on load">
            <div className="w-48">
              <MStroke mode="paint" />
            </div>
          </Cell>
          <Cell id="mstroke-loop" title="MStroke · loop (loader)">
            <div className="flex items-center gap-6">
              <div className="w-32">
                <MStroke mode="loop" paused={loopPaused} />
              </div>
              <Button variant="secondary" aria-pressed={loopPaused} onClick={() => setLoopPaused((p) => !p)}>
                {loopPaused ? 'Resume loop' : 'Pause loop'}
              </Button>
            </div>
          </Cell>
          <Cell id="mstroke-static" title="MStroke · static (reduced motion and no JS)">
            <div className="w-32">
              <MStroke mode="static" />
            </div>
          </Cell>
          <Cell id="bails" title="BailsLoader (404)">
            <div className="w-48">
              <BailsLoader replayKey={run} />
            </div>
          </Cell>
          <Cell id="heat" title="PitchHeatGrid">
            <PitchHeatGrid seed={seed} />
          </Cell>
          <Cell id="entry-dots" title="EntryDots">
            <EntryDots seed={seed} />
          </Cell>
          <Cell id="transcript" title="KineticTranscript">
            <KineticTranscript />
          </Cell>
          <Cell id="voice" title="VoiceNoteTyper">
            <VoiceNoteTyper />
          </Cell>
          <Cell id="series" title="SeriesChart" wide>
            <SeriesChart seed={seed + 4} />
          </Cell>
          <Cell id="quicklog" title="QuickLogStrip">
            <QuickLogStrip />
          </Cell>
          <Cell id="squad" title="SquadGrid">
            <SquadGrid />
          </Cell>
          <Cell id="rings" title="HeroRings (WebGL when gates pass, SVG otherwise)" wide>
            <div className="mx-auto max-w-[420px]">
              <HeroRings />
            </div>
          </Cell>
        </div>
      </Section>
    </>
  )
}
