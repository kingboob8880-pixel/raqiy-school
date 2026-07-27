#Requires -Version 5.1
# Запуск учебного Telegram-бота.
#
# ЗАПУСКАТЬ ЧЕРЕЗ ФАЙЛ «START-BOT.bat» — двойным щелчком.
# Он открывает PowerShell с нужными настройками и не даёт окну закрыться.
#
# Что делает скрипт:
#   1. проверяет, что установлены node и firebase;
#   2. читает functions\.env (токен, chat_id, секрет — уже заполнены);
#   3. спрашивает у Telegram, чей это токен, и показывает имя бота;
#   4. записывает три значения в секреты Firebase;
#   5. пересобирает данные курса;
#   6. выкладывает функции и правила доступа;
#   7. привязывает вебхук с секретом и проверяет результат.
#
# Всё, что происходит, пишется в файл ЗАПУСК-БОТА.log рядом со скриптом.
# Если что-то не получится — пришлите этот файл.
#
# Скрипт можно запускать повторно, ничего не сломается.

# ВАЖНО ПРО КОДИРОВКУ: этот файл сохранён в UTF-8 С BOM. Без BOM Windows
# PowerShell 5.1 читает .ps1 как ANSI, русские буквы превращаются в мусор,
# и скрипт падает на разборе — окно закрывается мгновенно, без единого
# сообщения. Ровно это и случилось в первый раз (2026-07-27). Имена
# переменных и функций здесь латиницей по той же причине.

$ErrorActionPreference = "Stop"
try { [Console]::OutputEncoding = [Text.Encoding]::UTF8 } catch {}

$ROOT    = Split-Path -Parent $MyInvocation.MyCommand.Path
$LOG     = Join-Path $ROOT "start-bot.log"
$PROJECT = "rukya-school"
$REGION  = "us-central1"

"=== Запуск $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') ===" | Out-File $LOG -Encoding UTF8

function Say($text, $color = "White") {
    Write-Host $text -ForegroundColor $color
    $text | Out-File $LOG -Append -Encoding UTF8
}
function Step($n, $text) { Say "" ; Say "=== ШАГ $n. $text ===" "Cyan" }
function Good($text)     { Say "  [ок] $text" "Green" }
function Note($text)     { Say "       $text" "DarkGray" }

# Внешние программы (node, firebase) пишут в stderr и предупреждения тоже.
# При $ErrorActionPreference = "Stop" ЛЮБАЯ такая строка становится
# исключением и улетает в общий catch — автор видит одну строку чужого
# стека вместо понятного сообщения. Ровно это и случилось 2026-07-27 на
# шаге сборки данных. Поэтому все внешние вызовы идут через Run().
function Run($exe, $argList) {
    $prev = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    try {
        $output = & $exe @argList 2>&1 | Out-String
    } finally {
        $ErrorActionPreference = $prev
    }
    $output | Out-File $LOG -Append -Encoding UTF8
    return [pscustomobject]@{ Code = $LASTEXITCODE; Text = $output }
}

function Fail($text, $hint) {
    Say ""
    Say "  [!] $text" "Red"
    if ($hint) { Say "      $hint" "Yellow" }
    Say ""
    Say "Подробности записаны в файл:" "DarkGray"
    Say "  $LOG" "DarkGray"
    Say ""
    Read-Host "Нажмите Enter, чтобы закрыть"
    exit 1
}

try {

# ─────────────────────────────────────────────────────────────────────────
Step 1 "Проверяю, что установлены node и firebase"

$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) {
    Fail "Не найден Node.js" "Установите с https://nodejs.org (версия LTS), затем запустите скрипт заново."
}
Good "node $((Run 'node' @('--version')).Text.Trim())"

$fb = Get-Command firebase -ErrorAction SilentlyContinue
if (-not $fb) {
    Fail "Не найден firebase" "Установите командой:  npm install -g firebase-tools`n      Затем войдите:  firebase login"
}
Good "firebase $(((Run 'firebase' @('--version')).Text.Trim() -split "`r?`n")[0])"

# ─────────────────────────────────────────────────────────────────────────
Step 2 "Читаю functions\.env"

$envPath = Join-Path $ROOT "functions\.env"
if (-not (Test-Path $envPath)) {
    Fail "Нет файла functions\.env" "Скопируйте functions\.env.example в functions\.env и заполните."
}

$cfg = @{}
foreach ($line in (Get-Content $envPath -Encoding UTF8)) {
    $t = $line.Trim()
    if ($t -eq "" -or $t.StartsWith("#") -or -not $t.Contains("=")) { continue }
    $i = $t.IndexOf("=")
    $cfg[$t.Substring(0, $i).Trim()] = $t.Substring($i + 1).Trim()
}
foreach ($key in @("TG_BOT_TOKEN", "TG_CHAT_ID", "TG_WEBHOOK_SECRET")) {
    if (-not $cfg[$key]) { Fail "В functions\.env не заполнено: $key" }
}
Good "Токен, chat_id и секрет на месте"

# ─────────────────────────────────────────────────────────────────────────
Step 3 "Спрашиваю у Telegram, чей это токен"

try {
    $me = Invoke-RestMethod -Uri "https://api.telegram.org/bot$($cfg.TG_BOT_TOKEN)/getMe" -TimeoutSec 20
} catch {
    Fail "Telegram не ответил: $($_.Exception.Message)" "Проверьте интернет. Если он есть — токен в functions\.env неверный."
}
if (-not $me.ok) { Fail "Токен недействителен" "Возьмите новый: @BotFather -> /mybots -> ваш бот -> API Token" }

$botName = $me.result.username
Good "Бот: @$botName ($($me.result.first_name))"

if ($botName -ne "ruyka_school_bot") {
    Say "  [!] Ожидался @ruyka_school_bot, а токен принадлежит боту @$botName" "Yellow"
    $answer = Read-Host "      Продолжить всё равно? (да / нет)"
    if ($answer -ne "да") { Fail "Остановлено по вашему решению" }
}

# ─────────────────────────────────────────────────────────────────────────
Step 4 "Записываю секреты в Firebase"
Note "Если запускаете повторно — старые версии секретов остаются, это нормально."
Note "Если попросит включить Secret Manager API — соглашайтесь."
Note "Если скажет про тариф Blaze — его нужно подключить; списаний при вашей нагрузке не будет."

Push-Location (Join-Path $ROOT "functions")
foreach ($key in @("TG_BOT_TOKEN", "TG_CHAT_ID", "TG_WEBHOOK_SECRET")) {
    # Значение пишем во временный файл БЕЗ перевода строки: при вводе с
    # клавиатуры Enter попадает внутрь секрета, и токен перестаёт совпадать.
    $tmp = [IO.Path]::GetTempFileName()
    [IO.File]::WriteAllText($tmp, $cfg[$key], (New-Object Text.UTF8Encoding $false))
    try {
        $r = Run "firebase" @("functions:secrets:set", $key, "--data-file", $tmp, "--project", $PROJECT, "--force")
        if ($r.Code -ne 0) {
            Pop-Location
            Say $r.Text.Trim() "DarkGray"
            Fail "Не удалось записать секрет $key" "Если не выполнен вход — сделайте:  firebase login"
        }
        Good "$key записан"
    } finally {
        Remove-Item $tmp -Force -ErrorAction SilentlyContinue
    }
}
Pop-Location

# ─────────────────────────────────────────────────────────────────────────
Step 5 "Пересобираю данные курса для бота"

Push-Location $ROOT
$r = Run "node" @("scripts/build-course-data.mjs")
if ($r.Code -ne 0) {
    Pop-Location
    Say ""
    Say $r.Text.Trim() "DarkGray"
    Fail "Не собрались данные курса" "Полный текст ошибки — выше и в логе."
}
Good (($r.Text.Trim() -split "`r?`n")[0])

# ─────────────────────────────────────────────────────────────────────────
Step 6 "Выкладываю функции — это 2-5 минут, окно не закрывайте"

$r = Run "firebase" @("deploy", "--only", "functions", "--project", $PROJECT)
Say $r.Text.Trim() "DarkGray"
if ($r.Code -ne 0) {
    Pop-Location
    Fail "Деплой функций не прошёл" "Ошибка видна выше и записана в лог."
}
Good "Функции выложены"

Step 7 "Выкладываю правила доступа"
$r = Run "firebase" @("deploy", "--only", "firestore:rules", "--project", $PROJECT)
Say $r.Text.Trim() "DarkGray"
if ($r.Code -ne 0) { Pop-Location; Fail "Правила не выложились" }
Good "Правила выложены"
Pop-Location

# ─────────────────────────────────────────────────────────────────────────
Step 8 "Привязываю вебхук"

$url = "https://$REGION-$PROJECT.cloudfunctions.net/telegramWebhook"
Note "Адрес функции: $url"

$body = @{
    url                  = $url
    secret_token         = $cfg.TG_WEBHOOK_SECRET
    allowed_updates      = @("message", "callback_query")
    drop_pending_updates = $true
} | ConvertTo-Json -Compress

$res = Invoke-RestMethod -Method Post -TimeoutSec 30 `
    -Uri "https://api.telegram.org/bot$($cfg.TG_BOT_TOKEN)/setWebhook" `
    -ContentType "application/json; charset=utf-8" `
    -Body ([Text.Encoding]::UTF8.GetBytes($body))

if (-not $res.ok) { Fail "Telegram отказал: $($res.description)" }
Good "Вебхук привязан"

# Команды меню — мелочь, но без неё в боте нет подсказок.
$cmds = @{ commands = @(
    @{ command = "start";    description = "начать" },
    @{ command = "menu";     description = "главное меню" },
    @{ command = "today";    description = "что сегодня" },
    @{ command = "progress"; description = "мой прогресс" }
)} | ConvertTo-Json -Depth 5 -Compress
Invoke-RestMethod -Method Post -TimeoutSec 20 `
    -Uri "https://api.telegram.org/bot$($cfg.TG_BOT_TOKEN)/setMyCommands" `
    -ContentType "application/json; charset=utf-8" `
    -Body ([Text.Encoding]::UTF8.GetBytes($cmds)) | Out-Null
Good "Команды меню настроены"

# ─────────────────────────────────────────────────────────────────────────
Step 9 "Проверяю"

Start-Sleep -Seconds 5
$info = Invoke-RestMethod -Uri "https://api.telegram.org/bot$($cfg.TG_BOT_TOKEN)/getWebhookInfo" -TimeoutSec 20
Good "Адрес у Telegram: $($info.result.url)"
if ($info.result.last_error_message) {
    Say "  [!] Последняя ошибка доставки: $($info.result.last_error_message)" "Yellow"
    Note "Обычно это значит, что функция ещё поднимается. Подождите минуту и напишите боту."
} else {
    Good "Ошибок доставки нет"
}

Say ""
Say "────────────────────────────────────────────" "Cyan"
Say " ГОТОВО. Осталось проверить руками:" "Cyan"
Say "────────────────────────────────────────────" "Cyan"
Say ""
Say " 1. Откройте @$botName и нажмите Start."
Say "    Должно прийти приглашение привязать аккаунт."
Say ""
Say " 2. Кабинет ученика на сайте -> «Привязать Telegram»"
Say "    -> «Открыть бота и завершить привязку»."
Say "    Бот ответит «Аккаунт привязан»."
Say ""
Say " 3. В боте: Модули -> Модуль 1 -> любой урок."
Say ""
Say " 4. Сдайте экзамен в боте и откройте эту же книгу на сайте —"
Say "    он должен быть отмечен сданным. Это главная проверка."
Say ""
Say " И отзовите старый токен: @BotFather -> /mybots ->" "Yellow"
Say " старый бот -> API Token -> Revoke current token." "Yellow"
Say ""

} catch {
    # Ловим ВСЁ, что не поймали проверки выше: иначе окно закроется молча.
    Say ""
    Say "  [!] Непредвиденная ошибка:" "Red"
    Say "      $($_.Exception.Message)" "Red"
    Say "      строка $($_.InvocationInfo.ScriptLineNumber): $($_.InvocationInfo.Line.Trim())" "DarkGray"
    Say ""
    Say "Пришлите файл: $LOG" "Yellow"
}

Say ""
Read-Host "Нажмите Enter, чтобы закрыть"
