status: NEED-CLAUDE

# REPORT-BRIEF-2026-07-21-night-liquid-glass-system

## Result
Did not implement the liquid-glass system autonomously. The brief asks to make the source panel a reusable design-language layer across dashboard, profile/settings, task detail, notifications, and chat surfaces. Under the autonomous guardrails this is redesign architecture work, not a narrow whitelisted UI fix.

## Classification
Outcome: `NEED-CLAUDE`.

Reason: the task affects shared visual primitives and multiple large screen surfaces. The brief itself says to stop if the implementation becomes a broad redesign architecture migration; current code already has several overlapping glass/redesign layers, so a night-run CSS sweep would be high risk.

## Evidence
- Source artifact: `docs/tasks/assets/4_liquid_glass_panel_component_2026-07-21.html:14` defines core blur/saturation/brightness/tint variables.
- Source artifact: `docs/tasks/assets/4_liquid_glass_panel_component_2026-07-21.html:148` defines the panel surface with backdrop filters and `url(#glass)`.
- Source artifact: `docs/tasks/assets/4_liquid_glass_panel_component_2026-07-21.html:194` defines the edge-light pseudo-element.
- Source artifact: `docs/tasks/assets/4_liquid_glass_panel_component_2026-07-21.html:225` defines the green glow pseudo-element.
- Source artifact: `docs/tasks/assets/4_liquid_glass_panel_component_2026-07-21.html:314` defines hover glow, but no explicit `:active`, `pointerdown`, or click-state rule was found in the canonical artifact.
- Existing app tokens: `styles/variables.less:35` already defines light-theme `.glass`, `.glass-green`, and `.glass-nav` overrides.
- Existing handoff layer: `styles/screens/light-redesign.less:54` applies shared glass styling to dashboard, profile, subscription, and task-detail surfaces.
- Existing layer size: `styles/screens/light-redesign.less` is already a large accumulated redesign override file, so another broad pass needs design review to avoid regressions.

## Proposed Plan For Claude/Yuri Review
1. Decide the canonical target surface list before implementation: start with one pilot screen, preferably dashboard or task-detail, then expand after visual QA.
2. Add neutral tokens in `styles/variables.less` only after agreeing on dark/light values and whether SVG filter plumbing is allowed globally.
3. Create a reusable BEM class family such as `.ui-liquid-glass`, `.ui-liquid-glass--interactive`, and `.ui-liquid-glass--green` instead of expanding the current ad hoc `.glass` selectors.
4. Preserve the source hover glow and define the missing press/click state explicitly with `:active` plus an optional JS class only if browser smoke proves CSS alone is insufficient.
5. Run the required 390x844 visual smoke on dashboard, task detail, profile/settings, notifications, and one dark/light comparison before classifying the implementation as `DONE`.

## Risks If Implemented Blindly
- Text contrast and overlap regressions on 390x844 because existing redesign screens already use dense absolute/fixed visual layers.
- Conflicting specificity with `styles/screens/light-redesign.less`, which currently contains many `!important` overrides.
- Possible UI architecture guard churn if SVG filters or helper markup are added in `index.html`.
- Ambiguous click-glow requirement because the canonical artifact has hover glow but no explicit click-state rule.

## Files Changed
- `pm/inbox/BRIEF-2026-07-21-night-liquid-glass-system.md`
- `pm/outbox/REPORT-BRIEF-2026-07-21-night-liquid-glass-system.md`
- `shared/WORK_LOG.md`
- `DEVELOPMENT_LOG.md`
- `pm/team-sync.md`
- `FILE_MAP.md`

## Verification
- `node scripts/check-cp1251-mojibake.mjs`: passed, `0 suspicious tokens`.
- `git diff --check`: passed.
- `git diff --cached --check`: passed.
- `node scripts/check-js-syntax.mjs`: no staged JS or HTML files.
- `bash scripts/check-portable-paths.sh`: passed.

## Commit
This commit; exact pushed SHA is recorded in the automation final summary.
