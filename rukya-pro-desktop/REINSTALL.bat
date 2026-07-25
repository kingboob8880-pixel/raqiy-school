@echo off
title RUKYA PRO - Reinstall
color 0E
cls

echo.
echo  ===================================================
echo     RUKYA PRO - Clean Reinstall
echo  ===================================================
echo.

cd /d "%~dp0"

where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo  ERROR: Node.js not found!
    start https://nodejs.org
    pause
    exit /b 1
)

if not exist "package.json" (
    color 0C
    echo  ERROR: package.json not found!
    pause
    exit /b 1
)

echo  [1/3] Removing old dependencies...
if exist "node_modules" (
    echo  Deleting node_modules...
    rmdir /s /q node_modules
    echo  Done.
)
if exist "package-lock.json" (
    del /q package-lock.json
    echo  Deleted package-lock.json
)
echo.

echo  [2/3] Installing dependencies...
echo  This may take 1-3 minutes...
echo.
call npm install
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo  ERROR: npm install failed!
    pause
    exit /b 1
)
echo.
echo  OK: All packages installed!
echo.

echo  [3/3] Starting server...
echo.
echo  ===================================================
echo     Reinstall complete!
echo     Starting http://localhost:5173
echo     Press Ctrl+C to stop.
echo  ===================================================
echo.

call npm run dev -- --open --port 5173

echo.
echo  Server stopped.
pause
