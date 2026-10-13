---
title: A camera is not perception
description: Most organisations already own the sensors they need. What they lack is anything that converts a wall of live video into a decision somebody can act on.
date: 2026-10-06
tags: Vision AI, Operations
---

Walk through almost any factory, warehouse, substation or municipal control room and you will find the same thing: a wall of screens showing live video that nobody is watching.

This is not negligence. It is arithmetic. A human operator can attend to a handful of streams for a short period before accuracy collapses, and most of these sites have hundreds of cameras running continuously. The footage is not being ignored because it is unimportant. It is being ignored because there is no mechanism that could possibly consume it.

## The asset already exists

That is why camera infrastructure is an unusual starting point for an automation problem. The capital expense is already sunk. The cabling is run, the mounts are installed, the network carries the streams, and the recordings are retained — frequently for years, frequently because a regulation says so.

What that estate currently produces is **evidence**, not **information**. Evidence is retrospective: after an incident, someone scrubs back through the recording and establishes what happened. It is genuinely valuable and it is entirely too late. The same stream, consumed as it arrives, could have been a warning.

The gap between those two uses is not a hardware gap. It is an interpretation gap.

## Detection is the easy half

It is tempting to assume the hard part is recognising objects. It largely is not, any more. Reliable detection of people, vehicles, equipment and protective gear is close to a commodity.

The difficulty is that detection on its own answers almost no question an operations lead actually has. "There is a person in frame" is not useful. The useful statements are conditional, spatial and temporal:

- A person is in frame **and** inside a marked exclusion zone **and** the machine beyond it is running.
- A vehicle has been at the dock **for longer than** its scheduled turnaround.
- The number of people in this area **exceeds** what this exit capacity supports.
- Someone entered a restricted corridor **and** no corresponding badge event was recorded.

Every one of those requires something detection does not supply: a model of the site. Where the zones are, what counts as normal dwell time, which rules apply at which hour, and which combinations are worth interrupting a human for.

## Why most deployments disappoint

Two failure modes account for the bulk of it.

The first is **alert flooding**. A system that fires on every detection trains its operators to dismiss it within a fortnight. An alert that is ignored is worse than no alert, because it manufactures the appearance of coverage. The hard engineering is in suppression — knowing when *not* to speak.

The second is **the last mile**. A correct inference that terminates in a dashboard nobody has open has changed nothing. The output has to arrive where the work already happens: the radio, the existing incident queue, the maintenance ticket, the shift handover. Systems that require a new screen to be watched tend to recreate the original problem in a more expensive form.

## What a workable version looks like

Judge these systems on operational questions rather than model metrics. Not "what is the mAP" but:

- How many alerts does a shift receive, and what fraction are acted upon?
- When it is wrong, how does a human correct it, and does that correction change future behaviour?
- Does it degrade gracefully when a lens fouls, a light fails or a camera is nudged out of alignment — all of which are certainties, not risks?
- Does it run on the estate that exists, or does it require the estate to be replaced first?

> The objective is not to watch more video. It is to watch almost none of it, and to be interrupted precisely when being interrupted is warranted.

That framing also sets the honest ceiling. This technology does not deliver understanding of a site. It delivers consistent attention — the one thing a human operator provably cannot sustain across hundreds of streams and an eight-hour shift, and the one thing a machine is good at.
