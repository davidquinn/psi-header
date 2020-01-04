/*
 * File: insertChangeLogCommand.ts
 * Project: psioniq File Header
 * File Created: Wednesday, 11th July 2018 6:31:17 am
 * Author: David Quinn (info@psioniq.uk)
 * -----
 * Last Modified: Friday, 3rd January 2020 7:43:43 am
 * Modified By: David Quinn (info@psioniq.uk)
 * -----
 * MIT License
 *
 * Copyright 2016 - 2018 David Quinn (psioniq)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { window, TextEditor, WorkspaceConfiguration, workspace, Position, Selection, TextDocument, TextLine, DocumentFilter } from 'vscode';
import * as helper from './helper';
import { ITemplateConfig, ILangConfig } from './interfaces';
import * as k_ from './constants';

export function insertChangeLog() {
	const editor: TextEditor = window.activeTextEditor;
	if (!editor) {
    	window.showErrorMessage('psi-header requires an active document.');
		return;
	}

	const wsConfig: WorkspaceConfiguration = workspace.getConfiguration(helper.BASE_SETTINGS);
	const langConfig: helper.ILangConfig = helper.getLanguageConfig(wsConfig, editor.document.languageId);
	const templateConfig: ITemplateConfig = helper.getTemplateConfig(wsConfig, editor.document.languageId);
	const naturalOrder: boolean = templateConfig.changeLogNaturalOrder || false;

	if (!templateConfig.changeLogCaption && !naturalOrder) {
		window.showErrorMessage('psi-header: Cannot insert change log - either the caption configuration must be provided or natural order configuration must be set to true.');
		return;
	}

	const isCompact: boolean = helper.isCompactMode(langConfig);

	const captionRow: number = captionRowIndex(editor.document, templateConfig, langConfig, naturalOrder, isCompact);
	if (captionRow === -1) {
		window.showErrorMessage('psi-header: Cannot insert change log - location not found in document.  Maybe you need to add a header?');
		return;
	}

	const tpl: Array<string> = templateConfig.changeLogEntryTemplate || k_.CHANGE_LOG_ENTRY_TEMPLATE;
	const config: helper.IConfig = helper.getConfig(wsConfig, langConfig);
	const variables: helper.IVariableList = helper.getVariables(wsConfig, editor, config, langConfig);
	const mergedChangeLog: Array<string> = helper.replaceTemplateVariables(tpl, langConfig.prefix, variables, config.creationDateZero).split('\n');
	const row: number = captionRow + (naturalOrder ? (-1 * (templateConfig.changeLogFooterLineCount || 0)) : (templateConfig.changeLogHeaderLineCount || 0));
	const col: number =  editor.document.lineAt(row).text.length;
	const pos: Position = new Position(row, col);
	editor.selection = new Selection(pos, pos);
	editor.edit(function(edit) {
		mergedChangeLog.forEach((line) => {
			edit.insert(editor.selection.active, '\n' + line);
		});
	});
}

function captionRowIndex(doc: TextDocument, template: ITemplateConfig, langConfig: ILangConfig, naturalOrder: boolean, isCompact: boolean): number {
	if (doc) {
		const caption: string = template ? template.changeLogCaption : null;
		if (naturalOrder) {
			if (isCompact) {
				let inComment: boolean = false;
				for (let i: number = 0; i < doc.lineCount; i++) {
					const text: string = doc.lineAt(i).text;
					if (!inComment){
						if (text.startsWith(langConfig.prefix)) {
							inComment = true;
						}
					} else {
						if (!text.startsWith(langConfig.prefix)) {
							return i - 1;
						}
					}
				}
			} else {
				for (let i: number = 0; i < doc.lineCount; i++) {
					if (doc.lineAt(i).text === langConfig.end) {
						return i - 1;
					}
				};

			}
		} else if (caption) {
			for (let i: number = 0; i < doc.lineCount; i++) {
				if (doc.lineAt(i).text.includes(caption)) {
					return i;
				}
			};
		}

	}
	return -1;
}
