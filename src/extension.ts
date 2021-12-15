// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	// console.log('Congratulations, your extension "decapsulator" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('decapsulator.decapsulate', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		const editor = vscode.window.activeTextEditor;

		if (editor) {
			let cursorStart = editor.selection.start;
			let cursorEnd = editor.selection.end;
			if (cursorEnd.isAfter(cursorStart)) {
				const pairs: {[key: string]: string} = {
					'(': ')',
					'[': ']',
					'{': '}',
					'<': '>',
					"'": "'",
					'"': '"',
					'`': '`'
				};
				let firstRange = new vscode.Range(cursorStart, cursorStart.translate(0, 1));
				let lastRange = new vscode.Range(cursorEnd.translate(0, -1), cursorEnd);
				const firstChar = editor.document.getText(firstRange);
				const lastChar = editor.document.getText(lastRange);
				// vscode.window.showInformationMessage(`${firstChar} ${lastChar}`);
				if (pairs[firstChar] === lastChar) {
					editor.edit(editBuilder => {
						editBuilder.delete(lastRange);
						editBuilder.delete(firstRange);
					});
				}
	
			}
		}

	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
