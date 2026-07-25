@echo off
title RUKYA PRO - Build EXE
color 0A
cls

echo.
echo  ===================================================
echo     RUKYA PRO - Build rukya.exe
echo  ===================================================
echo.
echo  This script builds the Windows installer once.
echo  After install, the app runs as rukya.exe.
echo  Internet is required - Electron downloads its own
echo  binaries on first build.
echo.

cd /d "%~dp0"

echo  [1/4] Checking Node.js...
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo.
    echo  ERROR: Node.js is NOT installed!
    echo  Download and install it from: https://nodejs.org
    echo  ^(LTS version, check "Add to PATH" during install^)
    echo.
    start https://nodejs.org
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do echo  OK: Node.js %%i
echo.

echo  [2/4] Installing dependencies (this can take 3-10 min)...
echo.
call npm install
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo.
    echo  ERROR: npm install failed. Check your internet connection.
    pause
    exit /b 1
)
echo.
echo  OK: dependencies installed.
echo.

echo  [3/4] Building the app (vite build)...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo  ERROR: app build failed.
    pause
    exit /b 1
)
echo  OK: dist\index.html built.
echo.

echo  [4/4] Building rukya.exe installer (electron-builder)...
echo  First run downloads Electron binaries (~150-200 MB) -
echo  needs internet, may take a few minutes.
echo.
set CSC_IDENTITY_AUTO_DISCOVERY=false
call npx electron-builder --win
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo.
    echo  ===================================================
    echo     ERROR: installer build failed.
    echo  ===================================================
    echo.
    echo  If the error above mentions "Cannot create symbolic
    echo  link" or "symlink" - this is a known Windows issue,
    echo  not a problem with the project. Windows blocks
    echo  creating symlinks for regular (non-admin) users by
    echo  default; electron-builder needs it for one of its
    echo  cached tools.
    echo.
    echo  Fix (pick one, then run this script again):
    echo.
    echo   Option A (recommended, no admin needed each time):
    echo     Settings - Privacy ^& security - For developers
    echo     - turn ON "Developer Mode". Restart this script.
    echo.
    echo   Option B:
    echo     Right-click BUILD_EXE.bat - "Run as administrator".
    echo.
    pause
    exit /b 1
)

echo.
echo  ===================================================
echo     DONE!
echo.
echo     Installer is in the release folder:
echo     RUKYA-PRO-Setup-1.0.0.exe
echo.
echo     Give this .exe to students - after install the
echo     app runs as rukya.exe.
echo  ===================================================
echo.
start explorer "%~dp0release"
pause
