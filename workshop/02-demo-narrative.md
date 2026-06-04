---
title: Demo Narrative — IBP Chat for Opella
description: Speaker's guide for the workshop opening demo. Explains IBP, the demand-review planner persona, why exceptions matter, and provides a scripted 7-minute walkthrough of the reference app.
author: David Canepa (Microsoft)
ms.date: 2026-05-28
ms.topic: concept
estimated_reading_time: 15
---

## How to use this document

You are the facilitator. This is the story you tell before any attendee opens an editor. Aim for 12 minutes of narrative plus a 7-minute live demo at the end. Do not read this verbatim. Use the talking points as anchors and speak in your own voice. Where a number or term is bolded, that's the one phrase to land precisely.

You do not need to be an IBP expert. The ten paragraphs that follow give you enough domain to teach the workshop honestly. If an attendee goes deeper than this, say so and route the question to the team afterwards.

## Part 1 — What IBP is, in plain language (3 minutes)

Integrated Business Planning, or **IBP**, is the monthly cycle a company uses to decide what to make, where to ship it, and what to promise customers over the next 18 months. Every consumer goods company runs a version of it. Opella runs theirs across 44 countries in the **AMEA** region — Asia, Middle East, Africa, Australia, New Zealand, Korea, Japan.

The cycle has four big meetings each month, named after their working-day position in the calendar. They happen in this order:

* **PMR**, the Portfolio Management Review, around working day 5. Decides whether new products and lifecycle changes are on track.
* **DR**, the Demand Review, around **working day 12**. Decides the demand plan for the next 18 months. This is the meeting our app supports.
* **SR**, the Supply Review, around working day 19. Decides whether the factories can meet that demand and where the constraints are.
* **MBR**, the Management Business Review, around working day 27. The executive sign-off on the integrated plan, with the financial impact attached.

Between cycles, the numbers move. Forecasts get revised. Promotions land. Markets shift. The job of the planner is to keep the plan honest as the world changes.

## Part 2 — Why a Demand Review is hard (3 minutes)

The Demand Review is the meeting we focused on. Pick this paragraph to lean into.

The Opella AMEA demand plan covers roughly **1,100 unique products** across 44 countries and seven sales zones. Each product has a forecast for every month for the next 18 months, plus the actuals for the last year, plus the budget, plus the previous month's plan. The total number of cells the planner has to reconcile each cycle is well over a million.

The planner is not paid to look at all of them. The planner is paid to find the **exceptions** — the places where the new forecast disagrees with the budget, or with last month's plan, or with what actually shipped, by enough to matter. Those exceptions are the agenda for the meeting. Everything else is noise.

In today's world, finding those exceptions means waiting for IT to refresh a Power BI report, filtering it down by hand, and trying to remember last cycle's context from a spreadsheet. The planner is competent. The tooling is slow. The cycle window is 5 working days. Something has to give and usually it's depth of analysis.

## Part 3 — Who the user is (2 minutes)

Picture one person. Pick a real-sounding name and stick with it for the workshop. Call her Maria. Maria is a regional demand planner at Opella covering AMEA. She has 12 years of experience. She owns the demand number that goes into the Demand Review. Her boss is in the meeting. Her boss's boss often is too.

Maria's day on D-12 looks like this. She comes in at 8 a.m. She opens the latest Kinaxis extract. She opens last month's slide deck. She opens her notes file. She has 6 hours to identify the top exceptions, write a one-page commentary on each, and prepare the slides for the 2 p.m. meeting. If she misses one, the meeting is incomplete. If she misreads one, the wrong decision lands.

What Maria wants is not another dashboard. She has dashboards. What Maria wants is a colleague she can ask: *what changed in Australia between last cycle and this one, why, and what do I need to validate before I show it?* That colleague is what the workshop is teaching attendees to build.

## Part 4 — Why this matters to Opella's bottom line (2 minutes)

Get the brutal-honesty version right here. Be specific. Do not invent a number.

Better exception triage in the Demand Review does not directly save a sum you can put on a slide. What it does is shorten the time to the right answer, which shows up in three places: fewer slow-moving stockouts, fewer expedited shipments, and fewer factory schedule changes after the SR. Opella has not shared a quantified target with us for any of these. Tell attendees that honestly. The point of the workshop is not to oversell — it is to put a working tool in the planner's hand.

What we can say with certainty is that the planner currently spends a large portion of D-12 on mechanical work — pulling extracts, filtering, formatting — and a small portion on judgement. The app being built today shifts that ratio.

## Part 5 — Why we are using the GitHub Copilot SDK (2 minutes)

Opella manufacturing and supply chain people already have GitHub Copilot licenses. They do not have Microsoft Foundry access. This matters because it means the workshop has zero infrastructure prerequisites. No Azure subscription to provision. No model deployment to configure. No quotas to request.

The GitHub Copilot SDK lets the attendee's own license authenticate a server-side application that calls Claude, GPT, and Gemini through the same Copilot catalog they already pay for. One license, multiple frontier models, one line of authentication. That is what makes the 3-hour workshop possible.

Be honest about what this is not. The SDK is not the right pattern for a production multi-tenant SaaS app — every end-user would need their own Copilot license. It is a perfect pattern for what we are building: an internal tool a team of planners uses against their own data, where every planner has a Copilot license already.

## Part 6 — The live demo script (7 minutes)

Open <http://localhost:3100> in a browser shared on the projector. The reference app should already be running. Do not show the editor yet. Just the app.

### Demo beat 1 — The shape of the data (90 seconds)

Click the **Dashboard** tab if it is in the build, or stay on the chat tab and type:

> Summarize the AMEA demand plan at a glance. What is the IBP current view, the budget, and the prior month's plan? Show me the headline gaps.

The model answers with a structured block showing IBP Current, Budget, Prior Month, and the deltas. Point to the screen and narrate: *this is the same view Maria would build by hand over 30 minutes from a Power BI export.*

### Demo beat 2 — The exception (2 minutes)

Type the question Maria actually has on D-12:

> Which countries moved the most between the last IBP cycle and this one? Give me the top three with their delta in EUR millions, and your best guess at the driver. Treat anything under 2 million as noise.

The model returns a ranked list with a delta column and a "likely driver" column. The drivers are clearly labeled as hypotheses, not facts. Lean into this: *the model is doing the triage work — surfacing the candidates and giving Maria a starting hypothesis. It is not making the decision. The decision still belongs to Maria.*

### Demo beat 3 — The drill-down (90 seconds)

Click into the top country from the response, or type:

> Take Australia. Break the cycle-over-cycle delta down by zone and by the top five products. What's the single product driving the most of it?

This is the moment where the agent feels like a colleague. It already has the context from the previous answer, so the follow-up is a conversation, not a fresh query. Call that out: *notice she did not have to re-state the cycle, the region, or the metric. The session persisted that context.*

### Demo beat 4 — The validation step (90 seconds)

Close the loop on responsibility. Type:

> Before I take this into the Demand Review, what should I validate? List the three things most likely to be wrong about this analysis and what would prove them right or wrong.

The model returns a checklist. This is the most important beat of the demo. Lean in: *the agent is telling Maria how to verify its own work. That is what makes this safe to put in front of a planner. The model does not pretend to be right — it gives her the audit trail.*

### Demo beat 5 — The model switch (30 seconds)

Open the model dropdown. Switch from Claude to GPT to Gemini. Re-run the first question. The answers will differ in shape but agree on the substance. Say: *one license, three frontier models, no extra setup. That is what we are about to build.*

## Part 7 — The transition to the workshop (1 minute)

Close the demo and bring up [01-curriculum.md](01-curriculum.md). Tell the room:

> Everything you just saw is in the repo on your machine. We are not going to rebuild every feature of it today. We are going to build the smallest path that gets you to your own version of beat 1 and beat 5 — your own data, your own model picker, your own answer. By the end of the workshop you will have the bones, and the rest is yours to extend during the week. Let's set our clocks. We have 2 hours of building ahead, plus a buffer for the things that always break the first time.

That sentence is the handoff into [stage 1 of the curriculum](01-curriculum.md#stage-1--specify-what-you-are-building-15-minutes).

## Questions you will get asked

Prepare answers to these. Memorise the first sentence of each.

### "Is the data real?"

No. The data in the workshop is synthetic. Same schema as the real Opella extract, completely fabricated values, made-up product names. The pattern works against your real data, and we can help you wire it up after the workshop.

### "Can I run this against my own spreadsheet?"

Yes. The chat app reads a JSON summary, not the Excel file directly. To point it at your data, write a small script that produces a summary in the same shape. The reference app has a Python engine in `context/IBP_analysis/ibp_engine.py` that does exactly this for the IBP shape — it is a model for how to do it for yours.

### "What happens to my Copilot quota if everyone uses this?"

The SDK calls count against your personal Copilot license, the same way Copilot Chat in the editor does. The license is generous for a planner-scale workload. If a team built something high-volume against this, the right next step is a Foundry deployment with a service-level quota, not a Copilot SDK app.

### "Why didn't you use Microsoft Foundry?"

Foundry is the right answer for a production deployment with a real SLA, monitoring, and quota. The SDK is the right answer when the goal is to put a working tool in a planner's hands today with the license they already have. Different tool, different job. Both belong in the toolbox.

### "Is the IBP cycle really this simple?"

No, the real cycle has more stages and more nuance. The four-meeting summary is the version a non-IBP person can hold in their head. If you want the full picture, the `context/IBP_analysis/IBP_Onboarding_Deck_Analysis.md` file in the repo walks through it slide by slide.

## Cheat sheet for the facilitator

Pin this above your monitor.

* IBP = Integrated Business Planning, the monthly cycle that produces the demand and supply plan.
* The four meetings, in order: PMR, DR, SR, MBR.
* The one we support: DR, the Demand Review, on working day 12.
* The user: a regional demand planner with 5 working days to find the exceptions worth discussing.
* The job of the app: turn 30 minutes of mechanical triage into 30 seconds of structured answers with audit-trail validation steps attached.
* The reason we use the GitHub Copilot SDK: every attendee already has a license, no Azure or Foundry prerequisites needed.
* The data in the workshop is synthetic. The pattern is real.
