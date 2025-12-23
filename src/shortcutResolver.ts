import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

/**
 * Resolves a Windows .lnk shortcut file to its target path.
 * Uses PowerShell to access Windows COM shortcuts for accurate resolution.
 * 
 * @param shortcutPath - The full path to the .lnk file
 * @returns The resolved target path
 */
export async function resolveShortcut(shortcutPath: string): Promise<string | null> {
	try {
		// PowerShell script to resolve the shortcut
		const psScript = `
$shortcut = New-Object -ComObject WScript.Shell
$link = $shortcut.CreateShortcut('${shortcutPath}')
Write-Output $link.TargetPath
`;

		// Write script to a temporary file in the same directory as the shortcut
		const tempDir = path.dirname(shortcutPath);
		const scriptPath = path.join(tempDir, `resolve-${Date.now()}.ps1`);
		
		try {
			fs.writeFileSync(scriptPath, psScript);
			
			// Execute PowerShell script
			const result = execSync(`powershell -NoProfile -ExecutionPolicy Bypass -File "${scriptPath}"`, {
				encoding: 'utf-8',
				stdio: ['pipe', 'pipe', 'ignore']
			});

			const targetPath = result.trim();
			
			if (!targetPath) {
				throw new Error('Could not resolve shortcut target');
			}

			return targetPath;
		} finally {
			// Clean up the temporary script file
			if (fs.existsSync(scriptPath)) {
				fs.unlinkSync(scriptPath);
			}
		}
	} catch (error) {
		throw new Error(`Failed to resolve shortcut: ${error}`);
	}
}

/**
 * Validates if a file is a valid Windows .lnk shortcut.
 * 
 * @param filePath - The path to the file
 * @returns true if the file is a valid .lnk file
 */
export function isShortcutFile(filePath: string): boolean {
	return filePath.toLowerCase().endsWith('.lnk') && fs.existsSync(filePath);
}
