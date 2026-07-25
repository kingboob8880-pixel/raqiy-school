@echo off
rem ---------------------------------------------------------------------
rem  ASCII ONLY. Do not put Cyrillic text in this file.
rem  See ZASHITA-1 for the reason (chcp + Cyrillic breaks cmd parsing).
rem ---------------------------------------------------------------------
chcp 65001 >nul 2>nul
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo ERROR: Node.js not found. Install it from https://nodejs.org
  echo.
  pause
  exit /b 1
)

where git >nul 2>nul
if errorlevel 1 (
  echo.
  echo ERROR: Git not found. Install it from https://git-scm.com/download/win
  echo.
  pause
  exit /b 1
)

node "scripts\step2-purge.mjs"
set RC=%errorlevel%

echo.
pause
exit /b %RC%
