# Change Log
All notable changes to the "psi-header" extension will be documented in this file.

To report bugs, issues, suggestions: email `info@psioniq.uk`

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
