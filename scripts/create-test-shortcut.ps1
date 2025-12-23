param(
    [string]$TargetPath = "$env:TEMP\test-target.txt",
    [string]$ShortcutPath = "$env:TEMP\test-shortcut.lnk"
)

# Create the target file if it doesn't exist
if (-not (Test-Path $TargetPath)) {
    "This is a test target file" | Out-File -FilePath $TargetPath -Encoding UTF8
}

# Create the shortcut
$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = $TargetPath
$Shortcut.Description = "Test shortcut for resolve-shortcut extension"
$Shortcut.Save()

Write-Host "Shortcut created at: $ShortcutPath"
Write-Host "Target path: $TargetPath"
