# CODEX-014 — Staging Telegram provider sync smoke

## Статус

Done: controlled full staging smoke прошёл на synthetic data, cleanup проверен.

## Что проверено

- Staging Worker принимает signed bot `register-chat`.
- D1 provider sync включён только в staging.
- При наличии synthetic Telegram identity и KV `tg:*` mapping Worker создаёт:
  - `integrations`;
  - `conversations`;
  - `legacy_conversation_mappings`.
- Mapping rows получают expected provider-sync approval shape.
- Synthetic D1/KV state удаляется после проверки.

## Result

- `signedRegisterChat = ok`
- `d1ProviderSync = ok`
- Before cleanup:
  - `integrations = 1`
  - `conversations = 1`
  - `mappings = 2`
  - `approvedProviderMappings = 2`
- After cleanup:
  - `users = 0`
  - `identities = 0`
  - `integrations = 0`
  - `conversations = 0`
  - `mappings = 0`
- Synthetic KV cleanup:
  - `initial = 12`
  - `final = 0`

## Files

- `scripts/smoke-staging-telegram-provider-sync.ps1`

## Notes

- Node-based full smoke was removed because repeated Wrangler child-process
  calls on Windows hit `UV_HANDLE_CLOSING`.
- PowerShell-native script is the supported smoke path for this workspace.
- No token, raw Telegram ids, chat ids, user ids or hashes are printed.

## Next

Staging-safe approved mapping report is now covered by CODEX-015. Next, build
the unlock planner that consumes that report and produces an import decision
summary without exposing production data.
