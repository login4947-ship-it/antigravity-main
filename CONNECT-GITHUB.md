# Подключение к GitHub

## Вариант 1: через Cursor (если GitHub уже залогинен)

1. Открой панель **Source Control** в Cursor: `Ctrl+Shift+G` или иконка ветки слева.
2. Нажми **«Initialize Repository»** (инициализировать репозиторий).
3. Нажми **«Publish to GitHub»** (опубликовать в GitHub) или **«...» → Remote → Add Remote** и укажи свой репозиторий.
4. При первом пуше выбери репозиторий или создай новый на GitHub.

Готово — пуши через кнопку **Sync** или **Push** в панели Source Control.

---

## Вариант 2: через командную строку (если установлен Git)

### 1. Установи Git (если ещё нет)

Скачай и установи: https://git-scm.com/download/win  
После установки **перезапусти Cursor/терминал**.

### 2. Создай репозиторий на GitHub

- Зайди на https://github.com/new
- Имя репозитория, например: `antigravity` или `autoservice`
- **Не** ставь галочку "Add a README" (репо должно быть пустым).
- Нажми **Create repository**.

### 3. Выполни команды в папке проекта

В терминале Cursor открой папку проекта и выполни (подставь свой **USERNAME** и **REPO**):

```powershell
cd "c:\Users\user\Projects\antigravity-main"
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/USERNAME/REPO.git
git push -u origin main
```

Пример: если твой логин `ivan`, репо `antigravity`:
```powershell
git remote add origin https://github.com/ivan/antigravity.git
git push -u origin main
```

Дальше пушишь так: **Source Control → ✓ Commit → Sync/Push** или в терминале:
```powershell
git add .
git commit -m "описание изменений"
git push
```

---

Файл `.env` уже в `.gitignore` — пароли и URL базы в репозиторий не попадут.
