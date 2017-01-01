/**
 * File: /Users/David/Development/psioniq/vscode-extensions/psi-header/src/insertFileHeaderCommand.ts
 * Project: /Users/David/Development/psioniq/vscode-extensions/psi-header
 * Created Date: Sun Jan 01 2017
 * Author: David Quinn (david@eternia.net)
 * 
 * License: MIT License (SPDX = 'MIT')
 * License URL: http://www.opensource.org/licenses/MIT
 * 
 * MIT License
 * 
 * Copyright (c) 2017 psioniq
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is furnished to do
 * so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import {workspace, window, TextEditor, WorkspaceConfiguration, Selection, Position} from 'vscode';
import {BASE_SETTINGS, ILangConfig, IConfig, IVariableList, getLanguageConfig, getTemplate, getConfig, getVariables, merge} from './helper';

/**
 * This is the command.  It inserts the header into the active editor document.
 * 
 * @export
 * @returns
 */
export function insertFileHeader() {
	const editor: TextEditor = window.activeTextEditor;
	if (!editor) {
    	window.showErrorMessage('psi-heder requires an active document.');
		return;
	}
	const wsConfig: WorkspaceConfiguration = workspace.getConfiguration(BASE_SETTINGS);
	const langId: string = editor.document.languageId;
	const langConfig: ILangConfig = getLanguageConfig(wsConfig, langId);
	const template: Array<string> = getTemplate(wsConfig, langId);
	const config: IConfig = getConfig(wsConfig, langConfig);
	const variables: IVariableList = getVariables(wsConfig, editor, config, langConfig);

	if (config.forceToTop) {
		const position = new Position(0, 0);
		editor.selection = new Selection(position, position);
	}

	editor.edit(function(edit) {
		edit.insert(editor.selection.active, merge(template, langConfig, variables, config));
	});
}
