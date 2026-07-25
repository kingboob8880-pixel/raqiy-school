@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ============================================================
echo   ШАГ 2 — Очистка истории git от полного текста
echo ============================================================
echo.
echo Зачем: шаг 1 обрезал файлы, но в истории git полный текст
echo остаётся и достаётся командой git show. Пока история не
echo вычищена, перенос в Firestore курс не защищает.
echo.
echo Что произойдёт:
echo   - будет сделана резервная копия всего репозитория
echo   - папка content/ будет вырезана из всех коммитов
echo   - история кода при этом сохранится
echo   - отправка на GitHub НЕ произойдёт автоматически
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo [ОШИБКА] Node.js не найден. Установите: https://nodejs.org
  echo.
  pause
  exit /b 1
)

where git >nul 2>nul
if errorlevel 1 (
  echo [ОШИБКА] Git не найден. Установите: https://git-scm.com/download/win
  echo.
  pause
  exit /b 1
)

set /p GO=Начать? Напишите "да" и нажмите Enter:
if /i not "%GO%"=="да" (
  echo Отменено.
  pause
  exit /b 0
)

echo.
node scripts\purge-content-history.mjs
if errorlevel 1 (
  echo.
  echo [ОСТАНОВЛЕНО] Смотрите сообщение выше.
  echo Резервная копия сделана — ничего не потеряно.
  pause
  exit /b 1
)

echo.
pause
