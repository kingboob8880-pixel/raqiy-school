@echo off
rem ---------------------------------------------------------------------
rem  ASCII ONLY. Do not put Cyrillic text in this file.
rem
rem  cmd.exe parses a .bat byte by byte in the current codepage. When
rem  "chcp 65001" is combined with Cyrillic text inside the same file, the
rem  parser loses its position and starts executing fragments of words
rem  ("'ho' is not recognized" from echo). Confirmed on the author's PC,
rem  2026-07-25. All Russian text and prompts live in the Node script.
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

node "scripts\step1-migrate.mjs"
set RC=%errorlevel%

echo.
pause
exit /b %RC%
