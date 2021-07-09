# MPP Archiver
Saves a Microsoft Project XML file to Mongo and/or local JSON file

![GitHub](https://img.shields.io/github/license/jolewis-ddn/mppArchiver)
![GitHub last commit](https://img.shields.io/github/last-commit/jolewis-ddn/mppArchiver)
![GitHub issues](https://img.shields.io/github/issues/jolewis-ddn/mppArchiver)
![Snyk Vulnerabilities for GitHub Repo](https://img.shields.io/snyk/vulnerabilities/github/jolewis-ddn/mppArchiver)
![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/jolewis-ddn/mppArchiver)

# Configuration
## Config File
Save this in the config/default.json file:
**All are optional and overridden by any command-line parameters**
* `input`: Input (XML) filename. *If this parameter does not exist, a command line parameter must be provided*
* `mongo`: *If this parameter does not exist, Mongo will not be used*
  * `user`: User's username
  * `password`: User's password
  * `host`: Hostname or IP where Mongo is running
  * `port`: Mongo port (does not have a default)
  * `options`: Optional parameters for the Mongo connection URL
  * `database`: Database name
  * `collection`: Base collection name. All collections created will append various suffixes to this string
* `json`:
  * `output`: Path and filename for output JSON file. If this parameter does not exist (and a command line parameter is not provided), a JSON file will not be generated
## Command-Line Parameters
* `-V --version`: Program version
* `-i --input`: Input (XML) filename (required unless specified in the config file; see above)
* `-j --save-json`: Filename to save the JSON output to
* `-w --wipe`: Remove any existing collections before saving the data to Mongo

# Installation and Use
* `git clone https://www.github.com/jolewis-ddn/mppArchiver`
* `cd mppArchiver`
* `npm i`
* `node archive.js` (plus any parameters)

# Output
* JSON file: Created by `pixl-xml`
* Mongo database records: Parsed JSON content.
  * Numbers and Dates are converted from Strings before saving to the database.
  * All records are tagged with the timestamp when the record was processed/saved
# Modules Used
![GitHub package.json dependency version (prod)](https://img.shields.io/github/package-json/dependency-version/jolewis-ddn/mppArchiver/commander)
![GitHub package.json dependency version (prod)](https://img.shields.io/github/package-json/dependency-version/jolewis-ddn/mppArchiver/config)
![GitHub package.json dependency version (prod)](https://img.shields.io/github/package-json/dependency-version/jolewis-ddn/mppArchiver/debug)
![GitHub package.json dependency version (prod)](https://img.shields.io/github/package-json/dependency-version/jolewis-ddn/mppArchiver/mongodb)
![GitHub package.json dependency version (prod)](https://img.shields.io/github/package-json/dependency-version/jolewis-ddn/mppArchiver/pixl-xml)

# License
[MIT](./LICENSE.txt)
