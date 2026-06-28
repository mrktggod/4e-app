# BACK-021 — Голосовой ввод через MediaRecorder + Whisper (iOS fix)

**Приоритет:** P1  
**Ответственный:** Codex  
**Одна задача за сессию**

## Контекст

`SpeechRecognition` / `webkitSpeechRecognition` не работает в старых версиях iOS в Telegram WKWebView — даёт ошибку `aborted` сразу после старта. На Android и новых iOS работает нормально.

Текущий код в `index.html` (~строка 3863): `openVoice()` использует `SpeechRecognition`. Нужно заменить на `MediaRecorder` + транскрипцию через Whisper API, что работает на всех платформах.

## Что нужно сделать

### 1. index.html — заменить openVoice()

Новый флоу:
1. Пользователь нажимает микрофон → `openVoice()` открывает голосовой экран
2. `MediaRecorder` начинает запись (кнопка "Держи и говори" или авто-старт)
3. Пользователь нажимает стоп (или 10 сек таймаут) → запись останавливается
4. Аудио blob отправляется на Worker endpoint `/transcribe` (POST, multipart/form-data, поле `audio`)
5. Worker возвращает `{ text: "распознанный текст" }`
6. Текст вставляется в `ask-field` и отправляется через `sendAsk()`

Логика шагов (vs-1..vs-5):
- vs-1 "Распознаю речь" — крутится во время записи
- vs-2 "Понимаю запрос" — крутится после отправки на Whisper
- vs-3..vs-5 — как сейчас (анализ, ответ, готово)

Обработка ошибок:
- Нет доступа к микрофону → тост "Нет доступа к микрофону", закрыть экран
- Whisper вернул ошибку → тост "Не удалось распознать речь", закрыть экран
- Формат записи: `audio/webm` (Android/Desktop) или `audio/mp4` (iOS) — проверять `MediaRecorder.isTypeSupported`

### 2. worker — новый endpoint /transcribe

В `src/` добавить обработчик `POST /transcribe`:
- Читает multipart body, извлекает поле `audio` (blob)
- Проверяет `x-token` заголовок (авторизация как в `/anthropic`)
- Отправляет аудио в OpenAI Whisper API:
  ```
  POST https://api.openai.com/v1/audio/transcriptions
  Authorization: Bearer {OPENAI_KEY}
  Content-Type: multipart/form-data
  file: <audio blob>
  model: whisper-1
  language: ru
  ```
- Возвращает `{ text: "..." }` или `{ error: "..." }`
- Секрет `OPENAI_KEY` читать из `env.OPENAI_KEY` (не хардкодить!)

После изменений: `npm run build` → `npx wrangler deploy`

Добавить секрет:
```
npx wrangler secret put OPENAI_KEY
```
(Юрий введёт ключ)

### 3. Совместимость

- Оставить SpeechRecognition как fallback если MediaRecorder недоступен
- Или убрать SpeechRecognition полностью и везде использовать MediaRecorder — на усмотрение

## Критерий готовности

- На iPhone (старый iOS, Telegram) голосовой ввод работает: записывает, распознаёт, отправляет сообщение
- На Android голосовой ввод работает
- Секрет `OPENAI_KEY` не хардкодится в коде

## Файлы для чтения

1. `FILE_MAP.md` → `FILE_MAP_UI.md` → строки ~3860-3916 в `index.html` (текущий openVoice)
2. `FILE_MAP_WORKER.md` — структура worker src/
3. `AGENTS.md` — правила работы с worker.js и кодировкой

## После выполнения

Обновить `pm/backlog.md` (BACK-021 → Ready for QA) и добавить запись в `shared/WORK_LOG.md`.
