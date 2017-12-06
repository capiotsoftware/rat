# ReST API Tester - R.A.T #

## Pre-requisites
`npm install -g winston chai mocha supertest`

## Installation
`npm i -g https://bitbucket.org/capiot/rat.git`

## Usage

`# rat <options>`

The available options are,

* `init` - Initializes the folders.
* `clean` - _Caution!_ Clears the current folder.
* `generate <testcaseFile>` - Generate the test scripts for the given test case file. The tool checks for the test case files under the *tests* folder. The generates tests are available under the scripts folder. If no options are provided, then all the test case files are picked up and test scripts are generated.
* `run <testScript>` - Run the test script or if the script file is not provided, sequentially run all the tests from the scripts folder. The result is available under the *logs* folder.