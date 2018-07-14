/*
 * File: README.md
 * Project: psioniq File Header
 * File Created: Wednesday, 11th July 2018 6:31:17 am
 * Author: David Quinn (info@psioniq.uk)
 * -----
 * Last Modified: Saturday, 14th July 2018 9:10:51 am
 * Modified By: David Quinn (info@psioniq.uk>)
 * -----
 * Copyright 2017 - 2018 David Quinn, psioniq
 */

import { window, TextEditor, WorkspaceConfiguration, workspace, Position, Selection, TextDocument, TextLine } from 'vscode';
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
	if (!templateConfig.changeLogCaption) {
		window.showErrorMessage('psi-header: Cannot insert change log - change log caption is not set.');
		return;
	}
	const captionRow: number = captionRowIndex(editor.document, templateConfig.changeLogCaption);
	if (captionRow === -1) {
		window.showErrorMessage('psi-header: Cannot insert change log - change log caption not found in document.  Maybe you need to add a header?');
		return;
	}
	const tpl: Array<string> = templateConfig.changeLogEntryTemplate || k_.CHANGE_LOG_ENTRY_TEMPLATE;
	const config: helper.IConfig = helper.getConfig(wsConfig, langConfig);
	const variables: helper.IVariableList = helper.getVariables(wsConfig, editor, config, langConfig);
	const mergedChangeLog: Array<string> = helper.replaceTemplateVariables(tpl, langConfig.prefix, variables).split('\n');
	const row: number = captionRow + (templateConfig.changeLogHeaderLineCount || 0);
	const col: number =  editor.document.lineAt(row).text.length;
	const pos: Position = new Position(row, col);
	editor.selection = new Selection(pos, pos);
	editor.edit(function(edit) {
		mergedChangeLog.forEach((line) => {
			edit.insert(editor.selection.active, '\n' + line);
		});
	});
}

function captionRowIndex(doc: TextDocument, caption: string): number {
	if (caption && doc) {
		for (let i: number = 0; i < doc.lineCount; i++) {
			if (doc.lineAt(i).text.includes(caption)) {
				return i;
			}
		};
	}
	return -1;
}
