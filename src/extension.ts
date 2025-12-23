import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { resolveShortcut } from './shortcutResolver';

let outputChannel: vscode.OutputChannel;

export function activate(context: vscode.ExtensionContext) {
	outputChannel = vscode.window.createOutputChannel('Resolve Shortcut');

	// Register the resolve shortcut command
	const resolveCommand = vscode.commands.registerCommand(
		'resolve-shortcut.resolveShortcut',
		async (uri?: vscode.Uri) => {
			try {
				const targetUri = await handleShortcutResolution(uri);
				if (targetUri) {
					outputChannel.appendLine(`Resolved shortcut to: ${targetUri.fsPath}`);
				}
			} catch (error) {
				outputChannel.appendLine(`Error: ${error}`);
				vscode.window.showErrorMessage(`Failed to resolve shortcut: ${error}`);
			}
		}
	);

	// Register the open shortcut command
	const openCommand = vscode.commands.registerCommand(
		'resolve-shortcut.openShortcut',
		async (uri?: vscode.Uri) => {
			try {
				const targetUri = await handleShortcutResolution(uri);
				if (targetUri) {
					// Open the resolved target
					await vscode.commands.executeCommand('vscode.open', targetUri);
				}
			} catch (error) {
				outputChannel.appendLine(`Error: ${error}`);
				vscode.window.showErrorMessage(`Failed to open shortcut: ${error}`);
			}
		}
	);

	// Handle file open events for .lnk files
	const fileOpenHandler = vscode.workspace.onDidOpenTextDocument(async (document: vscode.TextDocument) => {
		if (document.fileName.endsWith('.lnk')) {
			// Automatically resolve and open the shortcut
			try {
				const targetUri = await handleShortcutResolution(vscode.Uri.file(document.fileName));
				if (targetUri) {
					await vscode.commands.executeCommand('vscode.open', targetUri);
				}
			} catch (error) {
				outputChannel.appendLine(`Auto-resolve error: ${error}`);
			}
		}
	});

	// Handle file explorer click events for .lnk files
	const editorChangeHandler = vscode.window.onDidChangeActiveTextEditor(async (editor: vscode.TextEditor | undefined) => {
		if (editor && editor.document.fileName.endsWith('.lnk')) {
			// Automatically resolve and open the shortcut when clicked in explorer
			try {
				const targetUri = await handleShortcutResolution(vscode.Uri.file(editor.document.fileName));
				if (targetUri) {
					await vscode.commands.executeCommand('vscode.open', targetUri);
				}
			} catch (error) {
				outputChannel.appendLine(`Auto-resolve error: ${error}`);
			}
		}
	});

	context.subscriptions.push(resolveCommand, openCommand, fileOpenHandler, editorChangeHandler, outputChannel);
}

async function handleShortcutResolution(uri?: vscode.Uri): Promise<vscode.Uri | null> {
	let shortcutPath: string;

	if (uri) {
		shortcutPath = uri.fsPath;
	} else {
		// Get the current active file
		const activeEditor = vscode.window.activeTextEditor;
		if (!activeEditor) {
			vscode.window.showErrorMessage('No file selected');
			return null;
		}
		shortcutPath = activeEditor.document.fileName;
	}

	if (!shortcutPath.toLowerCase().endsWith('.lnk')) {
		vscode.window.showErrorMessage('Selected file is not a .lnk shortcut file');
		return null;
	}

	if (!fs.existsSync(shortcutPath)) {
		vscode.window.showErrorMessage(`Shortcut file not found: ${shortcutPath}`);
		return null;
	}

	try {
		const targetPath = await resolveShortcut(shortcutPath);
		if (!targetPath) {
			vscode.window.showErrorMessage('Could not resolve shortcut target');
			return null;
		}

		if (!fs.existsSync(targetPath)) {
			vscode.window.showErrorMessage(`Shortcut target not found: ${targetPath}`);
			return null;
		}

		return vscode.Uri.file(targetPath);
	} catch (error) {
		throw error;
	}
}

export function deactivate() {
	if (outputChannel) {
		outputChannel.dispose();
	}
}
