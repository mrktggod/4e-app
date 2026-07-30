status: DONE
brief: pm/inbox/BRIEF-2026-07-30-112-vk-calendar-deadline-parity.md

# REPORT - BRIEF-2026-07-30-112 VK calendar deadline parity

## Result

VK calendar now resolves relative deadlines and shows a general list of all
tasks with deadlines.

## Changed Files

- `vk.html`
- `scripts/vk-calendar-date-key-smoke.mjs`
- `FILE_MAP.md`
- `DEVELOPMENT_LOG.md`

## Behavior

- ISO dates and ISO datetimes still map to their literal date key.
- `сегодня`, `завтра`, and `послезавтра` now resolve to local date keys.
- Month grid highlights tasks using the normalized deadline key.
- The selected-day list still filters by normalized date key.
- `calDeadlineList` shows all tasks that have a normalized deadline, sorted by
  date.

## Raw Evidence

```text
npm run smoke:vk-calendar-date-key
> node scripts/vk-calendar-date-key-smoke.mjs
VK calendar date-key smoke: PASS
```

```text
npm run test:e2e:vk
4 passed
```

```text
node --check scripts/vk-calendar-date-key-smoke.mjs
exit 0
```

```text
node scripts/check-cp1251-mojibake.mjs
CP1251 mojibake check passed: 0 suspicious tokens
```

## Tails

No external calendar/CAL-002/CAL-003 work, production deploy, main merge, or live
VK account/device check was performed.
