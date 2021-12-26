import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

	const sorter = (a: number, b: number, desc: boolean = false) => {
		if (desc) {[a, b] = [b, a];}
		if (a > b) {return 1;}
		if (a < b) {return -1;}
		return 0;
	};

	const processConfiguration = () => {
		const delimiter: string = vscode.workspace.getConfiguration('decapsulator').delimiter;
		const decapsulatorRawPairs: string[] = vscode.workspace.getConfiguration('decapsulator').decapsulatorPairs;
		const decapsulatorPairs: {[opener: string]: string} = {};
		const startingLengths: number[] = [];
		const endingLengths: number[] = [];
		decapsulatorRawPairs.forEach(rawPair => {
			const splitRawPair = rawPair.split(delimiter);
			if (splitRawPair.length === 2) {
				decapsulatorPairs[splitRawPair[0]] = splitRawPair[1];
				if (!startingLengths.includes(splitRawPair[0].length)) {
					startingLengths.push(splitRawPair[0].length);
				}
				if (!endingLengths.includes(splitRawPair[1].length)) {
					endingLengths.push(splitRawPair[1].length);
				}
			}
		});
		startingLengths.sort((a, b) => sorter(a, b, true));
		endingLengths.sort((a, b) => sorter(a, b, true));
		return { decapsulatorPairs, startingLengths, endingLengths };
	};

	const getRangeAndChars = (editor: vscode.TextEditor, cursor: vscode.Position, offset: number) => {
		let range;
		if (offset >= 0) {
			range = new vscode.Range(cursor, cursor.translate(0, offset));
		} else {
			range = new vscode.Range(cursor.translate(0, offset), cursor);
		}
		const chars = editor.document.getText(range);
		return { range, chars };
	};

	const { decapsulatorPairs, startingLengths, endingLengths } = processConfiguration();

	let disposable = vscode.commands.registerCommand('decapsulator.decapsulate', () => {
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			const cursorStart = editor.selection.start;
			const cursorEnd = editor.selection.end;
			for (const startingLength of startingLengths) {
				const {range: startRange, chars: firstChars} = getRangeAndChars(editor, cursorStart, startingLength);
				if (!decapsulatorPairs[firstChars]) {continue;}
				for (const endingLength of endingLengths) {
					if (cursorEnd.translate(0, 1 - endingLength).isAfter(cursorStart.translate(0, startingLength))) {
						const {range: endRange, chars: lastChars} = getRangeAndChars(editor, cursorEnd, -1 * endingLength);
						if (decapsulatorPairs[firstChars] === lastChars) {
							editor.edit(editBuilder => {
								editBuilder.delete(endRange);
								editBuilder.delete(startRange);
							});
							return true;
						}
					}
				}
			}
		}
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}
