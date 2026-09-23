@echo off
chcp 65001 >nul
title RUKYA school - local runtime (bots + triggers + schedule)

rem Launcher for functions/local-server.js - the local replacement for
rem Cloud Functions (no Google billing needed, everything runs here).
rem
rem ASCII only, no BOM: cmd.exe prints a BOM as garbage before the first
rem command and can fail on it. Same lesson as START-BOT.bat (2026-07-27).
rem
rem The loop restarts the runtime if it crashes, so the school keeps
rem running unattended on an always-on PC. Ctrl+C (or closing the window)
rem stops it for real.

cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo node not found. Install Node.js from https://nodejs.org
  pause
  exit /b 1
)

if not exist "functions\local-server.js" (
  echo functions\local-server.js not found next to this launcher.
  pause
  exit /b 1
)

if not exist "functions\node_modules" (
  echo Installing dependencies (one time)...
  pushd functions
  call npm install
  popd
)

:loop
node functions\local-server.js
echo.
echo Runtime exited with code %errorlevel%. Restarting in 5 seconds...
echo Press Ctrl+C now to stop for real, or close the window.
timeout /t 5 /nobreak >nul
goto loop
