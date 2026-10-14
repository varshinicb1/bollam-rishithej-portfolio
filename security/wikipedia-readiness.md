# Wikipedia readiness — holding state

Status on 14 October 2026, while we wait for Rishithej's answers on
intake.bollamrishithej.com. Nothing here gets submitted until the checker says so.

## Where everything stands

| Piece | State | Copy of record |
|---|---|---|
| Wikipedia draft | `Draft:Rishithej_Bollam`, saved 14 Oct 2026 10:26 UTC, **not submitted** | `security/wikipedia-draft.txt` (identical to the live revision) |
| Wikidata | `Q141734133`: label, description, 4 aliases, P31 / P21 / P569 / P27, **no references** | — |
| COI disclosure | `User:Varshinicb` declares the connection | live |
| Intake form | Live and empty, waiting for him | `intake/` |
| Independent sources | **None found** (see `reference-links.md`) | — |

## Live problems, pending a decision

These are public now. Fixing them needs the Wikipedia/Wikidata account, so
they are not done without a go-ahead.

1. **Date of birth with no source.** The draft's infobox and lead, and
   Wikidata P569, give 22 September 1999. It is not published anywhere he
   controls, and he has not yet agreed to publication. Wikipedia's rule for
   living people is to leave it out unless reliable sources publish it or
   the subject has published it himself.
2. **Disputed title.** The draft says "founder and managing director of ML
   Dynamic Solutions". mldynamic.com lists him as CEO and someone else as
   Founder.

## The submission gates

The draft is submitted only when all of these hold. `intake/readiness.mjs`
checks them automatically.

1. **Two or three independent, substantial sources** — not his site, not a
   company he is part of, not LinkedIn, not a press-release wire, not paid.
2. **Every claim cites one of them.** A claim with no source comes out.
3. **DOB** either sourced and agreed, or removed.
4. **Titles match the companies' own sites.**
5. **No placeholder references** (`SOURCE-1..4` must be real citations).

## When Rishi's answers come in

```bash
node intake/pull.mjs
node intake/readiness.mjs
```

That downloads his answers and files, then writes
`intake/received/readiness.md`: each gate marked PASS, BLOCKED, WAITING or
INFO, with the exact edits for the draft, Wikidata and the site. Work through
the BLOCKED items first. Both outputs are git-ignored because they hold his
personal data.

## Wikidata statements still to add

| Statement | When |
|---|---|
| P106 occupation: entrepreneur (Q131524) | Any time — uncontroversial |
| P106 occupation: company director (Q107100767) | Any time |
| P856 official website: https://bollamrishithej.com/ | Any time |
| P6634 LinkedIn: rishithej-bollam-5b7638362 | Any time |
| P69 educated at: University of Leicester (Q1333399) + P512 MSc (Q950900) | After he confirms the course and year |
| P551 residence: Hyderabad (Q1361) | After he confirms |
| P2003 Instagram | After he confirms which handle is his |
| References on every statement | As soon as there is a source to cite |

Adding statements through the Wikidata page needs the browser pane on screen.

## Deadlines to keep in mind

- **Drafts are deleted after six months without an edit (G13).** The last
  edit was 14 Oct 2026, so it is safe until about 14 April 2027. Any real
  edit resets the clock.
- **An item with no references can be nominated for deletion on
  Wikidata.** Adding P856 and references lowers that risk.

## Not to do

- Do not submit to Articles for Creation before the gates pass. A decline
  stays in the draft's history and a resubmission is reviewed more harshly.
- Do not move the draft into article space directly; with a declared
  conflict of interest, it must go through review.
- Do not cite the blog. Posts are self-published, so they cannot show
  notability, and they were redated on 14 Oct 2026.
