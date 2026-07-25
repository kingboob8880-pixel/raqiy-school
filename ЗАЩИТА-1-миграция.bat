@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion
cd /d "%~dp0"

echo ============================================================
echo   ШАГ 1 — Перенос полного текста книг в Firestore
echo ============================================================
echo.
echo Что произойдёт:
echo   - полный текст 63 книг уйдёт в Firestore (доступ только оплатившим)
echo   - в репозитории останутся бесплатные отрывки (~12%%)
echo.

rem ---- Проверка Node ----
where node >nul 2>nul
if errorlevel 1 (
  echo [ОШИБКА] Node.js не найден.
  echo Установите: https://nodejs.org  ^(версия LTS^)
  echo.
  pause
  exit /b 1
)

rem ---- Ключ сервисного аккаунта ----
rem В командной строке Windows синтаксис "ПЕРЕМЕННАЯ=значение команда" НЕ
rem работает — это форма bash. Здесь переменная задаётся через set, это и
rem была самая частая причина ошибки при запуске вручную.
echo Нужен закрытый ключ сервисного аккаунта Firebase (файл .json).
echo Где взять: Firebase Console - Настройки проекта - Сервисные аккаунты
echo            - "Создать закрытый ключ"
echo.
echo Перетащите файл ключа сюда мышкой и нажмите Enter
set /p KEYFILE=Путь к ключу:

rem Убираем кавычки, которые Windows добавляет при перетаскивании
set KEYFILE=%KEYFILE:"=%

if "%KEYFILE%"=="" (
  echo.
  echo [ОШИБКА] Путь не указан.
  pause
  exit /b 1
)
if not exist "%KEYFILE%" (
  echo.
  echo [ОШИБКА] Файл не найден: %KEYFILE%
  pause
  exit /b 1
)

set GOOGLE_APPLICATION_CREDENTIALS=%KEYFILE%

rem ---- Зависимости ----
if not exist "scripts\node_modules\firebase-admin" (
  echo.
  echo Устанавливаю зависимости ^(один раз, займёт минуту^)...
  pushd scripts
  call npm install
  popd
  if errorlevel 1 (
    echo.
    echo [ОШИБКА] npm install не отработал.
    pause
    exit /b 1
  )
)

rem ---- Сначала проверка без записи ----
echo.
echo ============================================================
echo   ПРОВЕРКА ^(ничего не меняется^)
echo ============================================================
echo.
node scripts\seed-paid-content.mjs --dry-run
if errorlevel 1 (
  echo.
  echo [ОСТАНОВЛЕНО] Проверка не прошла — смотрите сообщение выше.
  echo Ничего не изменено.
  pause
  exit /b 1
)

echo.
echo ============================================================
echo Выше — план переноса. Ничего пока не изменено.
echo.
echo Дальше будет РЕАЛЬНАЯ запись в Firestore и обрезка файлов.
echo ============================================================
echo.
set /p GO=Продолжить? Напишите "да" и нажмите Enter:
if /i not "%GO%"=="да" (
  echo Отменено. Ничего не изменено.
  pause
  exit /b 0
)

echo.
node scripts\seed-paid-content.mjs
if errorlevel 1 (
  echo.
  echo [ОШИБКА] Перенос не завершился. Смотрите сообщение выше.
  pause
  exit /b 1
)

echo.
echo ============================================================
echo   Перенос выполнен
echo ============================================================
echo.
echo Осталось закоммитить обрезанные файлы:
echo.
echo    git add -A
echo    git commit -m "Полный текст книг перенесён в Firestore"
echo    git push
echo.
set /p DOCOMMIT=Сделать это сейчас автоматически? (да/нет):
if /i "%DOCOMMIT%"=="да" (
  git add -A
  git commit -m "Полный текст книг перенесён в Firestore"
  git push
  if errorlevel 1 (
    echo.
    echo [ОШИБКА] Отправка не прошла. Закоммитьте вручную командами выше.
  ) else (
    echo.
    echo Отправлено.
    echo.
    echo ТЕПЕРЬ ЗАПУСТИТЕ ШАГ 2:  ЗАЩИТА-2-очистка-истории.bat
    echo Без него полный текст остаётся доступен из истории git.
  )
) else (
  echo.
  echo Хорошо — закоммитьте вручную, потом запустите ШАГ 2.
)

echo.
pause
