# System readiness check for WHIP/WebRTC streaming (ASCII only for PS 5.1)
$ErrorActionPreference = 'SilentlyContinue'

Write-Host "=== 1. OBS Studio (registry) ==="
$obs = Get-ItemProperty 'HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*','HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*' |
  Where-Object { $_.DisplayName -match 'OBS' } |
  Select-Object DisplayName, DisplayVersion, InstallLocation
if ($obs) { $obs | Format-List } else { Write-Host "OBS Studio NOT found in installed programs" }

Write-Host "=== 2. OBS install paths ==="
foreach ($p in @("$env:ProgramFiles\obs-studio", "${env:ProgramFiles(x86)}\obs-studio")) {
  if (Test-Path $p) {
    Write-Host "FOUND: $p"
    $exe = Get-ChildItem -Path $p -Recurse -Filter 'obs64.exe' -First 1
    if ($exe) {
      $v = (Get-Item $exe.FullName).VersionInfo
      Write-Host ("  obs64.exe version: " + $v.ProductVersion + "  path: " + $exe.FullName)
    }
  } else { Write-Host "not present: $p" }
}

Write-Host "=== 3. MediaMTX / Broadcast Box / ffmpeg / go ==="
foreach ($cmd in @('obs64','ffmpeg','ffprobe','mediamtx','broadcast-box','go')) {
  $c = Get-Command $cmd
  if ($c) { Write-Host ("FOUND: " + $cmd + " -> " + $c.Source) } else { Write-Host ("not found: " + $cmd) }
}

Write-Host "=== 4. Winget / Node ==="
$wg = Get-Command winget
if ($wg) { Write-Host ("winget: " + (& winget --version)) } else { Write-Host "winget NOT found" }
$nd = Get-Command node
if ($nd) { Write-Host ("node: " + (& node --version) + " -> " + $nd.Source) } else { Write-Host "node NOT found" }

Write-Host "=== 5. Ports ==="
foreach ($port in @(8080, 8554, 8888, 8889, 1935)) {
  $inUse = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($inUse) { Write-Host ("port " + $port + ": BUSY (pid " + $inUse.OwningProcess + ")") }
  else { Write-Host ("port " + $port + ": free") }
}

Write-Host "=== 6. Camera / mic devices ==="
$cam = Get-PnpDevice -Class Camera -Status OK | Select-Object -First 2 -ExpandProperty FriendlyName
if ($cam) { Write-Host ("Cameras: " + ($cam -join ', ')) } else { Write-Host "No Camera class device found" }
$mic = Get-PnpDevice -Class MEDIA -Status OK | Where-Object { $_.FriendlyName -match 'mic|Micro|Audio|Realtek' } | Select-Object -First 3 -ExpandProperty FriendlyName
if ($mic) { Write-Host ("Audio devices: " + ($mic -join '; ')) }

Write-Host "=== 7. Hardware ==="
$cpu = (Get-CimInstance Win32_Processor).Name
$ram = [math]::Round((Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory / 1GB, 1)
$gpu = (Get-CimInstance Win32_VideoController | Select-Object -First 1).Name
Write-Host "CPU: $cpu"
Write-Host "RAM: $ram GB"
Write-Host "GPU: $gpu"

Write-Host "=== 8. Network ==="
$ips = Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notmatch '^127\.' -and $_.PrefixOrigin -ne 'WellKnown' } | Select-Object -First 3
foreach ($ip in $ips) { Write-Host ("IPv4: " + $ip.IPAddress + " (iface: " + $ip.InterfaceAlias + ")") }
$net = Get-NetConnectionProfile | Select-Object -First 1
if ($net) { Write-Host ("Network: " + $net.Name + " / " + $net.NetworkCategory) }
