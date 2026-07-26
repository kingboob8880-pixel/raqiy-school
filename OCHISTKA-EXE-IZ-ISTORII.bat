@echo off
REM ASCII only inside this file.
REM
REM Cyrillic characters inside a .bat break cmd parsing when combined with
REM chcp 65001 - that already happened once on 2026-07-25 and produced the
REM error "'ho' is not recognized as an internal or external command".
REM All Russian output lives in the Node script instead.

cd /d "%~dp0"

where git >nul 2>nul
if errorlevel 1 (
  echo git not found in PATH. Install Git for Windows first.
  pause
  exit /b 1
)

where node >nul 2>nul
if errorlevel 1 (
  echo node not found in PATH. Install Node.js first.
  pause
  exit /b 1
)

node scripts\purge-exe-history.mjs
echo.
pause
