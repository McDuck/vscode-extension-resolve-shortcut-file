#!/usr/bin/env python3
"""
Test Fixture Setup Script
Creates test .lnk shortcut files in the test-fixtures directory for manual testing.
"""

import os
import sys
import subprocess
import tempfile
from pathlib import Path

def create_test_shortcuts():
    """Create test shortcut files for integration testing."""
    
    # Ensure Windows platform
    if sys.platform != 'win32':
        print("Error: This script only works on Windows", file=sys.stderr)
        sys.exit(1)
    
    # Create test-fixtures directory
    project_root = Path(__file__).parent.parent
    fixtures_dir = project_root / 'test-fixtures'
    fixtures_dir.mkdir(exist_ok=True)
    
    # Create target files
    target_file = fixtures_dir / 'test-target.txt'
    target_file.write_text('This is a test target file for the resolve-shortcut extension.\n')
    
    target_dir = fixtures_dir / 'test-target-dir'
    target_dir.mkdir(exist_ok=True)
    (target_dir / 'readme.txt').write_text('This is a test target directory.\n')
    
    # Create shortcuts using PowerShell
    shortcuts = [
        {
            'name': 'test-shortcut.lnk',
            'target': str(target_file),
            'description': 'Test shortcut to a text file'
        },
        {
            'name': 'test-folder-shortcut.lnk',
            'target': str(target_dir),
            'description': 'Test shortcut to a folder'
        }
    ]
    
    for shortcut in shortcuts:
        shortcut_path = fixtures_dir / shortcut['name']
        target_path = shortcut['target'].replace("'", "''")
        shortcut_file_path = str(shortcut_path).replace("'", "''")
        
        ps_script = f"""
$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut('{shortcut_file_path}')
$Shortcut.TargetPath = '{target_path}'
$Shortcut.Description = '{shortcut['description']}'
$Shortcut.Save()
Write-Host "Created: {shortcut_path}"
"""
        
        try:
            subprocess.run(
                ['powershell', '-Command', ps_script],
                check=True,
                capture_output=True,
                text=True
            )
            print(f"✓ Created {shortcut['name']}")
        except subprocess.CalledProcessError as e:
            print(f"✗ Failed to create {shortcut['name']}: {e.stderr}", file=sys.stderr)
            sys.exit(1)
    
    print(f"\nTest fixtures created in: {fixtures_dir}")
    print("\nYou can now test the extension by:")
    print(f"1. Opening VS Code to the project folder")
    print(f"2. Opening test-fixtures/{shortcuts[0]['name']} to trigger shortcut resolution")
    print(f"3. Or right-click the shortcut and select 'Open Shortcut Target'")

if __name__ == '__main__':
    create_test_shortcuts()
