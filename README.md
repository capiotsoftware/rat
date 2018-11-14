# ReST API Tester - R.A.T #

Writing test cases and automating them are fairly time consuming activities. RAT aims to eliminate the pain of automating REST API test cases.

In itself, RAT is not a new framework. It's a simple code generator that generates [mocha](https://mochajs.org) test cases from a simple JSON file.

## Pre-requisites
`npm install -g log4js chai mocha supertest`

## Installation
`npm i -g @appveen/rat`

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

## Writing test cases

Once you initialize `rat` the following folders are created for you.

* _generatedTests_: Contains the generated test cases.
* _lib_: Files that are referred by the test cases.
* _logs_: Logs generated while running test cases.
* _tests_: Test cases that are written in _rat_ format and used to generate the test cases under _generatedTests_.

When `rat` is initialized for the first time a sample test case is provided under the _tests_ folder. The structure of the _test suit_ is as shown below.

### Test Suit

```json
{
  "testName": "<name of the test suit>",
  "url": ["<list of API endpoints>"],
  "globals": ["<global varaibles used by the test case>"],
  "tests": ["<list of 'test cases'. Format given below>"]
}
```

### Test Case

```json
{
  "endpoint": "<which endpoint to use from the list of API endpoints>",
  "name": "<name of the test case>",
  "continueOnError": "<Boolean. if 'true' then continue the test case without exiting>",
  "request": "<request structure>",
  "response": "<(optional).response structure>"
}
```

### Request object

```json
{
  "method": "<one of the HTTP methods>",
  "url": "<the URL that will be appended to the 'endpoint' specified for a testcase>",
  "headers": "headers to be sent as part of the request.",
  "payload": "<data to be send when the method is POST or PUT>",
  "payloadFile": "<name of the file from 'lib' folder to use>",
  "responseCode": "<HTTP status code>",
  "saveResponse": "<one of the entries from 'globals' where the response can be saved>"
}
```

__method__: _Required_. One of POST/PUT/GET/DELETE. In the generated code [supertest](https://github.com/visionmedia/supertest) is used to make HTTP requests.

__url__: _optional_. Any URI that has to be appended to the _endpoint_ specified under the test case.

__headers__: _optional_. A set of http header. If not set, no headers are send.

__payload__: _optional_. Request body for PATCH, POST and PUT requests. If not set, then `{}` is send by default.

__payloadFile__: _optional_. The name of the file under _lib_ folder that has the request body for PATCH, POST and PUT requests. If not set, then `{}` is send by default.

> __N.B.__ if both `payload` and `payloadFile` is provided, then `payload` takes precedence.

__responseCode__: _optional_. The HTTP status code that is _expected_ from the request. If not set, _no validations_ are done against the HTTP status code.

__saveResponse__: _optional_. One of the entries from _globals_. This will be used to save the output of the request so that it can used in any of the subsequent test cases. If the value is not in _globals_, then no error is raised, but might cause downstream test cases to fail.

### Response object

An optional response object. This response object is used to validate the response from the API. If no response object is provided, then no response validation is done.

In the current version of `rat` only JSON responses are validated.

```json
{
  "headers": "<response headers to be validated>",
  "body": "<object or array. response body will be validated against this>",
  "bodyFile": "<a file from 'lib' that can be used to validate the response body>"
}
```

## Validations
