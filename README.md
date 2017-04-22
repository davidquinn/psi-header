# psioniq File Header

This VSCode Extension will insert a header into the current document - either at the start of the document
or at the current cursor position. The header can be configured globally and/or per language.
However, the configuration separates the comment syntax from the template body so it is likely that
a single template will be able to cover most languages.

It can also log the last modified (user and date) via the change tracking feature which will update the header whenever the file is saved.

To report bugs, issues, suggestions: email `info@psioniq.uk`

Here is a sample output:

```javascript
/**
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

To run the extension, either:
* thump `F1` and type `Header Insert`; or
* type the keyboard shortcut `ctrl-alt-H` then `ctrl-alt-H`.

## Features

Refer to [Extension Settings](#extension-settings) for configuration details.

* Adds a genric or language-specific header at the current cursor location.
* Separates language specific elements (e.g. comment block begin and end) from the template body to minimise the number of templates you might need to manage.
* Configuration option to force the header to the top of the document - overridable per language.
* Configuration option to add additional blank lines after the header - overridable per language.
* Provides a default template body for all languages out of the box.
* Provides language-specific syntax settings (e.g. comment block syntax) out of the box.
* Configure your own custom language syntax globally and/or per language.
* Create your own custom templates - global and/or per language.
* Map custom templates across languages so you only need to enter the template body once.
* Map custom language syntax settings across languages so you only need to enter the settings once.
* Provides the following case-insensitive `system variables` for placeholder value substitution:
  * `date`: inserts the current date using the current locale (see also dateformat() system function below).
  * `time`: inserts the current time using the current locale.
  * `year`: inserts the current year.
  * `filepath`: inserts the fully-qualified name of the file.
  * `filename`: just the file name without the path details.
  * `projectpath`: inserts the fully-qualified path to the root directory of the project.
  * `projectname`: Attempts to read package.json for either a displayName or name property.
  * `company`: the name of your company.  In this release it defaults to "Your Company".
  * `author`: the name of the file author.  In this release it defaults to "You".
  * `authoremail`: the email address of the file author.  In this release it defaults to "you@you.you".
  * `licensetext`: the full text of the license. This is determined automatically.
  * `copyrightholder`: used in some licenses. If not provided it defaults to the same value as `company`.
  * `licensename`: The name of the license. If not using a custom license, this is determined automatically.
  * `licenseurl`: The url for the license. If using not using a license, this is determined automatically.
  * `spdxid`: The SPDX License ID for the license. If not using a custom license, this is determined automatically.
* Provides the following _case-sensitive_ `system functions` for configurable placeholder value substitution:
  * `dateformat(args)`: inserts a date or date part using format strings (see [dateformat System Function](#dateformat-system-function) for more details).
* Allows the overriding of system variable values with static global values within the configuration.
* Create an unlimited number of custom static variables for use throughout your custom templates.
* Can be run via a the key shortcut `ctrl+alt+H` then `ctrl+alt+H`.
* Can automatically insert license text based on SPDX license IDs.
* Can optionally record changes in the header each time the file is saved (see [Changes Tracking](#changes-tracking)).

## Dependencies

No requirements or dependencies.

## Extension Settings

It is quite possible to use this extension without making any changes to your VSCode's settings (although you probably want to set up a couple of variable values like author and company at least). 
Extensive configuration options are available should you wish to get your hands dirty.

Settings can be added as User and/or Workspace settings - VSCode handles the majik of merging them together.  Workspace settings take precedence over User settings.

* `psi-header.config`: Some global defaults:
  * `forceToTop`: If true, it will ignore the current cursor position and insert the header at the top of the document.
	If false (the default), the header will be inserted at the current cursor position.
	Can be overridden for specific languages (via *_psi-header.lang-config_*).
  * `blankLinesAfter`: Specify how many blank lines to insert after the header comment block.  Default is 0 (zero).
  * `license`: The SPDX License ID of the license to insert into the header (or "Custom" if providing your own license text).  Refer to [License Information](#license-information) for details.
* `psi-header.changes-tracking`: configuration for changes tracking:
  * `isActive`: If true, will activate changes tracking which will analyse every file during save.  Default value is false.
  * `modAuthor`: Identifies the label used on the comment line where the _modified by_ value is shown.  Default value is "Modified By: ".
  * `modDate`: Identifies the label used on the comment line where the _date modified_ value is shown.  Default value is "Last Modified: ".
  * `modDateFormat`: The format string for the modified date value.  Valid values are either "date" (system date - same as the `date` system variable) or a [Moment.js format string](http://momentjs.com/docs/#/displaying/format/).  The default value is "date".
  * `include`: Defines an array of VSC language IDs for the file types to include in changes tracking.  The default is an empty array which indicates any file type.
  * `exclude`: Defines an array of VSC language IDs for the file types to exclude from changes tracking.  The default is an empty array which indicates no exclusions.
* `psi-header.variables`: An array of name/value pairs that provide value substitution within templates.  This can be used to override the system variables as well as add new items for your own custom templates.
* `psi-header.lang-config`: An array of objects that allow language-specific adjustments to be made to the configuration.  You can provide a subset of values if you only want to override some of the settings. Each object can include:
  * `language`: Mandatory. Either the VSCode language ID or '*' for global settings.
  * `mapTo`: Optional.  If provided, this language will use the specified language's configuration (and the settings below will be ignored).  The value is a VSCode language ID.  Ignored if language = "*".
  * `begin`: Optional. Determines the comment block opening text (e.g. "/*").  This will be inserted as a line before the first line of the template.
  * `prefix`: Optional. Determines a prefix for each body line of the header (e.g. " * ").
  * `end`:  Optional. Determines the comment block closing text (e.g. " */").  This will be inserted after the last line of the template.
  * `forceToTop`: Optional. Same as *_psi-header.config.forceToTop_* but just for this language.  If set, this overrides the global setting.
  * `blankLinesAfter`: Optional. Same as *_psi-header.config.blankLinesAfter_* but just for this language.  If set, this overrides the global setting.
* `psi-header.templates`: An array of template definitions.  Each definition must include either *_mapTo_* or *_template_*.  Includes:
  * `language`: Mandatory. Either the VSCode language ID or '*' for the global template.
  * `mapTo`: Optional.  If provided, this language will use the specified language's template (and will ignore the following *_template_* value).  The value is a VSCode language ID.  Ignored if *_language = "*"_*.
  * `template`: This must be provided if *_mapTo_* is not declared.  Includes an array of strings that represent the body of the header.  No need to include the comment block syntax.
* `psi-header.license-text`: Optional.  The license text to use where *_psi-header.config.license = "Custom"_*.

Intellisense is provided for the above within the user and workspace settings files in VSCode.

When generating a header, the extension will do the following for the language-specific settings (`psi-header.lang-config` and `psi-header.templates`):
1. If there is a configuration that matches the document language then that is used; else
2. If there is a global configuration (`language = "*"`) that will be used; else
3. Use the built in defaults. 

### A Note About 'mapTo'

The `mapTo` option provided under `psi-header.lang-config` and `psi-header.templates` will not endlessly iterate through a chain of mappings to find the ultimate target.
It assumes that you are pointing it to a language that has a valid configuration.

Also, `mapTo` is ignored if the language value is set to "*".

## dateformat System Function

This function requires an argument that defines the format string.  In other respects it works like the other system variables.

The following example would output a date like `2017-04-14`
```javascript
    <<dateformat('YYYY-MM-DD')>>
```

And the following would generate something like `Friday, April 14th 2017, 8:50:19 am`
```javascript
	<<dateformat('dddd, MMMM Do YYYY, h:mm:ss a')>>
```

__Important Notes:__
* System functions are case-sensitive because the format string arguments require this;
* The format string argument must be surrounded by quotes (single or double).

The dateformat function uses Moment.js and passes the function argument as a string to moment().function(String).  The format string can use all [Moment.js format string options](http://momentjs.com/docs/#/displaying/format/).

## License Information

The `psi-header.config.license` setting expects either a valid [SPDX license ID](https://spdx.org/licenses/) or `"Custom"` if you are providing your own license text.
When set to Custom, you need to provide the license text via the `psi-header.license-text` setting.

## Changes Tracking

This extension can optionally track changes to files during save by writing the last modified date and/or user to the header comment block.  It does this by looking for specific text at the start of individual lines within the header, and replacing the whole line.  It will only search the first multi-line comment block within each file.

It works when saving either single or multiple files (e.g. during a *_Save All_*).  It will only update the details if VSC reports the document as "dirty".

It will look for lines within the header that start with `languageCommentPrefix + label` (e.g. "` * Date Modified: `" or "` * Modified By: `") and will replace the _whole_ line with `languageCommentPrefix + label + newValue`.  Where:
* `languageCommentPrefix` is the comment line prefix for the document's language (`psi-header.lang-config[language].prefix`);
* `label` is either:
  * the configured `psi-header.changes-tracking.modAuthor` (defaults to "Modified By: "); or
  * the configured `psi-header.changes-tracking.modDate` (defaults to "Date Modified: ").
* and `newValue` is either:
  * the author's name (same logic as the `author` system variable); or
  * the current date formatted via the configured `psi-header.changes-tracking.modDateFormat` (refer to the configuration settings for details).

Note that it will replace the whole line so is not suitable for lines with additional text after the value (or between the label and value).

Also, because the whole line is replaced, you need to make sure your label configuration includes all characters before the new value (e.g. the ": " in the above defaults).

So, taking the example from the beginning of the README, let's say Uncle Jack Bodkin modified the file two days after Tammy, then (assuming default values) the header would look like the following after save:

```javascript
/**
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

When enabled, change tracking processes every file on save.  You can restrict which files are processed via the `psi-header.changes-tracking` properties `include` and `exclude`.  The first defines a whitelist of language file types to include, whilst the second is a blacklist of language file types to exclude.

By default this functionality is disabled - you can activate it via the `psi-header.changes-tracking.isActive` boolean configuration property.

## An Example Custom Configuration

In the following example:
* Javascript and Typescript files will both use the custom template and configuration where `language = "javascript"`. 
* Lua will use it's own custom configuration (`language="lua"`), but will use the global custom template (`language = "*"`).
* All other languages will use the global custom template (`language = "*"`) and the built in configuration settings because there is no custom global `psi-header.lang-config` defined.
* changes tracking is turned on, but will skip Markdown and JSON files.
 

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
		]
	},
	"psi-header.license-text": [
		"All shall be well and all shall be well and all manner of things shall be well.",
		"We're doomed!"
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
				"Created Date: <<date>>",
				"Author: <<author>>",
				"-----",
				"Last Modified: ",
				"Modified By: ",
				"-----",
				"Copyright (c) <<year>> <<company>>"
				"",
				"<<licensetext>>"
			]
		},
		{
			"language": "javascript",
			"template": [
				"File: <<filepath>>",
				"Project: <<projectpath>>",
				"Created Date: <<date>>",
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


## Creating a Custom Template

This should be mostly obvious.  The configuration of this extension separates out the syntactical language elements (comment Begin, comment End, etc) from the body of the template so that hopefully you will only need to create a single template.

For the variable placeholders, the variable names should be surrounded with `<<` and `>>`. Do not add the prefix and suffix to your custom variable declarations!
So in the template, the system variable `filepath` is written `<<filepath>>`. Easy, huh!

The default (built in) template is:
```javascript
[
    "Filename: <<filepath>>",
    "Path: <<projectpath>>",
    "Created Date: <<date>>",
    "Author: <<author>>",
    "",
    "Copyright (c) <<year>> <<company>>"
]
```
...which, when rendered would produce the following (assuming JS):

```javascript
/**
 * Filename: \Users\me\Development\psioniq\myProject\src\myPrecious.js
 * Path: \Users\me\Development\psioniq\myProject
 * Created Date: Saturday December 31 2016
 * Author: David Quinn
 *
 * Copyright (c) 2016 psioniq Global Enterprises, Inc
 */
```

## Known Issues

* The extension does some clean up of the SPDX license text (mapping to variables, etc) but not everything is cleaned.  In particular, a number of licenses use a placeholder logic based on `<<var;...>>` that this extension does not try to convert at this stage - and some licenses have placeholder text like `<insert your slartibartfast here.  We wore an onion on our belt because that was the fashion of the day>`.  If you find hokey little anomolies that can be fixed, let me know.  Otherwise, I suggest you copy the license text into your custom license settings and fix it there.

To report bugs, issues, suggestions: email `info@psioniq.uk`


## Credits

This extension uses the following npm packages:
* [`spdx-license-list`](https://github.com/sindresorhus/spdx-license-list) to host the licenses.
* [`wordwrap`](https://github.com/substack/node-wordwrap) to word wrap the licenses.
* [`momentJs`](http://momentjs.com) for date parameter values.
