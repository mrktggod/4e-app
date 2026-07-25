# Интеграция Xiaomi MiMo

## Конфигурация

- Provider: OpenAI-compatible API.
- Endpoint: `https://api.xiaomimimo.com/v1`.
- Model: `mimo-v2.5-pro`.
- Secret хранится локально в `C:\Users\shelc\.continue\.env` как `MIMO_API_KEY`.
- `C:\Users\shelc\.continue\config.yaml` использует ссылку `${{ secrets.MIMO_API_KEY }}` и не содержит MiMo key напрямую.

## Локальный клиент

```powershell
node scripts\mimo-client.js --prompt "Reply exactly OK" --max-tokens 128
```

Для больших запросов предпочтителен stdin, чтобы содержимое не попадало в аргументы процесса:

```powershell
Get-Content prompt.txt -Raw | node scripts\mimo-client.js --max-tokens 1024
```

## Политика использования

- Не отправлять MiMo весь репозиторий автоматически.
- Передавать только необходимые фрагменты и формулировку конкретной задачи.
- Не отправлять secrets, `.env`, `.dev.vars`, пользовательские переписки и production-данные.
- Использовать MiMo как дополнительного аналитика или reviewer; окончательные изменения проверяет Codex локальными тестами.
- Учитывать, что API-запросы могут расходовать квоту Xiaomi.
- Для рабочих запросов указывать `--task-id MIMO-NNN`; метаданные вызова попадут в `docs/MIMO_ACTIVITY.jsonl`.
- Результат и проверку записывать в `docs/MIMO_WORK_LOG.md`.
