status: DONE

# BRIEF-2026-07-27-81-landing-main-domain-implementation

## Context

Yuri approved starting the sales landing implementation. The landing should live on the main domain path, not as a separate unrelated site. Existing plan: `docs/tasks/LANDING-001-sales-site-plan.md`.

## Task

Build the first landing page version in the app repo, ready for preview before production/domain routing changes.

Use the plan:

- product: `4 AI-секретарь`;
- visual direction: green glass, not Auros teal/pink;
- structure: nav, hero, feature cards, workflow, placeholder-safe stats or no stats, scenario/testimonial area without fake quotes, subscription teaser without prices, FAQ/trust, final CTA.

Recommended implementation:

- create `landing.html` or `/landing/` static entry inside this repo;
- reuse existing assets/styles where practical;
- do not replace the current app entry until Yuri explicitly approves routing;
- do not publish prices;
- no production deploy.

## Verification

- Landing page opens locally.
- First viewport clearly shows `4 AI-секретарь` and a CTA.
- No fake stats, no fake testimonials, no Auros copy.
- Mobile 390px and desktop screenshots show no text overlap or horizontal overflow.

## Report

Create `pm/outbox/REPORT-BRIEF-2026-07-27-81-landing-main-domain-implementation.md`.
