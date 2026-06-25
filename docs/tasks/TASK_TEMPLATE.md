# Шаблон атомарной задачи для Мимо

Копируй этот шаблон, заполняй и вставляй в Мимо.
Максимум 5 строк — Мимо виснет на большом тексте.

---

## ФОРМАТ ЗАДАЧИ

```
ФАЙЛ: <путь к файлу>
НАЙТИ: '<точная строка>'
ЗАМЕНИТЬ НА: '<новая строка>'
ПРОВЕРИТЬ: <команда проверки>
ЗАДЕПЛОИТЬ: <yes/no>
```

---

## ПРИМЕРЫ

### Правка JS в vk.html
```
ФАЙЛ: <repo-root>/vk.html
НАЙТИ: 'loadTasks();'
ЗАМЕНИТЬ НА: 'loadTasks(); renderStats();'
ПРОВЕРИТЬ: Select-String -Path vk.html -Pattern 'renderStats'
ЗАДЕПЛОИТЬ: yes
```

### Правка Worker
```
ФАЙЛ: <worker-repo-root>/worker.js
НАЙТИ: 'return handleProxy(request)'
ЗАМЕНИТЬ НА: 'return handleProxy(request, session)'
ПРОВЕРИТЬ: npx wrangler deploy --dry-run
ЗАДЕПЛОИТЬ: yes
```

### Только деплой без правок
```
ПАПКА: <repo-root>
КОМАНДА: git add -A; git commit -m "fix: <описание>"; git push
```

---

## ПРАВИЛА ДЛЯ МИМО (обязательно читать)

1. Читать файлы ТОЛЬКО через: `[System.IO.File]::ReadAllText($f, [System.Text.Encoding]::UTF8)`
2. Писать файлы ТОЛЬКО через: `[System.IO.File]::WriteAllText($f, $content, (New-Object System.Text.UTF8Encoding $false))`
3. После правки проверить кириллицу: `Select-String -Path $file -Pattern 'Войти'`
4. Использовать `;` вместо `&&` в PowerShell
5. После задачи записать результат в `docs/tasks/done/YYYY-MM-DD_описание.md`
