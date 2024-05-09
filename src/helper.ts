/*
 * File: helper.ts
 * Project: psioniq File Header
 * File Created: Tuesday, 25th December 2018 1:55:15 pm
 * Author: David Quinn (info@psioniq.uk)
 * -----
 * Last Modified: Thursday, 9th May 2024 12:29:35 pm
 * Modified By: David Quinn (info@psioniq.uk)
 * -----
 * MIT License
 *
 * Copyright 2016 - 2022 David Quinn (psioniq)
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
	workspace,
	window,
	TextEditor,
	WorkspaceConfiguration,
	TextDocument
} from 'vscode';
import * as k_ from './constants';
import {
	ITemplateConfig,
	ITemplateConfigList,
	IConfig,
	ILangConfig,
	ILangConfigList,
	IVariable,
	IVariableList,
	IPlaceholderFunction,
	IPlaceholderFromPrevFunction,
	IInspectableConfig,
	ZeroDate,
	ILicenseReference,
	IMappableLanguage
} from './interfaces';
import * as fs from 'fs';
import * as path from 'path';
import * as moment from 'moment';
import * as username from 'username';
import * as os from 'os';
const fullName = require("fullname");

let authorFullName: string = undefined;

/**
 * Retrieve the current configuration for this extension from the workspace settings.
 *
 * @param {WorkspaceConfiguration} wsConfig
 * @param {ILangConfig} langConfig
 * @returns {IConfig}
 */
export function getConfig(wsConfig: WorkspaceConfiguration, langConfig: ILangConfig): IConfig {
	let def: IConfig = {forceToTop: langConfig.forceToTop, blankLinesAfter: langConfig.blankLinesAfter};
	let cfg: IConfig = wsConfig && wsConfig.has(k_.CONFIG_SETTINGS) ? wsConfig.get<IConfig>(k_.CONFIG_SETTINGS) : null;

	const cfgForceToTop: boolean = cfg && cfg.hasOwnProperty('forceToTop') ? cfg.forceToTop : false;
	def.forceToTop = (def.forceToTop === undefined) ? cfgForceToTop : def.forceToTop;

	const cfgBlankLinesAfter: number = cfg && cfg.hasOwnProperty('blankLinesAfter') ? cfg.blankLinesAfter : 0;
	def.blankLinesAfter = (def.blankLinesAfter === undefined) ? cfgBlankLinesAfter : def.blankLinesAfter;

	// defaults to true if undefined for backwards compatibility
	def.spacesBetweenYears = (cfg && cfg.spacesBetweenYears === false) ? false : true;

	def.license = cfg && cfg.license ? cfg.license : null;

	def.ignoreAuthorFullname = cfg && cfg.ignoreAuthorFullname;

	if (cfg.hasOwnProperty('author')) {
		def.author = cfg.author;
	}

	if (cfg.hasOwnProperty('authorEmail')) {
		def.authorEmail = cfg.authorEmail;
	}

	if (cfg.hasOwnProperty('company')) {
		def.company = cfg.company;
	}

	if (cfg.hasOwnProperty('copyrightHolder')) {
		def.copyrightHolder = cfg.copyrightHolder;
	}

	if (cfg.hasOwnProperty('initials')) {
		def.initials = cfg.initials;
	}

	def.creationDateZero = cfg && cfg.creationDateZero ? cfg.creationDateZero : "asIs";

	def.hostname = cfg && cfg.hostname ? cfg.hostname : os.hostname();

	return def;
}

/**
 * Find the correct template or language config record.
 *
 *  Returns the config record where the language matches either the `fileXtn` or
 * `langId` (in that order). Will honour the `mapTo` of the matched record if
 * given.
 *
 * If no matching record is found, it will attempt to return the default record.
 *
 * @template T The type of record - template or language config.
 * @param {Array<T>} list The list of record to search
 * @param {string} langId The VSC language mode value of the target file
 * @param {string} filename The name of the target file.
 * @returns {T} A matching record or undefined.
 */
function getMappableRecord<T extends IMappableLanguage>(list: Array<T>, langId: string, filename: string): T {
	let def: T;
	const fileXtn: string = !!filename ? path.extname(filename) : '';
	if (fileXtn && fileXtn.length > 0) {
		def = list.find(item => item.language.toLowerCase() === fileXtn.toLowerCase());
	}
	if (!def) {
		def = list.find(item => item.language.toLowerCase() === langId.toLowerCase());
	}
	if (def && def.hasOwnProperty('mapTo')) {
		def = list.find(item => item.language.toLowerCase() === def.mapTo.toLowerCase());
	}
	if (!def) {
		def = list.find(item => item.language === k_.DEFAULT);
	}
	return def;
}

/**
 * Retrieve the desired template.  Will use the first of these that exists:
 *   - language-specific template from workspace settings; else
 *   - default template from workspace settings; else
 *   - the default template as defined by this extension.
 *
 * The language is typically based on the VSC Language Mode, but can also be the
 * file extension where the template's `language` starts with a period.
 *
 * @param {WorkspaceConfiguration} wsConfig
 * @param {string} langId
 * @param {string} filename The name of the target file.
 * @returns {Array<string>}
 */
export function getTemplateConfig(wsConfig: WorkspaceConfiguration, langId: string, filename: string): ITemplateConfig {
	const templates: ITemplateConfigList = getMergedTemplates(wsConfig);
	let base: ITemplateConfig = getMappableRecord<ITemplateConfig>(templates, k_.DEFAULT_PROPERTIES, undefined);
	if (!base) {
		base = { language: k_.DEFAULT, template: k_.DEFAULT_TEMPLATE, changeLogHeaderLineCount: 0 };
	}
	let cfg: ITemplateConfig = getMappableRecord<ITemplateConfig>(templates, langId, filename);
	if (!cfg || !cfg.template) {
		cfg = templates.find(item => item.language === k_.DEFAULT);
	}
	mapTemplateConfig(cfg, base);
	return base;
}

/**
 * Maps the values for template configuration properties from source to target.
 * Will not modify target for any property not found in source.
 *
 * @param {Object} source
 * @param {ITemplateConfig} target
 */
function mapTemplateConfig(source: Object, target: ITemplateConfig): void {
	if (source) {
		mapProperty(source, target, 'language');
		mapProperty(source, target, 'mapTo');
		mapProperty(source, target, 'template');
		mapProperty(source, target, 'changeLogCaption');
		mapProperty(source, target, 'changeLogHeaderLineCount');
		mapProperty(source, target, 'changeLogFooterLineCount');
		mapProperty(source, target, 'changeLogEntryTemplate');
		mapProperty(source, target, 'changeLogNaturalOrder');
	}

}


/**
 * Retrieve the desired language configuration comment block delineators.  Uses the following logic.
 *   - the base configuration is is defined by this extension, which is based on the document's language.
 *   - if there is a language-specific setting in the workspace settings, modify the base by that; else
 *   - if there is a default setting in the workspace settings, modify the base by that.
 *
 * Note that the workspace settings can provide any or all of the configuration properties.
 * Any non-defined properties will not be changed from the defaults.
 *
 * Within a language-specific workspace setting, include "mapTo" as a property to use the settings of another language.
 * The mapTo value is the name of the desired language.
 *
 * @param {WorkspaceConfiguration} wsConfig
 * @param {string} langId
 * @param {string} filename The name of the target file.
 * @returns {ILangConfig}
 */
export function getLanguageConfig(wsConfig: WorkspaceConfiguration, langId: string, filename: string): ILangConfig {
	let configs: ILangConfigList = getMergedLangConfig(wsConfig);
	let def: ILangConfig = getMappableRecord<ILangConfig>(configs, k_.DEFAULT_PROPERTIES, undefined);
	let base: ILangConfig = baseLangConfig(langId, def);
	let cfg: ILangConfig = getMappableRecord<ILangConfig>(configs, langId, filename);
	mapLangConfig(cfg, base);
	return base;
}

/**
 * Generate the base language configuration object.
 *
 * @param {string} langId The language id of the target file
 * @param {ILangConfig | undefined} defaultLangConfig The default language configuration. will hard-code default if this is undefined.
 * @returns The defaultLangConfig or a javascript-style base default modified for some specific languages.
 */
function baseLangConfig(langId: string, defaultLangConfig: ILangConfig|undefined) {
	let config: ILangConfig = defaultLangConfig ?? { language: '*', begin: '/*', prefix: ' * ', end: ' */' };
	switch(langId) {
		case "javascript":
		case "typescript":
			mapLangConfig({ begin: '/*', prefix: ' * ', end: ' */'}, config);
			break;
		case "swift":
			mapLangConfig({ begin: '/**', prefix: ' * ', end: ' */'}, config);
			break;
		case "lua":
			mapLangConfig({ begin: '--[[', prefix: '--', end: '--]]'}, config);
			break;
		case "perl":
		case "ruby":
			mapLangConfig({ begin: '#', prefix: '#', end: '#'}, config);
			break;
		case "vb":
			mapLangConfig({ begin: "'", prefix: "'", end: "'"}, config);
			break;
		case 'clojure':
			mapLangConfig({ begin: ';;', prefix: ';', end: ';;'}, config);
			break;
		case 'python':
			mapLangConfig({ begin: "'''", prefix: '', end: "'''"}, config);
			break;
		case "xml":
		case "html":
			mapLangConfig({ begin: '<!--', prefix: '', end: '-->'}, config);
			break;
		case "matlab":
			mapLangConfig({ begin: '%{', prefix: '%', end: '%}'}, config);
	}
	return config;
}

/**
 * Maps the values for language config properties from source to target.
 * Will not modify target for any property not found in source.
 *
 * @param {Object} source
 * @param {ILangConfig} target
 */
function mapLangConfig(source: Object, target: ILangConfig): void {
	if (source) {
		mapProperty(source, target, 'language');
		mapProperty(source, target, 'begin');
		mapProperty(source, target, 'prefix');
		mapProperty(source, target, 'suffix');
		mapProperty(source, target, 'lineLength');
		mapProperty(source, target, 'end');
		mapProperty(source, target, 'mapTo');
		mapProperty(source, target, 'forceToTop');
		mapProperty(source, target, 'blankLinesAfter');
		mapProperty(source, target, 'beforeHeader');
		mapProperty(source, target, 'afterHeader');
		mapProperty(source, target, 'rootDirFileName');
		mapProperty(source, target, 'modDate');
		mapProperty(source, target, 'modDateFormat');
		mapProperty(source, target, 'modAuthor');
		mapProperty(source, target, 'replace');
		mapProperty(source, target, 'ignoreLines');
	}

	target.suffix = target.suffix || '';
	if (target.suffix.length > 0) {
		if (!target.hasOwnProperty('lineLength') || target.lineLength <= 0) {
			target.lineLength = getEditorWordWrapColumn(80);
		}
	}
}

/**
 * Map the value of key from source to target.
 * Will not modify target if the property does not exist on source.
 *
 * @param {Object} source
 * @param {Object} target
 * @param {string} key
 */
function mapProperty(source: Object, target: Object, key: string): void {
	if (source.hasOwnProperty(key)) {
		target[key] = source[key];
	}
}

/**
 * Builds the template variables list from a combination of internal variables and those defined in the workspace settings.
 * Will overwrite internal variables if they are also included in the workspace settings.
 *
 * @param {WorkspaceConfiguration} wsConfig
 * @param {TextEditor} editor
 * @param {IConfig} config
 * @param {ILangConfig} langConfig
 * @param {boolean} ignoreLicense
 * @returns {IVariableList}
 */
export function getVariables(wsConfig: WorkspaceConfiguration, document: TextDocument, config: IConfig, langConfig: ILangConfig, ignoreLicense: boolean = false): IVariableList {
	let variables: IVariableList = [];
	const now: Date = new Date();
	const fcreated: Date = getActiveFileCreationDate(config.creationDateZero) || new Date();
	const currentFile: string = document.fileName;
	// system variables
	variables.push([k_.VAR_DATE, now.toDateString()]);
	variables.push([k_.VAR_TIME, now.toLocaleTimeString()]);
	variables.push([k_.VAR_YEAR, now.getFullYear().toString()]);
	variables.push([k_.VAR_FILE_PATH, currentFile]);
	variables.push([k_.VAR_FULL_PATH, getFullPathWithoutFilename(currentFile)]);
	variables.push([k_.VAR_RELATIVE_PATH, getRelativePathWithoutFilename(currentFile, langConfig.rootDirFileName)]);
	variables.push([k_.VAR_FILE_RELATIVE_PATH, getRelativeFilePath(currentFile, langConfig.rootDirFileName)]);
	variables.push([k_.VAR_PROJECT_PATH, getProjectRootPath(currentFile, langConfig.rootDirFileName)]);
	variables.push([k_.VAR_COMPANY, config && config.company ? config.company : 'Your Company']);
	variables.push([k_.VAR_AUTHOR, config && config.author ? config.author : getAuthorName(config && config.ignoreAuthorFullname)]);
	variables.push([k_.VAR_AUTHOR_EMAIL, config && config.authorEmail ? config.authorEmail : 'you@you.you']);
	variables.push([k_.VAR_PROJECT_NAME, getProjectName(currentFile, langConfig.rootDirFileName)]);
	variables.push([k_.VAR_PROJECT_SLUG, getProjectName(currentFile, langConfig.rootDirFileName).replace("@", "")]);
	variables.push([k_.VAR_FILE_NAME, extractFileName(currentFile)]);
	variables.push([k_.VAR_FILE_NAME_BASE, extractFileName(currentFile, true)]);
	// using filecreated or yeartoyear functions without arguments treat them like a variable.
	variables.push([k_.FUNC_FILE_CREATED, fcreated.toDateString()]);
	variables.push([k_.FUNC_YEAR_TO_YEAR, y2y('fc', 'now', null, config.creationDateZero)]);

	if (config && config.copyrightHolder) {
		variables.push([k_.VAR_COPYRIGHT_HOLDER, config.copyrightHolder]);
	}
	variables.push([k_.VAR_INITIALS, config && config.initials ? config.initials : 'ABC']);
	variables.push([k_.VAR_PROJ_VERSION, getProjectVersion(currentFile)]);
	variables.push([k_.VAR_HOSTNAME, config && config.hostname ? config.hostname : os.hostname()]);
	// custom variables
	let vl: IVariableList = getMergedVariables(wsConfig);
	if (vl && vl.length > 0) {
		for (let v of vl) {
			let item: IVariable = variables.find(function(element): boolean {
				return element[0] == v[0];
			});
			if (item) {
				item[1] = v[1];
			} else {
				variables.push(v);
			}
		}
	}

	// map copyright holder to company if not already provided via custom variable.
	if (variables.findIndex( (value: IVariable) => {
		return value[0] === k_.VAR_COPYRIGHT_HOLDER;
	}) === -1) {
		const company: IVariable = variables.find((val: IVariable) => {
			return val[0] === k_.VAR_COMPANY;
		});
		variables.push([k_.VAR_COPYRIGHT_HOLDER, (company ? company[1] : 'Your Company')]);
	}

	// license variables
	if (!ignoreLicense) {
		addLicenseVariables(wsConfig, variables, config, langConfig, currentFile);
	}
	return variables;
}

/**
 * Pass in a fully qualified file path and return the part of the path where an associated package.json file is located.
 * Iterates up through the directory structure until it finds a package.json file and if not found returns the original directory.
 *
 * @param {string} filename The file to use as the basis for searching.
 * @param {string} rootDirFileName The name of the file to search for in the root directory - defaults to package.json.
 * @returns {string} The directory within the path that contains a rootDirFileName, else fully qualified directory of the passed in filename.
 */
function getProjectRootPath(filename: string, rootDirFileName?: string): string {
	let found: boolean = false;
	const parsed = path.parse(filename);
	const dir: string = parsed ? parsed.dir : '';
	let result: string = dir;
	rootDirFileName = rootDirFileName || 'package.json';
	while(result.includes(path.sep)) {
		if (fs.existsSync(path.join(result, rootDirFileName)) || fs.existsSync(path.join(result, 'package.json'))) {
			found = true;
			break;
		} else {
			result = result.substring(0, result.lastIndexOf(path.sep));
		}
	}
	if (!found) {
		result = dir;
	}
	return result;
}

/**
 * Get the name of the project - either from a package.json or the last part of the root project path.
 *
 * @param {string} filename  The file to determine the project from.
 * @returns {string}
 */
function getProjectName(filename: string, rootDirFileName?: string): string {
	try {
		let projectName: string = null;
		const rootPath: string = getProjectRootPath(filename, rootDirFileName);
		const fname: string = path.join(rootPath, 'package.json');
		if (fs.existsSync(fname)) {
			const prj = JSON.parse(fs.readFileSync(fname).toString());
			if (prj) {
				projectName = prj.displayName ? prj.displayName : prj.name;
			}
		}
		return projectName ? projectName : path.basename(rootPath);
	} catch (error) {
		console.log('psioniqFileHeader - error returned when trying to determine project name.  Error object below:');
		console.log(error);
		return null;
	}
}

/**
 * Get the name of the project - either from a package.json or the last part of the root project path.
 *
 * @param {string} filename  The file to determine the project from.
 * @returns {string}
 */
function getProjectVersion(filename: string, defaultVersion?: string): string {
	try {
		let projectVersion: string = null;
		const rootPath: string = getProjectRootPath(filename);
		const fname: string = path.join(rootPath, 'package.json');
		if (fs.existsSync(fname)) {
			const prj = JSON.parse(fs.readFileSync(fname).toString());
			if (prj) {
				projectVersion = prj.version;
			}
		}
		return projectVersion || defaultVersion;
	} catch (error) {
		console.log('psioniqFileHeader - error returned when trying to determine project version.  Error object below:');
		console.log(error);
		return null;
	}
}

/**
 * Tries to determine the name of the current user, or if not available returns 'You'.
 *
 * @returns {string}
 */
export function getAuthorName(ignoreAuthorFullName: boolean): string {
	let name: string = ignoreAuthorFullName ? null : authorFullName;
	try {
		name = name || username.sync();
	} catch (error) {}
	return name ? name : 'You';
}

export async function retrieveAuthorFullName(): Promise<void> {
	try {
		authorFullName = await fullName();
	} catch (error) {
		authorFullName = undefined;
	}
}

/**
 * Get the filename from the file full path
 *
 * @param {string} fullpath
 * @returns {string}
 */
function extractFileName(fullpath: string, excludePath?: boolean): string {
	try {
		const basename = path.basename(fullpath);
		const idx: number = basename.lastIndexOf('.');
		if (excludePath && idx > 0) {
			return basename.substring(0, idx);
		} else {
			return basename;
		}
	} catch (error) {
		return null;
	}
}

/**
 * Gets the relative file path by removing the workspace root path.
 *
 * @param {string} fullpath
 * @param {string} rootDirFileName the name of a unique file that is expected to be in the root directory
 * @returns {string}
 */
export function getRelativeFilePath(fullpath: string, rootDirFileName?: string, addLeadingDot: boolean = false): string {
	try {
		const rootPath: string = getProjectRootPath(fullpath, rootDirFileName);
		if (rootPath === fullpath){
			return fullpath;
		}
		var relPath = fullpath.substring(rootPath.length);
		if (addLeadingDot) {
			relPath = '.' + relPath;
		}
		return relPath;
	} catch (error) {
		return null;
	}
}

function getRelativePathWithoutFilename(fullpath: string, rootDirFileName?: string): string {
	const p: string = getRelativeFilePath(fullpath, rootDirFileName);
	if (p === undefined || p === null) {
		return null;
	}
	const parsed = path.parse(p);
	return parsed ? parsed.dir : null;
}

function getFullPathWithoutFilename(fullpath: string) {
	const parsed = path.parse(fullpath);
	return parsed ? parsed.dir : null;
}

/**
 * Return the current editor file's creation date (birthtime)
 *
 */
function getActiveFileCreationDate(zeroDate: ZeroDate = 'asIs'): Date {
	let result: Date = null;
	const editor: TextEditor = window.activeTextEditor;
	if (editor && editor.document) {
		result = getFileCreationDate(editor.document.fileName, zeroDate);
	}
	return result;
}

/**
 * Return the file creation date of the passed in file.
 *
 * @param filename The name of the file to check.
 */
export function getFileCreationDate(filename: string, zeroDate: ZeroDate = 'asIs'): Date {
	let result: Date = null;
	try {
		if (fs.existsSync(filename)) {
			const stat: fs.Stats = fs.statSync(filename);
			if (stat && stat.birthtime) {
				result = _modifyForDayZero(stat.birthtime, zeroDate);
			}
		}
	} catch (error) {
		result = null;
	}
	return result;
}

/**
 * If the passed in date is Unix Epoch Zero then return the value defined by
 * ifZero, otherwise just return the date.
 *
 * @param {Date} date
 * @param {ZeroDate} [ifZero='asIs']
 * @returns {Date}
 */
function _modifyForDayZero(date: Date, ifZero: ZeroDate = 'asIs'): Date {
	let output: Date = new Date(date.valueOf());
	if (output.valueOf() === 0) {
		if (ifZero === 'blank') {
			output = null;
		} else if (ifZero === 'now') {
			output = new Date();
		}
	}
	return output;
}

/**
 * Add the license and related variables from the SPDX data.
 *
 * @param {WorkspaceConfiguration} wsConfig
 * @param {IVariableList} variables
 * @param {IConfig} config
 * @param {ILangConfig} langConfig
 */
function addLicenseVariables(wsConfig: WorkspaceConfiguration, variables: IVariableList, config: IConfig, langConfig: ILangConfig, editedFile: string): void {
	const spdxList = require('spdx-license-list/full');
	let uri: string = null;
	let txt: Array<string> = [];
	let spdx;
	if (config && config.license) {
		if (config.license.toLowerCase() === 'custom') {
			txt = wsConfig.has(k_.LICENSE_SETTINGS) ? wsConfig.get<Array<string>>(k_.LICENSE_SETTINGS).slice() : [];
		} else if (config.license.toLowerCase() === 'customuri') {
			const licenseRef = wsConfig.has(k_.LICENSE_REFERENCE) ? wsConfig.get<ILicenseReference>(k_.LICENSE_REFERENCE) : null;
			if (licenseRef) {
				if (licenseRef.uri) {
					if (licenseRef.uriIsLocalFile) {
						if (path.isAbsolute(licenseRef.uri)) {
							uri = licenseRef.uri;
						} else {
							const fn: string = path.basename(licenseRef.uri);
							const rootPath = getProjectRootPath(editedFile, fn);
							uri = path.join(rootPath, fn);
							if (!fs.existsSync(uri)) {
								uri = null;
							}
						}
						try {
							if (fs.existsSync(uri)) {
								txt = fs.readFileSync(uri).toString().replace(/\r\n/g,'\n').split("\n");
							}
						} catch (error) {
							console.log(error);
						}
						uri = null;
					} else { // licenseRef.uriIsLocalFile === false
						// process as external url and assume it is correct
						uri = licenseRef.uri;
					}
				}
			}
		} else if (config.license.length > 0) {
			spdx = spdxList[config.license];
			if (spdx) {
				txt = cleanSpdxLicenseText(spdx.licenseText).split('\n');
			}
		}
	}
	if (txt.length > 0) {
		const prefix: string = langConfig && langConfig.prefix ? langConfig.prefix : null;
		if (prefix) {
			for (let i = 1; i < txt.length; i++) {
				txt[i] = prefix + txt[i];
			}
		}
	}
	variables.push([k_.VAR_LICENSE_TEXT, replacePlaceholders(txt.join('\n'), variables, '', config.creationDateZero)]);
	if (spdx) {
		variables.push([k_.VAR_LICENSE_NAME, spdx.name]);
		variables.push([k_.VAR_LICENSE_URL, spdx.url]);
		variables.push([k_.VAR_SPDX_ID, config.license]);
	} else if (uri) {
		variables.push([k_.VAR_LICENSE_URL, uri]);
	}
}

export function replaceTemplateVariables(template: Array<string>, linePrefix: string, variables: IVariableList, zeroDate: ZeroDate): string {
	const body: Array<string> = [];
	for (let i = 0; i < template.length; i++) {
		body.push(linePrefix + template[i]);
	}
	return replacePlaceholders(body.join('\n'), variables, '', zeroDate);
}

/**
 *  Outputs the processed string by merging the template, language configuration, beforeText, afterText and variables.
 *
 * @param {Array<string>} template
 * @param {ILangConfig} langConfig
 * @param {Array<[string, string]>} variables
 * @param {IConfig} config
 * @returns {string}
 */
export function merge(template: Array<string>, langConfig: ILangConfig, variables: IVariableList, config: IConfig, editor: TextEditor): string {
	const beforeText: string = replacePlaceholders(
		arrayToString(langConfig.hasOwnProperty('beforeHeader') ? langConfig.beforeHeader : null),
		variables
	);
	const afterText: string = replacePlaceholders(
		arrayToString(langConfig.hasOwnProperty('afterHeader') ? langConfig.afterHeader : null),
		variables
	);
	const isCompact: boolean = isCompactMode(langConfig);
	const commentBegin: string = isCompact ? '' : `${langConfig.begin}\n`;
	const commentEnd: string = isCompact ? '' : `${langConfig.end}\n`;
	let endSpace: string = '';
	for (let i = 0; i < (config.blankLinesAfter); i++) {
		endSpace += '\n';
	}

	var body: string = replaceTemplateVariables(template, langConfig.prefix, variables, config.creationDateZero);

	const funcNeedle: string = `${k_.VAR_PREFIX}${k_.FUNC_PAD_LINE}(`;
	if (body.includes(funcNeedle) || langConfig.suffix.length > 0) {
		const lines = body.split('\n');
		for (let idx = 0; idx < lines.length; idx++) {
			lines[idx] = addLineSuffix(lines[idx], langConfig.suffix, langConfig.lineLength, <number> editor.options.tabSize);
		}
		body = lines.join('\n');
	}
	return `${beforeText}${commentBegin}${body}\n${commentEnd}${endSpace}${afterText}`;
}

/**
 * Test if the corrent language config is for compact mode headers.
 *
 * @export
 * @param {ILangConfig} langConfig
 * @returns {boolean}
 */
export function isCompactMode(langConfig: ILangConfig): boolean {
	return (!langConfig.begin || langConfig.begin.length === 0) && (!langConfig.end || langConfig.end.length === 0);
}

function getEditorWordWrapColumn(def: number = 80) {
	let config = workspace.getConfiguration('editor');
	return config ? config.get('wordWrapColumn', def) : def;
}

/**
 * Turns a string array into an EOL delimited string.
 *
 * @param {Array<string>} source
 * @returns {string}
 */
function arrayToString(source: Array<string>): string {
	return source && source.length > 0 ? source.join('\n') + '\n' : '';
}

/**
 * Process template variable placeholders.
 *
 * @param {string} source
 * @param {IVariableList} variables
 * @param {string} prevLine
 * @returns {string}
 */
export function replacePlaceholders(source: string, variables: IVariableList, prevLine: string | null = null, zeroDate: ZeroDate = 'asIs') : string {
	let replaced: string = source;
	for (let v of variables) {
		if (v[1]) {
			let regex = new RegExp(k_.VAR_PREFIX + v[0] + k_.VAR_SUFFIX, 'gi');
			replaced = replaced.replace(regex, v[1]);
			regex = new RegExp(k_.VAR_PREFIX + v[0] + k_.VAR_ARG_UPPER + k_.VAR_SUFFIX, 'gi');
			replaced = replaced.replace(regex, v[1].toLocaleUpperCase());
			regex = new RegExp(k_.VAR_PREFIX + v[0] + k_.VAR_ARG_LOWER + k_.VAR_SUFFIX, 'gi');
			replaced = replaced.replace(regex, v[1].toLocaleLowerCase());
		}
	}
	replaced = replaceFunctions(replaced, prevLine, zeroDate);
	return replaced;
}

/**
 * Adds the suffix to the end of the line left-padded with spaces if necessary
 * to bring up the line length to wrapCol.  Just returns line if suffix is empty.
 *
 * @export
 * @param {string} line The base line
 * @param {string} suffix The suffix.
 * @param {number} wrapCol
 * @returns {string}
 */
export function addLineSuffix(line: string, suffix: string, wrapCol: number, tabSize: number): string {
	wrapCol = wrapCol && wrapCol > 0 ? wrapCol : 80;

	// look for the `padwith` function and get the padding character
	let padding = getPaddingValues(line);
	let padChar: string = padding[0] ? padding[1] : '';
	const padMaxLength: number = padding[0] && (padding[2] > 0) ? padding[2] : wrapCol;

	if (padChar.length == 0 && (!suffix || suffix.length == 0)) {
		return line;
	}
	if (padChar.length > 0) {
		line = removeFunctionCall(k_.FUNC_PAD_LINE, line);
	} else { // there is no padChar defined
		padChar = ' ';
	}
	line = line || '';
	const fullLineLength: number = wrapCol - suffix.length;

	let spacedContentLength: number = line.length;
	if (line.indexOf('\t') >= 0) {
		spacedContentLength = 0;
		for (let idx: number = 0; idx < line.length; idx++) {
			spacedContentLength++;
			if (line.charAt(idx) == '\t') {
				while(spacedContentLength % tabSize !== 0) {
					spacedContentLength++;
				}
			}
		}
	}	

	let padAdded: number = 0;
	while (spacedContentLength < fullLineLength && padAdded < padMaxLength) {
		spacedContentLength++;
		padAdded++;
		line += padChar;
	}
	return line + suffix;
}

function removeFunctionCall(functionName: string, fromLine: string): string {
	const funcPrefix: string = `${k_.VAR_PREFIX}${functionName}(`;
	let idxStart: number = fromLine.indexOf(funcPrefix);
	if (idxStart < 0) {
		return null;
	}
	let idxEnd: number = fromLine.indexOf(k_.VAR_SUFFIX, idxStart);
	return `${fromLine.substring(0, idxStart)}${fromLine.substring(idxEnd + k_.VAR_SUFFIX.length)}`;
}

function getPaddingValues(fromLine: string): [boolean, string, number] {
		// look for the `padwith` function and get the padding character and optional length
		let replacements: IVariableList = [];
		constructFunctionReferences(replacements, fromLine, k_.FUNC_PAD_LINE, (args: string): string => {
			let cleanedArgs: string =
				args && args.length > 0
				? args.split(',').map(arg => arg.trim().replace(/('|")/g, '')).join()
				: '';
			return cleanedArgs;
		});
		const split: string[] = (replacements.length > 0 ? replacements[0][1] : '').split(',');
		const padChar: string = split.length > 0 ? split[0] : '';
		const padLen: number = split.length > 1 ? safeParseInt(split[1], 0) : 0;
		return [padChar.length === 1, padChar, padLen];
}

function safeParseInt(s: string, fallback: number): number {
	const intValue: number = parseInt(s);
	return Number.isNaN(intValue) ? fallback : intValue;
}

/**
 * Process template function placeholders
 *
 * @param source the template text
 * @param prevLine the replaced line, or null if not replacing
 * @param zeroDate specifies behavior if "fc" is used and file creation date
 *                 cannot be determined
 */
function replaceFunctions(source: string, prevLine: string | null, zeroDate: ZeroDate) : string {
	let replaced: string = source;
	let replacements: IVariableList = [];

	// get date part placeholders
	constructFunctionReferences(replacements, source, k_.FUNC_DATE_FMT, (args: string): string => {
		// remove the surrounding quotes
		args = args.substring(1, args.length - 1);
		return moment().format(args);
	});

	// get file creation date placeholders
	constructFunctionReferences(replacements, source, k_.FUNC_FILE_CREATED, (args: string): string => {
		// remove the surrounding quotes
		args = args.substring(1, args.length - 1);
		const fcreated: Date = getActiveFileCreationDate(zeroDate) || new Date();
		if (!args) {
			return "";
		} else if (args) {
			return moment(fcreated).format(args);
		} else {
			return fcreated.toDateString();
		}
	});

	// get the year to year placeholders
	constructFunctionReferencesWithPrev(replacements, source, k_.FUNC_YEAR_TO_YEAR, prevLine, (args: string, prevText: string | null) => {
		let argsArray: string[] =
			args && args.length > 0
			? args.split(',').map(arg => arg.trim().replace(/('|")/g, ''))
			: [];
		return y2y((argsArray.length > 0 ? argsArray[0] : 'fc'), (argsArray.length > 1 ? argsArray[1] : 'now'), prevText, zeroDate);
	});

	// perform placeholder substitution
	for (let v of replacements) {
		let regex = new RegExp(escapeRegExp(v[0]), 'g');
		replaced = replaced.replace(regex, v[1]);
	}
	return replaced;
}

/**
 * Process a year argument, which might be the special string "fc" or "now".
 * 
 * @param arg  The argument year, or special value "fc" or "now"
 * @param zeroDate  Behavior if file creation date cannot be determined
 * @returns The year text output
 */
function y2yYear(arg: string, zeroDate: ZeroDate = "asIs"): string {
	if (!arg) {
		return '';
	} else if (arg.toLowerCase() === 'fc') {
		return (getActiveFileCreationDate(zeroDate) || new Date()).getFullYear().toString();
	} else if (arg.toLowerCase() === 'now') {
		return new Date().getFullYear().toString();
	}
	return arg;
}

/**
 * Returns a year to year string from the passed in from and to year parameters
 * 
 * @param fromArg First yeartoyear() argument text
 * @param toArg   Second yeartoyear() argument text
 * @param prevText Text from existing header at the yeartoyear() call, if any
 * @param zeroDate Behavior if file creation date cannot be determined
 * @returns The yeartoyear() result replacement text
 */
function y2y(fromArg: string, toArg: string, prevText: string | null, zeroDate: ZeroDate = "asIs"): string {
	// check for the "!P" flag on each argument
	let usePrevFrom: boolean = false;
	if (fromArg.endsWith("!P")) {
		fromArg = fromArg.substring(0, fromArg.length - 2);
		usePrevFrom = true;
	}
	let usePrevTo: boolean = false;
	if (toArg.endsWith("!P")) {
		toArg = toArg.substring(0, toArg.length - 2);
		usePrevTo = true;
	}

	// if have a prevText and a !P flag requested
	let prevFrom: string | null = null;
	let prevTo: string | null = null;
	if (!prevText) {
		usePrevFrom = usePrevTo = false;
	}
	else if (usePrevFrom || usePrevTo)
	{
		const y2yMatch = prevText.match(/^(\d{4}) ?- ?(\d{4})(?!\d)/);
		if (y2yMatch) {
			prevFrom = y2yMatch[1];
			prevTo = y2yMatch[2];
		} else {
			const yearMatch = prevText.match(/^\d{4}(?!\d)/);
			if (yearMatch) {
				prevFrom = prevTo = yearMatch[0];
			} else {
				// year(s) not found in previous text, so use the y2yYear(arg)
				usePrevFrom = usePrevTo = false;
			}
		}
	}

	fromArg = usePrevFrom ? prevFrom : y2yYear(fromArg, zeroDate);
	toArg = usePrevTo ? prevTo : y2yYear(toArg, zeroDate);

	const config = workspace.getConfiguration(`${k_.BASE_SETTINGS}.${k_.CONFIG_SETTINGS}`)
	const spacesBetweenYears = config.get<boolean>('spacesBetweenYears', true);
	const sp = spacesBetweenYears ? " " : "";

	return fromArg === toArg ? fromArg : `${fromArg}${sp}-${sp}${toArg}`;
}

/**
 * Construct a placeholder variable list for a specified function based on the template text content.
 * @param {IVariableList} references an existing list to add the output variable/values pairs to.
 * @param {string} source the template text
 * @param {string} functionName the name of the template function
 * @param {IPlaceholderFunction} cb the method to run to retrieve the value based on the function arguments
 */
function constructFunctionReferences(references: IVariableList, source: string, functionName: string, cb: IPlaceholderFunction) {
	const funcNeedle: string = `${k_.VAR_PREFIX}${functionName}(`;
	let indices: Array<number> = getIndicesOf(funcNeedle, source, false);
	for (let i = 0; i < indices.length; i++) {
		let start = indices[i];
		let end: number = source.indexOf(`)`, start);
		if (end > -1) {
			let args: string = source.substring(start + funcNeedle.length, end);
			let key: string = `${funcNeedle}${args})${k_.VAR_SUFFIX}`;
			let value: string = cb ? cb(args) : '';
			references.push([key, value]);
		}
	}
}

/**
 * Construct a placeholder variable list for a specified function based on the template text content and the existing content.
 * 
 * The second argument to @a cb will be the part of @a prevLine from the matched position to the end,
 * or an empty string if not replacing text or the replaced text could not be determined.
 * 
 * @param {IVariableList} references an existing list to add the output variable/values pairs to.
 * @param {string} source the template text
 * @param {string} functionName the name of the template function
 * @param {string} prevLine the existing line being replaced, or null if creating a new header
 * @param {IPlaceholderFunction} cb the method to run to retrieve the value based on the function arguments and previous file text
 */
function constructFunctionReferencesWithPrev(references: IVariableList, source: string, functionName: string, prevLine: string | null, cb: IPlaceholderFromPrevFunction) {
	const funcNeedle: string = `${k_.VAR_PREFIX}${functionName}(`;
	let indices: Array<number> = getIndicesOf(funcNeedle, source, false);
	for (let i = 0; i < indices.length; i++) {
		let start = indices[i];
		let end: number = source.indexOf(`)`, start);
		if (end > -1) {
			let prevMatcher = '^';
			let srcPos = 0;
			while (srcPos < start) {
				let prefixPos = source.indexOf(k_.VAR_PREFIX, srcPos);
				let suffixPos = -1;
				if (prefixPos > -1 && prefixPos < start) {
					suffixPos = source.indexOf(k_.VAR_SUFFIX, prefixPos + k_.VAR_PREFIX.length);
				}
				if (suffixPos > -1 && suffixPos < start) {
					prevMatcher += escapeRegExp(source.substring(srcPos, prefixPos));
					prevMatcher += '.+?';
					srcPos = suffixPos + k_.VAR_SUFFIX.length;
				}
				else
				{
					prevMatcher += escapeRegExp(source.substring(srcPos, start));
					srcPos = start;
				}
			}
			const prevMatch = prevLine ? prevLine.match(prevMatcher) : null;
			const prevValue: string = prevMatch ? prevLine.substring(prevMatch[0].length) : null;

			let args: string = source.substring(start + funcNeedle.length, end);
			let key: string = `${funcNeedle}${args})${k_.VAR_SUFFIX}`;
			let value: string = cb ? cb(args, prevValue) : '';
			references.push([key, value]);
		}
	}
}

/**
 * Clean up some of the easier goo goo muck from the license text.
 *
 * @param {string} lic
 * @returns {string}
 */
function cleanSpdxLicenseText(lic: string): string {
	let str = lic.replace(/<year>/gi, placeholder(k_.VAR_YEAR))
		.replace(/<owner>/gi, placeholder(k_.VAR_COPYRIGHT_HOLDER))
		.replace(/<owner organization name>/gi, placeholder(k_.VAR_COPYRIGHT_HOLDER))
		.replace(/<copyright holders>/gi, placeholder(k_.VAR_COPYRIGHT_HOLDER))
		.replace(/<copyright holder>/gi, placeholder(k_.VAR_COPYRIGHT_HOLDER))
		.replace(/<copyright notice>/gi, `Copyright (c) ${placeholder(k_.VAR_YEAR)} ${placeholder(k_.VAR_COPYRIGHT_HOLDER)}]`)
		.replace(/<organization>/gi, placeholder(k_.VAR_COMPANY))
		.replace(/<insert your license name here>/gi, placeholder(k_.VAR_LICENSE_NAME))
		.replace(/phk@freebsd.org/gi, placeholder(k_.VAR_AUTHOR_EMAIL))
		.replace(/rob Landley/gi, placeholder(k_.VAR_AUTHOR))
		.replace(/rob@landley.net/gi, placeholder(k_.VAR_AUTHOR_EMAIL))
		.replace(/sam hocevar/gi, placeholder(k_.VAR_AUTHOR))
		.replace(/sam@hocevar.net/gi, placeholder(k_.VAR_AUTHOR_EMAIL))
		.replace(/<name of author>/gi, placeholder(k_.VAR_AUTHOR));
	let arr: Array<string> = str.split('\n');
	let wrapped: Array<string> = [];
	for (let i = 0; i < arr.length; i++) {
		wrapped = wrapped.concat(wordWrap(arr[i], 80));
	}
	return wrapped.join('\n');
}

/**
 * Wrap the word wrap wrapper in a wrapper that wraps words. (No rap!)
 *
 * @param {string} str
 * @param {number} width
 * @returns {Array<string>}
 */
function wordWrap(str: string, width: number): Array<string> {
	var wrap = require('wordwrap')(width);
	const wrapped: string = wrap(str);
	return wrapped.split('\n');
}

/**
 * Generate a placeholder string.
 *
 * @param {string} str
 * @returns {string}
 */
function placeholder(str: string): string {
	return  `${k_.VAR_PREFIX}${str}${k_.VAR_SUFFIX}`;
}

/**
 * Search the haystack for instances of needle and return an array of index positions.
 *
 * @param needle the value to search for
 * @param haystack the string to search
 * @param caseSensitive is the match case sensitive?
 */
function getIndicesOf(needle: string, haystack: string, caseSensitive: boolean): Array<number> {
    var searchStrLen: number = needle.length;
    if (searchStrLen == 0) {
        return [];
    }
    var startIndex: number = 0,
		index: number,
		indices: Array<number> = [];

    if (!caseSensitive) {
        haystack = haystack.toLowerCase();
        needle = needle.toLowerCase();
    }
    while ((index = haystack.indexOf(needle, startIndex)) > -1) {
        indices.push(index);
        startIndex = index + searchStrLen;
    }
    return indices;
}

/**
 * Escapes regular expression special characters
 *
 * @param value the string to escape
 */
function escapeRegExp(value: string) : string {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}


/**
 * Returns the current configuration values for an array of strings.
 * Unlike the default VSC method, this will merge the various strings of the
 * Default then User then Workspace then WorkspaceFolder settings into a single
 * array that includes all strings (the default behaviour of VSC is to only
 * return the last array).
 *
 * @param wsConfig The Workspace Configuration
 * @param key The configuration key to retrieve - can use dot notation.
 */
export function getMergedStrings(wsConfig: WorkspaceConfiguration, key: string): Array<string> {
	const cfg: IInspectableConfig<Array<string>> = wsConfig.inspect(key);
	return cfg ? mergeStringLists(cfg.defaultValue || [], cfg.globalValue || [], cfg.workspaceValue || [], cfg.workspaceFolderValue || []) : [];
}

/**
 * General method to merge one or more string arrays into a single array that
 * includes all of the strings from all of the passed in string arrays.
 *
 * @param {...Array<string>} lists The string array(s)
 * @returns {Array<string>} The merged array of strings
 */
function mergeStringLists(...lists: Array<Array<string>>): Array<string> {
	let merged: Array<string> = [];
	for (let list of lists) {
		list.forEach((value: string) => {
			if (merged.indexOf(value) === -1) {
				merged.push(value);
			}
		});
	}
	return merged;
}

/**
 * Returns the full set of templates that are defined in Default, User,
 * Workspace and/or WorkspaceFolder settings.  Unlike the default VSC method,
 * the returned array will include all templates defined across all settings.
 *
 * @param wsConfig The Workspace Configuration object.
 */
export function getMergedTemplates(wsConfig: WorkspaceConfiguration): ITemplateConfigList {
	const cfg: IInspectableConfig<ITemplateConfigList> = wsConfig.inspect(k_.TEMPLATE_SETTINGS);
	return cfg ? mergeTemplateLists(cfg.defaultValue || [], cfg.globalValue || [], cfg.workspaceValue || [], cfg.workspaceFolderValue || []) : [];
}

/**
 * General method to merge one or more [[ITemplateList]] arrays into a single
 * array that includes all of the template lists from all of the passed in arrays.
 *
 * @param lists The ITemplateList array(s)
 */
function mergeTemplateLists(...lists: ITemplateConfigList[]): ITemplateConfigList {
	let merged: ITemplateConfigList = [];
	for (let list of lists) {
		list.forEach((newTemplate: ITemplateConfig) => {
			const idx: number = merged.findIndex((mergedTemplate: ITemplateConfig) => {
				return mergedTemplate.language === newTemplate.language;
			});
			if (idx === -1) {
				merged.push(newTemplate);
			} else {
				merged.splice(idx, 1, newTemplate);
			}
		});
	}
	return merged;
}

/**
 * Returns the full set of language configuration objects that are defined in
 * Default, User, Workspace and/or WorkspaceFolder settings.  Unlike the default
 * VSC method, the returned array will include all language configurations
 * defined across all settings.
 *
 * @param wsConfig The Workspace Configuration object.
 */
export function getMergedLangConfig(wsConfig: WorkspaceConfiguration): ILangConfigList {
	const cfg: IInspectableConfig<ILangConfigList> = wsConfig.inspect(k_.LANG_CONFIG_SETTINGS);
	return cfg ? mergeLangConfigLists(cfg.defaultValue || [], cfg.globalValue || [], cfg.workspaceValue || [], cfg.workspaceFolderValue || []) : [];
}

/**
 * General method to merge one or more [[ILangConfigList]] arrays into a single
 * array that includes all of the language configuration lists from all of the
 * passed in arrays.
 *
 * @param lists The ILangConfigList array(s)
 */
function mergeLangConfigLists(...lists: ILangConfigList[]): ILangConfigList {
	let merged: ILangConfigList = [];
	for (let list of lists) {
		list.forEach((newLangConfig: ILangConfig) => {
			const idx: number = merged.findIndex((mergedLangConfig: ILangConfig) => {
				return mergedLangConfig.language === newLangConfig.language;
			});
			if (idx === -1) {
				merged.push(newLangConfig);
			} else {
				merged.splice(idx, 1, newLangConfig);
			}
		});
	}
	return merged;
}

/**
 * Returns the full set of variables that are defined in Default, User,
 * Workspace and/or WorkspaceFolder settings.  Unlike the default VSC method,
 * the returned array will include all variables defined across all settings.
 *
 * @param wsConfig The Workspace Configuration object.
 */
export function getMergedVariables(wsConfig: WorkspaceConfiguration): IVariableList {
	const cfg: IInspectableConfig<IVariableList> = wsConfig.inspect(k_.VARIABLE_SETTINGS);
	return cfg ? mergeVariableLists(cfg.defaultValue || [], cfg.globalValue || [], cfg.workspaceValue || [], cfg.workspaceFolderValue || []) : [];
}

/**
 * General method to merge one or more [[IVariableList]] arrays into a single
 * array that includes all of the variable lists from all of the passed in arrays.
 *
 * @param lists The IVariableList array(s)
 */
function mergeVariableLists(...lists: IVariableList[]): IVariableList {
	let merged: IVariableList = [];
	for (let list of lists) {
		list.forEach((newVariable: IVariable) => {
			const idx: number = merged.findIndex((mergedVariable: IVariable) => {
				return mergedVariable[0] == newVariable[0];
			});
			if (idx === -1) {
				merged.push(newVariable);
			} else {
				merged.splice(idx, 1, newVariable);
			}
		});
	}
	return merged;
}

export function trimStart(s: string) {
	const r = /^\s+/;
	return s.replace(r, '');
}

export {BASE_SETTINGS} from './constants';
export {IConfig, ILangConfig, IVariableList} from './interfaces';
