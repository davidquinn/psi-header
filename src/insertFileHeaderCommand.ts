/*
 * File: insertFileHeaderCommand.ts
 * Project: psioniq File Header
 * File Created: Wednesday, 1st November 2017 7:39:26 pm
 * Author: David Quinn (info@psioniq.uk)
 * -----
 * Last Modified: Saturday, 14th July 2018 7:17:18 am
 * Modified By: David Quinn (info@psioniq.uk>)
 * -----
 * MIT License
 *
 * Copyright 2017 - 2018 David Quinn, psioniq
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
import {BASE_SETTINGS, ILangConfig, IConfig, IVariableList, getLanguageConfig, getTemplateConfig, getConfig, getVariables, merge} from './helper';

/**
 * This is the command that inserts the header into the active editor document.
 *
 * @export
 * @returns
 */
export function insertFileHeader() {
	const editor: TextEditor = window.activeTextEditor;
	if (!editor) {
    	window.showErrorMessage('psi-header requires an active document.');
		return;
	}
	const wsConfig: WorkspaceConfiguration = workspace.getConfiguration(BASE_SETTINGS);
	const langId: string = editor.document.languageId;
	const langConfig: ILangConfig = getLanguageConfig(wsConfig, langId);
	const template: Array<string> = getTemplateConfig(wsConfig, langId).template;
	const config: IConfig = getConfig(wsConfig, langConfig);
	const variables: IVariableList = getVariables(wsConfig, editor, config, langConfig);

	// console.log(`insertFileHeader into ${editor.document.fileName}`);

	if (config.forceToTop) {
		const position = new Position(0, 0);
		editor.selection = new Selection(position, position);
	}

	editor.edit(function(edit) {
		edit.insert(editor.selection.active, merge(template, langConfig, variables, config));
	});
}
