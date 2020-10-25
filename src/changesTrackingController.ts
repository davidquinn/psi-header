/*
 * File: changesTrackingController.ts
 * Project: psioniq File Header
 * File Created: Tuesday, 25th December 2018 1:55:15 pm
 * Author: David Quinn (info@psioniq.uk)
 * -----
 * Last Modified: Saturday, 19th September 2020 10:06:49 am
 * Modified By: David Quinn (info@psioniq.uk)
 * -----
 * MIT License
 *
 * Copyright 2016 - 2020 David Quinn (psioniq)
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
	Range,
	commands
} from 'vscode';
import {
	ITrackingConfig,
	IVariableList,
	IVariable,
	ILangConfig,
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
	getTemplateConfig,
	replacePlaceholders,
	getAuthorName,
	getMergedVariables,
	isCompactMode,
	addLineSuffix,
	trimStart
} from './helper';
import { log } from 'util';
import * as mm from 'minimatch';
import { insertFileHeader } from './insertFileHeaderCommand';

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
	 * Used to update an existing header or force a header if enforceHeader is true.
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
			if (doc && doc.isDirty && this._want(doc.languageId, doc.fileName)) {
				const langConfig: ILangConfig = getLanguageConfig(this._wsConfig, doc.languageId, doc.fileName);
				const mainConfig: IConfig = getConfig(this._wsConfig, langConfig);
				if (this._config.enforceHeader && this._docNeedsHeader(doc)) {
					insertFileHeader();
				}
				const variables: IVariableList = getVariables(this._wsConfig, activeTextEditor, mainConfig, langConfig, !this._config.updateLicenseVariables);
				const template: Array<string> = getTemplateConfig(this._wsConfig, doc.languageId, doc.fileName).template;

				const modDate: string = langConfig.modDate || this._config.modDate;
				const modDateWithPrefix: string = langConfig.prefix + modDate;

				const modAuthor: string = langConfig.modAuthor || this._config.modAuthor;
				const modAuthorWithPrefix: string = langConfig.prefix + modAuthor;

				const replaceList: Array<string> = langConfig.replace || this._config.replace;

				let modDateTemplate: string = template.find((value) => {
					return trimStart(value).startsWith(trimStart(modDate));
				});
				if (modDateTemplate) {
					modDateTemplate = langConfig.prefix + modDateTemplate;
				}

				let modAuthorTemplate: string = template.find((value) => {
					return trimStart(value).startsWith(trimStart(modAuthor));
				});
				if (modAuthorTemplate) {
					modAuthorTemplate = langConfig.prefix + modAuthorTemplate;
				}

				const mdf = langConfig.modDateFormat || this._config.modDateFormat;
				const date: string = mdf === 'date' ? new Date().toDateString() : moment().format(mdf);

				let inComment: boolean = false;
				let lastCommentLine: boolean = false;
				let replacers: IRangeReplacerList = [];
				const isCompact: boolean = isCompactMode(langConfig);
				for (let i: number = 0; i < doc.lineCount; i++) {
					const txt: string = doc.lineAt(i).text;
					if (txt && txt.length > 0) {
						const range: Range = new Range(i, 0, i, txt.length);
						if (!range.isEmpty) {
							if (inComment && ((isCompact && !txt.startsWith(langConfig.prefix)) ||  txt === langConfig.end)) {
								// stop searching if we come to the end of the first comment block in the document
								inComment = false;
								lastCommentLine = true;
								// break;
							}
							if (!inComment && !lastCommentLine && ((isCompact && txt.startsWith(langConfig.prefix)) || txt === langConfig.begin)) {
								// we have come to the first comment block in the file, so start searching
								inComment = true;
							}
							if (inComment || lastCommentLine) {
								if (this._startsWith(txt, langConfig.prefix, modAuthor)) {
									replacers.push({
										range: range,
										newString: addLineSuffix(
											modAuthorTemplate && modAuthorTemplate !== modAuthorWithPrefix
												? replacePlaceholders(modAuthorTemplate, variables, mainConfig.creationDateZero)
												: modAuthorWithPrefix + (modAuthorWithPrefix.endsWith(' ') ? '' : ' ') + this._author,
											langConfig.suffix,
											langConfig.lineLength,
											<number> activeTextEditor.options.tabSize
										)
									});
								}
								else if (this._startsWith(txt, langConfig.prefix, modDate)) {
									replacers.push({
										range: range,
										newString: addLineSuffix(
											modDateTemplate && modDateTemplate !== modDateWithPrefix
												? replacePlaceholders(modDateTemplate, variables, mainConfig.creationDateZero)
												: modDateWithPrefix + (modDateWithPrefix.endsWith(' ') ? '' : ' ') + date,
											langConfig.suffix,
											langConfig.lineLength,
											<number> activeTextEditor.options.tabSize
										)
									});
								} else if (replaceList && replaceList.length > 0) {
									for (let replaceString of replaceList) {
										if (this._startsWith(txt, langConfig.prefix, replaceString)) {
											let modReplaceTemplate: string = template.find((value) => {
												return trimStart(value).startsWith(trimStart(replaceString));
											});
											if (modReplaceTemplate) {
												modReplaceTemplate = langConfig.prefix + modReplaceTemplate;
												replacers.push({
													range: range,
													newString: addLineSuffix(
														replacePlaceholders(modReplaceTemplate, variables, mainConfig.creationDateZero),
														langConfig.suffix,
														langConfig.lineLength,
														<number> activeTextEditor.options.tabSize
													)
												});
											}
										}
									}
								}
								if (lastCommentLine) {
									break;
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
			if (this._wantAutoHeader() && doc.uri.scheme === 'file' && this._want(doc.languageId, doc.fileName) && this._fileIsNew(doc.fileName) && this._docNeedsHeader(doc)) {
				const $this = this;
				commands.executeCommand(k_.FILE_HEADER_COMMAND).then(() => {
					if ($this._config.autoHeader === k_.AUTO_HEADER_AUTO_SAVE) {
						doc.save();
					}
				});
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
			includeGlob: [],
			excludeGlob: [],
			autoHeader: k_.AUTO_HEADER_OFF,
			replace: [],
			enforceHeader: false,
			updateLicenseVariables: false
		};
		let cfg: ITrackingConfig = this._wsConfig && this._wsConfig.has(k_.TRACKING_SETTINGS) ? this._wsConfig.get<ITrackingConfig>(k_.TRACKING_SETTINGS) : null;
		if (cfg) {
			def.isActive = cfg.isActive ? cfg.isActive : false;
			def.modDate = cfg.modDate ? cfg.modDate : def.modDate;
			def.modAuthor = cfg.modAuthor ? cfg.modAuthor : def.modAuthor;
			def.modDateFormat = cfg.modDateFormat ? cfg.modDateFormat : def.modDateFormat;
			def.include = cfg.include ? cfg.include : def.include;
			def.exclude = cfg.exclude ? cfg.exclude : def.exclude;
			def.includeGlob = cfg.includeGlob ? cfg.includeGlob : def.includeGlob;
			def.excludeGlob = cfg.excludeGlob ? cfg.excludeGlob : def.excludeGlob;
			def.autoHeader = cfg.autoHeader ? cfg.autoHeader : k_.AUTO_HEADER_OFF;
			def.replace = cfg.replace ? cfg.replace : def.replace;
			def.enforceHeader = cfg.enforceHeader ? cfg.enforceHeader : false;
			def.updateLicenseVariables = cfg.updateLicenseVariables ? cfg.updateLicenseVariables : false;
		}
		this._config = def;
		// get author name
		let config: IConfig = this._wsConfig && this._wsConfig.has(k_.CONFIG_SETTINGS) ? this._wsConfig.get<IConfig>(k_.CONFIG_SETTINGS) : null;
		const ignoreAuthorFullName: boolean = config && config.ignoreAuthorFullname;
		this._author = config && config.author ? config.author : getAuthorName(ignoreAuthorFullName);
		let vl: IVariableList = getMergedVariables(this._wsConfig);
		if (vl) {
			const el: IVariable = vl.find(function(element: [string, string]): boolean { return element[0] === k_.VAR_AUTHOR; });
			this._author = el && el.length > 1 && el[1] ? el[1] : this._author;
		}
	}

	/**
	 * Returns true if change tracking is active for the specified language,
	 * or if the filename matches an active glob pattern.
	 *
	 * @private
	 * @param {string} langId
	 * @param {string} filename
	 * @returns {boolean}
	 * @memberof ChangesTrackingController
	 */
	private _want(langId: string, filename: string): boolean {
		// return this._config && this._config.exclude.indexOf(langId) < 0 && (this._config.include.length === 0 || this._config.include.indexOf(langId) >= 0);
		if (!this._config) {
			return false;
		}
		return (
				(this._config.include.length === 0 && this._config.includeGlob.length === 0)
				|| this._config.include.indexOf(langId) >= 0
				|| this._filenameInGlobs(filename, this._config.includeGlob)
			)
			&& this._config.exclude.indexOf(langId) < 0
			&& !this._filenameInGlobs(filename, this._config.excludeGlob);
	}

	private _filenameInGlobs(filename: string, globs: string[]) {
		return globs.some((glob) => {
			return mm.match([filename], glob, {}).length === 1;
		});
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
			result = true;
			const lang: ILangConfig = getLanguageConfig(this._wsConfig, doc.languageId, doc.fileName);
			const mainConfig: IConfig = getConfig(this._wsConfig, lang);
			let skip: number = lang.beforeHeader ? lang.beforeHeader.length : 0;
			for (let i: number = 0; i < doc.lineCount; i++) {
				const txt: string = doc.lineAt(i).text;
				if (txt && (
					(isCompactMode(lang) && txt.startsWith(lang.prefix))
					|| (!isCompactMode(lang) && txt == lang.begin)
				)) {
					result = false;
					break;
				}
				if (this._isIgnorableLine(txt, lang.ignoreLines)) {
					skip++;
				}
				if (mainConfig.forceToTop && (i >= skip)) {
					break;
				}
			}
		}
		return result;
	}

	private _isIgnorableLine(line: string, ignorants: Array<string>): boolean {
		let ignorable: boolean = false;
		if (line !== undefined && line !== null && line.trim().length === 0) {
			ignorable = true;
		}
		if (!ignorable && line && line.length > 0 && ignorants && ignorants.length > 0) {
			for (let i: number = 0; i < ignorants.length; i++) {
				if (line.startsWith(ignorants[i])) {
					ignorable = true;
					break;
				}
			}
		}
		return ignorable;
	}

	private _startsWith(line: string, langPrefix: string, searchText: string): boolean {
		if (!line || !searchText || line.length == 0 || searchText.length == 0 || (langPrefix.length > 0 && !line.startsWith(langPrefix))) {
			return false;
		}
		const haystack: string = trimStart(line.substr(langPrefix ? langPrefix.length : 0));
		return haystack.startsWith(trimStart(searchText));
	}
}
