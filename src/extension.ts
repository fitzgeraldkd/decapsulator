import * as vscode from 'vscode';

import { processConfiguration } from './utils';

export function activate(context: vscode.ExtensionContext) {

	let wrappers = processConfiguration();

	vscode.workspace.onDidChangeConfiguration(e => {
		if (e.affectsConfiguration('decapsulator')) {
			wrappers = processConfiguration();
		}
	});
	
	let disposable = vscode.commands.registerCommand('decapsulator.decapsulate', () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {return;}
		const rangesToDelete: vscode.Range[] = [];
		for (const selection of editor.selections) {
			const selectedText = editor.document.getText(selection);
			for (const wrapper of wrappers) {
				if (selectedText.match(wrapper.pattern)) {
					const cursorStart = selection.start;
					const cursorEnd = selection.end;
					rangesToDelete.push(new vscode.Range(cursorStart, cursorStart.translate(0, wrapper.startLength)));
					rangesToDelete.push(new vscode.Range(cursorEnd.translate(0, -1 * wrapper.endLength), cursorEnd));
					break;
				}
			}
		}
		editor.edit(editBuilder => {
			rangesToDelete
				.sort((a, b) => b.start.character - a.start.character)
				.forEach(range => {editBuilder.delete(range);});
		});
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}
