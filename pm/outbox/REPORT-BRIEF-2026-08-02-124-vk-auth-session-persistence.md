# REPORT-BRIEF-2026-08-02-124-vk-auth-session-persistence

status: NEED-CLAUDE
lessons_read: 1

## Scope Decision

No obvious local frontend token/session bug was found in `vk.html`; the remaining manual symptom needs live VK/worker auth review.

## Findings

- `vk.html:767` uses `WORKER = 'https://edge.4-ai.site'` and `vk.html:768` stores the saved frontend token under `vk4_token`.
- `vk.html:989` saves the token to localStorage.
- `vk.html:1008` completes auth by storing token/user and entering the app.
- `vk.html:947` treats only `401`, `403`, and explicit invalid-token style responses as reasons to delete a saved token.
- `scripts/vk-auth-session-smoke.mjs` verifies that saved tokens survive `500`, `429`, invalid JSON, network, and timeout recovery paths, and are removed only for `401`, `403`, or explicit invalid token.

## Why Not DONE

- Local mocked session persistence is green.
- The reported user-facing issue may depend on live VK launch params, worker `/auth/me` or `/auth/vk` behavior, token validation policy, VK credentials, or account linking.
- The brief explicitly says to stop with `NEED-CLAUDE` if the cause touches worker auth, account linking, VK credentials, token validation policy, or security-sensitive behavior.

## Verification

- `npm run smoke:vk-auth-session` - PASS.
- `$env:AUTOTEST_PORT='4185'; npm run test:e2e:vk` - PASS, 4/4 tests. Default port `4174` is occupied on this workstation and serves the wrong response, so a free port was required.
- `node scripts/check-cp1251-mojibake.mjs` - PASS, `0 suspicious tokens`.
- `npm run check:portable-paths` - PASS.
- `git diff --check` - PASS.

## Proposed Next Step

- Claude should inspect live VK Mini App auth with real launch params and worker logs for `/auth/me`, `/auth/vk`, and token validation outcomes.
- If worker returns recoverable errors that the frontend misclassifies, create a narrow follow-up with exact response samples.

## Commit

- App commit: a02e57def4557f64cbf797d6fed14d802bc46f3c

## Honest Tails

- No live VK auth was executed.
- No runtime auth code was changed.
- No production deploy, no merge into `main`, no CAL, no prices, no secrets, no payment or entitlement changes.
- Pre-existing unrelated local modifications were left untouched.
