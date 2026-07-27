# Запуск учебного Telegram-бота — один скрипт вместо восьми шагов вручную.
#
# Что делает:
#   1. читает functions/.env (токен, chat_id, секрет — уже заполнены);
#   2. проверяет у Telegram, что токен живой, и показывает имя бота;
#   3. записывает три значения в секреты Firebase;
#   4. выкладывает функции и правила доступа;
#   5. привязывает вебхук с секретом;
#   6. проверяет, что Telegram принял привязку, и печатает итог.
#
# Как запустить:
#   правой кнопкой по файлу → «Выполнить с помощью PowerShell»
# либо в PowerShell:
#   cd "C:\Users\kingb\OneDrive\Desktop\Raqiy"
#   powershell -ExecutionPolicy Bypass -File .\ЗАПУСК-БОТА.ps1
#
# Скрипт можно запускать повторно — он ничего не ломает при втором прогоне.

$ErrorActionPreference = "Stop"
$OutputEncoding = [Console]::OutputEncoding = [Text.Encoding]::UTF8

$ROOT = Split-Path -Parent $MyInvocation.MyCommand.Path
$PROJECT = "rukya-school"
$REGION = "us-central1"

function Шаг($n, $text) { Write-Host "`n=== $n. $text ===" -ForegroundColor Cyan }
function Ок($text)      { Write-Host "  OK  $text" -ForegroundColor Green }
function Плохо($text)   { Write-Host "  !!  $text" -ForegroundColor Red }
function Прим($text)    { Write-Host "      $text" -ForegroundColor DarkGray }

# ─────────────────────────────────────────────────────────────────────────
Шаг 1 "Читаю functions/.env"

$envPath = Join-Path $ROOT "functions\.env"
if (-not (Test-Path $envPath)) {
  Плохо "Нет файла functions\.env"
  Прим "Скопируйте functions\.env.example в functions\.env и заполните."
  exit 1
}

$cfg = @{}
foreach ($line in Get-Content $envPath -Encoding UTF8) {
  $t = $line.Trim()
  if ($t -eq "" -or $t.StartsWith("#") -or -not $t.Contains("=")) { continue }
  $i = $t.IndexOf("=")
  $cfg[$t.Substring(0, $i).Trim()] = $t.Substring($i + 1).Trim()
}

foreach ($key in @("TG_BOT_TOKEN", "TG_CHAT_ID", "TG_WEBHOOK_SECRET")) {
  if (-not $cfg[$key]) { Плохо "В functions\.env не заполнено: $key"; exit 1 }
}
Ок "Токен, chat_id и секрет на месте"

# ─────────────────────────────────────────────────────────────────────────
Шаг 2 "Спрашиваю Telegram, чей это токен"

try {
  $me = Invoke-RestMethod -Uri "https://api.telegram.org/bot$($cfg.TG_BOT_TOKEN)/getMe" -TimeoutSec 20
} catch {
  Плохо "Telegram не ответил. Проверьте интернет и токен в functions\.env"
  exit 1
}
if (-not $me.ok) { Плохо "Токен недействителен — возьмите новый у @BotFather"; exit 1 }

Ок "Бот: @$($me.result.username) ($($me.result.first_name))"
if ($me.result.username -ne "ruyka_school_bot") {
  Плохо "Ожидался @ruyka_school_bot, а токен принадлежит другому боту."
  $ответ = Read-Host "      Продолжить всё равно? (да/нет)"
  if ($ответ -ne "да") { exit 1 }
}

# ─────────────────────────────────────────────────────────────────────────
Шаг 3 "Записываю секреты в Firebase"
Прим "Если попросит включить Secret Manager API — соглашайтесь."
Прим "Если скажет про тариф Blaze — его нужно подключить, списаний при вашей нагрузке не будет."

Push-Location (Join-Path $ROOT "functions")
try {
  foreach ($key in @("TG_BOT_TOKEN", "TG_CHAT_ID", "TG_WEBHOOK_SECRET")) {
    # Пишем значение во временный файл без перевода строки: набранный руками
    # Enter попал бы внутрь секрета, и токен перестал бы совпадать.
    $tmp = [IO.Path]::GetTempFileName()
    [IO.File]::WriteAllText($tmp, $cfg[$key], (New-Object Text.UTF8Encoding $false))
    try {
      & firebase functions:secrets:set $key --data-file $tmp --project $PROJECT --force 2>&1 | Out-String | Write-Verbose
      if ($LASTEXITCODE -ne 0) { throw "не удалось записать $key" }
      Ок "$key записан"
    } finally {
      Remove-Item $tmp -Force -ErrorAction SilentlyContinue
    }
  }
} catch {
  Плохо $_.Exception.Message
  Прим "Если не выполнен вход — сделайте: firebase login"
  Pop-Location
  exit 1
}
Pop-Location

# ─────────────────────────────────────────────────────────────────────────
Шаг 4 "Пересобираю данные курса для бота"

Push-Location $ROOT
& node scripts/build-course-data.mjs
if ($LASTEXITCODE -ne 0) { Плохо "Не собрались данные курса"; Pop-Location; exit 1 }
Ок "functions\course-data.json обновлён"

# ─────────────────────────────────────────────────────────────────────────
Шаг 5 "Выкладываю функции (2-5 минут)"

& firebase deploy --only functions --project $PROJECT
if ($LASTEXITCODE -ne 0) { Плохо "Деплой функций не прошёл — читайте ошибку выше"; Pop-Location; exit 1 }
Ок "Функции выложены"

Шаг 6 "Выкладываю правила доступа"
& firebase deploy --only firestore:rules --project $PROJECT
if ($LASTEXITCODE -ne 0) { Плохо "Правила не выложились"; Pop-Location; exit 1 }
Ок "Правила выложены"
Pop-Location

# ─────────────────────────────────────────────────────────────────────────
Шаг 7 "Привязываю вебхук"

$url = "https://$REGION-$PROJECT.cloudfunctions.net/telegramWebhook"
Прим "Адрес функции: $url"

$body = @{
  url = $url
  secret_token = $cfg.TG_WEBHOOK_SECRET
  allowed_updates = @("message", "callback_query")
  drop_pending_updates = $true
}
$res = Invoke-RestMethod -Method Post -TimeoutSec 30 `
  -Uri "https://api.telegram.org/bot$($cfg.TG_BOT_TOKEN)/setWebhook" `
  -ContentType "application/json; charset=utf-8" `
  -Body ([Text.Encoding]::UTF8.GetBytes(($body | ConvertTo-Json -Compress)))

if (-not $res.ok) { Плохо "Telegram отказал: $($res.description)"; exit 1 }
Ок "Вебхук привязан"

# ─────────────────────────────────────────────────────────────────────────
Шаг 8 "Проверяю"

Start-Sleep -Seconds 3
$info = Invoke-RestMethod -Uri "https://api.telegram.org/bot$($cfg.TG_BOT_TOKEN)/getWebhookInfo" -TimeoutSec 20
Ок "Адрес у Telegram: $($info.result.url)"
if ($info.result.last_error_message) {
  Плохо "Последняя ошибка доставки: $($info.result.last_error_message)"
  Прим "Часто это значит, что функция ещё поднимается. Подождите минуту и напишите боту снова."
} else {
  Ок "Ошибок доставки нет"
}

# Команды меню в боте — мелочь, но без неё в боте нет подсказок.
$cmds = @{ commands = @(
  @{ command = "start";    description = "начать" },
  @{ command = "menu";     description = "главное меню" },
  @{ command = "today";    description = "что сегодня" },
  @{ command = "progress"; description = "мой прогресс" }
)}
Invoke-RestMethod -Method Post -TimeoutSec 20 `
  -Uri "https://api.telegram.org/bot$($cfg.TG_BOT_TOKEN)/setMyCommands" `
  -ContentType "application/json; charset=utf-8" `
  -Body ([Text.Encoding]::UTF8.GetBytes(($cmds | ConvertTo-Json -Depth 5 -Compress))) | Out-Null
Ок "Команды меню настроены"

Write-Host "`n────────────────────────────────────────────" -ForegroundColor Cyan
Write-Host " ГОТОВО. Что делать дальше:" -ForegroundColor Cyan
Write-Host "────────────────────────────────────────────" -ForegroundColor Cyan
Write-Host @"
 1. Откройте @$($me.result.username) и нажмите Start.
    Должно прийти приглашение привязать аккаунт.

 2. Кабинет ученика на сайте -> «Привязать Telegram»
    -> «Открыть бота и завершить привязку».
    Бот ответит «Аккаунт привязан».

 3. В боте: Модули -> Модуль 1 -> любой урок.

 4. Сдайте экзамен в боте и откройте эту же книгу на сайте —
    он должен быть отмечен сданным. Это главная проверка.

 ⚠️ И отзовите старый токен: @BotFather -> /mybots ->
    старый бот -> API Token -> Revoke current token.
    Он лежал в открытом репозитории и остаётся в его истории.
"@ -ForegroundColor White

Read-Host "`nНажмите Enter, чтобы закрыть"
