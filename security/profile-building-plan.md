# Building Bollam Rishithej's public profile

Written 15 October 2026. The aim is to be **findable, consistent and
independently covered**. Visibility built that way compounds; visibility
bought or faked collapses, and on Wikipedia it gets the subject's name
blacklisted.

## Where he stands today

| Surface | State |
|---|---|
| bollamrishithej.com | Live, strong, structured data links Wikidata, LinkedIn, Instagram |
| Wikidata Q141734133 | Live, linked both ways with the site |
| Wikipedia | Draft ready, COI declared on the draft's talk page; **blocked on independent sources** |
| LinkedIn | Exists; URL has a random suffix (`-5b7638362`) |
| Instagram | Exists |
| Crunchbase, Wellfound, F6S, Startup India, X, YouTube, podcasts | **Nothing found** |
| News coverage | **None found** |

The single biggest gap is the last row. Everything else is a few hours of
setup; independent coverage is what makes the rest count.

## Tier 1: claim the ground (this week; he does these himself)

These need his own login or ID, so he does them, not us.

1. **LinkedIn**
   - Set a clean public URL: `linkedin.com/in/rishithej-bollam` (Settings → Edit
     public profile & URL), then update the site, Wikidata P6634 and the
     intake form to match.
   - Headline = the resolved titles only (wait for his intake answers).
   - Featured section: the website, "Fifty thousand people", the ventures page.
   - Turn on "Creator mode"-style topic hashtags: #Entrepreneurship #DeepTech
     #Manufacturing #India.
2. **Reserve the handles** before anyone else does: X `@rishithej_bollam`
   (currently free), a YouTube `@` handle, Threads. Even if unused, put the
   website link in each bio.
3. **Crunchbase** person profile, plus profiles for VidyuthLabs, Predictera,
   FirstSecure.ai. Journalists and investors check Crunchbase first, and Google
   reads it. Free to submit; Crunchbase moderates.
4. **Startup India (startupindia.gov.in)** profiles for every DPIIT-recognised
   company. These are government pages: they are the citation for the DPIIT
   line in the Wikipedia draft, which currently has a placeholder.
5. **Wellfound and F6S** company pages, for hiring and programme applications.
6. **One name everywhere: "Bollam Rishithej"**, with the same photo and the same
   one-line bio. Inconsistent names split Google's understanding of him into
   several people.
7. **Google Knowledge Panel.** The groundwork is done (Wikidata ↔ website). When
   a panel appears for his name, he clicks "Claim this knowledge panel" and
   verifies with the Google account tied to his LinkedIn or website.

## Tier 2: earn independent coverage (the part that matters most)

This is what makes Wikipedia possible and what a Knowledge Panel is built
from. Each item is a real story he already has; nothing needs inventing.

| Story he already has | Pitch to | Why they'd run it |
|---|---|---|
| Leicester MSc → founder in Hyderabad | University of Leicester alumni office | Universities actively want graduate-founder stories |
| AI school-management pilot at Deccan Springs Global School, MoU signed | Telangana Today, Deccan Chronicle, The Hindu (Hyderabad), EdTech desks at YourStory / Inc42 | Local, concrete, education angle |
| Going to the Canton Fair to learn manufacturing for Indian hardware | ET Manufacturing, Mint, Moneycontrol, Inc42 | Timely (Phase 1 opens 16 Oct) and on-trend: Indian hardware, supply chains |
| Portable electrochemical instruments (VidyuthLabs) with academic collaboration | The Hindu Science, IndiaBioscience, ET HealthWorld | Deep-tech from Hyderabad; only once the collaboration is signed |
| DPIIT-recognised startups across AI and sensing | Entrackr, Inc42 "startup spotlight" sections | Low bar, real coverage |
| "Fifty thousand jobs" as a founder's metric | Op-ed desks: Mint, ET Prime, The Print, Moneycontrol | Strong, distinctive argument |

Also:
- **Hyderabad ecosystem:** T-Hub, T-Works, WE Hub, TiE Hyderabad, NASSCOM
  events. Apply to speak or judge; event pages that name speakers are
  independent mentions.
- **Podcasts:** Indian startup podcasts take founder guests regularly; each
  episode page is a durable, searchable mention.
- **Awards with independent juries** (not pay-to-enter "40 under 40" lists).

Note: op-eds and podcast interviews build reach, but Wikipedia does not count
his own words as independent coverage. News articles *about* him, written by
journalists, are what count.

## Tier 3: a content engine that compounds

- **LinkedIn, two posts a week.** The seven blog essays are seven-plus weeks of
  material. Each becomes a text post, then a carousel, then a 60-second video.
- **Canton Fair, 16 Oct onwards: the best near-term moment.** Short daily
  posts: what he learned, what surprised him, what's cheap or hard. Specific,
  honest, timely posts from a trade-fair floor are the kind that travel. Then
  one wrap-up blog post.
- **Instagram:** the human side — the fair, the school pilot, the lab, the
  team. Reels outperform static posts.
- **Reply, don't only post.** Thoughtful comments on posts by larger accounts
  in Indian deep-tech and manufacturing bring more profile visits early on than
  original posts do.

## What "viral" honestly means here

No one can promise virality. What reliably works is being **specific, timely
and human** repeatedly, so that when one post does travel there is a
consistent, credible profile behind it. The Canton Fair trip is the best
chance in the next month.

## Do not, at any price

- **Paid "Wikipedia page creation" services.** Undisclosed paid editing is a
  Terms of Use violation. These agencies run sockpuppets; when caught, the
  article is deleted and the title often **salted** (locked against
  re-creation), which can permanently close Wikipedia to him.
- **Paid "featured in" placements, press-release wires, pay-to-be-listed
  "top founder" lists.** Reviewers recognise them, and they make genuine
  coverage look suspect.
- **Bought followers, likes or engagement pods.** LinkedIn and Instagram
  detect and suppress them; the profile ends up with less reach.
- **Different titles on different sites.** Fix the ML Dynamic and FirstSecure
  contradictions (intake form section 05) before any press push; a journalist
  who finds them will ask.

## Order of work

1. Now: reserve handles, Crunchbase, Startup India, LinkedIn URL.
2. 16–20 Oct: Canton Fair posting.
3. As soon as his intake answers arrive: fix titles everywhere; email the
   Leicester alumni office.
4. Next 4–8 weeks: pitch the Deccan Springs story to Hyderabad press, then the
   manufacturing angle to national business press.
5. When two or three independent articles exist: run
   `node intake/readiness.mjs`, fill the draft's citations, submit to Articles
   for Creation.
