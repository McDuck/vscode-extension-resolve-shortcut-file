#!/usr/bin/env pwsh
<#
.SYNOPSIS
Build, package and install extension locally

.DESCRIPTION
Compiles TypeScript, packages the extension as .vsix, and optionally installs it locally.

.PARAMETER Install
Installs the extension after packaging (default: $true). Use -Install:$false to skip installation.

.PARAMETER Help
Shows this help message.

.EXAMPLE
./build.ps1                   # Compile, package, and install
./build.ps1 -Install:$false   # Compile and package only, skip install
./build.ps1 -Help             # Show this help message
#>

param(
    [switch]$Install = $true,
    [switch]$Help
)

if ($Help) {
    Get-Help $MyInvocation.MyCommand.Path -Full
    exit 0
}

$ErrorActionPreference = "Stop"
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "Build, Package `& Install Extension" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

# Compile
Write-Host "`n[1/3] Compiling..." -ForegroundColor Yellow
& npx @("tsc", "-p", "./")
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Compilation failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Compiled" -ForegroundColor Green

# Package
Write-Host "`n[2/3] Packaging..." -ForegroundColor Yellow
& npx @("vsce", "package")
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Packaging failed" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Packaged" -ForegroundColor Green

# Install
if ($Install) {
    Write-Host "`n[3/3] Installing locally." -ForegroundColor Yellow

    $vsix = Get-ChildItem -Filter "*.vsix" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    if ($vsix) {
        # List installed extensions
        $installedExtensions = code --list-extensions | Out-String

        # Check if the specific extension is installed
        if ($installedExtensions -like "*mcprocess.resolve-shortcut-file*") {
            Write-Host "Uninstalling locally..." -ForegroundColor Yellow
            code --uninstall-extension "mcprocess.resolve-shortcut-file" 2>$null
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Uninstalled" -ForegroundColor Green
            } else {
                Write-Host "❌ Uninstallation failed" -ForegroundColor Red
                exit 1
            }
        }
        
        Write-Host "Installing locally..." -ForegroundColor Yellow
        code --install-extension $vsix.FullName
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Installed" -ForegroundColor Green
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
}

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✅ Complete!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
