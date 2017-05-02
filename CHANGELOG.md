# Change Log
All notable changes to the "psi-header" extension will be documented in this file.

To report bugs, issues, suggestions: email `info@psioniq.uk`

## 0.9.1 (NOT YET RELEASED)
* __FIX__: Removed erroneous character from default Python and HTML line prefix setting.
* __NEW__: Optional config property `psi-header.lang-config.beforeHeader` setting allows you to insert multiple lines of text before the beginning of the header comment block.
* __NEW__: Optional config property `psi-header.lang-config.afterHeader` setting allows you to insert multiple lines of text after the end of the header comment block (and after any configured blankLinesAfter).

## 0.9.0 (22/04/2017)
* __IMPORTANT__: This extension now requires Visual Studio Code v1.6.0 as a minumum.
* __NEW__: Change Tracking: The extension can now record __modified date__ and __modified by__ values within the header whenever the file is saved.

## 0.3.3 (21/04/2017)
* __INFO__: Updated to the latest version of spdx-license-list@3.0.1.
* __FIX__: Fixed a catastrophic spelling mistake in a message string :)

## 0.3.2 (20/04/2017)
* __DOC__: Just a name change and a few fixed typos in the documentation - no code changes.

## 0.3.0 (13/04/2017)
* __NEW__: Implemented a new template placeholder concept of `system functions` which are like `system variables` but they can take arguments.  System functions are case-sensitive because the arguments may themselves need to be case sensitive (as is the first system function below).
* __NEW__: Implemented `dateformat(formatString)` system function for partial or formatted date placeholders.  This gives you complete control over the formatting of dates and times.  The format string is as per Moment.js.  Refer to the __dateformat System Function__ section in the README file for details.
* __INFO__: Added MomentJs package to support date formatting.

## 0.2.9 (30/03/2017)
* __FIX__: Issue with insertion of multiple comment line prefixes when using the Custom license text (thanks to Otto Meijer for reporting this).

## 0.2.8 (28/03/2017)
* __INFO__: Added contact email for reporting bugs.  Otto Meijer reported a bug with custom licences in his review on 13/3 and I have not been able to reproduce it.  Otto if you are listening, could you use the bugs link to send me more details - and maybe a sample settings file.

## 0.2.5 (03/01/2017)
* __FIX__: Just documentation fixes.

## 0.2.4 (03/01/2017)
* __FIX__: Wrong placeholder when using built in template.

## 0.2.3 (01/01/2017)
* __NEW__: Added system variables for `filename` and `projectname`.

## 0.2.1 (01/01/2017)
* __INFO__: Just a wee category change.

## 0.2.0 (01/01/2017)
* __NEW__: Added License configuration.
* __NEW__: Added system variables for `copyrightholder`, `licensetext`, `licensename`, `licenseurl`, `spdxid` and `authoremail`.
* __INFO__: Various code tweaks

## 0.1.0 (30/12/2016)
* Initial release.
