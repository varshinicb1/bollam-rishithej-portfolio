# Wikipedia, Wikidata and the Knowledge Panel

Checked on 2026-10-14 against the live APIs: **no English Wikipedia article
exists** for "Bollam Rishithej" or "Rishithej Bollam", and **no Wikidata item
exists** for either name or for ML Dynamic Solutions.

I have not created a Wikipedia page, and I want to be straight about why,
because the reason is not caution — it is that doing it now would make the
search problem **worse**, not better.

---

## Why a page created today would be deleted

Wikipedia's bar for a person is **WP:GNG** and **WP:NBIO**: significant
coverage, in multiple published, reliable, **secondary** sources that are
**independent of the subject**. Independent means not written by him, not
issued by his companies, and not paid for.

When I searched for him last week, the result was explicit: *no independent
news coverage or third-party confirmation.* That is the entire problem, and
it is the same blocker for every route below.

A new article about a living person with no independent sourcing is routinely
removed within hours under **CSD A7** — no credible indication of
significance — or sent to Articles for Deletion.

**And this is the part that matters for your goal:** a deletion discussion is
a permanent, public, heavily-indexed page titled
*"Wikipedia:Articles for deletion/Bollam Rishithej"*. Wikipedia ranks
extremely well. You would be creating a page that ranks for your own name and
whose entire content is a group of strangers explaining why you are not
notable. That is strictly worse than the current situation, and it cannot be
deleted afterwards.

There is a second cost. **WP:AUTOBIO** and **WP:COI** discourage writing about
yourself, and the Wikimedia Terms of Use require paid editors to disclose.
Undisclosed self-promotion is detected often, and when it is, it attracts the
kind of coverage you do not want.

So: not yet. Not never — **not yet**, and the gap is specific and closable.

---

## What to do instead, in order

### 1. Wikidata — the realistic near-term target

Wikidata is a separate project with a much lower bar. Under **WD:N** an item
is acceptable if it refers to a clearly identifiable entity that can be
described using *serious and publicly available references*. A company
director with verifiable corporate records and a published professional site
is a reasonable case — far short of what Wikipedia demands.

It matters because **Wikidata feeds Google's Knowledge Graph directly.** This
is the mechanism behind most of what you want from "a Wikipedia page."

**The item is written and ready to import**:
`security/wikidata-item.quickstatements.txt`

Every identifier in it was verified against the live Wikidata API on
2026-10-14, not recalled. Two that an earlier draft of this document had
wrong, and which would have silently created nonsense statements:

- University of Leicester is **Q1333399**, not Q1264125
- Master of Science is **Q950900**, not Q50101

| Property | Value | Verified |
|---|---|---|
| Label (en) | Bollam Rishithej | — |
| Description (en) | Indian company director and technology entrepreneur | — |
| Also known as | Rishithej Bollam; Bollam Rishi Thej; B. Rishithej; Rishi Bollam | — |
| instance of (P31) | human | Q5 |
| sex or gender (P21) | male | Q6581097 |
| country of citizenship (P27) | India | Q668 |
| occupation (P106) | entrepreneur | Q131524 |
| occupation (P106) | company director | Q107100767 |
| educated at (P69) | University of Leicester | Q1333399 |
| ↳ academic degree (P512) | Master of Science | Q950900 |
| residence (P551) | Hyderabad | Q1361 |
| official website (P856) | https://bollamrishithej.com/ | — |
| LinkedIn profile ID (P6634) | rishithej-bollam-5b7638362 | — |
| Instagram username (P2003) | rishithej_bollam | — |

Deliberately omitted: **date of birth**, because I do not know it and will not
guess one onto a public record about a living person; **employer (P108)** and
**affiliation (P1416)**, because no Wikidata item exists for ML Dynamic
Solutions and pointing at a non-existent item fails; **image (P18)**, which
requires a Commons upload under a free licence first — a separate decision,
since it permanently licenses the photograph for anyone's reuse.

### How to run it

1. Sign in at **quickstatements.toolforge.org** with the Wikimedia account.
2. **Declare the connection on the account's user page first** — one sentence
   is enough: *"I edit in connection with Bollam Rishithej / ML Dynamic
   Solutions."* Wikidata tolerates disclosed conflict of interest. It does not
   tolerate concealed conflict of interest, and being caught at the second is
   far worse than declaring the first.
3. New batch → **Import V1 commands** → paste the file → Import → Run.
4. It creates one item and ten referenced statements.

### Read this before you run it

**Every reference in the batch currently points at his own website.** Under
WD:N an item must describe a clearly identifiable entity using *serious and
publicly available* references, and a self-published site is a weak reading of
that. An item about a living person sourced entirely to their own site can be
taken to **Requests for Deletion**.

It is a far smaller risk than the Wikipedia one — a deleted Wikidata item
leaves no page arguing he is not notable — but it is real. **The single thing
that would make this item solid is one independent citation**, and the
University of Leicester alumni feature below is the easiest one available.

My recommendation: send the Leicester email first, and run the batch once you
have that URL to add as a reference. If you would rather create it now, the
file is ready and the downside is recoverable.

### 2. The Google Knowledge Panel — you do not need Wikipedia for this

Google builds entity understanding from structured data plus corroboration
across independent sources. The site now emits `disambiguatingDescription`,
`givenName`/`familyName`, `sameAs` and a full `Person` graph, which is the
on-site half done.

Once a panel appears, use **"Claim this knowledge panel"** to verify as the
subject and gain the ability to suggest corrections. You cannot claim one
that does not exist yet, which again routes back to step 3.

### 3. The actual bottleneck: be independently covered

Everything above is gated on the same thing. These are legitimate, specific
and mostly achievable within a year.

**Start this month:**

- **University of Leicester alumni story.** Universities actively want
  graduate-success features, he has a genuine one, and a `.ac.uk` page is a
  strong independent source. Email the alumni office. This is the single
  easiest credible citation available to him and he already has the
  photographs.
- **Canton Fair, 16 October.** Trade press covers Indian delegations at the
  fair. A quotable, specific point of view — the one in the new post, about
  manufacturability being the real gap — is what gets a founder quoted rather
  than listed.
- **DPIIT / Startup India.** Ensure the recognised entities' public listings
  name him. Government records are strong, neutral sources.

**Over the next six to twelve months:**

- **Editorial** trade coverage: Inc42, YourStory, Entrepreneur India,
  The Hindu BusinessLine, Telangana Today, Moneycontrol.
- **Conference speaking** with a published programme naming him.
- The **BITS Pilani Hyderabad** and **RV College** collaborations, if they
  produce a paper, a published MoU or a university news item.
- **Awards with independent juries** — not pay-to-enter listings.

### What not to do, at any price

**Do not buy "PR package" placements.** Large parts of the Indian digital
press sell articles, and Wikipedia editors maintain lists of outlets whose
coverage is treated as unreliable precisely because of it. Paid placements
do not count toward notability, they are recognisable to the people who
assess it, and once a subject is associated with them, future genuine
coverage is read with suspicion. It converts a solvable problem into a
permanent one.

The slow route is the only one that compounds, which is the same argument as
every other piece of writing on the site.

---

## Summary

| Route | Possible now? | Gate |
|---|---|---|
| Wikipedia article | **No** — would be deleted, and the deletion page would rank for his name | Significant independent secondary coverage |
| Wikidata item | Nearly — needs ~2 independent references | Same, much smaller amount |
| Knowledge Panel | Follows from the above | Entity corroboration |
| Search Console reindex | **Yes, today** | Your Google login |

The one thing that is fully available right now and still not done is
**verifying the domain in Google Search Console and requesting reindexing** —
Google's index still describes him as CEO of the ML Group, which is the claim
the site was corrected to remove.
