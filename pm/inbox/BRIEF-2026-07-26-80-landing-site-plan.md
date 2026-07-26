status: NEW

# BRIEF-2026-07-26-80-landing-site-plan

## Context

Yuri wants a sales/marketing landing site for "4 AI-секретарь" soon (separate from the product itself). He provided a design-token reference file extracted from `https://www.auros.global/` (dark teal "abyssal fintech terminal" style — colors, type scale, spacing, component patterns) and wants the layout/structure patterns reused, with colors/type swapped to our own brand.

Reference file: `pm/inbox/DESIGN-auros-reference.md` (copy the uploaded token doc here if not already present — ask Yuri if missing, do not fetch auros.global's actual page content/imagery for reuse, only the structural pattern).

Auros itself is a crypto liquidity/trading firm — do not reuse their copy, stats, or claims. Only reuse: section structure (nav → hero with headline+CTA → feature/service cards row → large stat counters → testimonials → recessed CTA footer), component patterns (surface cards without shadows, uppercase tracked labels, gradient CTA button, large glowing stat numbers), and spacing rhythm.

## Task — plan only, no code yet

1. Propose a color/type mapping from the Auros token set to our existing brand (light/dark green glass design system — see `DESIGN-GLASS-001` / [[project_glass_design_system]] equivalent in this repo's design docs) so the landing page feels consistent with the product's own UI, not literally copying Auros's teal/pink.
2. Draft a section-by-section content outline for the landing page tailored to "4 AI-секретарь" (personal AI task secretary via Telegram/VK/web), for example: hero (value prop + CTA to start in Telegram), 3-4 feature cards (AI chat, voice, smart reminders, memory/skills), stat counters (placeholder metrics until we have real ones — flag clearly as placeholder), testimonials (placeholder until beta feedback exists — do not invent fake quotes), pricing teaser linking to in-app subscription, footer CTA.
3. Decide/propose where this lives technically: a new static page/repo, or a route within the existing public site — flag trade-offs (SEO, deploy simplicity, whether it needs to be a separate repo like the content-factory site).
4. Do NOT write the actual site code yet. Produce a short plan doc (`docs/tasks/LANDING-001-sales-site-plan.md` or similar in the private docs repo) with the above, plus open questions for Yuri.

## Stop Points

- No implementation/code for the landing site itself in this brief — plan document only.
- Do not use any real user counts, testimonials, or stats that aren't real yet — mark all placeholders explicitly.
- No production deploy, no domain/DNS changes without Yuri's explicit approval.

## Verification

- Plan doc exists and is readable without needing to open the Auros reference separately (self-contained).

## Report

`pm/outbox/REPORT-2026-07-26-80-landing-site-plan.md` — plain-language summary (per `AGENTS.md` "Как писать отчёты для Юрия"): what the plan proposes, what decisions Yuri needs to make before code starts, where to read the full plan.
