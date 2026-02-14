# Один раз введи логин GitHub — скрипт подставит его в remote и сделает push.
$username = Read-Host "Твой логин на GitHub"
if ([string]::IsNullOrWhiteSpace($username)) { Write-Host "Логин не введён. Выход."; exit 1 }
$repo = Read-Host "Имя репозитория (Enter = antigravity-main)"
if ([string]::IsNullOrWhiteSpace($repo)) { $repo = "antigravity-main" }
$url = "https://github.com/$username/$repo.git"
Write-Host "Remote: $url"
Set-Location $PSScriptRoot
git remote set-url origin $url
git push -u origin main
Write-Host "Готово. Дальше просто: git push"
