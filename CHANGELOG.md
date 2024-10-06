# Change Log
All notable changes to the "psi-header" extension will be documented in this file.

Report bugs, issues, suggestions at https://github.com/davidquinn/psi-header

## 1.23.1 (06 October 2024)
*__FIX__*: New system function `padline` to pad the end of a single line with a specified character.

## 1.23.0 (10 May 2024)
*__NEW__*: New system function `padline` to pad the end of a single line with a specified character.

## 1.22.2 (11 December 2023)
*__DOCUMENTATION__*: Fixed an erroneous code sample in the *Configuration* section that incorrectly represented how custom variables are added to the `psi-header.variables` configuration.

## 1.22.1 (10 October 2023)
*__DOCUMENTATION__*: Fixed erroneous reference to `changeLogItemTemplate` in README.md - should be `changeLogEntryTemplate`. Also, fixed example code that did not add quotes around the format string parameter for the `dateformat()` system function. There are no code changes to the extension.

## 1.22.0 (17 August 2023)
*__NEW__*: New feature to set "system" default values for the properties of each `lang-config` and `templates` configuration. 

Prior to this release, the default values for a `lang-config` were hard coded as: `{"begin": "/*", "prefix": " *", "end": " */"}` with everything else being left undefined. This feature allows you to add a new `lang-config` entry `"language": "*DEFAULTS*"` which will enable you to define your own "system" default values for any of the config settings (not just the ones above). Any property not provided here (or provided as `null`) will fallback to its hard-coded system default.

Similarly, the extension previously defined defaults for a `templates` entry that result in a basic template without a changes log. This feature allows you to add a new `templates` entry `"language": "*DEFAULTS*"` which will enable you to define your own "system" default values. You can define default values for any of the`templates` properties. Any property not provided here (or provided as `null`) will fallback to its hard-coded system default.

Obviously, any language-specific (or `"language": "*"`) entry you have added will use the values you provide to override the above default values. 

There should not be any change to pre-1.22.0 behaviour if you do not specifically add this new defaults configuration to your existing VSCode setup.

So, *__BE CAREFUL!__* The `"*DEFAULTS*"` entry overrides the previous system default values. So it may affect headers for languages you currently use if you add this to an existing VSCode setup. Unless you have a burning desire to change the system defaults, you probably do not need this new feature.

## 1.21.4 (18 July 2023) - Documentation change only.
*__DOCUMENTATION__*: Fixed an erroneous code sample in the *Changes Tracking - Option 2 Template Substitution* section. It erroneously had the `replace` array in the `templates` section when it should have been in either the `changes-tracking` or `lang-config` sections. The rest of the text in that section was however correct.

## 1.21.3 (06 July 2023)
*__FIX__*: Removed a debug comment that was written to the console :(.

## 1.21.2 (06 July 2023)
*__FIX__*: Fixed issue inserting a change log entry where natural order is used and the prefix and suffix are the same.

## 1.21.1 (06 March 2023)
*__FIX__*: Fixed an issue with `includeGlob` and `excludeGlob` that was introduced a few years back when Microsoft removed the concept of "root location" from VSC Workspaces. The consequence was that a glob could no longer start with a dot to indicate a relative location. It is now possible to select files in the project root with glob patterns like: `./myfile.json` or `./**/myfile.json` or `**/myfile.json`. Originally the first 2 worked but after the MS change only the 3rd one worked, now all 3 should work.

## 1.21.0 (29 October 2022)
*__NEW__*: New system variable <<projectslug>> that provides a version of projectname for use in url's and links.
*__FIX__*: Removed the logic from the changesTrackingController that attempts to maintain the pre-save selections for the current text editor. This logic was causing an error because the selections have been made readonly in the VSC API. VSC appears to correctly handle this itself now.

## 1.20.0 (29 August 2022)
*__MAINT__*: Updated dependencies for various packages. No functionality or other code changes.

## 1.19.1 (13 July 2022)
*__NEW__*: Added new system variables `fullpath` and `relativepath` to return the (full or relative) path without filename. `relativepath` is relative to the project base (which will usually be the `project.json` file or the file name identified via the `psi-header.lang-config.rootDirFileName` configuration setting).

## 1.19.0 (30 April 2022)
*__FIX__*: Fixed an issue where information for the wrong file could be applied to the header when saving a file that was not the active document. Relates to [Issue 21](https://github.com/davidquinn/psi-header/issues/21).

## 1.18.0 (07 March 2022)
*__NEW__*: Added `"spacesBetweenYears"` config option.

## 1.17.0 (12 January 2022)
*__CHANGE__*: Changed the startup behaviour of the extension so that it is activated *_after_* VSCode completes its startup routines. This should stop performance reports being generated by VSCode for the extension on some systems.
*__FIX__*: Fixed an error that could occur if the header is added to a new file that has never been saved to disk.

## 1.16.0 (28 Dec 2021)
*__NEW__*: "!P" suffix on `yeartoyear` function parameters causes the changes tracker to not update the value in existing header. Thanks to Andrew Schepler for the idea and work on this.

## 1.15.2 (16 May 2021)
*__FIX__*: Fix for github Issue #12. When using the `yeartoyear` function as a variable (i.e. without brackets), it was not returning a single year where the from and to years were the same.

## 1.15.1 (25 February 2021)
No changes to functionality
* Added example settings.json showing every configuration option.

## 1.15.0 (24 February 2021)
No changes to functionality
* Added source to GitHub.
* Added explicit LICENSE.txt file.

## 1.14.1 (19 September 2020)
Just some extra documentation around 1.14.0.

## 1.14.0 (19 September 2020)
*__NEW__*: Template and Language Configurations can now be defined by file extension.
*__NEW__*: Variable substitution text can be forced to upper or lowercase.

## 1.13.1 (08 August 2020)
*__FIX__*: Got rid of recalcitrant console.log entry...oops!

## 1.13.0 (08 August 2020)
*__NEW__*: New system function `yeartoyear(from, to)` to generate year text for copyright message.

## 1.12.0 (18 July 2020)
*__NEW__*: The before and after areas of the header (defined for a specific language via `psi-header.lang`) can now contain system varibles. Note however though that this only works when first adding the header and they are not reprocessed on subsequent file saves.

## 1.11.1 (25 April 2020)
No new or changed functionality, just a couple of fixes for typos in the documentation.

## 1.11.0 (23 April 2020)
*__NEW__*: Added new configuration section `psi-header.license-reference` with options to add license text from a local file or add a link to an online license. These options are activated by setting the `psi-header.config.license` option to `CustomUri`.

## 1.10.0 (08 April 2020)
*__NEW__*: New `hostname` system variable to return the host name of the local machine. Uses os.hostname(), but the value can be overridden via the new `psi-header.config.hostname` setting.

## 1.9.1 (04 Jan 2020)
*__NEW__*: New changes tracking option `updateLicenseVariables` which will process the license variables during a changes tracking save.  Turn this on if your configuration causes updates to header lines that include any license variables.  By default this is not active because it is a fairly expensive operation to process the SPDX license data.

## 1.9.0 (04 Jan 2020)
*__NEW__*: New global configuration option `creationDateZero` to determine what to do where the OS returns Epoch Zero (1 Jan 1970) as file creation date.  Mainly affects Linux users who are editing files on an externally mounted NTFS partition.
*__FIX__*: Fixed a bug where the first and last lines of a compact comment block were not updated on change tracking updates.

## 1.8.3 (29 December 2019)
*__MAINT__*: Added Linux file creation time information to known issues (where Linux returns invalid creation date information).  There are no code changes.

## 1.8.2 (14 Nov 2019)
*__NEW__*: Extended the `author` system variable to attempt to retrieve fullname from the OS when determining author name.  The order of precedence is: `psi-header.config.author` then `fullname` then `username`.

## 1.8.1 (04 Nov 2019)
*__NEW__*: New filenamebase system variable returns the filename without the extension.

## 1.8.0 (10 Sept 2019)
*__NEW__*: New projectversion system variable to set the project version in a header.

## 1.7.4 (15 July 2017)
*__NEW__*: Integer setting `psi-header.templates[].changeLogFooterLineCount` used when `psi-header.templates[].changeLogNaturalOrder` is `true` to add lines between the bottom of the header and the log lines.

## 1.7.3 (14 July 2019)
*__NEW__*: Boolean setting `psi-header.templates[].changeLogNaturalOrder` allows change log entries to be shown in chronological order (latest entry last).  The change logs will always be added at the very end of the header.  Read overview for more information.

## 1.7.2 (21 June 2019)
*__FIX__*: Fixed a problem where this extension could be tricked into adding an extra header to the file during save. Added `psi-header.lang-config.ignoreLines` string array setting.  The save process will exclude lines that start with any of the included strings when trying to work out if the file already has a header (e.g. where auto-header and force header options are active).  Use this to get round the problem where the header should be at the top of the file but something has annoyingly auto-inserted lines above your carefully constructed header.  Also, blank lines at the top of the file are now ignored.  Many extensions could add lines to the top of your files, but the most common one is VSCode auto-adding the very first import statement above your existing header in javascript/typescript files.

## 1.7.1 (31 May 2019)
*__MAINT__: Just some extra info in the README around usage of the `enforceHeader` setting.  No changes to the extension functionality at all.

## 1.7.0 (29 May 2019)
*__NEW__: Added changes tracking option `enforceHeader` which will check the file during save and add a header to the file if none exists.  For this to work well you should ensure that the `forceToTop` global config option is TRUE as the logic scans the file looking for any comment blocks to determine if there is a header (it just assumes that the first comment block it finds is a header).  If `forceToTop` is true it won't keep searching the file beyond the first lines.

*__MAINT__*: Updated npm package dependencies for vscode, moment & mocha for audit warnings.

## 1.6.8 (13 May 2019)
*__CHANGE__: Changed the title of the extension within the VSCode Settings UI (from `Header Insert` to `psioniq File Header`).

## 1.6.7 (05 March 2019)
*__FIX__: Changes tracking will track changes for languages that are configured with an empty prefix for the comment lines.

## 1.6.6 (31 December 2018)
*__FIX__: Fixed problem with link to some headings in the README file when viewing the details in a browser (i.e. on the Visual Studio Marketplace website) caused by the Markdown to HTML conversion.
*__CHANGE__: Changes tracking will trim left whitespace when trying to find the `modAuthor`, `modDate` and `replace[]` settings in the template and in the header.  So you can now use spaces and tabs to indent your template and not have to add that whitespace to the abovementioned `changes-tracking` settings.

## 1.6.5 (29 December 2018)
*__FIX__: The block-style header now correctly reads the `lineLength` property if it is set.

## 1.6.4 (28 December 2018)
*__FIX__: Fixed a typo in the documentation.

## 1.6.3 (28 December 2018)
* __NEW__: Implemented ability to override the `changes-tracking.replace` setting within the language configuration.

## 1.6.2 (22 December 2018)
* __NEW__: Implemented ability to override the `changes-tracking` settings `modDate`, `modDateFormat` and `modAuthor` within the language configuration.
* __NEW__: Added default language config for `matlab`.

## 1.6.1 (21 December 2018)
* __NEW__: Implemented block-style comment headers.
* __MAINT__: Documentation review.

## 1.5.3 (30 September 2018)
* __MAINT__: Just an overdue bit of documentation clean up.

## 1.5.2 (26 September 2018)
* __FIX__: Try to force VSCode to install the minimatch library to get around the `command 'psi-header.insertFileHeader' not found` issue that some users reported.

## 1.5.1 (22 September 2018)
* __NEW__: You can now use file globs to determine which files to include/exclude from change tracking via the new `includeGlob` and `excludeGlob` settings under `psi-header.changes-tracking`.  These settings work in tandem with the existing `include` and `exclude` settings.
* __CHANGE__: The behaviour of changes tracking has changed slightly as a result of the glob enhancement above because we now have two dimensions of inclusion and exclusion (languageID and fileName).  Previously, if you provided both the `include` and `exclude` properties then the `exclude` would have been ignored (but you never did that did you because that would have been silly!).  This has now changed and the extension will process all includes followed by all excludes to determine whether to track changes to the file.

## 1.5.0 (14 July 2018)
* __NEW__: System variable `initials` and matching `psi-header.config.initials` configuration setting.  Allows you to enter your initials in the template.
* __NEW__: Change Log feature allows you to define a template to insert change log (changes history) items into the header.  Details are in the README file.

## 1.4.0 (7 June 2018)
* __NEW__: The header can now be created in "compact mode" without begin and end lines on the comment block. To activate this, you *must* set the `lang-config.begin` *and* `lang-config.end` configuration values to an empty string for any language where you want this behaviour.  Refer to the README.md file for more information.

## 1.3.6 (05 March 2018)
* __CHANGE__: The default opening comment block has been changed from `"/**"` to `"/*"` because VSC doesn't show object help in intellisense correctly if there is a comment block that starts `"/**"` above the item being queried when using JSDoc or similar.  If you don't like this new behaviour, you can just create a default language config and set the begin property to `"/**"` to get the old behaviour.
* __NEW__: New language configuration option `psi-header.lang-config.rootDirFileName` for projects that don't expect a package.json file (and for some reason you don't want to create one).  Allows you to set the name of a file that you would expect to see in the project's root directory (and nowhere else).  It is only used to try and determine the project root directory for `filerelativepath`, `projectpath` and `projectname` variables.  When set, the extension will determine the root path when _either_ of `rootDirFileName` or `package.json` file is found.

## 1.3.5 (09 December 2017)
* __FIX__: Fixed an issue determining the project name and root folder in Windows.  This could cause the `projectname` variable to fail when not using a package.json.

## 1.3.4 (22 November 2017)
* __MAINT__: Just some housekeeping in the readme file for clarity - no new or changed functionality.

## 1.3.3 (17 November 2017)
* __FIX__: Fixed a bug introduced by the previous fix for auto-header add where text has been added to the file.

## 1.3.2 (16 November 2017)
* __FIX__: Fixed a bug where 2 headers could be inserted into a new file created via File->New or Cmd-N/Ctrl-N if (and only if) auto-header was active and you had manually added a header before the first ever save of the file.

## 1.3.1 (01 November 2017)
* __NEW__: Added new `psi-header.changes-tracking.replace` configuration setting.  This is an array of strings that let you define which additional lines from the template should be replaced during file save.  This would be useful for example for updating the file name in the header.  This setting is in addition to the existing modified date and author settings which don't need to be added here (although you could).
* __CHANGE__: Replaced the default VSC logic for reading array-based configuration settings between user and workspace settings.  The original code would simply replace the user settings array with the workspace settings array.  The new logic merges the two so you can use workspace settings to override individual user setting array values or to add new array settings.  This affects `psi-header.variables`, `psi-header.lang-config` and `psi-header.templates`.
* __FIX__: Removed a debug console log entry.

## 1.2.1 (27 October 2017)
* __NEW__: Added new `psi-header.config` settings for `author`, `authorEmail`, `company` and `copyrightHolder`.  You can still use the `psi-header.variables` (which if present will override the values of these new settings) but the new settings allow you to override individual values between user settings and workspace settings.

## 1.1.5 (26 October 2017)
* __CHANGE__: Closed a loophole in the template selection logic where a template.mapTo points to an existing but invalid language template (for example setting mapTo to a language entry that itself has a mapTo).  In this case, the extension will map back to the default ("*") template if it exists.
* __FIX__: Fixed a bug in the mapTo template selection which could cause a valid mapping to not be honoured.
* __FIX__: Fixed a bug in the mapTo language selection which could cause a valid mapping to not be honoured.

## 1.1.3 (25 October 2017)
* __CHANGE__: In prior versions, changes tracking just looked for lines in the first comment block that started with the configuration prefixes `psi-header.changes-tracking.modAuthor` and `psi-header.changes-tracking.modDate` and replaced the rest of the line with a 'hard-coded' author name or date respectively.  This has now been changed to reference back to the template so that you can control how the rest of the line is updated.  If your template has no characters after the abovementioned prefixes then the update will continue to work as previously.  However, you can now configure the whole line - including using the system variables and functions.  Refer to the *Changes Tracking* section in the readme file for more information.  Note that if you extend the modDate line in the template, the `psi-header.changes-tracking.modDateFormat` setting will be ignored (because you are controllong what shows on the line).
* __CHANGE__: You no longer need to add a trailing space to `psi-header.changes-tracking.modAuthor` and `psi-header.changes-tracking.modDate` configuration settings.

## 1.0.0 (07 October 2017)
* __CHANGE__: This extension should now be compatible with Multi Root Workspaces in VSCode (Refer to *A Note about Project Paths* in the readme file for an explanation of how this now works.

## 0.9.8 (17 July 2017)
* __NEW__: Headers can now be added automatically on file creation.  Refer to the *Auto Header* section of the readme file for details.

## 0.9.7 (14 July 2017)
* __FIX__: The changes tracking now correctly recognises when workspace or user settings were modified in-session.  Thanks (again) to Luís Teixeira for raising this.  You no longer need to restart VSCode after making changes to the changes tracking settings.

## 0.9.6 (14 July 2017)
* __MAINT__: Bump dependency for username package.
* __MAINT__: Some comments cleanup and tagline change for marketplace.

## 0.9.5 (12 July 2017)
* __NEW__: You can pass an empty argument list to `filecreated()` in order to use the current locale date string.
* __NEW__: `filecreated` can be used like a system variable (without arguments or brackets).  In this case, it will return the date using the current locale date format.
* __MAINT__: A few bits of cleanup: comments, regenerated all file headers using the amazing psioniq File Header extension.
* Thanks to Luís Teixeira for requesting the `filecreated` option.

## 0.9.4 (11 July 2017)
* __NEW__: Implemented `filecreated(formatString)` system function which returns the file creation date formatted via the passed in formatString.  Refer to the __dateformat and filecreated System Functions__ section in the README file for details.
* __CHANGE__: Modified the default (inbuilt) template to use the new `filecreated` system function.

## 0.9.3 (16 May 2017)
* __CHANGE__: The `author` system variable will try to determine the username of the logged in user.  If not found, it will fall back to the current behaviour of 'You'.  Either way, this can still be overridden by providing your own value via psi-header.variables which takes precedence.
* __INFO__: Added username npm package to support author name.

## 0.9.2 (09 May 2017)
* __CHANGE__: The `projectname` system variable will now return the base name for the project folder (rather than null) if the project doesn't have a package.json file.  Note that this only works if the file has been saved to disk before generating the header.
* __NEW__: Added a new system variable `filerelativepath` which returns the path and file name relative to the base project.

## 0.9.1 (02 May 2017)
* __FIX__: Removed erroneous character from default Python and HTML line prefix setting.
* __NEW__: Optional config property `psi-header.lang-config.beforeHeader` setting allows you to insert multiple lines of text before the beginning of the header comment block.
* __NEW__: Optional config property `psi-header.lang-config.afterHeader` setting allows you to insert multiple lines of text after the end of the header comment block (and after any configured blankLinesAfter).

## 0.9.0 (22 April 2017)
* __IMPORTANT__: This extension now requires Visual Studio Code v1.6.0 as a minumum.
* __NEW__: Change Tracking: The extension can now record __modified date__ and __modified by__ values within the header whenever the file is saved.

## 0.3.3 (21 April 2017)
* __INFO__: Updated to the latest version of spdx-license-list@3.0.1.
* __FIX__: Fixed a catastrophic spelling mistake in a message string :)

## 0.3.2 (20 April 2017)
* __DOC__: Just a name change and a few fixed typos in the documentation - no code changes.

## 0.3.0 (13 April 2017)
* __NEW__: Implemented a new template placeholder concept of `system functions` which are like `system variables` but they can take arguments.  System functions are case-sensitive because the arguments may themselves need to be case sensitive (as is the first system function below).
* __NEW__: Implemented `dateformat(formatString)` system function for partial or formatted date placeholders.  This gives you complete control over the formatting of dates and times.  The format string is as per Moment.js.  Refer to the __dateformat System Function__ section in the README file for details.
* __INFO__: Added MomentJs package to support date formatting.

## 0.2.9 (30 March 2017)
* __FIX__: Issue with insertion of multiple comment line prefixes when using the Custom license text (thanks to Otto Meijer for reporting this).

## 0.2.8 (28 March 2017)
* __INFO__: Added contact email for reporting bugs.  Otto Meijer reported a bug with custom licences in his review on 13/3 and I have not been able to reproduce it.  Otto if you are listening, could you use the bugs link to send me more details - and maybe a sample settings file.

## 0.2.5 (03 January 2017)
* __FIX__: Just documentation fixes.

## 0.2.4 (03 January 2017)
* __FIX__: Wrong placeholder when using built in template.

## 0.2.3 (01 January 2017)
* __NEW__: Added system variables for `filename` and `projectname`.

## 0.2.1 (01 January 2017)
* __INFO__: Just a wee category change.

## 0.2.0 (01 January 2017)
* __NEW__: Added License configuration.
* __NEW__: Added system variables for `copyrightholder`, `licensetext`, `licensename`, `licenseurl`, `spdxid` and `authoremail`.
* __INFO__: Various code tweaks

## 0.1.0 (30 December 2016)
* Initial release.
