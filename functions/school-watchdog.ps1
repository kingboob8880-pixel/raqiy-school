# RUKYA school watchdog. ASCII only on purpose: Windows PowerShell 5.1 reads
# BOM-less files as ANSI, so any non-ASCII text here could turn into garbage.
#
# JOB: every 120 seconds ask the local runner's lock port "are you alive?".
# The runner (functions/local-server.js) binds 127.0.0.1:8791 at startup and
# answers exactly "ruqya-local-server". No answer or a foreign answer means
# the runner is dead -> relaunch it through RunSchoolHidden.vbs, the same
# entry point Windows uses at logon.
#
# LAYERING (why this exists):
#   layer 1 - RUN-SCHOOL.bat restarts node when it crashes (5 s loop);
#   layer 2 - THIS watchdog covers the rarer case when the whole hidden
#             cmd/node process tree disappears (Task Manager cleanup, shell
#             restart, sleep oddities). Seen live on 2026-09-26: the tree
#             died silently and the admin stopped getting Telegram notices
#             for ~1.5 days with nobody noticing.
#
# TO STOP EVERYTHING FOR REAL: kill this watchdog (powershell.exe running
# school-watchdog.ps1) FIRST, then the runner - otherwise the watchdog just
# brings the runner back within two minutes.
$ErrorActionPreference = 'SilentlyContinue'

$RepoRoot = Split-Path -Parent $PSScriptRoot          # functions\.. = repo root
$Vbs      = Join-Path $RepoRoot 'RunSchoolHidden.vbs' # same autostart entry
$Log      = Join-Path $PSScriptRoot 'watchdog.log'
$LockUrl  = 'http://127.0.0.1:8791/'
$Alive    = 'ruqya-local-server'

function Write-Log([string]$msg) {
  $line = '[{0}] {1}' -f (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ'), $msg
  Add-Content -Path $Log -Value $line
}

# The runner answers without a Content-Type header, so PowerShell hands
# Invoke-WebRequest's .Content back as a byte[] - comparing it to a string
# would be false every time (found by live test 2026-09-28). Normalize here.
function Get-RunnerState {
  try {
    $c = (Invoke-WebRequest -Uri $LockUrl -UseBasicParsing -TimeoutSec 5).Content
    if ($c -isnot [string]) { $c = [System.Text.Encoding]::UTF8.GetString($c) }
    if ($c -eq $Alive) { return 'alive' }
    return 'foreign'
  } catch { return 'down' }
}

# Single-instance guard: our own command line contains the marker too, so
# count 1 = just us, count 2+ = a duplicate watchdog is starting -> it exits.
$hosts = @(Get-CimInstance Win32_Process -Filter "Name='powershell.exe'" |
  Where-Object { $_.CommandLine -match 'school-watchdog\.ps1' })
if ($hosts.Count -gt 1) {
  Write-Log ('duplicate watchdog detected (' + $hosts.Count + ' hosts), this one exits')
  exit 0
}

Write-Log 'watchdog started'

while ($true) {
  Start-Sleep -Seconds 120

  if ((Get-RunnerState) -eq 'alive') { continue }  # healthy, stay quiet

  Write-Log 'runner not answering, relaunching'
  # NOTE (found by live test 2026-09-28): the parentheses below are required.
  # Without them PowerShell binds '"' as -ArgumentList and passes + $Vbs + '"'
  # as separate positional args, so wscript gets garbage and nothing starts.
  Start-Process wscript.exe -ArgumentList ('"' + $Vbs + '"')

  # Give the tree time to boot, then verify twice (boot takes ~3 s but the
  # hidden cmd + wscript chain can be slower under disk load). If layer 1
  # (the .bat loop) is still mid-restart, the port lock makes this extra
  # launch harmless: the second node sees the live port and exits code 0.
  Start-Sleep -Seconds 20
  $state = Get-RunnerState
  if ($state -ne 'alive') { Start-Sleep -Seconds 20; $state = Get-RunnerState }
  if ($state -eq 'alive') { Write-Log 'runner revived' }
  else { Write-Log ('runner STILL not answering after relaunch (state: ' + $state + ') - check functions\local-server.log') }
}
