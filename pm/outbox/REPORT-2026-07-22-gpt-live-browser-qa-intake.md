status: QA-INTAKE

# GPT live/browser QA intake — 2026-07-22

## Source

External GPT QA note from Alexey. The run could not open a real Telegram Mini App / Telegram WebView and could not capture new screenshots because Chromium was unavailable in that environment.

Reported check time: `2026-07-22T19:44:35+02:00` (`2026-07-22T20:44:35+03:00` Moscow time).

Browser/live target: `https://app.4-ai.site/`.

Reported browser/live metadata:

- HTTP: `200 OK`
- `x-app-asset-version`: `tma-diag-2026-07-18-urgent2`
- Service worker: `prod-redesign-2026-07-21`
- Saved artifacts mentioned by GPT: `live-index.html`, `live-styles.min.css`, `live-sw.js` (not attached in this intake)

## Results

| Area | Status | Evidence |
| --- | --- | --- |
| Telegram Mini App after full close | `BLOCKED` | No access to real Telegram/WebView or Telegram version from GPT environment. |
| Old cache signs | `BLOCKED` for Telegram, `PASS` for browser/live | Browser/live returns production redesign markers and fresh service worker. |
| Dashboard | `PARTIAL PASS / BLOCKED` | Live HTML contains `dash-hero`, `focus-day-count`, `focus-day-text`, `focus-panel-overlay`, `focus-panel-list`; Telegram visual click not verified. |
| Task detail | `PARTIAL PASS / BLOCKED` | Live HTML contains `#task-detail`, `detail-redesign-shell`, `detail-redesign-hero`, and controls `Перенести`, `Редактировать`, `Готово`; long-title layout not visually rendered. |
| Profile | `PARTIAL PASS / BLOCKED` | Live HTML contains `profile-handoff-shell`, `profile-handoff-hero`, and one main `profile-avatar`; mobile duplicate/avatar layout not visually verified. |
| Screenshots | `BLOCKED` | Playwright installed but Chromium binary/system Chrome unavailable. |

## FAIL / BLOCKED interpretation

No confirmed FAIL was reported for the live browser app in this GPT run. The meaningful result is environmental: Telegram WebView and screenshots remain blocked from that QA environment.

Telegram cache is not proven. If Alexey's phone shows an older dashboard in Telegram while the regular mobile browser shows the redesign, that becomes strong evidence of Telegram WebView/cache behavior. Browser/live itself appears to serve redesign markers and the current service worker.

## Not published / not expected

`focus-summary-card` was not found in live HTML/CSS. This is not treated as a live bug for this intake; the published version currently uses `focus-panel-overlay` + `focus-panel-list`.

## Next manual evidence needed

To close the Telegram side, use a real phone:

1. Force close Telegram.
2. Open the Telegram Mini App.
3. Capture Dashboard, Focus popup, Task detail, and Profile.
4. Open `https://app.4-ai.site/` in the normal mobile browser and capture the same screens for comparison.

Keep this separate from the current iPhone task-detail blocker evidence: Alexey's manual screenshots already confirm live UI problems in reminder time, tag popup layering, long hero content, and bottom-nav background.
