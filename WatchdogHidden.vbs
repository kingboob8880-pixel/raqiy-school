' WatchdogHidden.vbs - second line of defense for the Ruqyah school runner.
' Starts functions\school-watchdog.ps1 hidden (no window) at every logon.
' The watchdog pings the runner's lock port every 2 minutes and relaunches
' the whole RUN-SCHOOL.bat tree if it disappeared silently.
'
' Install: copy THIS FILE into the Startup folder (shell:startup).
' To stop: Task Manager -> end the powershell.exe process running
'          school-watchdog.ps1, then remove this file from Startup.
'
' ASCII only, Windows script host reads .vbs as ANSI.
Dim sh
Set sh = CreateObject("WScript.Shell")
sh.CurrentDirectory = "c:\Users\kingb\OneDrive\Desktop\Raqiy"
' 0 = hidden window, False = don't wait. -ExecutionPolicy Bypass is needed
' because the machine policy blocks console .ps1 files (npm shims lesson).
sh.Run "powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File ""c:\Users\kingb\OneDrive\Desktop\Raqiy\functions\school-watchdog.ps1""", 0, False
