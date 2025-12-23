import * as assert from 'assert';
import * as path from 'path';
import * as fs from 'fs';
import { execSync } from 'child_process';
import { resolveShortcut, isShortcutFile } from '../shortcutResolver';

suite('Integration Tests - Shortcut Resolution', () => {
	let testShortcutPath: string;
	let testTargetPath: string;

	suiteSetup(function(this: any) {
		this.timeout(10000); // Increase timeout for shortcut creation
		const tempDir = path.join(__dirname, '..', '..', '..', 'test-fixtures');
		if (!fs.existsSync(tempDir)) {
			fs.mkdirSync(tempDir, { recursive: true });
		}

		testTargetPath = path.join(tempDir, 'test-target.txt');
		testShortcutPath = path.join(tempDir, 'test-shortcut.lnk');

		// Create the target file
		fs.writeFileSync(testTargetPath, 'This is a test target file for shortcut resolution');

		// Create a shortcut using PowerShell
		const psScript = `
$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut('${testShortcutPath}')
$Shortcut.TargetPath = '${testTargetPath}'
$Shortcut.Description = 'Test shortcut for resolve-shortcut extension'
$Shortcut.Save()
`;

		try {
			// Write the script to a temp file and execute it
			const scriptPath = path.join(tempDir, 'create-shortcut.ps1');
			fs.writeFileSync(scriptPath, psScript);
			execSync(`powershell -NoProfile -ExecutionPolicy Bypass -File "${scriptPath}"`, {
				stdio: 'pipe'
			});
			// Clean up the script file
			fs.unlinkSync(scriptPath);
		} catch (error) {
			throw new Error(`Failed to create test shortcut: ${error}`);
		}
	});

	suiteTeardown(() => {
		// Clean up test files
		if (fs.existsSync(testTargetPath)) {
			fs.unlinkSync(testTargetPath);
		}
		if (fs.existsSync(testShortcutPath)) {
			fs.unlinkSync(testShortcutPath);
		}
	});

	test('should create a valid test shortcut', () => {
		assert.ok(fs.existsSync(testShortcutPath), 'Test shortcut file should exist');
		assert.ok(isShortcutFile(testShortcutPath), 'Test shortcut should be recognized as valid .lnk file');
	});

	test('should resolve a .lnk file to its target path', async () => {
		const resolvedPath = await resolveShortcut(testShortcutPath);
		assert.strictEqual(resolvedPath, testTargetPath, `Resolved path should be ${testTargetPath}, but got ${resolvedPath}`);
	});

	test('should resolve to an existing file', async function() {
		this.timeout(5000); // Increase timeout for PowerShell execution
		const resolvedPath = await resolveShortcut(testShortcutPath);
		assert.ok(resolvedPath, 'Resolved path should not be null');
		assert.ok(fs.existsSync(resolvedPath), 'Resolved target should exist');
	});

	test('should recognize shortcut file extension', () => {
		assert.ok(isShortcutFile(testShortcutPath), 'Should recognize .lnk file');
		assert.strictEqual(isShortcutFile(testTargetPath), false, 'Should not recognize .txt file as shortcut');
	});
});
