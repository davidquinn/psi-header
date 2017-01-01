/**
 * File: /Users/David/Development/psioniq/vscode-extensions/psi-header/src/constants.ts
 * Project: /Users/David/Development/psioniq/vscode-extensions/psi-header
 * Created Date: Sun Jan 01 2017
 * Author: David Quinn (david@eternia.net)
 * 
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

/**
 * Settings Section names
 */
export const BASE_SETTINGS: string = 'psi-header';
export const VARIABLE_SETTINGS: string = 'variables';
export const CONFIG_SETTINGS: string = 'config';
export const LANG_CONFIG_SETTINGS: string = 'lang-config';
export const TEMPLATE_SETTINGS: string = 'templates';
export const LICENSE_SETTINGS: string = 'license-text';

/**
 * System Variable names
 */
export const VAR_DATE: string = 'date';
export const VAR_TIME: string = 'time';
export const VAR_YEAR: string = 'year';
export const VAR_FILE_PATH: string = 'filepath';
export const VAR_PROJECT_PATH: string = 'projectpath';
export const VAR_COMPANY: string = 'company';
export const VAR_AUTHOR: string = 'author';
export const VAR_AUTHOR_EMAIL: string = 'authoremail';
export const VAR_LICENSE_TEXT: string = 'licensetext';
export const VAR_COPYRIGHT_HOLDER: string = 'copyrightholder';
export const VAR_LICENSE_NAME: string = 'licensename';
export const VAR_LICENSE_URL: string = 'licenseurl';
export const VAR_SPDX_ID: string = 'spdxid';

/**
 * The default template where none is provided in the user settings.
 */
export const DEFAULT_TEMPLATE: Array<string> = [
    `Filename: $[${VAR_FILE_PATH}]`,
    `Path: $[${VAR_PROJECT_PATH}]`,
    `Created Date: $[${VAR_DATE}]`,
    `Author: $[${VAR_AUTHOR}]`,
    "",
    `Copyright (c) $[${VAR_YEAR}] $[${VAR_COPYRIGHT_HOLDER}]`
];


/**
 * The variable placeholder prefix.
 */
export const VAR_PREFIX: string = '<<';

/**
 * The variable placeholder suffix.
 */
export const VAR_SUFFIX: string = '>>';

/**
 * The key text for a default language config or template.
 */
export const DEFAULT: string = '*';

// const MIT_TEXT: string = `Copyright (c) $[year] $[company]

// Permission is hereby granted, free of charge, to any person obtaining a copy 
// of this software and associated documentation files (the "Software"), to deal 
// in the Software without restriction, including without limitation the rights 
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell 
// copies of the Software, and to permit persons to whom the Software is furnished 
// to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all 
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS 
// FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR 
// COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER 
// IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION 
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.`;

// const ISC_TEXT: string = `ISC License

// Copyright (c) $[year], $[company]

// Permission to use, copy, modify, and/or distribute this software for any purpose 
// with or without fee is hereby granted, provided that the above copyright notice 
// and this permission notice appear in all copies.

// THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH 
// REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND 
// FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, 
// OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, 
// DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS 
// ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.`;
