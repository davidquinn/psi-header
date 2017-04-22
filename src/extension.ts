/**
 * File: /Users/David/Development/psioniq/vscode-extensions/psi-header/src/extension.ts
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

'use strict';

import {ExtensionContext, commands, WorkspaceConfiguration, workspace} from 'vscode';
import * as command from './insertFileHeaderCommand';
import * as k_ from './constants';
import {ChangesTrackingController} from './changesTrackingController';

export function activate(context: ExtensionContext) {
    // the header generator command
	let disposable = commands.registerCommand('psi-header.insertFileHeader', () => {
        command.insertFileHeader();
    });
    context.subscriptions.push(disposable);

	// the changes tracking subscription
	const wsConfig: WorkspaceConfiguration = workspace.getConfiguration(k_.BASE_SETTINGS);
	const controller: ChangesTrackingController = new ChangesTrackingController(wsConfig);
	context.subscriptions.push(controller);
}

export function deactivate() {
}