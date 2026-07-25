@echo off
title RUKYA PRO
color 0A
cls

echo.
echo  ===================================================
echo     RUKYA PRO - Setup and Launch (dev preview)
echo  ===================================================
echo.

cd /d "%~dp0"

echo  [1/4] Checking Node.js...
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo.
    echo  ERROR: Node.js is NOT installed!
    echo.
    echo  Please download and install Node.js from:
    echo  https://nodejs.org
    echo.
    echo  After installation, run this file again.
    echo.
    start https://nodejs.org
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do echo  OK: Node.js %%i

where npm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo  ERROR: npm not found! Reinstall Node.js.
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('npm --version') do echo  OK: npm %%i
echo.

echo  [2/4] Checking project...
if not exist "package.json" (
    color 0C
    echo  ERROR: package.json not found!
    echo  Make sure START.bat is in the project root folder.
    pause
    exit /b 1
)
echo  OK: package.json found
echo.

echo  [3/4] Checking dependencies...
if exist "node_modules" (
    echo  OK: node_modules exists - skipping install
) else (
    echo  Installing npm packages...
    echo  This may take 1-3 minutes, please wait...
    echo.
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        color 0C
        echo.
        echo  ERROR: npm install failed!
        echo  Check your internet connection.
        pause
        exit /b 1
    )
    echo.
    echo  OK: All packages installed!
)
echo.

echo  [4/4] Starting dev server...
echo.
echo  ===================================================
echo     RUKYA PRO is starting!
echo.
echo     Address: http://localhost:5173
echo.
echo     Browser will open automatically.
echo     Press Ctrl+C to stop the server.
echo  ===================================================
echo.

call npm run dev -- --open --port 5173

echo.
echo  Server stopped.
pause
