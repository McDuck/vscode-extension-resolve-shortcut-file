@echo off
REM Test Fixture Setup Script for Windows
REM Creates test .lnk shortcut files in the test-fixtures directory

setlocal enabledelayedexpansion

REM Get the project root directory
set "PROJECT_ROOT=%~dp0.."
set "FIXTURES_DIR=%PROJECT_ROOT%\test-fixtures"

REM Create test-fixtures directory
if not exist "%FIXTURES_DIR%" mkdir "%FIXTURES_DIR%"

REM Create target file
echo This is a test target file for the resolve-shortcut extension. > "%FIXTURES_DIR%\test-target.txt"
echo Created test target file

REM Create target directory
if not exist "%FIXTURES_DIR%\test-target-dir" mkdir "%FIXTURES_DIR%\test-target-dir"
echo This is a test target directory. > "%FIXTURES_DIR%\test-target-dir\readme.txt"
echo Created test target directory

REM Create shortcut to file using PowerShell
powershell -Command ^
  "$WshShell = New-Object -ComObject WScript.Shell; " ^
  "$Shortcut = $WshShell.CreateShortcut('%FIXTURES_DIR%\test-shortcut.lnk'); " ^
  "$Shortcut.TargetPath = '%FIXTURES_DIR%\test-target.txt'; " ^
  "$Shortcut.Description = 'Test shortcut to a text file'; " ^
  "$Shortcut.Save(); " ^
  "Write-Host 'Created test-shortcut.lnk'"

REM Create shortcut to directory using PowerShell
powershell -Command ^
  "$WshShell = New-Object -ComObject WScript.Shell; " ^
  "$Shortcut = $WshShell.CreateShortcut('%FIXTURES_DIR%\test-folder-shortcut.lnk'); " ^
  "$Shortcut.TargetPath = '%FIXTURES_DIR%\test-target-dir'; " ^
  "$Shortcut.Description = 'Test shortcut to a folder'; " ^
  "$Shortcut.Save(); " ^
  "Write-Host 'Created test-folder-shortcut.lnk'"

echo.
echo Test fixtures created in: %FIXTURES_DIR%
echo.
echo You can now test the extension by:
echo 1. Opening VS Code to the project folder
echo 2. Opening test-fixtures\test-shortcut.lnk to trigger shortcut resolution
echo 3. Or right-click the shortcut and select 'Open Shortcut Target'
echo.

pause
