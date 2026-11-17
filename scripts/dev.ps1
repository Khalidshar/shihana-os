$ErrorActionPreference = 'Stop'
Set-Location (Split-Path $PSScriptRoot -Parent)
npm.cmd run build
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
npm.cmd run dev
