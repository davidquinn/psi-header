/**
 * File: interfaces.ts
 * Relative Path: /src/interfaces.ts
 * Project: psioniq File Header
 * File Created: Sunday, 1st January 2017 10:16:39 am
 * Author: David Quinn (info@psioniq.uk)
 * -----
 * Last Modified: Friday, 27th October 2017 8:08:31 am
 * Modified By: David Quinn <info@psioniq.uk>
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



import {Range} from 'vscode';

/**
 * Interface for a template entry in the settings file.
 * Each entry will have either a template or mapTo property.
 * If both are provided, mapTo will take precedence.
 * 
 * @interface ITemplate
 */
export interface ITemplate {
    language: string,
    mapTo?: string;
    template?: Array<string>;
}

/**
 * Interface for an array of [[ITemplate]].
 */
export type ITemplateList = Array<ITemplate>;

/**
 * Global configuration options
 * 
 * @export
 * @interface IConfig
 */
export interface IConfig {
    forceToTop?: boolean;
    blankLinesAfter?: number;
	license?: string;
	author?: string;
	authorEmail?: string;
	company?: string;
	copyrightHolder?: string;
}

/**
 * Interface for a configuration entry.
 * When adding entries to the user settings, any or all of the properties can be provided.
 * If mapTo is provided it will take precedence over all the other properties (i.e. others will be ignored).
 * 
 * @interface ILangConfig
 */
export interface ILangConfig {
    language: string;
    mapTo?: string;
    begin?: string;
    prefix?: string;
    end?: string;
    forceToTop?: boolean;
    blankLinesAfter?: number;
	beforeHeader?: Array<string>;
	afterHeader?: Array<string>;
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
	autoHeader?: string;
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
