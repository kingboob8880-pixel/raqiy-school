@echo off
chcp 65001 >nul
title Zapusk uchebnogo bota

rem Launcher for start-bot.ps1
rem
rem Windows blocks .ps1 by default, and "Run with PowerShell" closes the
rem window instantly on any error. This file bypasses the policy and keeps
rem the window open no matter what happens.
rem
rem ASCII only, no BOM: cmd.exe prints the BOM as garbage before the first
rem command and can fail on it. Created 2026-07-27.

cd /d "%~dp0"

if not exist "%~dp0start-bot.ps1" (
  echo File start-bot.ps1 not found next to this launcher.
  pause
  exit /b 1
)

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-bot.ps1"

echo.
pause
