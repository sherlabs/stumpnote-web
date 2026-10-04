# Stage briefs

One brief per stage, named `S<n>-<slug>.md`. Each brief must contain: goal, inputs (files to read), outputs (files/routes to produce), done-criteria (verifiable, so re-running the stage is idempotent), checks to run, and the STATUS.md/TASKS.md updates expected.

| Stage | Name | Brief |
|---|---|---|
| S0 | Bootstrap | done (no brief needed; see `STATUS.md`) |
| S1 | Plan and spec | to be written (S1 itself writes S2..S7 briefs) |
| S2 | Foundation (Next.js + Payload, tokens, DB) | to be written in S1 |
| S3 | Marketing site | to be written in S1 |
| S4 | Legal and support pages | to be written in S1 |
| S5 | Admin website analytics | to be written in S1 |
| S6 | Admin AI spend and product analytics | to be written in S1 |
| S7 | Deploy (Vercel free tier) and QA | to be written in S1 |

If a stage brief is missing when you reach that stage, write it first from `docs/spec/`, commit, then execute.
