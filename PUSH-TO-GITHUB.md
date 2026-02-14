# Выкатить проект на GitHub

Репозиторий уже инициализирован, коммит есть. Осталось:

## 1. Создай репозиторий на GitHub

- Открой: **https://github.com/new**
- **Repository name:** `antigravity-main` (или любое имя).
- Оставь репозиторий **пустым** (не добавляй README, .gitignore, license).
- Нажми **Create repository**.

## 2. Подставь свой логин и запушь

В терминале (в папке проекта) выполни, заменив **ТВОЙ_ЛОГИН** на свой логин GitHub:

```powershell
cd "c:\Users\user\Projects\antigravity-main"
git remote set-url origin https://github.com/ТВОЙ_ЛОГИН/antigravity-main.git
git push -u origin main
```

Если репозиторий назвал по-другому — подставь его имя вместо `antigravity-main` в URL.

После этого проект будет на GitHub, дальше пушишь через **Source Control** в Cursor или `git push`.

---

Чтобы коммиты отображались под твоим именем на GitHub, настрой глобально (один раз):

```powershell
git config --global user.name "Твоё Имя"
git config --global user.email "твой@email.com"
```
