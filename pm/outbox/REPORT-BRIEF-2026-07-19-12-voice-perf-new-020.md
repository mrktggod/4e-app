status: DONE

# REPORT-BRIEF-2026-07-19-12-voice-perf-new-020

## Result

Stopped without code changes. The latest user instruction explicitly called out voice NEW-020 as live-QA / real-device work that must be marked `NEED-YURI` and not executed autonomously in this queue.

## Why Yuri Is Needed

- The brief's meaningful acceptance proof includes voice flow behavior and honest latency validation.
- Even though the brief mentions synthetic headless transcript injection, the user clarified that this item requires real-device/live QA for this run.
- Voice QA can depend on browser/device microphone behavior, Telegram/TMA shell behavior, and perceived latency; this should not be approximated as DONE here.

## Proposed Next Step

Yuri should run or authorize a focused real-device voice performance pass, then provide either:

- raw measured `window.__voicePerfLast` / `__voicePerfHistory` values from a real device, or
- an explicit refined brief allowing synthetic headless-only measurement and a narrow UI timing patch.

## Verification

```text
node scripts/check-cp1251-mojibake.mjs
CP1251 mojibake check passed: 0 suspicious tokens
```

## Honest Tails

- No voice code was changed.
- No staging voice smoke was run.
- No production deploy.
- No merge into `main`.
- No CAL, price, secret, payment, or entitlement work.

## Resolution Update - 2026-07-22

Alexey explicitly confirmed that voice works in his regular use and there are no remaining complaints. `NEW-020` is therefore closed as user-accepted without a speculative timing change. The earlier `NEED-YURI` classification remains useful history, but no additional raw telemetry or real-device pass is required for this task.
