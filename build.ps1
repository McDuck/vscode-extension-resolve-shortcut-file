#!/usr/bin/env pwsh
<#
.SYNOPSIS
Build pipeline for Resolve Shortcut File extension
.DESCRIPTION
Compiles TypeScript, runs tests, and optionally installs the extension locally
#>

param(
    [switch]$Install = $false
)

$ErrorActionPreference = "Stop"
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "Resolve Shortcut File - Build Pipeline" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

# Step 1: Compile
Write-Host "`n[1/4] Compiling TypeScript..." -ForegroundColor Yellow
npm run compile
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Compilation failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Compilation successful" -ForegroundColor Green

# Step 2: Package
Write-Host "`n[2/3] Packaging extension..." -ForegroundColor Yellow
npx vsce package
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Packaging failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Extension packaged" -ForegroundColor Green

# Step 3: Install (optional)
if ($Install) {
    Write-Host "`n[3/3] Installing extension locally..." -ForegroundColor Yellow
    
    # Uninstall old version
    Write-Host "  Uninstalling previous version..." -ForegroundColor Gray
    code --uninstall-extension "your-name.resolve-shortcut-file" 2>$null
    
    # Install new version
    $vsixFile = Get-ChildItem -Filter "*.vsix" -Path $scriptPath | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    if ($vsixFile) {
        Write-Host "  Installing $($vsixFile.Name)..." -ForegroundColor Gray
        code --install-extension $vsixFile.FullName
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Extension installed locally" -ForegroundColor Green
        } else {
            Write-Host "❌ Installation failed" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "❌ No .vsix file found" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "`n[3/3] Skipping local install" -ForegroundColor Yellow
    Write-Host "   Run with -Install flag to install locally" -ForegroundColor Gray
}

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✅ Build pipeline complete!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
