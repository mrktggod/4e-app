status: DONE

# BRIEF-2026-07-25-66-dashboard-right-edge-overflow

## Context

Linked bug: `BUG-2026-07-25-013`.

The home dashboard right edge is clipped on a phone viewport.

## Task

Find and fix the home/dashboard horizontal overflow or app-shell width issue causing the right edge to be clipped. Keep changes scoped to layout/CSS and existing home shell patterns.

## Stop Points

- No production deploy.
- No merge into `main`.
- No broad redesign migration.
- No payment, entitlement, CAL, price, or secret work.

## Verification

- `node scripts/check-cp1251-mojibake.mjs`
- `npm run smoke:home001`
- `npm run test:e2e:web` if shell/nav layout changes.
- Shared guards before commit.

## Report

Write `pm/outbox/REPORT-BRIEF-2026-07-25-66-dashboard-right-edge-overflow.md`.
