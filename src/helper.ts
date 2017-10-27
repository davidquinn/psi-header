/**
 * File: helper.ts
 * Relative Path: /src/helper.ts
 * Project: psioniq File Header
 * File Created: Sunday, 1st January 2017 9:32:01 am
 * Author: David Quinn (info@psioniq.uk)
 * -----
 * Last Modified: Friday, 27th October 2017 8:16:41 pm
 * Modified By: David <you@you.you>
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



import {workspace, window, TextEditor, WorkspaceConfiguration} from 'vscode';
import * as k_ from './constants';
import {ITemplate, ITemplateList, IConfig, ILangConfig, ILangConfigList, IVariable, IVariableList, IPlaceholderFunction} from './interfaces';
import * as fs from 'fs';
import * as path from 'path';
import * as moment from 'moment';
import * as username from 'username';

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

	def.license = cfg && cfg.license ? cfg.license : null;

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

	return def;
}

/**
 * Retrieve the desired template.  Will use the first of these that exists:
 *   - language-specific template from workspace settings; else
 *   - default template from workspace settings; else
 *   - the default template as defined by this extension.
 * 
 * @param {WorkspaceConfiguration} wsConfig
 * @param {string} langId
 * @returns {Array<string>}
 */
export function getTemplate(wsConfig: WorkspaceConfiguration, langId: string): Array<string> {
	let def: ITemplate;
	const templates: ITemplateList = wsConfig && wsConfig.has(k_.TEMPLATE_SETTINGS) ? wsConfig.get<ITemplateList>(k_.TEMPLATE_SETTINGS) : null;

	if (templates) {
		def = templates.find(function(item: ITemplate, index: number, obj: ITemplateList): boolean {
			return item.language === langId;
		});
		if (def && def.hasOwnProperty('mapTo')) {
			const mapTo = def.mapTo;
			def = templates.find(function(item: ITemplate, index: number, obj: ITemplateList): boolean {
				return item.language === mapTo;
			});
		}
		if (def == null || !def.template) {
			def = templates.find(function(item: ITemplate, index: number, obj: ITemplateList): boolean {
				return item.language === k_.DEFAULT;
			});
		}
	}

	if (!def || !def.template) {
		def = { language: k_.DEFAULT, template: k_.DEFAULT_TEMPLATE };
	}
	
	return def.template;
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
 * @returns {ILangConfig}
 */
export function getLanguageConfig(wsConfig: WorkspaceConfiguration, langId: string): ILangConfig {
	let base: ILangConfig = baseLanguageConfig(langId);
	let cfg: ILangConfig;
	let configs: ILangConfigList = wsConfig && wsConfig.has(k_.LANG_CONFIG_SETTINGS) ? wsConfig.get<ILangConfigList>(k_.LANG_CONFIG_SETTINGS) : null;

	if (configs) {
		cfg = configs.find(function(item: ILangConfig, index: number, obj: ILangConfigList): boolean {
			return item.language === langId;
		});
		if (cfg && cfg.hasOwnProperty('mapTo')) {
			const mapTo = cfg.mapTo;
			// I'm only doing this once!!  You won't make me run around in circles!!
			cfg = configs.find(function(item: ILangConfig, index: number, obj: ILangConfigList): boolean {
				return item.language === mapTo;
			});
		}
		if (cfg == null) {
			cfg = configs.find(function(item: ILangConfig, index: number, obj: ILangConfigList): boolean {
				return item.language === k_.DEFAULT;
			});
		}
	}

	mapLanguageConfig(cfg, base);
	return base;
}

/**
 * Generate the base language configuration object.
 * 
 * @param {string} langId
 * @returns
 */
function baseLanguageConfig(langId: string) {
	let config: ILangConfig = { language: '*', begin: '/**', prefix: ' * ', end: ' */' };
	switch(langId) {
		case "swift":
			mapLanguageConfig({ begin: '/**'}, config);
			break;
		case "lua":
			mapLanguageConfig({ begin: '--[[', prefix: '--', end: '--]]'}, config);
			break;
		case "perl":
		case "ruby":
			mapLanguageConfig({ begin: '#', prefix: '#', end: '#'}, config);
			break;
		case "vb":
			mapLanguageConfig({ begin: "'", prefix: "'", end: "'"}, config);
			break;
		case 'clojure':
			mapLanguageConfig({ begin: ';;', prefix: ';', end: ';;'}, config);
			break;
		case 'python':
			mapLanguageConfig({ begin: "'''", prefix: '', end: "'''"}, config);
			break;
		case "xml":
		case "html":
			mapLanguageConfig({ begin: '<!--', prefix: '', end: '-->'}, config);
			break;
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
function mapLanguageConfig(source: Object, target: ILangConfig): void {
	if (source) {
		mapProperty(source, target, 'language');
		mapProperty(source, target, 'begin');
		mapProperty(source, target, 'prefix');
		mapProperty(source, target, 'end');
		mapProperty(source, target, 'mapTo');
		mapProperty(source, target, 'forceToTop');
		mapProperty(source, target, 'blankLinesAfter');
		mapProperty(source, target, 'beforeHeader');
		mapProperty(source, target, 'afterHeader');
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
 * @param {boolean} ignoreLicence
 * @returns {IVariableList}
 */
export function getVariables(wsConfig: WorkspaceConfiguration, editor: TextEditor, config: IConfig, langConfig: ILangConfig, ignoreLicence: boolean = false): IVariableList {
	let variables: IVariableList = [];
	const now: Date = new Date();
	const fcreated: Date = getActiveFileCreationDate() || new Date();
	const currentFile: string = editor.document.fileName;
	console.log(config);
	// system variables
	variables.push([k_.VAR_DATE, now.toDateString()]);
	variables.push([k_.VAR_TIME, now.toLocaleTimeString()]);
	variables.push([k_.VAR_YEAR, now.getFullYear().toString()]);
	variables.push([k_.VAR_FILE_PATH, currentFile]);
	variables.push([k_.VAR_FILE_RELATIVE_PATH, getRelativeFilePath(currentFile)]);
	variables.push([k_.VAR_PROJECT_PATH, getProjectRootPath(currentFile)]);
	variables.push([k_.VAR_COMPANY, config && config.company ? config.company : 'Your Company']);
	variables.push([k_.VAR_AUTHOR, config && config.author ? config.author : getAuthorName()]);
	variables.push([k_.VAR_AUTHOR_EMAIL, config && config.authorEmail ? config.authorEmail : 'you@you.you']);
	variables.push([k_.VAR_PROJECT_NAME, getProjectName(currentFile)]);
	variables.push([k_.VAR_FILE_NAME, extractFileName(currentFile)]);
	// using filecreated function without arguments treats it like a variable.
	variables.push([k_.FUNC_FILE_CREATED, fcreated.toDateString()]);
	if (config && config.copyrightHolder) {
		variables.push([k_.VAR_COPYRIGHT_HOLDER, config.copyrightHolder]);
	}

	// custom variables
	let vl: IVariableList = wsConfig && wsConfig.has(k_.VARIABLE_SETTINGS) ? wsConfig.get<IVariableList>(k_.VARIABLE_SETTINGS) : null;
	if (vl && vl.length > 0) {
		for (let v of vl) {
			let item: IVariable = variables.find(function(element, index, array): boolean {
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
	if (variables.findIndex( (value: IVariable, index: number, obj: IVariableList) => {
		return value[0] === k_.VAR_COPYRIGHT_HOLDER;
	}) === -1) {
		const company: IVariable = variables.find((val: IVariable, idx: number, obj: IVariableList) => {
			return val[0] === k_.VAR_COMPANY;
		});
		variables.push([k_.VAR_COPYRIGHT_HOLDER, (company ? company[1] : 'Your Company')]);
	}

	// license variables
	if (!ignoreLicence) {
		addLicenseVariables(wsConfig, variables, config, langConfig);
	}
	return variables;
}

/**
 * Pass in a fully qualified file path and return the part of the path where an associated package.json file is located.
 * Iterates up through the directory structure until it finds a package.json file and if not found returns the original directory.
 * 
 * @param {string} filename The file to use as the basis for searching.
 * @returns {string} The directory within the path that contains a package.json, else a blank string.
 */
function getProjectRootPath(filename: string): string {
	const parsed = path.parse(filename);
	const dir: string = parsed ? parsed.dir : '';
	let result: string = dir;
	while(result.includes(path.sep)) {
		if (fs.existsSync(path.join(result, 'package.json'))) {
			break;
		} else {
			result = result.substring(0, result.lastIndexOf(path.sep));
		}
	}
	if (result.length === 0) {
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
function getProjectName(filename: string): string {
	try {
		const rootPath: string = getProjectRootPath(filename);
		const fname: string = path.join(rootPath, 'package.json');
		if (fs.existsSync(fname)) {
			const prj = JSON.parse(fs.readFileSync(fname).toString());
			if (prj) {
				return prj.displayName ? prj.displayName : prj.name;
			}
		}
		return path.basename(rootPath);
	} catch (error) {
		return null;
	}
}

/**
 * Tries to determine the name of the current user, or if not available returns 'You'.
 * 
 * @returns {string} 
 */
export function getAuthorName(): string {
	let name: string;
	try {
		name = username.sync();
	} catch (error) {
		
	}
	return name ? name : 'You';
}

/**
 * Get the filename from the file full path
 * 
 * @param {string} fullpath 
 * @returns {string} 
 */
function extractFileName(fullpath: string): string {
	try {
		return path.basename(fullpath);
	} catch (error) {
		return null;
	}
}

/**
 * Gets the relative file path by removing the workspace root path.
 * 
 * @param {string} fullpath 
 * @returns {string} 
 */
function getRelativeFilePath(fullpath: string): string {
	try {
		const rootPath: string = getProjectRootPath(fullpath);
		return fullpath.substring(rootPath.length);
	} catch (error) {
		return null;
	}
}

/**
 * Return the current editor file's creation date (birthtime)
 * 
 */
function getActiveFileCreationDate(): Date {
	let result: Date = null;
	const editor: TextEditor = window.activeTextEditor;
	if (editor && editor.document) {
		result = getFileCreationDate(editor.document.fileName);
	}
	return result;
}

/**
 * Return the file creation date of the passed in file.
 * 
 * @param filename The name of the file to check.
 */
export function getFileCreationDate(filename): Date {
	let result: Date = null;
	try {
		if (fs.existsSync(filename)) {
			const stat: fs.Stats = fs.statSync(filename);
			if (stat && stat.birthtime) {
				result = stat.birthtime;
			}
		}
	} catch (error) {
		result = null;
	}
	return result;
}

/**
 * Add the license and related variables from the SPDX data.
 * 
 * @param {WorkspaceConfiguration} wsConfig
 * @param {IVariableList} variables
 * @param {IConfig} config
 * @param {ILangConfig} langConfig
 */
function addLicenseVariables(wsConfig: WorkspaceConfiguration, variables: IVariableList, config: IConfig, langConfig: ILangConfig): void {
	const spdxList = require('spdx-license-list/full');
	let txt: Array<string> = [];
	let spdx;
	if (config && config.license) {
		if (config.license === 'Custom') {
			txt = wsConfig.has(k_.LICENSE_SETTINGS) ? wsConfig.get<Array<string>>(k_.LICENSE_SETTINGS).slice() : [];
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
	variables.push([k_.VAR_LICENSE_TEXT, replacePlaceholders(txt.join('\n'), variables)]);
	if (spdx) {
		variables.push([k_.VAR_LICENSE_NAME, spdx.name]);
		variables.push([k_.VAR_LICENSE_URL, spdx.url]);
		variables.push([k_.VAR_SPDX_ID, config.license]);
	}
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
export function merge(template: Array<string>, langConfig: ILangConfig, variables: IVariableList, config: IConfig): string {
	let body: Array<string> = [];
	for (let i = 0; i < template.length; i++) {
		body.push(langConfig.prefix + template[i]);
	}
	let merged: string = body.join('\n');
	merged = replacePlaceholders(merged, variables);
	
	let beforeText: string = arrayToString(langConfig.hasOwnProperty('beforeHeader') ? langConfig.beforeHeader : null);
	let afterText: string = arrayToString(langConfig.hasOwnProperty('afterHeader') ? langConfig.afterHeader : null);

	let endSpace: string = '';
	for (let i = 0; i < (config.blankLinesAfter); i++) {
		endSpace += '\n';
	}
	return `${beforeText}${langConfig.begin}\n${merged}\n${langConfig.end}\n${endSpace}${afterText}`;
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
 * @returns {string}
 */
export function replacePlaceholders(source: string, variables: IVariableList): string {
	let replaced: string = source;
	for (let v of variables) {
		if (v[1]) {
			let regex = new RegExp(k_.VAR_PREFIX + v[0] + k_.VAR_SUFFIX, 'gi');
			replaced = replaced.replace(regex, v[1]);
		}
	}
	replaced = replaceFunctions(replaced);
	return replaced;
}

/**
 * Process template function placeholders
 * 
 * @param source the templae text
 */
function replaceFunctions(source: string): string {
	let replaced: string = source;	
	let replacements: IVariableList = [];
	// get date part placeholders
	constructFunctionReferences(replacements, source, k_.FUNC_DATE_FMT, (args: string): string => {
		// remove the surrounding quotes
		args = args.substring(1, args.length - 1);
		return moment().format(args);
	})

	// get file creation date placeholders
	constructFunctionReferences(replacements, source, k_.FUNC_FILE_CREATED, (args: string): string => {
		// remove the surrounding quotes
		args = args.substring(1, args.length - 1);
		const fcreated: Date = getActiveFileCreationDate() || new Date();
		if (args) {
			return moment(fcreated).format(args);
		} else {
			return fcreated.toDateString();
		}
	})
	
	// perform placeholder substitution
	for (let v of replacements) {
		let regex = new RegExp(escapeRegExp(v[0]), 'g');
		replaced = replaced.replace(regex, v[1]);
	}
	return replaced;
}

/**
 * Construct a placeholder variable list for a specified function based on the template text content.
 * 
 * @param {string} source the template text
 * @param {string} functionName the name of the template function
 * @param {IPlaceholderFunction} cb the method to run to retrieve the value based on the function arguments
 * @returns {IVariableList} 
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

export {BASE_SETTINGS} from './constants';
export {IConfig, ILangConfig, IVariableList} from './interfaces';
