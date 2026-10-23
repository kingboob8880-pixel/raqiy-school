@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"

echo.
echo  RUKYA PRO - local course backup
echo  ------------------------------------------------------------
echo  Saves the whole course to the "backups" folder on this PC.
echo.

node scripts\backup-course.mjs %*
if errorlevel 1 goto fail

echo.
echo  OK. Snapshot is in the "backups" folder.
echo  Keep a copy on another disk as well:
echo     node scripts\backup-course.mjs --out D:\Raqiy-BACKUPS
echo.
echo  Check an archive later:
echo     node scripts\backup-course.mjs --verify backups\NAME.zip
echo  Restore into an empty folder:
echo     node scripts\backup-course.mjs --restore backups\NAME.zip D:\RESTORE
goto end

:fail
echo.
echo  Backup FAILED - see the message above.

:end
echo.
pause
