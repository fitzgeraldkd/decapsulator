import * as vscode from 'vscode';

interface WrapperInfo {
    pattern: RegExp
    startLength: number
    endLength: number
}

// Characters that need to be escaped within a regex pattern.
const ESCAPED_CHARACTERS = new Set('.^$*+-?()[]{}\\|');

/**
 * Return a copy of the string with characters escaped as needed for a regex pattern.
 */
export function escapeString(str: string) {
    return str
        .split('')
        .map(char => ESCAPED_CHARACTERS.has(char) ? '\\' + char : char)
        .join('');
}

/**
 * Load the user's settings and generate a list of patterns to match against.
 */
export function processConfiguration() {
    const delimiter: string = vscode.workspace.getConfiguration('decapsulator').delimiter;
    const decapsulatorRawPairs: string[] = vscode.workspace.getConfiguration('decapsulator').decapsulatorPairs;
    const wrappers: WrapperInfo[] = [];
    decapsulatorRawPairs.forEach(rawPair => {
        const [start, end] = rawPair.split(delimiter);
        const escapedStart = escapeString(start);
        const escapedEnd = escapeString(end);
        const pattern = new RegExp(`^${escapedStart}.*${escapedEnd}$`);
        wrappers.push({ pattern, startLength: start.length, endLength: end.length });
    });
    return wrappers;
}
