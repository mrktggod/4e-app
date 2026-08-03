# Release queue

Очередь показывает путь от PR к `main`, deployment и ручной приёмке. Merge принимает только человек.

| Brief | Поверхность | release_state | Что подтверждено | Следующее действие / владелец |
| --- | --- | --- | --- | --- |
| BRIEF-2026-08-02-119-remove-home-show-all-button | Telegram Mini App dashboard | CHANGES_REQUIRED | PR #53, head `a820b7cae6f9451c4578ece86a35229ecfac62c5`; `api-smoke`/`qa:quick` green; review нашёл старые screenshots | Новый evidence follow-up с screenshots именно head; затем Алексей решает merge |
| BRIEF-2026-08-02-120-telegram-web-menu-and-voice-buttons-regression | Telegram Mini App и web/PWA | BLOCKED / NEED-YURI | PR #54, head `869c32dd1fda5000fbf32807d4718cc9b1c842e4`; CI green; live surface не доказана | Юрий даёт device/viewport screenshots и точный handoff |
| BRIEF-2026-08-02-121-web-oauth-route-and-test-link-popup | web/PWA OAuth | IMPLEMENTATION_QUEUED | PR/SHA нет, статус NEW | Узкая диагностика без auth-кода; ночной владелец |
| BRIEF-2026-08-02-122-notifications-functional-audit | Telegram Mini App / web | IMPLEMENTATION_QUEUED | PR/SHA нет, статус NEW | Аудит контракта и evidence; ночной владелец |
| BRIEF-2026-08-02-123-telegram-group-bot-no-response | Telegram bot | NEED-YURI | Живая группа и canonical bot evidence отсутствуют | Юрий даёт live evidence или canonical bot worktree |
| BRIEF-2026-08-02-124-vk-auth-session-persistence | VK Mini App / web | IMPLEMENTATION_QUEUED | PR/SHA нет, статус NEW | Диагностика без auth/security изменений; ночной владелец |
| BRIEF-2026-08-02-125-vk-dashboard-profile-parity-audit | VK Mini App | IMPLEMENTATION_QUEUED | PR/SHA нет, статус NEW | Gap matrix и узкие follow-up briefs; ночной владелец |
| BRIEF-2026-08-02-126-vk-chat-created-task-not-on-dashboard | VK Mini App | IMPLEMENTATION_QUEUED | PR/SHA нет, статус NEW | Узкая диагностика state/refresh; ночной владелец |

PR #53 и #54 не помечены `PR_READY`: независимый review 4pm PR #22 требует process/evidence исправлений. Ни один SHA не подтверждён в `main` или deployment.
