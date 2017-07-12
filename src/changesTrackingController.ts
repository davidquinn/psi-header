/**
 * File: changesTrackingController.ts
 * Relative Path: /src/changesTrackingController.ts
 * Project: psioniq File Header
 * File Created: Friday, 21st April 2017 9:14:32 pm
 * Author: David Quinn (info@psioniq.uk)
 * -----
 * Last Modified: Wednesday, July 12th 2017, 7:52:41 am
 * Modified By: David Quinn
 * -----
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



import {
	Disposable, 
	WorkspaceConfiguration, 
	Selection, 
	TextDocumentWillSaveEvent, 
	workspace, 
	window, 
	TextDocument,
	TextEdit,
	Range
} from 'vscode';
import {ITrackingConfig, IVariableList, IVariable, ILangConfig, IRangeReplacer, IRangeReplacerList} from './interfaces';
import * as k_ from './constants';
import * as moment from 'moment';
import {getLanguageConfig} from './helper';

export class ChangesTrackingController {
	private _disposable: Disposable;
	private _wsConfig: WorkspaceConfiguration;
	private _config: ITrackingConfig;
	private _author: string = 'You';
	private _selections: Selection[];

	constructor(config: WorkspaceConfiguration) {
		this._wsConfig = config;
		this._getConfig();
		const subscriptions: Disposable[] = [];
		workspace.onWillSaveTextDocument(this._onWillSave, this, subscriptions);
		workspace.onDidSaveTextDocument(this._onDidSave, this, subscriptions);
		workspace.onDidChangeConfiguration(this._onConfigChanged, this, subscriptions);
		this._disposable = Disposable.from(...subscriptions);
	}

	dispose(): void {
		this._disposable.dispose();
	}

	private _onWillSave(e: TextDocumentWillSaveEvent): void {
		if (this._config.isActive) {
			if (window.activeTextEditor) {
				// keep track of current window's selection
				this._selections = window.activeTextEditor.selections;
			}

			const doc: TextDocument = e.document;
			if (doc && doc.isDirty && this._wantLanguage(doc.languageId)) {
				const langConfig: ILangConfig = getLanguageConfig(this._wsConfig, doc.languageId);
				const date: string = this._config.modDateFormat === 'date' ? new Date().toDateString() : moment().format(this._config.modDateFormat);
				let inComment: boolean = false;
				let replacers: IRangeReplacerList = [];
				for (let i: number = 0; i < doc.lineCount; i++) {
					const txt: string = doc.lineAt(i).text;
					if (txt && txt.length > 0) {
						const range: Range = new Range(i, 0, i, txt.length);
						if (!range.isEmpty) {
							if (inComment && txt === langConfig.end) {
								// stop searching if we come to the end of the first comment block in the document
								break;
							}
							if (!inComment && txt === langConfig.begin) {
								// we have come to the first comment block in the file, so start searching
								inComment = true;
							} else if (inComment) {
								if (txt.startsWith(langConfig.prefix + this._config.modAuthor)) {
									replacers.push({range: range, newString: langConfig.prefix + this._config.modAuthor + this._author});
								}
								else if (txt.startsWith(langConfig.prefix + this._config.modDate)) {
									replacers.push({range: range, newString: langConfig.prefix + this._config.modDate + date});
								}
							}
						}
					}
				}
				if (replacers.length > 0) {
					let edits: TextEdit[] = [];
					replacers.forEach(replacer => {
						const edit = TextEdit.replace(replacer.range, replacer.newString);
						edits.push(edit);
					})
					e.waitUntil(Promise.resolve(edits));
				}
			}
		}
	}

	private _onDidSave(): void {
		if (this._selections) {
			// reinstate the selection from before the save
			window.activeTextEditor.selections = this._selections;
			this._selections = undefined;
		}
	}

	private _onConfigChanged() {
		this._getConfig();
	}

	private _getConfig(): void {
		// get tracking config
		let def: ITrackingConfig = {
			isActive: false, 
			modDate: 'Last Modified: ', 
			modAuthor: 'Modified By: ', 
			modDateFormat: 'date',
			include: [],
			exclude: []
		};
		let cfg: ITrackingConfig = this._wsConfig && this._wsConfig.has(k_.TRACKING_SETTINGS) ? this._wsConfig.get<ITrackingConfig>(k_.TRACKING_SETTINGS) : null;
		if (cfg) {
			def.isActive = cfg.isActive ? cfg.isActive : false;
			def.modDate = cfg.modDate ? cfg.modDate : def.modDate;
			def.modAuthor = cfg.modAuthor ? cfg.modAuthor : def.modAuthor;
			def.modDateFormat = cfg.modDateFormat ? cfg.modDateFormat : def.modDateFormat;
			def.include = cfg.include ? cfg.include : def.include;
			def.exclude = cfg.exclude ? cfg.exclude : def.exclude;
		}
		this._config = def;
		// get author name
		let vl: IVariableList = this._wsConfig && this._wsConfig.has(k_.VARIABLE_SETTINGS) ? this._wsConfig.get<IVariableList>(k_.VARIABLE_SETTINGS) : null;
		if (vl) {
			const el: IVariable = vl.find(function(element: [string, string]): boolean { return element[0] === k_.VAR_AUTHOR; });
			this._author = el && el.length > 1 && el[1] ? el[1] : 'You';
		}
	}

	private _wantLanguage(langId: string): boolean {
		return this._config && this._config.exclude.indexOf(langId) < 0 && (this._config.include.length === 0 || this._config.include.indexOf(langId) >= 0);
	}
}
