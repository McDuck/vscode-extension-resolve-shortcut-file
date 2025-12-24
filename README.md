# Resolve Shortcut File

A VS Code extension that resolves Windows `.lnk` shortcut files and opens their target files or folders.

## Features

- **Resolve Shortcuts**: Automatically resolve `.lnk` Windows shortcut files to their target paths
- **Open Target**: Open the target file or folder with a single click or command
- **Consistent Behavior**: Single-click and open actions behave identically
- **Context Menu**: Right-click on `.lnk` files in the file explorer to resolve or open their targets
- **Error Handling**: Clear error messages if shortcuts cannot be resolved

## Usage

### Via Command Palette

1. Open the Command Palette (`Ctrl+Shift+P`)
2. Search for "Resolve Shortcut" or "Open Shortcut Target"
3. Select the desired command

### Via File Explorer

1. Right-click on a `.lnk` file in the File Explorer
2. Select "Open Shortcut Target" from the context menu
3. The target file or folder will open automatically

### Via Single Click

- In the File Explorer, single-click a `.lnk` file and it will automatically resolve and open the target

## Requirements

- Windows OS (uses Windows COM objects to resolve shortcuts)
- VS Code 1.75.0 or later
- PowerShell 5.1 or later (included with Windows)

## Extension Settings

This extension currently has no user-configurable settings.

## Known Limitations

- Works only on Windows systems (uses Windows COM objects)
- Requires valid `.lnk` files (corrupted shortcuts cannot be resolved)
- The target file or folder must exist for successful opening

## Development

### Project Structure

```
src/
  ├── extension.ts           # Main extension entry point
  ├── shortcutResolver.ts    # Shortcut resolution logic
  └── test/
      ├── runTest.ts         # Test runner
      └── shortcutResolver.test.ts  # Unit tests
```

### Building

```bash
npm install
npm run compile
```

### Testing

```bash
npm test
```

#### Integration Tests

The project includes integration tests with real `.lnk` shortcut files:

1. **Unit Tests** (`src/test/shortcutResolver.test.ts`) - Tests file validation and error handling
2. **Integration Tests** (`src/test/integration.test.ts`) - Creates actual `.lnk` shortcuts and tests resolution

The integration tests automatically:
- Create a test target file
- Generate a real Windows `.lnk` shortcut using PowerShell COM objects
- Test shortcut resolution against the actual file
- Clean up test files after completion

#### Manual Testing with Test Fixtures

To create test shortcut files you can manually open and test:

**Windows Batch:**
```bash
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

These scripts create:
- `test-fixtures/test-shortcut.lnk` - Shortcut pointing to a text file
- `test-fixtures/test-folder-shortcut.lnk` - Shortcut pointing to a directory

You can then:
1. Open the project in VS Code
2. Navigate to `test-fixtures/` folder
3. Single-click or double-click `test-shortcut.lnk` to trigger the extension
4. Or right-click and select "Open Shortcut Target"

### Debugging

1. Press `F5` to start the extension in debug mode
2. Test the extension in the new VS Code window that opens

## License

MIT
