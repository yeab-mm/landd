# Full Metro / Expo reset for Windows (run from land-portal-app folder)
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

Write-Host "Stopping Node processes on ports 8081 and 8082..."
8081, 8082 | ForEach-Object {
  $conn = Get-NetTCPConnection -LocalPort $_ -ErrorAction SilentlyContinue
  if ($conn) {
    $conn.OwningProcess | Sort-Object -Unique | ForEach-Object {
      Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue
    }
  }
}

Write-Host "Clearing caches..."
Remove-Item -Recurse -Force "$root\.expo" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "$root\node_modules\.cache" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "$env:TEMP\metro-*" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "$env:TEMP\haste-map-*" -ErrorAction SilentlyContinue

Write-Host "Reinstalling dependencies..."
npm install

Write-Host "Done. Start with: npm run start:clean"
