import * as vscode from 'vscode';
import { execFile } from 'child_process';

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.window.registerCustomEditorProvider(
      'lnk.resolver',
      new LnkEditorProvider(),
      { supportsMultipleEditorsPerDocument: false }
    )
  );
}

class LnkEditorProvider implements vscode.CustomEditorProvider {
  private onDidChangeCustomDocumentEmitter = new vscode.EventEmitter<
    vscode.CustomDocumentEditEvent<vscode.CustomDocument>
  >();
  onDidChangeCustomDocument = this.onDidChangeCustomDocumentEmitter.event;

  async openCustomDocument(
    uri: vscode.Uri
  ): Promise<vscode.CustomDocument> {
    return { uri, dispose() {} };
  }

  async resolveCustomEditor(
    document: vscode.CustomDocument
  ): Promise<void> {

    const target = await resolveLnk(document.uri.fsPath);

    if (!target) {
      vscode.window.showErrorMessage('Failed to resolve .lnk file');
      return;
    }

    const targetUri = vscode.Uri.file(target);

    await vscode.commands.executeCommand(
      'vscode.open',
      targetUri
    );
  }

  async saveCustomDocument(document: vscode.CustomDocument): Promise<void> {
    // Not needed for .lnk files
  }

  async saveCustomDocumentAs(document: vscode.CustomDocument, destination: vscode.Uri): Promise<void> {
    // Not needed for .lnk files
  }

  async revertCustomDocument(document: vscode.CustomDocument): Promise<void> {
    // Not needed for .lnk files
  }

  async backupCustomDocument(
    document: vscode.CustomDocument,
    context: vscode.CustomDocumentBackupContext,
    cancellation: vscode.CancellationToken
  ): Promise<vscode.CustomDocumentBackup> {
    // Not needed for .lnk files
    return { id: '1', delete() {} };
  }
}

function resolveLnk(path: string): Promise<string | null> {
  return new Promise((resolve) => {
    execFile(
      'powershell',
      [
        '-NoProfile',
        '-Command',
        `(New-Object -ComObject WScript.Shell).CreateShortcut('${path}').TargetPath`
      ],
      (err, stdout) => {
        if (err) {
          resolve(null);
        } else {
          resolve(stdout.trim() || null);
        }
      }
    );
  });
}
