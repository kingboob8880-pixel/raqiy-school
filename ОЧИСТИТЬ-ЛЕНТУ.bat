@echo off
chcp 65001 >nul
title Очистка ленты достижений
cd /d "%~dp0"
echo.
echo  Убираю из ленты записи, которые больше не соответствуют
echo  действительности: отозванный доступ, отозванный сертификат,
echo  успехи удалённых учеников.
echo.
node scripts/clean-feed.mjs
echo.
pause
