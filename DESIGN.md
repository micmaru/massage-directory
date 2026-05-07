<!-- SEED: re-run /impeccable document once there's code to capture the actual tokens and components. -->

---
name: MassageMap
description: South Africa's vetted massage therapy directory — warm, trusted, local.
---

# Design System: MassageMap

## 1. Overview

**Creative North Star: "The Trusted Referral"**

MassageMap is what it feels like when a knowledgeable friend recommends a practitioner they personally vouch for. The interface is warm without being soft, professional without being clinical, and distinctly South African without being parochial. Every screen should feel like it was made by someone who cares about the local massage therapy community — not assembled from a global SaaS template or a generic classifieds platform.

The visual register is restrained: an off-white surface that reads like warm paper, a teal accent used with the restraint of a quality editorial magazine, and a dark navigation bar that anchors the product with authority. Serif display type provides warmth and credibility; humanist sans body copy stays readable and approachable. The Woolworths.co.za quality signal is the right reference point for trust and warmth — premium without pretension, distinctly local.

Motion responds to user actions, never performs for its own sake. A button press confirms; a card hover lifts slightly. No choreography, no scroll sequences.

This system explicitly rejects three failure modes from PRODUCT.md: the cluttered transactional energy of Gumtree, the clinical institutional coldness of Netcare, and the visual language of adult/escort directories. Any pattern that reads as seedy, chaotic, or corporate-medical is a hard failure.

**Key Characteristics:**
- Warm off-white surfaces (#f8f5f0) with a dark navigation bar as the anchoring constant
- Restrained teal accent: appears on ≤10% of any screen, earns attention through rarity
- Serif display type for names and headings; humanist sans for all functional copy
- Responsive motion — feedback and transitions, no choreography
- Full platform visual consistency: one design language across browse, profile, registration, and dashboard


## 2. Colors: The Trusted Palette

A restrained palette grounded in warmth and paper-like surfaces. The accent earns its place through scarcity; neutrals carry warmth, never clinical white.

### Primary
- **Warm Teal** ([to be resolved during implementation — approximately oklch(55% 0.12 185)]): The single accent. Primary CTAs, active states, verified badges, key interactive links. Never decorative.

### Neutral
- **Warm Off-White** (#f8f5f0): Primary surface. Page backgrounds and card backgrounds. Reads like quality paper — warmer than clinical white, lighter than cream. This is the dominant color of the product.
- **Dark Anchor** ([to be resolved — deep navy or charcoal, approximately #1a1f2e]): Top navigation bar background across all screens. Provides authority and visual continuity without the harshness of pure black.
- **Warm Ink** ([to be resolved — dark warm-neutral for body text, approximately oklch(22% 0.01 60)]): Primary text. Tinted toward warmth, never pure black.
- **Muted Stone** ([to be resolved — medium neutral for secondary text, borders, dividers, approximately oklch(65% 0.01 60)]): Supporting text, input borders, card separators.

**The Rarity Rule.** The teal accent appears on ≤10% of any given screen. Its scarcity is intentional — when it appears, it means: primary action, verified status, or active state.

**The Warm Surface Rule.** No pure white (#ffffff) and no pure black (#000000) anywhere. Every neutral carries warmth. Clinical white belongs on Netcare; it does not belong here.


## 3. Typography

**Display Font:** Serif — [to be chosen at implementation; candidates: Lora, Playfair Display, DM Serif Display]
**Body Font:** Humanist sans — [to be chosen at implementation; candidates: Inter, Source Sans 3, Nunito]

**Character:** A pairing that reads like a quality South African publication. The serif display provides editorial warmth and trust signals; the humanist sans keeps body copy accessible and contemporary. Neither is precious. Together they say: knowledgeable, local, trustworthy.

### Hierarchy
- **Display** (serif, light to regular weight, large scale): Profile names at hero scale, prominent section headings. Signals permanence and quality.
- **Headline** (serif or sans semibold, medium-large): Page titles, card headings, listing names at list scale.
- **Title** (sans medium to semibold): Section labels, navigation items, dashboard panel headers.
- **Body** (sans regular, base size, 65–75ch max line length): All descriptive content, profile bios, listing details, form guidance.
- **Label** (sans medium, small, slightly tracked): Tags, status badges, metadata, button copy, category labels.

**The Register Rule.** Serif for names and display moments only. Sans for everything functional. A serif label inside a sans-body card, or vice versa, is a design error.


## 4. Elevation

Flat by default. Depth is conveyed through tonal surface layering — card backgrounds are slightly warmer or cooler than the page background — and restrained hover shadows. No heavy drop shadows at rest.

**The Flat-by-Default Rule.** Surfaces sit at zero elevation. A shadow only appears as a response to an interactive state (hover, focus, dragging). A resting card must not compete with its content through decoration.


## 5. Components

*No components to document in seed mode. Re-run `/impeccable document` once implementation begins to capture real tokens, component shapes, and the sidecar panel.*


## 6. Do's and Don'ts

### Do:
- **Do** use the teal accent on ≤10% of any screen. Its rarity is a trust signal.
- **Do** keep the dark navigation bar consistent across every customer-facing screen. It is the product's visual constant.
- **Do** use serif display type for headings and profile names; humanist sans for all functional and body copy.
- **Do** tint every neutral toward warmth. Off-white surfaces, warm-ink text, muted-stone borders.
- **Do** respond to user actions with transitions (Responsive motion). Feedback belongs; choreography does not.
- **Do** maintain full visual consistency across browse, profile, registration, and dashboard. If a component looks different across screens, it is a bug.
- **Do** lift card elevation only on hover or active state, not at rest.

### Don't:
- **Don't** design like Gumtree: no cluttered classifieds layouts, no transactional density, no low-trust visual shortcuts.
- **Don't** design like Netcare: no clinical white, no institutional coldness, no medical-hierarchy UI rigidity.
- **Don't** use any visual pattern associated with adult or escort directories: no dark full-bleed photography with neon accents, no anonymous category-browsing that feels seedy.
- **Don't** use pure white (#ffffff) or pure black (#000000) as any surface or text color. Every neutral must carry warmth.
- **Don't** use the teal accent decoratively. If it appears, it must mean something: primary action, verified status, or active state.
- **Don't** mix serif and sans within a single UI component.
- **Don't** add choreography: no scroll-triggered entrance sequences, no staggered list animations, no motion for its own sake.
- **Don't** let visual drift accumulate between screens. Consistency across the full platform is a stated design principle, not a nice-to-have.
