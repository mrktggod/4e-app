status: DONE

# BRIEF-2026-07-27-82-vk-dashboard-separate-surface-parity

## Context

Yuri decided VK should remain a separate surface, but should be brought as close as practical to desktop/Telegram. Do not blindly copy the web/TG dashboard shell. Adapt VK intentionally.

## Task

Improve VK dashboard/home parity as a narrow VK-only slice.

Goals:

- keep VK as its own `vk.html` surface;
- make the first screen visually and functionally closer to the current product home;
- keep existing VK auth/session/payment behavior unchanged;
- avoid broad redesign architecture.

Start by auditing current `vk.html` home against current `index.html` home and implement only the smallest safe dashboard/home parity change.

## Stop Points

- No VK Pay, payment, entitlement, auth/session or production changes.
- No wholesale copy of `index.html` shell into `vk.html`.
- If the required change is broad, stop with `NEED-CLAUDE`.

## Verification

- `npm run test:e2e:vk`
- relevant VK smoke, or add one if missing;
- no duplicate logo regression: `npm run smoke:vk-header-logo`.

## Report

Create `pm/outbox/REPORT-BRIEF-2026-07-27-82-vk-dashboard-separate-surface-parity.md`.
