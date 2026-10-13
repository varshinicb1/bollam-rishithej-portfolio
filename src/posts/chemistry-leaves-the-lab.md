---
title: Why lab-grade chemistry had to leave the laboratory
description: The bottleneck in water, soil and food testing is almost never the chemistry. It is the journey the sample takes to reach it, and the days that journey costs.
date: 2026-10-10
tags: Deep tech, Electrochemistry
---

Ask what limits environmental and agricultural testing and the intuitive answer is sensitivity — that the instruments are not good enough. They are. A benchtop spectrometer in a decent laboratory will find heavy metals at parts per billion and has been able to for decades.

The limit is logistics.

## The sample has to travel

A field sample taken at a borewell, a paddy plot or a factory outfall cannot analyse itself. It is bottled, labelled, preserved, transported, queued, run, and written up. Each of those steps costs time, and some of them cost fidelity: dissolved oxygen shifts, pH drifts, volatile species escape, and the thing measured in the laboratory is no longer exactly the thing that existed at the wellhead.

Then the result arrives days later. By then the irrigation decision has been made, the batch has shipped, the effluent has gone downstream. The measurement is accurate and useless — it describes a moment that has passed.

## Why miniaturisation is the real problem

So the obvious move is to bring the instrument to the sample. The reason this took so long is that the dominant laboratory techniques resist being made small. Optical spectrometry wants a long, stable path length and a controlled environment; chromatography wants carrier gases, columns and pumps. Shrinking either one tends to mean discarding exactly the properties that made it trustworthy.

Electrochemical sensing starts from a different place. It measures what happens when a species gives up or accepts electrons at an electrode surface — current and potential, not light through a column. That is attractive for field work for three structural reasons:

- **The transducer is already small.** The sensing element is an electrode. Making it smaller tends to be a fabrication problem, not a physics problem.
- **The readout is electrical from the start.** There is no optical chain to convert, align or keep clean. A current is already the kind of signal a cheap microcontroller can digitise.
- **It is specific by chemistry, not by separation.** Selectivity comes from electrode material, surface modification and the potential applied, rather than from physically separating the sample first.

## Where the difficulty actually moves

None of this makes the problem easy. It relocates it.

A laboratory controls temperature, operator technique and sample preparation. A field device controls none of those, so the hard engineering moves into compensation and calibration — holding a reference stable across a thirty-degree ambient swing, resisting fouling when the electrode is dipped into real water carrying real sediment, and keeping drift inside a useful band across the device's life rather than across a single afternoon.

That is why *continuous* matters more than *portable*. A device carried to a site and read once is a faster version of the old model. A device left in place, reading repeatedly and reporting, changes what the measurement is for: not a verdict on a sample, but a time series of a system. Trends are what let you act before a threshold is crossed rather than after.

## The economic point

The cost argument is usually framed as instrument price, which is the least interesting part. The expensive thing about the laboratory model is not the spectrometer; it is that the cost per measurement stays roughly flat no matter how many you take. Sample handling does not amortise.

A deployed sensor inverts that. The hardware is bought once and the marginal cost of the next reading approaches nothing. That is what makes measuring hourly instead of quarterly a rational decision rather than an indulgent one — and measuring hourly is the difference between knowing a field's nitrogen is falling and discovering the yield was lower after harvest.

> Precision analytical chemistry stopped being a sensitivity problem some time ago. It is a distribution problem, and distribution problems are solved by making the instrument cheap, rugged and numerous.
