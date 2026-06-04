---
title: Workshop Curriculum — Ship an IBP Agent in 1 Hour
description: Stage-by-stage facilitator guide. Each attendee forks a skeleton, ships five features in five branches adapted from the upstream GitHub Copilot Hands-on Lab Levels 3–5, and watches Dokploy auto-deploy each merge to a real URL.
author: David Canepa (Microsoft)
ms.date: 2026-05-29
ms.topic: tutorial
estimated_reading_time: 14
---

## How to use this document

Seven stages, sixty minutes. Five of them ship a feature through the full **branch → Copilot → PR → Dokploy** loop. Each feature is also a worked example of one concept from the upstream [GitHub Copilot HoL — Advanced track](https://copilot-hol-hyd-bg.westeurope.cloudapp.azure.com/workshop/docs/) (Levels 3–5), re-cast onto the IBP domain so attendees learn the technique on a codebase they care about. Cuts in priority order are at the bottom.

The workshop is structured around one repeating loop:

```text
git checkout -b feat/x  →  Copilot writes the code  →  git push  →  PR + merge  →  Dokploy deploys  →  refresh your URL
```

That loop runs five times in 60 minutes. Time per feature is measured in single-digit minutes, not in hours.

## Mapping to the upstream HoL

| Feature | Upstream HoL concept | IBP application |
|---|---|---|
| F1 — Model picker | L3 Code Generation | Multi-model dropdown for the Copilot session |
| F2 — IBP data context | L3 Refactoring + L5 Role Prompting | Inject summary JSON into a typed system prompt |
| F3 — Plan + tests | L4 Plan & Implement + L3 Tests generation | Plan-mode design of `topMovers()` helper + Vitest |
| F4 — Custom instructions | L5 Custom Instructions | `.github/copilot-instructions.md` + scoped `.instructions.md` |
| F5 — Reusable prompt + agent | L5 Reusable Prompts + Custom Agents | `/demand-review` slash command + `IBPAnalyst` agent |

## Setup checkpoint (do this before stage 1)

Before attendees arrive, the facilitator must have provisioned:

1. **A skeleton repository** under a GitHub organisation attendees can fork. The skeleton is this repo's reference app stripped to: Remix scaffold + Tailwind, `app/lib/copilot.server.ts` with the singleton + `askOnce`, a `home.tsx` with hard-coded model and no domain context, the synthetic `public/ibp-data-summary.json`, and `Dockerfile` + `dokploy.yaml`. Vitest is wired in but no test files exist.
2. **One Dokploy project per attendee**, each pointing at the attendee's eventual fork URL. Each project has a `GITHUB_TOKEN` env var with `copilot` scope set on the Dokploy side — **not** on attendee laptops.
3. **A URL list** mapping attendee email → Dokploy URL, sent 24 hours before the workshop.

Attendees only need a browser, Git, and VS Code with the Copilot extension. Node.js is optional.

## Context

Deliver this in 60–90 seconds before any code. It is the only framing attendees get, so it has to do real work.

> Opella's Integrated Business Planning cycle moves tens of thousands of forecast rows every month across 44 AMEA countries, 7 zones, and roughly 50 brands. Today, when a planner asks "what moved between last cycle and this cycle, and why?", the answer lives in a TM1 extract, a few pivot tables, and the heads of two or three people. Surfacing one exception can take an afternoon. Surfacing the right exception in time for the Demand Review is the difference between a decision and a postponement.
>
> The goal of this project is to give every Opella supply chain person a small, owned, deployable AI agent that sits on top of their own operational data and answers planner-grade questions in seconds — using only the GitHub Copilot license they already have. No Foundry, no Azure provisioning, no ML team in the loop. One license, one repo, one URL.
>
> The goal of this workshop is to prove that loop end-to-end on a synthetic IBP dataset. By the time you walk out of the room you will have shipped five features to a public URL using GitHub Copilot, and you will know exactly which file to change to point the same agent at your own data on Monday morning.

Then open the reference deployment on the projector, type one planner question, point at the most recent merged PR and the Dokploy deploy log, and say: *"What you ship in this workshop is what you take back to your team. Every feature is a branch you cut, a prompt you give Copilot, and a merge that goes live in 90 seconds. We do that five times."*

## Stage 1 — Fork the skeleton and confirm your URL (5 minutes)

Goal: every attendee has a clone of the skeleton open in VS Code and a live (empty) deployment on their Dokploy URL.

1. Open the skeleton repo URL and click **Fork**.
2. `git clone https://github.com/<you>/opella-ibp-skeleton.git`
3. Open the folder in VS Code. Verify the Copilot extension is signed in (status bar bottom-right).
4. Open the Dokploy URL the facilitator emailed. It should load and let you send a message that comes back with a generic answer from a hard-coded model.

Done when the fork exists, the project tree is open in VS Code, and the Dokploy URL responds. Do not move on until every attendee is on a working URL.

## Stage 2 — Feature 1: Model picker (8 minutes)

Goal: first trip around the deploy loop. Replace the hard-coded model with a dropdown of every model the Copilot license can reach.

### Concept (HoL Level 3 — Code Generation)

The simplest use of Copilot Agent mode: hand it a small, well-scoped multi-file edit and let it ship. The goal here is to feel the loop, not to write impressive code.

### Why it matters

Different planner questions deserve different models. *"Summarise this cycle in three bullets"* is a job for a cheap, fast model; *"reconcile these four cycles and explain the divergence"* is a job for a frontier reasoning model. Hard-coding one wastes the rest of the Opella Copilot license.

### Branch and prompt

```powershell
git checkout -b feat/model-picker
```

Paste into Copilot Chat (Agent mode):

> In `app/lib/copilot.server.ts` there is already a `getClient()` singleton. Add a new exported function `listModels()` that calls `client.listModels()` and returns `[{ id, name }]`. Then create `app/routes/api.models.ts` that exports a `loader` returning `{ models }`. Update `app/routes/home.tsx` to fetch `/api/models` in a `useEffect`, render a `<select>` next to the input, and send the chosen `model` in the POST body to `/api/chat`. Register the new route in `app/routes.ts`.

### Ship

```powershell
git add -A; git commit -m "feat: model picker"; git push -u origin feat/model-picker
```

Open the PR, merge, watch Dokploy redeploy, refresh.

Done when the URL shows a model dropdown populated with Claude / GPT / Gemini and switching models produces visibly different voices.

## Stage 3 — Feature 2: Inject the IBP data context (12 minutes)

Goal: turn a generic chat into a **domain agent**. The model now answers using the real synthetic IBP numbers, every turn. This is the moment the workshop crosses from "I called an API" to "I built an agent".

### Concept (HoL Level 3 Refactoring + Level 5 Role Prompting)

Two upstream techniques applied at once: agent-mode multi-file refactoring (create the prompt module, wire it into the chat action) and *role prompting* — telling the model exactly who it is, what data it may use, and what answer shape is acceptable.

### Why it matters

A generic chatbot tells a planner what "IBP" stands for. A grounded agent tells them *"Net Sales for ANZ dropped €4.2M between IBP Jan and IBP Feb, mostly carried by Australia and concentrated in two brands — here is what to validate before the Demand Review."* The difference is whether the model is allowed to invent or forced to cite. By injecting the IBP summary into the system prompt every turn, the agent moves from "interesting demo" to **"tool a planner would actually open before a meeting"** — with a static JSON file, no vector DB, no retraining, no infrastructure.

### Branch and prompt

```powershell
git checkout main; git pull; git checkout -b feat/ibp-context
```

> The file `public/ibp-data-summary.json` contains a structured summary of the AMEA IBP dataset. Create `app/lib/prompts.server.ts` that: (1) reads the JSON once on startup and caches it; (2) exports `buildDataContext()` returning a Markdown block under 1,500 characters with three tables (meta header, Net Sales overview, zone-level breakdown); (3) exports a `SYSTEM_PROMPT` constant that names the persona **"IBP demand-review analyst for Opella AMEA"**, restricts the model to the data in the CONTEXT block, requires EUR millions to one decimal, and forces the answer shape *what changed → why → what to validate*. Then update `app/routes/api.chat.ts` so the action composes `SYSTEM_PROMPT + "\n\nCONTEXT:\n" + buildDataContext()` and passes it as the `systemMessage` when creating the Copilot session.

### Sanity-check before pushing

* `prompts.server.ts` has the `.server.ts` suffix so Vite keeps it out of the browser bundle.
* No real Opella numbers appear in code — every number comes from the JSON.
* The system prompt names the persona, constrains the answer shape, and fences the data in a `CONTEXT:` block.

### Ship and verify

```powershell
git add -A; git commit -m "feat: inject IBP data context"; git push -u origin feat/ibp-context
```

Merge. Wait ~90s. Refresh and ask:

> Which countries moved the most between the last IBP cycle and this one? Give me the top three with their delta in EUR millions, and your best guess at the driver.

The answer should now name specific zones (AMET, ANZ, ASEA, CN, JP, SA) and use EUR millions formatting. The room sees the same generic-to-grounded shift on every screen at almost the same moment. That is the workshop's payoff.

## Stage 4 — Feature 3: Plan-then-implement with tests (10 minutes)

Goal: use **Plan mode** to design a small feature, then hand the plan to **Agent mode** to implement it with unit tests in one flow.

### Concept (HoL Level 4 Plan & Implement, plus Level 3 Tests generation)

Agent mode without a plan tends to over-edit. Plan mode reads the codebase, proposes a structured TODO, asks clarifying questions, and only then hands off to Agent. The deliverable here is small but real: a server-side helper that ranks the top movers, plus Vitest tests — the kind of code you want test coverage on the day a planner cites the output in a Demand Review.

### Why it matters

The fast path — "just ask Agent" — works for trivial edits and collapses for anything else. Plan-mode is the difference between an agent that ships your idea and one that ships *its* idea. Asking for tests up front stops you from merging code that hallucinates a column name your dataset doesn't have.

### Branch and flow

```powershell
git checkout main; git pull; git checkout -b feat/top-movers
```

Open a new Copilot Chat in **Plan** mode and select a premium model (GPT-5 or Claude Sonnet 4.5). Paste:

> I want a new server-only helper `app/lib/movers.server.ts` exporting `topMovers(n: number)` that reads the cached IBP summary and returns the `n` countries with the largest absolute Net Sales delta between the two most recent IBP cycles, as `{ country, zone, deltaMEur, direction }[]`. Wire it into `buildDataContext()` as a fourth Markdown table called **Top movers**. Add a `vitest` test file `app/lib/movers.test.ts` with at least four positive and two negative cases against the shipped synthetic summary. Use the project's existing TypeScript and Tailwind conventions. Write the complete plan out in Markdown first; do not implement yet.

Review the plan. Answer any clarifying questions. Click **Start Implementation** (or switch to Agent and type *Start Implementation*). When it's done, run `npm test` in the integrated terminal — all tests should pass before committing.

### Ship

```powershell
git add -A; git commit -m "feat: top-movers helper + vitest"; git push -u origin feat/top-movers
```

Merge. Refresh. Ask *"show me the top movers"* — the answer now cites the new table verbatim.

## Stage 5 — Feature 4: Customize Copilot for the IBP repo (8 minutes)

Goal: add a `.github/copilot-instructions.md` plus one scoped `.instructions.md` so every teammate (and every Copilot session) inherits the same IBP conventions automatically.

### Concept (HoL Level 5 — Custom Instructions)

Instructions files are repo-scoped meta-prompts. They ship with the code, apply to every Copilot session anyone opens against the repo, and can be filtered to specific file globs via the `applyTo` front-matter. This is how a team enforces *"don't invent column names, use EUR millions, never put server-only code in client bundles"* without re-typing it in every prompt.

### Why it matters

Workshop-day quality drops the moment a second person joins the repo. Custom instructions are the cheapest, most durable answer: they turn one person's hard-won prompt discipline into a team default that survives the next refactor. This is also where AGENTS.md, copilot-instructions.md, and the upstream HoL's `.github/instructions/*.instructions.md` pattern all converge.

### Branch and prompt

```powershell
git checkout main; git pull; git checkout -b feat/copilot-instructions
```

> Create `.github/copilot-instructions.md` with: (1) the project context (Remix + Vite + Tailwind + TS strict, GitHub Copilot SDK, synthetic IBP dataset, deploys via Dokploy on merge to main); (2) the domain rules from `SYSTEM_PROMPT` in `app/lib/prompts.server.ts` (EUR millions one decimal, *what changed → why → what to validate*, never invent numbers); (3) the WEBMAR-aligned stack rules (Remix preferred, no Next.js, no Java, no GraphQL, Prisma for ORM, PostgreSQL). Then create `.github/instructions/server-only.instructions.md` with front-matter `applyTo: "app/**/*.server.ts"` and one rule: "Never import this module from a route's client component. Always re-export through a Remix `loader` or `action`."

### Ship and verify

```powershell
git add -A; git commit -m "chore: copilot instructions"; git push -u origin feat/copilot-instructions
```

Merge. The deploy is a no-op (no runtime code changed) but the PR is the educational artifact — every Copilot session on this repo now inherits these rules. Test it: open Copilot Chat and ask *"what stack does this project use?"* — the answer should reflect the new instructions.

## Stage 6 — Feature 5: Reusable prompt + IBP Analyst agent (8 minutes)

Goal: package the demand-review workflow as a one-click `/demand-review` slash command, and an `IBPAnalyst` custom agent that anyone on the team can pick from the Copilot agent selector.

### Concept (HoL Level 5 — Reusable Prompts + Custom Agents)

`.prompt.md` files in `.github/prompts/` become slash commands. `.agent.md` files in `.github/agents/` become selectable personas in Copilot Chat, each with their own model, tool-set, and core responsibilities. Together they take the muscle memory of *how a senior planner uses this app* and turn it into reusable infrastructure.

### Why it matters

The hardest thing to scale in a team is not the code — it's the *how to ask*. Reusable prompts and custom agents move that knowledge out of someone's head and into the repo, so the second person on the team is productive the first day.

### Branch and prompt

```powershell
git checkout main; git pull; git checkout -b feat/copilot-prompts
```

> Create two files. (1) `.github/prompts/demand-review.prompt.md` with YAML front-matter (`agent: 'agent'`, `description: 'Prepare a Demand Review brief'`), and a body that asks Copilot to read the latest IBP summary, list the top three movers with delta in EUR millions, explain the likely driver for each, and list three numbers a planner should validate before the meeting. (2) `.github/agents/IBPAnalyst.agent.md` with front-matter (`name: "IBPAnalyst"`, `description: "Opella AMEA IBP demand-review analyst"`, `model: Claude Sonnet 4.5`, `tools: ["codebase", "search", "fetch", "runCommands"]`), and a Core Responsibilities body covering: reading `public/ibp-data-summary.json` as the source of truth, formatting EUR millions to one decimal, leading every answer with *what changed → why → what to validate*, never inventing numbers, and asking the user to point at a different summary file when the question is out of scope of the AMEA dataset.

### Ship and try

```powershell
git add -A; git commit -m "feat: /demand-review prompt + IBPAnalyst agent"; git push -u origin feat/copilot-prompts
```

Merge. In Copilot Chat, type `/demand-review`. Then open the agent selector and pick **IBPAnalyst**. Ask any planner question — every answer now follows the discipline you encoded once.

## Stage 7 — Wrap and take-home (4 minutes)

Goal: every attendee leaves with a URL they can share and a clear path to point this at their own data.

* **Your URL is yours.** The Dokploy project keeps running. Share it with a colleague before leaving the room.
* **To point it at your own data:** replace `public/ibp-data-summary.json` with a JSON file of the same shape produced from your dataset, then update `SYSTEM_PROMPT` in `app/lib/prompts.server.ts`. Open a PR. Merge. Done.
* **What you really took home:** not just five features, but the patterns underneath — Plan mode, custom instructions, reusable prompts, custom agents. The same patterns apply to every codebase you own.
* **To go deeper:** the full reference app in [ibp-chat/](../ibp-chat) shows streaming responses, persistent multi-turn sessions, and file upload. Open the source and ask `IBPAnalyst` to explain any piece you want.

Close with the whiteboard sentence: *one license, your own data, a working agent on a real URL — in one hour.*

## If a deploy fails

Three failure modes in priority order:

1. **Dokploy didn't redeploy after merge.** Check the deploy log. The most common cause is a TypeScript compile error from a Copilot suggestion that `npm run dev` would have caught locally — but most attendees aren't running locally. Open the failing file, ask Copilot Chat to fix the specific error message, push a fixup commit.
2. **"No models available" / auth errors at runtime.** The Dokploy environment variable `GITHUB_TOKEN` is missing the `copilot` scope. Regenerate with `gh auth refresh --scopes copilot && gh auth token` and update the Dokploy env. Redeploy.
3. **Every attendee gets the same error simultaneously.** Copilot service issue, not the code. Switch models from the dropdown. If all models fail, the facilitator walks the room through the reference app's source on screen for the remaining time. The architecture lesson still lands.

## What to cut if you are running short

Cut in this order. Each cut buys roughly 8 minutes.

1. **Drop Feature 5 (Stage 6).** The team-scaling story is already made by Feature 4's custom instructions.
2. **Drop Feature 4 (Stage 5).** The agent is fully working at the end of Feature 3.
3. **Demo Feature 1 instead of having attendees ship it.** The facilitator does the model picker as a live narrated demo on the projector; attendees ship only Features 2 and 3.

**Do not cut Stages 1, 3, or 4.** They are the spine: own a URL → ship a grounded agent → learn Plan mode.
