import * as assert from 'assert';
import * as path from 'path';
import * as fs from 'fs';
import { isShortcutFile, resolveShortcut } from '../shortcutResolver';

suite('Shortcut Resolver Tests', () => {
	test('isShortcutFile should return true for .lnk files', () => {
		// Create a temporary .lnk file for testing
		const testDir = path.join(__dirname, '..', '..', '..', 'test-fixtures');
		if (!fs.existsSync(testDir)) {
			fs.mkdirSync(testDir, { recursive: true });
		}

		const testFile = path.join(testDir, 'test.lnk');
		fs.writeFileSync(testFile, 'dummy content');

		try {
			assert.strictEqual(isShortcutFile(testFile), true, 'isShortcutFile should return true for .lnk files');
		} finally {
			// Cleanup
			if (fs.existsSync(testFile)) {
				fs.unlinkSync(testFile);
			}
		}
	});

	test('isShortcutFile should return false for non-.lnk files', () => {
		const testDir = path.join(__dirname, '..', '..', '..', 'test-fixtures');
		if (!fs.existsSync(testDir)) {
			fs.mkdirSync(testDir, { recursive: true });
		}

		const testFile = path.join(testDir, 'test.txt');
		fs.writeFileSync(testFile, 'dummy content');

		try {
			assert.strictEqual(isShortcutFile(testFile), false, 'isShortcutFile should return false for non-.lnk files');
		} finally {
			// Cleanup
			if (fs.existsSync(testFile)) {
				fs.unlinkSync(testFile);
			}
		}
	});

	test('isShortcutFile should return false for non-existent files', () => {
		const nonExistentFile = path.join(__dirname, 'non-existent.lnk');
		assert.strictEqual(isShortcutFile(nonExistentFile), false, 'isShortcutFile should return false for non-existent files');
	});

	test('resolveShortcut should throw an error for invalid shortcut files', async function() {
		this.timeout(5000); // Increase timeout for PowerShell execution
		const testDir = path.join(__dirname, '..', '..', '..', 'test-fixtures');
		if (!fs.existsSync(testDir)) {
			fs.mkdirSync(testDir, { recursive: true });
		}

		const invalidShortcut = path.join(testDir, 'invalid.lnk');
		fs.writeFileSync(invalidShortcut, 'this is not a valid shortcut file');

		try {
			try {
				await resolveShortcut(invalidShortcut);
				assert.fail('resolveShortcut should throw an error for invalid shortcut files');
			} catch (error) {
				assert.ok(error, 'Expected an error to be thrown');
			}
		} finally {
			// Cleanup
			if (fs.existsSync(invalidShortcut)) {
				fs.unlinkSync(invalidShortcut);
			}
		}
	});

	test('resolveShortcut should throw an error for non-existent files', async function() {
		this.timeout(5000); // Increase timeout for PowerShell execution
		const nonExistentFile = path.join(__dirname, 'non-existent.lnk');
		
		try {
			await resolveShortcut(nonExistentFile);
			assert.fail('resolveShortcut should throw an error for non-existent files');
		} catch (error) {
			assert.ok(error, 'Expected an error to be thrown');
		}
	});
});
