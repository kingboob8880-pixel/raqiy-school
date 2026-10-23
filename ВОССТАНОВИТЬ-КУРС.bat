@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"

echo.
echo  RUKYA PRO - restore the course from the last snapshot
echo  ------------------------------------------------------------
echo.
node scripts\backup-course.mjs --list
echo.
echo  This will OVERWRITE course files in this folder with the snapshot.
echo  A snapshot made before the damage is what you usually want - see the list above.
echo  To restore a specific one instead of the last:
echo     node scripts\backup-course.mjs --restore backups\NAME.zip . --force
echo.
echo  Continue? Type YES and press Enter.
set /p ans=
if /i not "%ans%"=="YES" goto cancel

node scripts\backup-course.mjs --restore-latest
goto end

:cancel
echo Cancelled - nothing changed.

:end
echo.
pause
