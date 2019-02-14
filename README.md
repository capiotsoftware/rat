# ReST API Tester - R.A.T #

> this readme is WIP

Writing test cases and automating them are fairly time consuming activities. RAT aims to eliminate the pain of automating REST API test cases.

In itself, RAT is not a new framework. It's a simple code generator that generates [mocha](https://mochajs.org) test cases from a simple JSON file.

# Installation
`npm i -g @appveen/rat`

# Usage

`# rat [options] [file ...]`

The available options are,

* `i, init`: Creates all the required folders and initializes it with a sample test case.
* `u, upgrade`: Upgrades the modules required to run RAT.
* `g, generate`: Generates scripts for all the files under tests folder.
* `g, generate [file ...]`: Generate the script for only the specifed test file.
* `r, run`: Run all the tests.
* `r, run [file ...]`: Run the specific test.
* `demo`: Starts the demo server.

# Writing test cases

Test cases are bundles as a test suite and each test suite is written as a JSON file. 

Once you initialize `rat` the following folders are created for you.

* _generatedTests_: Contains the generated test cases.
* _lib_: Files that are referred by the test cases.
* _logs_: Logs generated while running test cases.
* _tests_: Test cases that are written in _rat_ format and used to generate the test cases under _generatedTests_.

When `rat` is initialized for the first time a sample test case is provided under the _tests_ folder. The structure of the _test suit_ is as shown below.

## Test Suit

* Each file should only have only one test suite section.

| Option | Type |Desctiprion |
|---|---|---|
| `testName` | String | _Required_. Name of the test case |
| `url` | List | _Required_. A list of URLs that will be used in this test suite |
| `globals` | List | A list of global variables that would be used in the test cases. Global varaibles are used to pass data between test cases. |
| `tests` | Array | Tests is an array of objects. Each object in the array is test case.  |

Sample test suite file,

```json
{
    "testName": "Sample API Tests",
    "url": [
        "http://localhost:8080",
        "http://localhost:8081"
    ],
    "globals": [
        "loginResponse",
        "data"
    ],
    "tests": []
}
```

## Test Case

| Option | Type |Desctiprion |
|---|---|---|
| `endpoint` | Number | _Required_. This denotes the position of the URL in the list of `url` that was defined in the test suite section. The list starts with **1**. Example, if `url` was defined as `url:["http://localhost:8080", "http://localhost:8081"]`, then `endpoint:1` points to the first URL, `http://localhost:8080` |
| `name` | String | Name of the test case. This would appear in the summary. |
| `continueOnError` | Boolean | Default: `false`. If set to `true`, then the test execution will stop if this step fails. |
| `request` | Object | _Required_. The request definition. |
| `response` | Object | The response data that would be used to validate the API response. |
| `saveResponse` | String | The name of the variable where the response from the server has to be captured. This should be a member of `globals` array.|

Sample test case

```json
{
    "endpoint": "1",
    "name": "Login - Valid",
    "request": {
        "method": "POST",
        "url": "/login",
        "payload": {
            "username": "alice",
            "password": "password"
        },
        "responseCode": 200,
        "saveResponse": "loginResponse"
    },
    "response": {
        "body": {
            "token": null
        }
    }
}
```

## Request object

```json
{
  "method": "String. One of the HTTP methods - POST, PUT, GET, DELETE, PATCH",
  "url": "Array. List of URLs that will be used",
  "headers": "Object. Headers to be sent as part of the request",
  "payload": "Object. Data to be send when the method is POST or PUT",
  "payloadFile": "String. Name of the file from 'lib' folder to use",
  "responseCode": "Number. HTTP status code expected",
  "saveResponse": "String. The variable where the output of this request has to be captured. This variable must exist in globals array."
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

## Response object

An optional response object. This response object is used to validate the response from the API. If no response object is provided, then no response validation is done.

In the current version of `rat` only JSON responses are validated.

```json
{
  "headers": "<response headers to be validated>",
  "body": "<object or array. response body will be validated against this>",
  "bodyFile": "<a file from 'lib' that can be used to validate the response body>"
}
```

# Smart substituitions

## URL

At the begining of the test suite we used `urls` to define a list od endpoints that 

# Sample

* Start the RAT demo server in a separate terminal - `rat demo`
* Create a RAT test case folder - `rat init` . This would have generated a sample folder structure with a sample test case.
* Generate the test case - `rat generate`
* Run the test case - `rat run`

