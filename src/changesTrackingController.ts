/**
 * File: changesTrackingController.ts
 * Project: psioniq File Header
 * File Created: Sunday, 29th October 2017 8:11:24 am
 * Author: David Quinn (info@psioniq.uk)
 * -----
 * Last Modified: Thursday, 16th November 2017 5:17:52 pm
 * Modified By: David Quinn (info@psioniq.uk>)
 * -----
 * MIT License
 * 
 * Copyright 2017 - 2017 David Quinn, psioniq
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
	TextEditor,
	TextLine,
	Range,
	commands
} from 'vscode';
import {
	ITrackingConfig,
	IVariableList,
	IVariable,
	ILangConfig,
	IRangeReplacer,
	IRangeReplacerList,
	IConfig
} from './interfaces';
import * as k_ from './constants';
import * as moment from 'moment';
import {
	getLanguageConfig,
	getFileCreationDate,
	getVariables,
	getConfig,
	getTemplate,
	replacePlaceholders,
	getAuthorName,
	getMergedVariables
} from './helper';
import { log } from 'util';

/**
 * Configuration and setup for changes tracking.
 * 
 * @export
 * @class ChangesTrackingController
 */
export class ChangesTrackingController {
	private _disposable: Disposable;
	private _wsConfig: WorkspaceConfiguration;
	private _config: ITrackingConfig;
	private _author: string = 'You';
	private _selections: Selection[];

	/**
	 * Creates an instance of ChangesTrackingController.
	 * @memberof ChangesTrackingController
	 */
	constructor() {
		this._getConfig();
		const subscriptions: Disposable[] = [];
		workspace.onWillSaveTextDocument(this._onWillSave, this, subscriptions);
		workspace.onDidSaveTextDocument(this._onDidSave, this, subscriptions);
		workspace.onDidChangeConfiguration(this._onConfigChanged, this, subscriptions);
		window.onDidChangeActiveTextEditor(this._onDidChangeActiveTextEditor, this, subscriptions);
		this._disposable = Disposable.from(...subscriptions);
	}

	/**
	 * Dispose of the ChangesTrackingController.
	 * 
	 * @memberof ChangesTrackingController
	 */
	dispose(): void {
		this._disposable.dispose();
	}

	/**
	 * Delegate method triggered whenever a document will be saved.
	 * Used to update an existing header.
	 * 
	 * @private
	 * @param {TextDocumentWillSaveEvent} e 
	 * @memberof ChangesTrackingController
	 */
	private _onWillSave(e: TextDocumentWillSaveEvent): void {
		const activeTextEditor: TextEditor = window.activeTextEditor;
		if (this._config.isActive) {
			if (activeTextEditor) {
				// keep track of current window's selection
				this._selections = activeTextEditor.selections;
			}

			const doc: TextDocument = e.document;
			if (doc && doc.isDirty && this._wantLanguage(doc.languageId)) {
				const langConfig: ILangConfig = getLanguageConfig(this._wsConfig, doc.languageId);
				const mainConfig: IConfig = getConfig(this._wsConfig, langConfig);
				const variables: IVariableList = getVariables(this._wsConfig, activeTextEditor, mainConfig, langConfig, true);
				const template: Array<string> = getTemplate(this._wsConfig, doc.languageId);
				const modDatePrefix: string = langConfig.prefix + this._config.modDate;
				const modAuthorPrefix: string = langConfig.prefix + this._config.modAuthor;
				let modDateTemplate: string = template.find((value) => {
					return value.startsWith(this._config.modDate);
				});
				if (modDateTemplate) {
					modDateTemplate = langConfig.prefix + modDateTemplate;
				}
				let modAuthorTemplate: string = template.find((value) => {
					return value.startsWith(this._config.modAuthor);
				});
				if (modAuthorTemplate) {
					modAuthorTemplate = langConfig.prefix + modAuthorTemplate;
				}
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
								if (txt.startsWith(modAuthorPrefix)) {
									replacers.push({
										range: range, 
										newString: modAuthorTemplate && modAuthorTemplate !== modAuthorPrefix
											? replacePlaceholders(modAuthorTemplate, variables)
											: modAuthorPrefix + (modAuthorPrefix.endsWith(' ') ? '' : ' ') + this._author
									});
								}
								else if (txt.startsWith(modDatePrefix)) {
									replacers.push({
										range: range, 
										newString: modDateTemplate && modDateTemplate !== modDatePrefix
											? replacePlaceholders(modDateTemplate, variables)
											: modDatePrefix + (modDatePrefix.endsWith(' ') ? '' : ' ') + date
									});
								} else if (this._config.replace && this._config.replace.length > 0) {
									for (let replace of this._config.replace) {
										const replacePrefix: string = langConfig.prefix + replace;
										if (txt.startsWith(replacePrefix)) {
											let modReplaceTemplate: string = template.find((value) => {
												return value.startsWith(replace);
											});
											if (modReplaceTemplate) {
												modReplaceTemplate = langConfig.prefix + modReplaceTemplate;
												replacers.push({
													range: range,
													newString: replacePlaceholders(modReplaceTemplate, variables)
												});
											}
										}
									}
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

	/**
	 * Delegate method called after document is saved.  
	 * Cleans up the selections and ensures the active editor is reinstated.
	 * 
	 * @private
	 * @memberof ChangesTrackingController
	 */
	private _onDidSave(): void {
		if (this._selections) {
			// reinstate the selection from before the save
			window.activeTextEditor.selections = this._selections;
			this._selections = undefined;
		}
	}

	/**
	 * Re-reads the configuration settings.
	 * 
	 * @private
	 * @memberof ChangesTrackingController
	 */
	private _onConfigChanged() {
		this._getConfig();
	}

	/**
	 * Called whenever the active editor is changed.
	 * This controls automatic adding of headers to new files.
	 * 
	 * @private
	 * @param {TextEditor} editor 
	 * @memberof ChangesTrackingController
	 */
	private _onDidChangeActiveTextEditor(editor: TextEditor) {
		if (editor && editor.document) {
			const doc = editor.document;
			if (this._wantAutoHeader() && doc.uri.scheme === 'file' && this._wantLanguage(doc.languageId) && this._docNeedsHeader(doc) && this._fileIsNew(doc.fileName)) {
				const $this = this;
				commands.executeCommand(k_.FILE_HEADER_COMMAND).then(() => {
					if ($this._config.autoHeader === k_.AUTO_HEADER_AUTO_SAVE) {
						doc.save();
					}
				})
			}
		}
	}

	/**
	 * Reads the configuration and caches it in this object.
	 * 
	 * @private
	 * @memberof ChangesTrackingController
	 */
	private _getConfig(): void {
		this._wsConfig = workspace.getConfiguration(k_.BASE_SETTINGS);
		
		// get tracking config
		let def: ITrackingConfig = {
			isActive: false, 
			modDate: 'Last Modified:', 
			modAuthor: 'Modified By:', 
			modDateFormat: 'date',
			include: [],
			exclude: [],
			autoHeader: k_.AUTO_HEADER_OFF,
			replace: []
		};
		let cfg: ITrackingConfig = this._wsConfig && this._wsConfig.has(k_.TRACKING_SETTINGS) ? this._wsConfig.get<ITrackingConfig>(k_.TRACKING_SETTINGS) : null;
		if (cfg) {
			def.isActive = cfg.isActive ? cfg.isActive : false;
			def.modDate = cfg.modDate ? cfg.modDate : def.modDate;
			def.modAuthor = cfg.modAuthor ? cfg.modAuthor : def.modAuthor;
			def.modDateFormat = cfg.modDateFormat ? cfg.modDateFormat : def.modDateFormat;
			def.include = cfg.include ? cfg.include : def.include;
			def.exclude = cfg.exclude ? cfg.exclude : def.exclude;
			def.autoHeader = cfg.autoHeader ? cfg.autoHeader : k_.AUTO_HEADER_OFF;
			def.replace = cfg.replace ? cfg.replace : def.replace;
		}
		this._config = def;
		// get author name
		let config: IConfig = this._wsConfig && this._wsConfig.has(k_.CONFIG_SETTINGS) ? this._wsConfig.get<IConfig>(k_.CONFIG_SETTINGS) : null;
		this._author = config && config.author ? config.author : getAuthorName();
		let vl: IVariableList = getMergedVariables(this._wsConfig);
		if (vl) {
			const el: IVariable = vl.find(function(element: [string, string]): boolean { return element[0] === k_.VAR_AUTHOR; });
			this._author = el && el.length > 1 && el[1] ? el[1] : this._author;
		}
	}

	/**
	 * Returns true if change tracking is active for the specified language.
	 * 
	 * @private
	 * @param {string} langId 
	 * @returns {boolean} 
	 * @memberof ChangesTrackingController
	 */
	private _wantLanguage(langId: string): boolean {
		return this._config && this._config.exclude.indexOf(langId) < 0 && (this._config.include.length === 0 || this._config.include.indexOf(langId) >= 0);
	}

	/**
	 * Returns true if the file is new (created within the past 3 seconds).
	 * 
	 * @private
	 * @param {any} filename 
	 * @returns 
	 * @memberof ChangesTrackingController
	 */
	private _fileIsNew(filename) {
		const fcreated: Date = getFileCreationDate(filename);
		return (fcreated && !moment(fcreated).isBefore(moment().subtract(3, 's')));
	}

	/**
	 * Returns true if auto header creation is active.
	 * 
	 * @private
	 * @returns 
	 * @memberof ChangesTrackingController
	 */
	private _wantAutoHeader() {
		return this._config && (this._config.autoHeader === k_.AUTO_HEADER_MANUAL_SAVE || this._config.autoHeader === k_.AUTO_HEADER_AUTO_SAVE);
	}

	/**
	 * Returns the first line of the header template for the specified language.
	 * 
	 * @private
	 * @param {any} langId 
	 * @returns 
	 * @memberof ChangesTrackingController
	 */
	private _langBegin(langId) {
		let result: string = null;
		const cfg: ILangConfig = getLanguageConfig(this._wsConfig, langId);
		if (cfg) {
			result = cfg.begin;
		}
		return result;
	}

	/**
	 * Returns true if the file appears to need a header.
	 * 
	 * @private
	 * @param {TextDocument} doc 
	 * @returns 
	 * @memberof ChangesTrackingController
	 */
	private _docNeedsHeader(doc: TextDocument) {
		let result: boolean = doc.lineCount <= 1;
		if (!result) {
			const langBegin: string = this._langBegin(doc.languageId);
			for (let i: number = 0; i < doc.lineCount; i++) {
				const txt: string = doc.lineAt(i).text;
				if (txt && txt.length > 0 && txt == langBegin) {
					result = false;
					break;
				}
			}
		}
		return result;
	}
}
