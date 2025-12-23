# Testing Guide

This document explains how to test the Resolve Shortcut VS Code extension.

## Prerequisites

- Windows OS (for shortcut resolution)
- PowerShell 5.1+ (included with Windows)
- VS Code 1.75.0+
- Node.js and npm (for building the extension)

## Running Tests

### Automated Tests

Run the full test suite (unit + integration):

```bash
npm install
npm run compile
npm test
```

This will:
1. Create real `.lnk` files with PowerShell
2. Test shortcut resolution
3. Clean up test files

### Manual Integration Testing

For interactive testing with actual shortcut files:

#### Step 1: Create Test Fixtures

Choose one of these methods:

**Batch file (easiest on Windows):**
```cmd
scripts\setup-test-fixtures.bat
```

**PowerShell:**
```powershell
powershell -ExecutionPolicy Bypass -File scripts/create-test-shortcut.ps1
```

**Python:**
```bash
python scripts/setup-test-fixtures.py
```

#### Step 2: Test the Extension

1. Open the project in VS Code
2. Press `F5` to launch the extension in debug mode
3. A new VS Code window opens with the extension loaded
4. Open the `test-fixtures` folder in the debug window
5. You'll see two shortcut files:
   - `test-shortcut.lnk` - Points to a text file
   - `test-folder-shortcut.lnk` - Points to a directory

#### Step 3: Test Shortcut Resolution

Try these interactions:

**Single-click opening:**
- Click on `test-shortcut.lnk` in the explorer
- The target file should open automatically

**Context menu:**
- Right-click on `test-shortcut.lnk`
- Select "Open Shortcut Target"
- The target should open

**Command palette:**
- Press `Ctrl+Shift+P`
- Type "Resolve Shortcut" or "Open Shortcut Target"
- Select the command
- The shortcut target resolves

## Debugging

When debugging the extension (F5):
- Check the "Resolve Shortcut" output channel for logs
- Check VS Code's Developer Tools (Help → Toggle Developer Tools)
- Breakpoints work in `.ts` files in the main VS Code window

## Troubleshooting

### "Cannot find module" errors during test run
```bash
npm install
npm run compile
```

### PowerShell script execution blocked
```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope CurrentUser
```

### Test shortcuts won't create
- Ensure PowerShell has access to temp directory
- Check that `scripts/` folder exists
- Verify Windows COM object support (all modern Windows)

### Extension not activating
- Check the extension is selected in debug configurations
- Verify `package.json` has correct contribution points
- Review "Resolve Shortcut" output channel for errors
