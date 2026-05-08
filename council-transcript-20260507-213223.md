# Council Transcript — MassageMap Homepage Layout

**Date:** 2026-05-07  
**Question:** Should MassageMap's homepage have a search bar only, or should it also show featured therapist cards below the fold?

---

## Framed Question

MassageMap is a vetted massage therapy directory for South Africa, serving mobile-first clients (primarily on phones, 375px base) who are looking for a nearby massage therapist or spa. The product is in a visual redesign toward a warm, trustworthy feel — the "Trusted Local Referral" — explicitly avoiding the cluttered classifieds feel of Gumtree.co.za and the clinical coldness of Netcare.

The decision: should the redesigned homepage show ONLY a search/location interface (province selector + search bar), OR should it also show featured therapist cards below the fold?

Context: mobile-first, trust-critical (competes with adult-services association), early-stage (low supplier count possible), three-sided product (clients, therapists/spas, admin).

---

## Advisor Responses

### The Contrarian
The featured-cards idea has a landmine baked into it: supplier count per area may be low. What does the homepage look like when there are three therapists in Johannesburg and none in Polokwane? You either show the same three cards to everyone regardless of location (dishonest, breaks trust) or empty slots (dead directory). Neither survives contact with a skeptical first-time visitor.

"Featured" implies curation. Who decides? Paid placement = recreates classifieds. Algorithmic = surfaces whoever registered first. Manual admin = doesn't scale past 50 suppliers.

Adult directories use exactly the grid-of-faces pattern. Cards without strong vetting markers actually accelerate the wrong association. Search-only isn't sparse — it's a confidence statement. Featured cards are a patch on weak search UX, not a design decision.

### The First Principles Thinker
The actual question is: what job does the homepage do? Users have an immediate specific need — a massage, nearby, now or soon. The homepage's job is to eliminate uncertainty about whether this is the right place, then get out of the way. Featured cards are a symptom of not trusting the search flow.

Early-stage supply is the real constraint not being named. Featured cards with thin coverage reveal directory immaturity. A Johannesburg user who sees three cards, two of which are in Pretoria, has already lost trust.

The trust signal needed is clarity of purpose, not visual richness. The wrong question is "search-only vs. featured cards." The right question: what one thing does a first-time visitor need to believe to start their search? Answer that in copy and visual hierarchy, then build the search path.

### The Expansionist
Featured cards — but framing is everything. Cards are social proof at exactly the trust moment. A well-composed card — verified badge, real photo, professional name, suburb — tells the visitor "these people were checked." That's what Gumtree cannot do.

"Featured" can become a revenue line. Paid homepage visibility is a natural subscription upsell. Five beautifully presented vetted therapists beats a province grid that leads to empty results. Scarcity, when honest, reads as selectiveness.

Cards make the homepage solve a trust problem AND a discovery problem simultaneously. Clients in transit who don't know which suburb they want get exposed to supply they wouldn't have found through the drill-down. The province grid stays. Search stays. But below it, three or four cards that say "this is what vetted looks like" — that's the homepage doing double duty.

### The Outsider
The province grid is a filing cabinet. Strangers don't open filing cabinets — they read the room first. At 375px, province selector plus search bar is the entire viewport. Nothing to feel. No signal that real humans are behind this.

The Gumtree risk comes from the wrong KIND of cards — price tags, low-quality photos, zero curation signal. A card with a professional headshot, vetted badge, named suburb says "these people were checked."

Solve the early-stage problem editorially: hand-pick 4-5 excellent profiles as permanent featured cards until density grows. Call the section "Featured Therapists" not "Near You." Honesty over false abundance. One viewport of search inputs cannot answer the question "are there real, vetted people on here?" A single well-composed therapist card can.

### The Executor
The current homepage already has a hero headline ("Find your perfect massage") and sub-line ("Browse therapists and spas across South Africa") plus the province grid. The structure is correct. The trust work to do today is copy-level, not architecture-level.

Change the sub-line to something that signals vetting — "Every listing personally vetted. No adult services." That single line, costing five minutes, does more trust work than a featured-cards section requiring a week of engineering.

Do not build featured cards until supplier density justifies it. Add `featured: true` to the supplier schema now so the field exists when needed. Move on.

---

## Peer Reviews

*Anonymization mapping: A = Expansionist, B = Outsider, C = First Principles, D = Contrarian, E = Executor*

### Reviewer 1
1. **Strongest: D (Contrarian).** Pressure-tests real failure modes — empty state, curation-legitimacy trap, irony that grid-of-faces is exactly the adult directory pattern.
2. **Biggest blind spot: A (Expansionist).** Assumes five well-presented vetted therapists are ready now, in right locations, with good photos. That assumption does enormous silent work.
3. **What all missed:** Location detection. The most natural mobile-first move is to ask for or detect location on arrival — "Therapists near Sandton" instead of a province grid. Dissolves the featured-cards debate entirely.

### Reviewer 2
1. **Strongest: B (Outsider).** Names the actual mechanism (Gumtree's problem is low-quality photos + zero curation, not cards), proposes concrete editorial fix, connects design to trust without abstraction.
2. **Biggest blind spot: C (First Principles).** Reframes the question but offers nothing. "Answer in copy and visual hierarchy" is advice-shaped emptiness.
3. **What all missed:** The search path itself. Province-first is the wrong entry point for a mobile user in transit. A location-aware "near me" as primary CTA would do more work than either featured cards or copy tweaks.

### Reviewer 3
1. **Strongest: B (Outsider).** Makes a concrete recommendation, addresses the trust tension, separates Gumtree-cards-done-wrong from cards-done-right, offers an execution path.
2. **Biggest blind spot: C (First Principles).** Non-answer dressed as depth.
3. **What all missed:** The returning user. Every response treats the homepage as a first-visit trust problem. Directory stickiness depends on repeat visits — a search-only homepage has no memory, no shortcut for the returning visitor.

### Reviewer 4
1. **Strongest: B (Outsider).** Concrete recommendation, addresses the core tension, neutralises the trust objection.
2. **Biggest blind spot: E (Executor).** Treats copy as substitute for design. "Every listing personally vetted" is a claim any directory can make — does zero work if visual language reads untrustworthy.
3. **What all missed:** Return visit. All five treat the homepage as first-visit acquisition. A purely search-first homepage has no memory, no warmth, no reason to return.

### Reviewer 5
1. **Strongest: D (Contrarian).** Stress-tests implementation mechanics, names three concrete failure modes of "featured" (paid/algorithmic/manual), frames search-only as deliberate confidence signal.
2. **Biggest blind spot: C (First Principles).** Rigorous setup, empty conclusion.
3. **What all missed:** Three-sided product dynamic. The homepage is also a supplier recruitment signal. Early-stage suppliers deciding whether to register ask "does this directory look worth paying for?" All five reasoned exclusively from the customer side.

---

## Chairman's Verdict

### Where the Council Agrees
The province grid alone is a weak trust signal. Early-stage supplier density is the critical constraint on featured cards. "Featured" requires honesty about what it means — paid placement recreates classifieds, algorithmic surfaces first-registered, manual doesn't scale. Copy is underused and undervalued.

### Where the Council Clashes
Search-only as confidence vs. search-only as coldness. Both are right about different users. The disagreement is about what "done well" requires, and whether the suppliers to support it exist today. Revenue potential of featured placement: legitimate at maturity, a trap at early stage — a disagreement about timing, not principle.

### Blind Spots the Council Caught
**Location detection** (3 peer reviewers flagged independently): province-first was treated as fixed, but a "near me" GPS CTA dissolves the featured-cards debate. **Three-sided product dynamic**: the homepage is also a supplier recruitment signal. **The returning user**: all five treated the homepage as a first-visit problem only.

### The Recommendation
Do not build featured cards yet. Add location detection as the primary CTA. Fix the copy today.

The Contrarian wins on implementation risk. The moment the Expansionist's assumption is validated — six or more active, photographed, verified suppliers in a single area — the Outsider's case becomes correct and featured cards should be added. Add `featured: true` to the supplier schema now so the capability exists when density justifies it.

### The One Thing to Do First
Add a "Find therapists near me" button as the primary CTA above the province grid — GPS detection on tap, graceful fallback to province grid on denial — and update the sub-line copy to explicitly name vetting and exclude adult services.
