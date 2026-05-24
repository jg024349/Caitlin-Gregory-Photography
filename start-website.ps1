$ErrorActionPreference = "Stop"

Set-Location -LiteralPath $PSScriptRoot

$nodeCommand = Get-Command node -ErrorAction SilentlyContinue

if (-not $nodeCommand) {
  Write-Host ""
  Write-Host "Node.js is required to run the contact form server." -ForegroundColor Yellow
  Write-Host "Install the LTS version from https://nodejs.org, then run this script again."
  Write-Host ""
  Read-Host "Press Enter to close"
  exit 1
}

try {
  $nodeVersion = & node --version
} catch {
  Write-Host ""
  Write-Host "Node.js was found, but Windows could not run it." -ForegroundColor Yellow
  Write-Host "Install or repair the LTS version from https://nodejs.org, then run this script again."
  Write-Host ""
  Read-Host "Press Enter to close"
  exit 1
}

Write-Host ""
Write-Host "Starting Caitlin Gregory Photography website..." -ForegroundColor Green
Write-Host "Using Node.js $nodeVersion"
Write-Host "Open this URL in your browser:"
Write-Host "http://127.0.0.1:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Leave this window open while previewing the site. Press Ctrl+C to stop."
Write-Host ""

node server.js
