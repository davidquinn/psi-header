:: Table of Contents ::
<!-- TOC -->

- [Overview](#overview)
	- [Summary of Features](#summary-of-features)
- [Commands](#commands)
- [System Variables](#system-variables)
- [System Functions](#system-functions)
- [Configuration](#configuration)
	- [Global Options](#global-options)
	- [Changes Tracking Configuration](#changes-tracking-configuration)
	- [Variable Values](#variable-values)
	- [Language Configuration](#language-configuration)
	- [Templates](#templates)
- [Compact Mode](#compact-mode)
- [Block-Style Comment Headers](#block-style-comment-headers)
- [A Note about Project Paths](#a-note-about-project-paths)
- [License Information](#license-information)
- [Changes Tracking](#changes-tracking)
	- [Option 1 Simple Replacement](#option-1-simple-replacement)
	- [Option 2 Template Substitution](#option-2-template-substitution)
- [Auto Header](#auto-header)
- [Change Log](#change-log)
	- [Configuring Change Logging](#configuring-change-logging)
	- [Questions about Change Logs](#questions-about-change-logs)
- [An Example Custom Configuration](#an-example-custom-configuration)
- [Creating a Custom Template](#creating-a-custom-template)
- [Known Issues](#known-issues)
- [Credits](#credits)

<!-- /TOC -->

# Overview
The `psioniq File Header` VSCode Extension will insert a header into the current document - either at the start of the document or at the current cursor position. The header can be configured globally and/or per language.  However, the configuration separates the comment syntax from the template body so it is likely that a single template will be able to cover most languages.

It can optionally log modifications to the file via the change tracking feature which will update the header whenever the file is saved.

It is also possible to add templated comment blocks to the header to record for example a historic summary of changes to the file.

There are a veritable plethora of configuration options to cover your innermost headular cravings.

To report bugs, issues, suggestions: email `info@psioniq.uk`

Here is a sample output:

```javascript
/*
 * File: \Users\me\Development\psioniq\myProject\src\myPrecious.js
 * Project: \Users\me\Development\psioniq\myProject
 * Created Date: Saturday December 31 2016
 * Author: Arthur Bodkin, esq
 * -----
 * Last Modified: Sunday January 01 2017
 * Modified By: Tammy Bodkin
 * -----
 * Copyright (c) 2016 psioniq Global Enterprises, Inc
 */
```

To add a new header manually:
* thump `F1` and type `Header Insert`; or
* type the keyboard shortcut `ctrl-alt-H` then `ctrl-alt-H`.

To insert an entry into the change log:
* hit `F1` and type `Header Change Log Insert`; or
* type the keyboard shortcut `ctrl-alt-C ctrl-alt-C`.

Once inserted, the cursor will be placed at the end of the new log entry.

Now grab a coffee and read on...


## Summary of Features
Refer to [Configuration](#configuration) for the various extension settings details.

* Adds a generic or language-specific header at the current cursor location or at the top of the file.
* Optionally [track changes](#changes-tracking) in the header each time the file is saved.
* Configurable whitelists and blacklists to determine which files can be change tracked.
* Can automatically add a header to new files.
* Compatible with VSCode Multi Root Workspaces.
* Separates language specific elements (e.g. comment block begin and end) from the template body to minimise the number of templates you might need to manage.
* Configuration option to force the header to the top of the document - overridable per language.
* Configuration option to add additional blank lines after the header - overridable per language.
* Configurable options to add text before or after the header (e.g. pre-processor commands).
* Provides a default template body for all languages out of the box.
* Provides language-specific syntax settings (e.g. comment block syntax) out of the box.
* Configure your own custom language syntax globally and/or per language.
* Create your own custom templates - global and/or per language.
* Map custom template and syntax settings across languages so you can easily reuse them.
* Provides case-insensitive [System Variables](#system-variables) for placeholder value substitution.
* Provides _case-sensitive_ [System Functions](#system-functions) for configurable placeholder value substitution.
* Allows the overriding of system variable values with static global values within the configuration.
* Create an unlimited number of custom static variables for use throughout your custom templates.
* Header insertion can be run manually via the key shortcut `ctrl+alt+H` then `ctrl+alt+H`.
* Can automatically insert license text based on SPDX license IDs.
* Allows changes logging for recording a history of changes to the file.

# Commands
This extension adds the following commands to VSCode:
| Command name | Keyboard Shortcut | Description |
|---|---|---|
| Header Insert | ctrl-alt-H ctrl-alt-H | Inserts a new file header |
| Header Change Log Insert | ctrl-alt-C ctrl-alt-C | Inserts a new [change log entry](#change-log) into an existing header |

# System Variables
The following system variables are available for placeholder substitution in your templates.  They are case-insensitive.

|Variable Name | Description |
|---|---|
| `date` | The current date using the current locale (also see the `dateformat()` [system function](#system-function) below for a formattable date string version). |
| `time` | The current time using the current locale. |
| `year` | The current year. |
| `filepath` | The fully-qualified name of the file. |
| `filerelativepath` | The file name including the relative path within the project. |
| `filename` | Just the file name without the path details. |
| `projectpath` | The fully-qualified path to the root directory of the project. |
| `projectname` | Attempts to read package.json (in the current or any parent directory) for either a `displayName` or `name` property.  If there is no package.json file _and_ the file has been saved to disk, it will return the project path's base name. |
| `company` | The name of your company.  In this release it defaults to "Your Company". |
| `author` | Will attempt to get the user name of the current user, otherwise it defaults to "You". |
| `initials` | Your initials (where you don't want the whole author name |
| `authoremail` | The email address of the file author.  In this release it defaults to "you@you.you". |
| `licensetext` | The full text of the license. This is determined automatically. |
| `copyrightholder` | Used in some licenses. If not provided it defaults to the same value as `company`. |
| `licensename` | The name of the license. If not using a custom license, this is determined automatically. |
| `licenseurl` | The url for the license. If using not using a license, this is determined automatically. |
| `spdxid` | The SPDX License ID for the license. If not using a custom license, this is determined automatically. |

You can also create your own custom variables (for example if you are using this extension within a team or you need project-specific variables in your template) by adding your own variables to `psi-header.variables` then referring to them within your template like the following example which adds a custom variable called `projectCreationYear`:
``` json
	"psi-header.variables": [
		["projectCreationYear", "2017"]
	],
	"psi-header.templates": [
		{
			"language": "*",
			"template": [
				"File: <<filename>>",
				"Project: <<projectname>>",
				"File Created: <<filecreated('dddd, Do MMMM YYYY h:mm:ss a')>>",
				"Author: <<author>> (<<authoremail>>)",
				"-----",
				"Last Modified: <<dateformat('dddd, Do MMMM YYYY h:mm:ss a')>>",
				"Modified By: <<author>> (<<authoremail>>>)",
				"-----",
				"Copyright <<projectCreationYear>> - <<year>> <<copyrightholder>>, <<company>>"
			]
		}
	]
```


# System Functions
The following _case-sensitive_ `system functions` are available for configurable placeholder value substitution.  These are similar to [System Variables](#system-variables) but they take arguments.

|Function Name | Description |
|---|---|
| `dateformat(args)` | The current date or date part using format strings.  This function takes a single string argument which represents the moment.js compatible format string. |
| `filecreated(args)` | The file created date and time using format strings.  This function takes a single string argument which represents the moment.js compatible format string (surrounded in single or double quotes).  It can also be called without arguments to use the current locale date format. If the file created date cannot be determined it will return the current date and time (usually because the file has not yet been saved to disk, or the operating system failed to return the creation date and time). |

`filecreated` can also return the current locale date string by passing no arguments.  BOth the following will work:
```javascript
	<<filecreated()>>
	<<filecreated>>
```

The following examples would both output a date like `2017-04-14`
```javascript
    <<dateformat('YYYY-MM-DD')>>
    <<filecreated('YYYY-MM-DD')>>
```

And the following would both generate something like `Friday, April 14th 2017, 8:50:19 am`
```javascript
	<<dateformat('dddd, MMMM Do YYYY, h:mm:ss a')>>
	<<filecreated('dddd, MMMM Do YYYY, h:mm:ss a')>>
```

These functions use Moment.js and can use all [Moment.js format string options](http://momentjs.com/docs/#/displaying/format/).

# Configuration
It is quite possible to use this extension without making any changes to your VSCode's settings (although you probably want to set up a couple of variable values like author and company at least).  Extensive configuration options are available should you wish to get your hands dirty.

There are some specific settings that you must setup if you want to use the [Change Log](#change-log) feature.

Settings can be added as User and/or Workspace and/or WorkspaceFolder settings - VSCode handles the majik of merging them together.  Workspace Folder settings take precedence over Workspace settings which take precedence over User settings (which in turn take precendce over Default values).

When generating a header, the extension will do the following for the language-specific settings (`psi-header.lang-config` and `psi-header.templates`):
1. Start with the built in defaults.
2. If there is a configuration setting that matches the document language, options set there will overwrite those from the default; else
3. If there is a global configuration (`language = "*"`), options set there will overwrite those from the default.

Intellisense is provided for the options within the user and workspace settings files in VSCode.

The configuration settings are organised into the following areas described below:
* `psi-header`:
  * `config`: global configuration settings;
  * `changes-tracking`: settings relates to changes tracking;
  * `variables`: an array of key/value pairs for variable substitution values;
  * `lang-config`: an array of language-specific (and general) settings (comment styles, etc)
  * `templates`: an array of language-specific (and general) header templates.

## Global Options
Options that affect the whole extension.  In some cases these defaults can be overridden within specific language configurations.

*_Configuration Section:_* `psi-header.config`.

| Option | Description |
|---|---|
| `forceToTop` | If true, it will ignore the current cursor position and insert the header at the top of the document. If false (the default), the header will be inserted at the current cursor position. Can be overridden for specific languages (via *_psi-header.lang-config_*). |
| `blankLinesAfter` | Specify how many blank lines to insert after the header comment block.  Default is 0 (zero). |
| `license` | The SPDX License ID of the license to insert into the header (or `"Custom"` if providing your own license text). Refer to [License Information](#license-information) for details. |
| `author` | Your name - used by the `author` system variable.  Optional with no default. |
| `initials` | Your initials - used by the `initials` system variable.  Optional with no default. |
| `authorEmail` | Your email address - used by the `authoremail` system variable.  Optional with no default. |
| `company` | Your Company's name - used by the `company` system variable.  Optional with no default. |
| `copyrightHolder` | Your copyright name - used by the `copyrightholder` system variable.  Optional with no default. |

## Changes Tracking Configuration
Options that affect changes tracking.

*_Configuration Section:_* `psi-header.changes-tracking`.

| Option | Description |
|---|---|
| `isActive` | If true, will activate changes tracking which will analyse every file during save.  Default value is false. |
| `modAuthor` | Identifies the label used on the comment line where the _modified by_ value is shown.  Default value is "Modified By:". |
| `modDate` | Identifies the label used on the comment line where the _date modified_ value is shown.  Default value is "Last Modified:". |
| `modDateFormat` | The format string for the modified date value.  Valid values are either "date" (system date - same as the `date` system variable) or a [Moment.js format string](http://momentjs.com/docs/#/displaying/format/).  The default value is "date".  Note that this setting is ignored if `modDate` line is based on a custom string. |
| `include` | Defines an array of VSC language IDs for the file types to include in changes tracking.  The default is an empty array which indicates any file type. |
| `includeGlob` | Defines an array of file globs for the files to include in changes tracking.  The default is an empty array which indicates any file. |
| `exclude` | Defines an array of VSC language IDs for the file types to exclude from changes tracking.  The default is an empty array which indicates no exclusions. |
| `excludeGlob` | Defines an array of file globs for the files to exclude from changes tracking.  The default is an empty array which indicates no exclusions. |
| `autoHeader` | Determines whether the header should be added automatically to *_new_* files.  Refer to the [Auto Header](#auto-header) section for details. |
| `enforceHeader` | Determines if the extension should automatically check the file and add a header whenever the file is saved if an existing header is not found.  This setting is independent of `autoHeader` and works best with `psi-header.config.forceToTop` set to `true` as otherwise any comment block is interpreted as a potential header.  |
| `replace` | An array of template line prefixes that define additional header lines to replace during a file save.  By way of example, you could use this to ensure that changes to file name or project name are always updated during save (it happens!). |


## Variable Values
An array of name/value pairs that provide value substitution within templates.  This can be used to override the system variables as well as add new items for your own custom templates.

*_Configuration Section:_* `psi-header.variables`.


## Language Configuration
An array of objects that allow language-specific adjustments to be made to the configuration.  You can provide a subset of values if you only want to override some of the settings. Each object can include the following options.

*_Configuration Section:_* `psi-header.lang-config`.

| Option | Description |
|---|---|
| `language` | Mandatory. Either the VSCode language ID or '*' for global settings. |
| `mapTo` | Optional.  If provided, this language will use the specified language's configuration (and the settings below will be ignored).  The value is a VSCode language ID.  You can not `mapTo` a language that itself has the `mapTo` value set.  Ignored if language = "*". |
| `begin` | Optional - defaults to `"/*"`. Determines the comment block opening text.  This will be inserted as a line before the first line of the template.  Refer to [Compact Mode](#-compact-mode) for information on headings with no begin and end lines. |
| `prefix` | Optional - defaults to `" * "`. Determines a prefix for each body line of the header. |
| `suffix` | Optional character(s) to form a line end suffix if you want [block-style comment headers](#-block-style-comment-headers). |
| `lineLength` | Optional - sets the default line length for [block-style comment headers](#-block-style-comment-headers). |
| `end` |  Optional - defaults to `" */"`. Determines the comment block closing text.  This will be inserted after the last line of the template.  Refer to [Compact Mode](#-compact-mode) for information on headings with no begin and end lines. |
| `forceToTop` | Optional. Same as *_psi-header.config.forceToTop_* but just for this language.  If set, this overrides the global setting. |
| `blankLinesAfter` | Optional. Same as *_psi-header.config.blankLinesAfter_* but just for this language.  If set, this overrides the global setting. |
| `beforeHeader` | Optional.  Allows multiple lines of text to be inserted before the beginning of the header comment block (e.g. pre-processor commands).  NOTE: The extenion will not add comment prefixes to this text, so you will need to include them in your text if necessary. |
| `afterHeader` | Optional.  Allows multiple lines of text to be inserted after the end of the header comment block (e.g. pre-processor commands).  This will appear after any configured `blankLinesAfter`.  NOTE: The extenion will not add comment prefixes to this text, so you will need to include them in your text if necessary. |
| `rootDirFileName` | Optional.  By default this extension looks for a file called `package.json` to determine the project's root path.  This allows you to also search for an additional file name that should exist in the root path.  The contents of the file are irrelevant (it can be a blank file).  Only really needed if you can't have a package.json file in your root path. |
| `modAuthor` | Optional. Overrides the [changes-tracking.modAuthor](##-changes-tracking-configuration) setting for this language.  Identifies the label used on the comment line where the _modified by_ value is shown.  There is no default value as by default the changes tracking setting will be used. |
| `modDate` | Optional. Overrides the [changes-tracking.modDate](##-changes-tracking-configuration) setting for this language.  Identifies the label used on the comment line where the _date modified_ value is shown.    There is no default value as by default the changes tracking setting will be used. |
| `modDateFormat` | Optional. Overrides the [changes-tracking.modDateFormat](##-changes-tracking-configuration) setting for this language.  The format string for the modified date value.  Valid values are either "date" (system date - same as the `date` system variable) or a [Moment.js format string](http://momentjs.com/docs/#/displaying/format/).    There is no default value as by default the changes tracking setting will be used.  Note that this setting is ignored if `modDate` line is based on a custom string. |
| `replace` | Optional. Overrides the [changes-tracking.replace](##-changes-tracking-configuration) setting for this language.  An array of template line prefixes that define additional header lines to replace during a file save.  If defined, the value here replaces the `replace` settings in `changes-tracking` for this language. |

## Templates
An array of template definitions.  Each definition must include either *_mapTo_* or *_template_*.  Includes the following options.

*_Configuration Section:_* `psi-header.templates`

| Option | Description |
|---|---|
| `language` | Mandatory. Either the VSCode language ID or '*' for the global template. |
| `mapTo` | Optional.  If provided, this language will use the specified language's template (and will ignore the following *_template_* value).  The value is a VSCode language ID.  You can not `mapTo` a language that itself has the `mapTo` value set.  Ignored if *_language = "*"_*. |
| `template` | This must be provided if *_mapTo_* is not declared.  Includes an array of strings that represent the body of the header.  No need to include the comment block syntax. |
| `changeLogCaption` | Mandatory if using the [Change Log](#change-log) feature.  Defines the caption for the change log that must also appear in the main header template.  The extension uses this caption to work out where to place a new change log entry. |
| `changeLogHeaderLineCount` | Used in the [Change Log](#change-log) feature to define the number of lines in the main template between the above _changeLogCaption_ and the log entries.  This can be used to configure the main template to include column headings for the change log.  Defaults to 0 if not provided. |
| `changeLogItemTemplate` | The template for a change log entry.  Allows overriding of the default item template. |
| `psi-header.license-text` | Optional.  The license text to use where *_psi-header.config.license = "Custom"_*. |

*_NOTE:_*   Also, `mapTo` is ignored if the language value is set to "*".

# Compact Mode
The header can be created in `"compact mode"` - that is, without begin and end lines on the comment block. To activate this, you *must* set both the `lang-config.begin` *and* `lang-config.end` configuration values to an empty string for any language where you want this behaviour.  You can do this on the default language configuration (`lang-config.language = "*"`) to apply to all languages.  Obviously this will cause the header to work like a series of single line comments, so you must also make sure that the `lang-config.prefix` property is set to a valid single line comment prefix.

Also note that the change tracking will not auto-insert a header in compact mode if there are any lines in the file that start with the `lang-config.prefix`.

Again, this will only work if both the `lang-config.begin` *and* `lang-config.end` configuration values are present and set to an empty string.

Example language configuration:
```javascript
	"psi-header.lang-config": [
		{
			"language": "javascript",
			"begin": "",
			"end": "",
			"prefix": "// "
		}
	]
```

# Block-Style Comment Headers
You can create block-style comment headers using the `psi-header.lang-config`'s `suffix` setting, and optionally the `lineLength` setting.  This can be used to provide a header in the following format:
```
 ###############################################################################
 # File: \Users\me\Development\psioniq\myProject\src\myPrecious.xyz            #
 # Project: \Users\me\Development\psioniq\myProject                            #
 # Created Date: Saturday December 31 2016                                     #
 # Author: Arthur Bodkin, esq                                                  #
 # -----                                                                       #
 # Last Modified: Sunday January 01 2017                                       #
 # Modified By: Tammy Bodkin                                                   #
 # -----                                                                       #
 # Copyright (c) 2016 psioniq Global Enterprises, Inc                          #
 ###############################################################################
```
To use block-style just add a non-blank `suffix` property to any language where you want this feature (or add it to the default '*' language configuration).  The suffix must be one or more characters long in order for this to work.

You can also influence how long each line is by setting the `lineLength` property for the language.  If this is not set, the extension will attempt to use the current editor value (`wordWrapColumn`) or will otherwise default to 80.

When working out the line length, the extension will take account of any tab characters in the line.

The extension will not attempt to wrap lines that are already longer than the line length.  It also does not add the suffix to the beginning and end lines or to change history lines.

# A Note about Project Paths
When this extension was originally written VSCode only supported opening a single directory in a workspace.  So, working out the root directory was reasonably simple - life was good!  However, now with Multi Root Workspaces we can no longer assume the root directory (infact Microoft has deprecated the method that returned the root directory).

Therefore, placeholders that need to know the project root directory (`filerelativepath`, `projectpath` and `projectname`) try to work it out by iterating up the directory structure (starting at the current editor file location) until they come to a package.json file or a filename set in the `psi-header.lang-config.rootDirFileName` configuration setting.  If either one is found then its location is assumed to be the root - otherwise it just assumes the same directory as the edited file.

# License Information
The `psi-header.config.license` setting expects either a valid [SPDX license ID](https://spdx.org/licenses/) or `"Custom"` if you are providing your own license text.  When set to Custom, you need to provide the license text via the `psi-header.license-text` setting.

The extension does some clean up of the SPDX license text (mapping to variables, etc) but not everything is cleaned.  In particular, a number of licenses use a placeholder logic based on `<<var;...>>` that this extension does not try to convert at this stage - and some licenses have placeholder text like `<insert your slartibartfast here.  We wore an onion on our belt because that was the fashion of the day>`.  If you find hokey little anomolies that can be dealt with, let me know.  Otherwise, I suggest you copy the license text into your custom license settings and fix it there.

# Changes Tracking
This extension can optionally track changes to files during save by writing the last modified date and/or user to the header comment block.  It does this by looking for specific text (ignoring initial whitespace) at the start of individual lines within the header, and replacing the whole line.  It will only search the first multi-line comment block within each file.

It works when saving either single or multiple files (e.g. during a *_Save All_*).  It will only update the details if VSC reports the document as "dirty".

By default change tracking processes every dirty file on save.  You can restrict which files are processed via the `psi-header.changes-tracking` properties:
* `include`: an array that provides a whitelist of language file types to include;
* `exclude`: an array that provides a blacklist of language file types to exclude;
* `includeGlob`: an array that provides a whitelist of file globs to include;
* `excludeGlob`: an array that provides a blacklist of file globs to exclude.

The extension uses the following logic to work out whether to change-track the current file:
* if both `include` and `includeGlob` are null or empty then any file can be included.  However, if either (or both) `include` or `includeGlob` are not empty then only files that satisfy the non-empty whitelist(s) can be included; then
* if the current file satisfies the above criteria, the extension will test to make sure the file is not covered by the `exclude` and `excludeGlob` settings.

By default changes tracking is disabled - you can activate it via the `psi-header.changes-tracking.isActive` boolean configuration property.

Early versions of the extension simply replaced everything after the line identifier.  However, from version 1.1.3 you can use the template to customise the whole line. These two options are described below.

## Option 1 Simple Replacement
It will look for lines within the header that start with `languageCommentPrefix + trimStart(label)` (e.g. "` * Date Modified:`" or "` * Modified By:`") and will replace the _whole_ line with `languageCommentPrefix + label + newValue`.  Where:
* `languageCommentPrefix` is the comment line prefix for the document's language (`psi-header.lang-config[language].prefix`);
* `label` is either:
  * the configured `psi-header.changes-tracking.modAuthor` (defaults to "Modified By:"); or
  * the configured `psi-header.changes-tracking.modDate` (defaults to "Date Modified:").
* and `newValue` is either:
  * the author's name (same logic as the `author` system variable); or
  * the current date formatted via the configured `psi-header.changes-tracking.modDateFormat` (refer to the configuration settings for details).

Note that it will replace the whole line so is not suitable for lines where you want to control the text of the line.

Also, because the whole line is replaced, you need to make sure your label configuration includes all characters before the new value (e.g. the ":" in the above defaults).  Although, the extension will insert a space before the value if necessary.

So, taking the following example template from the beginning of the README:
```json
"psi-header.templates": [
	{
		"language": "*",
		"template": [
			"File: <<filepath>>",
			"Project: <<projectpath>>",
			"Created Date: <<filecreated('dddd MMMM Do YYYY')>>",
			"Author: <<author>>",
			"-----",
			"Last Modified:",
			"Modified By:",
			"-----",
			"Copyright (c) <<year>> <<company>>"
		]
	},
]
```

Let's say Uncle Jack Bodkin modified the file three days after Tammy, then (assuming default values) the header would look like the following after save:
```javascript
/*
 * File: \Users\me\Development\psioniq\myProject\src\myPrecious.js
 * Project: \Users\me\Development\psioniq\myProject
 * Created Date: Saturday December 31 2016
 * Author: Arthur Bodkin, esq
 * -----
 * Last Modified: Tuesday January 03 2017
 * Modified By: Uncle Jack Bodkin
 * -----
 * Copyright (c) 2016 psioniq Global Enterprises, Inc
 */
```

NOTE: What is important in the above is that there is no text beyond the label in the template for the two lines we are replacing.

## Option 2 Template Substitution
If there are any characters in the template on either of the comment lines after the `label` then the extension will preserve it during the update.  You can include text as well as any of the system variables and functions.

You can also use this method to update other lines from the template via the `psi-header.changes-tracking.replace` array.  The array holds strings that represent the beginning of the line from the template (excluding the line prefix) - you just need to include enough characters from the beginning of the line to ensure uniqueness.

Note that the `psi-header.changes-tracking.modDateFormat` configuration setting is ignored when using this option.

So, modifying the `"Last Modified:"` and `"Modified By:"` lines in the template from the earlier example in _Option 1_,

```json
"psi-header.templates": [
	{
		"language": "*",
		"template": [
			"File: <<filepath>>",
			"Project: <<projectpath>>",
			"Created Date: <<filecreated('dddd MMMM Do YYYY')>>",
			"Author: <<author>>",
			"-----",
			"Last Modified: <<filecreated('dddd MMMM Do YYYY h:mm:ss a')>>",
			"Modified By: the developer formerly known as <<author>> at <<<authoremail>>>",
			"-----",
			"Copyright (c) <<year>> <<company>>"
		]
	},
]
```

Because there is now text after the labels on these lines, the extra text is used to generate the following output:
```javascript
/*
 * File: \Users\me\Development\psioniq\myProject\src\myPrecious.js
 * Project: \Users\me\Development\psioniq\myProject
 * Created Date: Saturday December 31 2016
 * Author: Arthur Bodkin, esq
 * -----
 * Last Modified: Tuesday January 03 2017 09:37:28 am
 * Modified By: the developer formerly known as Uncle Jack Bodkin at <uncle.jack@psioniq.net>
 * -----
 * Copyright (c) 2016 psioniq Global Enterprises, Inc
 */
```


# Auto Header
This extension can be configured to automatically add a file header on creating a new file via the `psi-header.changes-tracking.autoHeader` setting.  The valid values for this setting are:
* `off`: (default) headers will not be added to new files automatically;
* `manualSave`: a header will be added but the file will not be automatically saved; or
* `autoSave`: the header will be added and the file immediately saved.

It will only create headers for *_new_* files added directly via VSCode.  To insert a header in any file during save, set `psi-header.changes-tracking.enforceHeader` option to true.  `enforceHeader` will scan the file during save to check if there is a header - it works best with `psi-header.config.forceToTop` set to true, otherwise any comment block in the file could be interpreted as a header.

If the file is added via the `New File` icon in the `Explorer` the header will be created immediately.  However, if the file is created via the `File->New File` menu item or via `Ctrl/Cmd-N` the header will not be added _until you perform a physical save_.  Why?  Mainly because we do not know what language the file will use until it is saved.  The extension will not add a header to a new file that already contains a multi-line comment block.

The auto header configuration will honour the `include`, `exclude`, `includeGlob` and `excludeGlob` settings under `psi-header.changes-tracking`.

# Change Log
This feature allows you to add change log entries to the header to record major changes to the current file.  It provides a template for each change log entry and you then just add your own comments.  By default it is configured to record the date and initials of the user to which you can add a short comment, but you can configure it to your needs.

Entries are added immediately after the Caption Line (described in the configuration section below) with the most recent entries at the top.

To insert an entry into the change log, just hit `ctrl-alt-C ctrl-alt-C`.  Once inserted, the cursor will be placed at the end of the new log entry.

Note that the above call will fail if the template has not been correctly configured (see below) or if the document does not contain a header.

## Configuring Change Logging
To configure this you need to add a caption line to your `psi-header.templates[].template` which will enable the extension to insert new entries in the correct location.  This acts as a heading for the whole change log.  It is not possible to use this feature without this caption line.

Next, you need to tell the extension how to find this caption line via the `psi-header.templates[].changeLogCaption` setting which must include enough of the above-mentioned caption line text to be enable it to be found within the header.

You can also optionally add extra lines between the caption line and the change log entries via the `psi-header.templates[].changeLogHeaderLineCount` setting to add (for example) column headings for your entries.  This setting records the number of lines in your template in between the caption line and the log entries - it excludes the caption line itself.  This setting defaults to 0 (zero) - i.e. no extra lines.

Finally, the default log entry template is a single line with date then a TAB then initials then another TAB but you can create your own template via the `psi-header.templates[].changeLogEntryTemplate` setting - see examples below.

A simple example that just adds a caption to the header and uses the defaults for everything else is provided below:
```json
"psi-header.templates": [
	{
		"language": "*",
		"template": [
			"File: <<filepath>>",
			"Project: <<projectpath>>",
			"Created Date: <<filecreated('dddd MMMM Do YYYY')>>",
			"Author: <<author>>",
			"-----",
			"Last Modified: <<filecreated('dddd MMMM Do YYYY h:mm:ss a')>>",
			"Modified By: the developer formerly known as <<author>> at <<<authoremail>>>",
			"-----",
			"Copyright (c) <<year>> <<company>>"
			"-----",
			"HISTORY:"
		],
		"changeLogCaption": "HISTORY:"
	},
]
```
would give output similar to the following:
```javascript
/*
 * File: \Users\me\Development\psioniq\myProject\src\myPrecious.js
 * Project: \Users\me\Development\psioniq\myProject
 * Created Date: Saturday December 31 2016
 * Author: Arthur Bodkin, esq
 * -----
 * Last Modified: Tuesday January 03 2017 09:37:28 am
 * Modified By: the developer formerly known as Uncle Jack Bodkin at <uncle.jack@psioniq.net>
 * -----
 * Copyright (c) 2016 psioniq Global Enterprises, Inc
 * -----
 * HISTORY:
 * 2018-07-14	JB	Added a rabbit
 * 2018-05-12	AB	Fixed the type of bug that only a mother could love.
 */
```

Or for an example with a heading and custom template that uses a different date format and adds a blank line before each entry:
```json
"psi-header.templates": [
	{
		"language": "*",
		"template": [
			"File: <<filepath>>",
			"Project: <<projectpath>>",
			"Created Date: <<filecreated('dddd MMMM Do YYYY')>>",
			"Author: <<author>>",
			"-----",
			"Last Modified: <<filecreated('dddd MMMM Do YYYY h:mm:ss a')>>",
			"Modified By: the developer formerly known as <<author>> at <<<authoremail>>>",
			"-----",
			"Copyright (c) <<year>> <<company>>"
			"-----",
			"HISTORY:",
			"Date      \tBy\tComments",
			"----------\t---\t---------------------------------------------------------"
		],
		"changeLogCaption": "HISTORY:",
		"changeLogHeaderLineCount": 2,
		"changeLogEntryTemplate": [
			"",
			"<<dateformat(DD-MM-YYYY)>>\t<<initials>>\t"
		]
	},
]
```
would give output similar to the following:
```javascript
/*
 * File: \Users\me\Development\psioniq\myProject\src\myPrecious.js
 * Project: \Users\me\Development\psioniq\myProject
 * Created Date: Saturday December 31 2016
 * Author: Arthur Bodkin, esq
 * -----
 * Last Modified: Tuesday January 03 2017 09:37:28 am
 * Modified By: the developer formerly known as Uncle Jack Bodkin at <uncle.jack@psioniq.net>
 * -----
 * Copyright (c) 2016 psioniq Global Enterprises, Inc
 * -----
 * HISTORY:
 * Date      	By	Comment
 * ----------	---	-----------------------------------------------------------
 *
 * 14-07-2018	JB	Added a rabbit
 *
 * 12-05-2018	AB	Fixed the type of bug that only a mother could love.
 */
```

## Questions about Change Logs

### 7.2.1. Can this be configured to not have a caption line?
No.  The caption line is how the extension works out where to add the log entries.  You may have edited the header manually, so there is no easy way for the extension to map the raw template back to the edited header.

### 7.2.2. Can it be configured to automatically add a log entry?
No, because this would be extremely annoying if an entry was added every time the file was saved (which would then expect you to add a comment which would necessitate another save which would add another entry which would require you to add a comment which would...).

### 7.2.3. Can I have comments on a separate line?
Yes.  Just provide your own `psi-header.templates[].changeLogEntryTemplate` which allows you to define a multi line template.  You could add a log entry template something like:

```json
"psi-header.templates": [
	{
		...other settings...
		"changeLogEntryTemplate": [
			"<<dateformat(YYYY-MM-DD)>>  (<<author>>)",
			""
		]
	},
]
```

### 7.2.4. Why do I have to manually add the comment?
The most likely cause is that your Visual Studio Brain Implant(TM) module is not correctly configured for your instance of VSCode.  Try facing your computer and moving your head in a figure of eight pattern to establish a connection.  If this fails, move your fingers frantically up and down near the keyboard.

OR

I am not very good at working out what your comment should contain.

### 7.2.5. What if I need longer comments?
No problem.  Just add additional lines to your comment/entry.  New log entries are always added to the top of the log, so it doesn't care if you have changed the layout of earlier entries.

# An Example Custom Configuration
In the following example:
* Javascript and Typescript files will both use the custom template and configuration where `language = "javascript"`.
* Lua will use it's own custom configuration (`language="lua"`), but will use the global custom template (`language = "*"`).
* All other languages will use the global custom template (`language = "*"`) and the built in configuration settings because there is no custom global `psi-header.lang-config` defined.
* changes tracking is turned on, but will skip Markdown and JSON files.
* auto header creation is active, but will not save the file after inserting the heading.

```json
{
	"psi-header.config": {
		"forceToTop": true,
		"blankLinesAfter": 6,
		"license": "Custom"
	},
	"psi-header.changes-tracking": {
		"isActive": true,
		"modAuthor": "Modified By: ",
		"modDate": "Last Modified: ",
		"modDateFormat": "date",
		"include": [],
		"exclude": [
			"markdown",
			"json"
		],
		"excludeGlob": [
			"out/**",
			"src/**/*.xyz"
		],
		"autoHeader": "manualSave"
	},
	"psi-header.license-text": [
		"All shall be well and all shall be well and all manner of things shall be well.",
		"Nope...we're doomed!"
	],
	"psi-header.variables": [
		["company", "psioniq"],
		["author", "Arthur Bodkin"],
		["authoremail", "art@psioniq.uk"]
	],
	"psi-header.lang-config": [
		{
			"language": "lua",
			"begin": "--[[",
			"prefix": "--",
			"end": "--]]",
			"blankLinesAfter": 0
		},
		{
			"language": "python",
			"begin": "###",
			"prefix": "# ",
			"end": "###",
			"blankLinesAfter": 0,
			"beforeHeader": [
				"#!/usr/bin/env python3",
				"# -*- coding:utf-8 -*-"
			]
		},
		{
			"language": "javascript",
			"begin": "/**",
			"prefix": " * ",
			"end": " */",
			"blankLinesAfter": 2,
			"forceToTop": false
		},
		{
			"language": "typescript",
			"mapTo": "javascript"
		}
	],
	"psi-header.templates": [
		{
			"language": "*",
			"template": [
				"File: <<filepath>>",
				"Project: <<projectpath>>",
				"Created Date: <<filecreated('dddd, MMMM Do YYYY, h:mm:ss a')>>",
				"Author: <<author>>",
				"-----",
				"Last Modified: ",
				"Modified By: ",
				"-----",
				"Copyright (c) <<year>> <<company>>"
				"",
				"<<licensetext>>",
				"-----"
				"HISTORY:",
				"Date      \tBy\tComments",
				"----------\t---\t----------------------------------------------------------"
			],
			"changeLogCaption": "HISTORY:",
			"changeLogHeaderLineCount": 2,
			"changeLogEntryTemplate": [
				"<<dateformat('YYYY-MM-DD')>>\t<<initials>>\t"
			]
		},
		{
			"language": "javascript",
			"template": [
				"File: <<filepath>>",
				"Project: <<projectpath>>",
				"Created Date: <<filecreated('dddd, MMMM Do YYYY, h:mm:ss a')>>",
				"Author: <<author>>",
				"-----",
				"Last Modified: ",
				"Modified By: ",
				"-----",
				"Copyright (c) <<year>> <<company>>",
				"------------------------------------",
				"Javascript will save your soul!"
			]
		},
		{
			"language": "typescript",
			"mapTo": "javascript"
		}
	]
}
```

# Creating a Custom Template
This should be mostly obvious.  The configuration of this extension separates out the syntactical language elements (comment Begin, comment End, etc) from the body of the template so that hopefully you will only need to create a single template.

For the variable placeholders, the variable names should be surrounded with `<<` and `>>`. Do not add the prefix and suffix to your custom variable declarations!  So in the template, the system variable `filepath` is written `<<filepath>>`. Easy, huh!

The default (built in) template is:
```javascript
[
    "Filename: <<filepath>>",
    "Path: <<projectpath>>",
    "Created Date: <<filecreated('dddd, MMMM Do YYYY, h:mm:ss a')>>",
    "Author: <<author>>",
    "",
    "Copyright (c) <<year>> <<company>>"
]
```
...which, when rendered would produce the following (assuming JS):

```javascript
/*
 * Filename: \Users\me\Development\psioniq\myProject\src\myPrecious.js
 * Path: \Users\me\Development\psioniq\myProject
 * Created Date: Saturday, December 31st 2016, 10:27:35 am
 * Author: David Quinn
 *
 * Copyright (c) 2016 psioniq Global Enterprises, Inc
 */
```

# Known Issues
* Refer to [License Information](#-license-information) for the extension's limitations on cleaning up SPDX license text.

To report bugs, issues, suggestions: email `info@psioniq.uk`


# Credits
This extension uses the following npm packages...thank you :):
* [`spdx-license-list`](https://github.com/sindresorhus/spdx-license-list) to host the licenses.
* [`wordwrap`](https://github.com/substack/node-wordwrap) to word wrap the licenses.
* [`momentJs`](http://momentjs.com) for date parameter values.
* [`username`](https://github.com/sindresorhus/username) to get the default author name.
* [`minimatch`](https://github.com/isaacs/minimatch) to process the include and exclude globs for changes tracking.
