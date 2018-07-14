/*
 * File: extension.ts
 * Project: psioniq File Header
 * File Created: Friday, 30th December 2016 5:20:27 pm
 * Author: David Quinn (info@psioniq.uk)
 * -----
 * Last Modified: Saturday, 14th July 2018 7:17:02 am
 * Modified By: David Quinn (info@psioniq.uk>)
 * -----
 * MIT License
 *
 * Copyright 2017 - 2018 David Quinn, psioniq
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

'use strict';

import {ExtensionContext, commands} from 'vscode';
import { insertFileHeader } from './insertFileHeaderCommand';
import { insertChangeLog } from './insertChangeLogCommand';
import * as k_ from './constants';
import {ChangesTrackingController} from './changesTrackingController';

export function activate(context: ExtensionContext) {
    // the header generator command
	let headerSubscription = commands.registerCommand(k_.FILE_HEADER_COMMAND, () => {
        insertFileHeader();
    });
    context.subscriptions.push(headerSubscription);

	let insertChangeLogSubscription = commands.registerCommand(k_.CHANGE_LOG_INSERT_COMMAND, () => {
		insertChangeLog();
	});
	context.subscriptions.push(insertChangeLogSubscription);

	// the changes tracking subscription
	const controller: ChangesTrackingController = new ChangesTrackingController();
	context.subscriptions.push(controller);
}

export function deactivate() {
}