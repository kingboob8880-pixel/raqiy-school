' RunSchoolHidden.vbs - starts the Ruqyah school local runner with NO window.
'
' Placed into the user Startup folder (shell:startup) so it launches on
' every logon and stays invisible: bots, Firestore listeners and the daily
' schedule keep working in the background. The log lives in
' functions\local-server.log.
'
' To stop: Task Manager -> end the node.exe process, or remove this file
' from the Startup folder. To watch it work instead: RUN-SCHOOL.bat
' (a visible window; the port lock makes sure only ONE runner runs, so
' starting both is safe - the second one closes itself).
'
' ASCII only, Windows script host reads .vbs as ANSI.
Dim sh
Set sh = CreateObject("WScript.Shell")
sh.CurrentDirectory = "c:\Users\kingb\OneDrive\Desktop\Raqiy"
' 0 = hidden window, False = don't wait; "silent" tells the .bat never to
' pause on a normal exit (see RUN-SCHOOL.bat)
sh.Run """c:\Users\kingb\OneDrive\Desktop\Raqiy\RUN-SCHOOL.bat"" silent", 0, False
