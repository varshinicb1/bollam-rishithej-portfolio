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

It still needs at least a couple of genuinely independent references, so do
step 3 first or alongside. When there are two, the item is:

| Property | Value |
|---|---|
| Label (en) | Bollam Rishithej |
| Also known as | Rishithej Bollam; Bollam Rishi Thej; B. Rishithej |
| Description (en) | Indian company director and technology entrepreneur |
| instance of (P31) | human (Q5) |
| sex or gender (P21) | *(as he wishes to state it)* |
| country of citizenship (P27) | India (Q668) |
| occupation (P106) | entrepreneur (Q131524); company director |
| educated at (P69) | University of Leicester (Q1264125) |
| academic degree (P512) | Master of Science (Q50101) |
| residence (P551) | Hyderabad (Q1361) |
| official website (P856) | https://bollamrishithej.com/ |
| described at URL (P973) | https://bollamrishithej.com/about |

Every statement needs a **reference** (P248 / S854). Statements sourced only
to his own site will be challenged; the two independent ones carry the item.

**Do not create it from an account that is obviously his.** Declare the
connection on the account's user page instead. Wikidata tolerates disclosed
COI; it does not tolerate concealed COI.

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
