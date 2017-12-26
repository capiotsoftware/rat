# ReST API Tester - R.A.T #

Writing test cases and automating them are fairly time consuming activities. RAT aims to eliminate the pain of automating REST API test cases.

In itself, RAT is not a new framework. It's a simple code generator that generates [mocha](https://mochajs.org) test cases from a simple JSON file.

## Pre-requisites
`npm install -g winston chai mocha supertest`

## Installation
`npm i -g https://bitbucket.org/capiot/rat.git`

## Usage

`# rat [options] [file ...]`

The available options are,

* `i, init`: Creates all the required folders and initializes it with a sample test case.
* `clean`: Remove all RAT generated files and folders.
* `clear`: Clears all the log files under the _logs_ folder.
* `g, generate`: Generates scripts for all the files under tests folder.
* `g, generate [file ...]`: Generate the script for only the specifed test file.
* `r, run`: Run all the tests.
* `r, run [file ...]`: Run the specific test.
* `demo`: Starts the demo server.

## How to write test cases?