/*
 * File: interfaces.ts
 * Project: psioniq File Header
 * File Created: Tuesday, 25th December 2018 1:55:15 pm
 * Author: David Quinn (info@psioniq.uk)
 * -----
 * Last Modified: Saturday, 15th May 2021 1:38:19 pm
 * Modified By: Andrew Schepler (aschepler@gmail.com)
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

import {Range} from 'vscode';

/**
 * What to do with zero dates.
 */
export type ZeroDate = 'asIs' | 'blank' | 'now';

export interface IMappableLanguage {
    language: string;
    mapTo?: string;
}

/**
 * Interface for a template entry in the settings file.
 * Each entry will have either a template or mapTo property.
 * If both are provided, mapTo will take precedence.
 *
 * @interface ITemplate
 */
export interface ITemplateConfig extends IMappableLanguage {
	template?: Array<string>;
	changeLogCaption?: string;
	changeLogHeaderLineCount?: number;
	changeLogFooterLineCount?: number;
	changeLogEntryTemplate?: Array<string>;
	changeLogNaturalOrder?: boolean;
}

/**
 * Interface for an array of [[ITemplate]].
 */
export type ITemplateConfigList = Array<ITemplateConfig>;

/**
 * Global configuration options
 *
 * @export
 * @interface IConfig
 */
export interface IConfig {
    forceToTop?: boolean;
    blankLinesAfter?: number;
	spacesBetweenYears?: boolean;
	license?: string;
	author?: string;
	authorEmail?: string;
	company?: string;
	copyrightHolder?: string;
	initials?: string;
	ignoreAuthorFullname?: boolean;
	creationDateZero?: ZeroDate;
	hostname?: string;
}

/**
 * Interface for a configuration entry.
 * When adding entries to the user settings, any or all of the properties can be provided.
 * If mapTo is provided it will take precedence over all the other properties (i.e. others will be ignored).
 *
 * @interface ILangConfig
 */
export interface ILangConfig extends IMappableLanguage {
    begin?: string;
	prefix?: string;
	suffix?: string;
	lineLength?: number;
    end?: string;
    forceToTop?: boolean;
    blankLinesAfter?: number;
	beforeHeader?: Array<string>;
	afterHeader?: Array<string>;
	rootDirFileName?: string;
	modDate?: string;
	modDateFormat?: string;
	modAuthor?: string;
	replace?: Array<string>;
	ignoreLines?: Array<string>;
}

/**
 * Interface for the modifications tracker configuration.
 */
export interface ITrackingConfig {
	isActive?: boolean;
	modDate?: string;
	modDateFormat?: string;
	modAuthor?: string;
	include?: string[];
	exclude?: string[];
	includeGlob?: string[];
	excludeGlob?: string[];
	autoHeader?: string;
	replace?: string[];
	enforceHeader?: boolean;
	updateLicenseVariables?: boolean;
}

/**
 * Interface for an array of [[ILangConfig]]
 */
export type ILangConfigList = Array<ILangConfig>;

/**
 * Type that defines a name value pair of strings - used for variables.
 */
export type IVariable = [string, string];

/**
 * Type that defines an array of [[IVariable]]
 */
export type IVariableList = Array<IVariable>;

/**
 * Delegate for function that returns a placeholder value
 *
 * @export
 * @interface IPlaceholderFunction
 */
export interface IPlaceholderFunction {
	(arg: string): string;
}

/**
 * Delegate for function using old text and returning a placeholder value
 * 
 * @export
 * @interface IPlaceholderFromPrevFunction
 */
export interface IPlaceholderFromPrevFunction {
	(arg: string, prevText: string | null): string;
}

/**
 * Interface for a single range replacement
 *
 * @export
 * @interface IRangeReplacer
 */
export interface IRangeReplacer {
	range: Range;
	newString: string;
}

/**
 * Type that defines an array of [[IRangeReplacer]].
 */
export type IRangeReplacerList = Array<IRangeReplacer>;

/**
 * Interface for the results returned by a call to WorkspaceConfig.inspect.
 */
export interface IInspectableConfig<T extends any> {
	key: string;
	defaultValue?: T;
	globalValue?: T;
	workspaceValue?: T;
	workspaceFolderValue?: T;
}

export interface ILicenseReference {
	uri?: string;
	uriIsLocalFile?: boolean;
}
