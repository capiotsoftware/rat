"use strict";
var fs = require("fs");
var path = require("path");
var buffer = require("buffer");
var execSync = require("child_process").execSync;
var e = {};

e.usage = () => {
    var message = "Usage: rat [options] [file ...]\n";
    message += "Options: \n";
    message += "\t i, init                 Initialize\n";
    message += "\t clean                   Clean up\n";
    message += "\t ui                      Start in UI mode.\n";
    message += "\t g, generate             Generates scripts for all the files under tests folder\n";
    message += "\t g, generate [file ...]  Generate the script for only the specifed test file\n";
    message += "\t r, run                  Run all the tests\n";
    message += "\t r, run                  Run all the tests and stop at the first failure\n";
    message += "\t r, run [file ...]       Run the specific test\n";
    message += "\t r, run [file ...]       Run the specific test\n";
    message += "\t -stopOnError            Stop at the first failure while running tests\n";
    message += "\t v, version              Run the specific test\n";
    message += "\t demo                    Starts the demo server\n";
    message += "Some of the available options might overwrite your files without warning.\n";
    console.log(message);
    process.exit();
};

e.init = () => {
    console.log("Initializing folder...");
    var sampleTestCase = fs.readFileSync(__dirname + "/../testCases/sample.json");
    var samplePayload = fs.readFileSync(__dirname + "/../testCases/payload.json");
    var sampleResonse = fs.readFileSync(__dirname + "/../testCases/response.json");
    let testFileName = path.join(process.cwd(), "tests", "sample.json");
    let requestFileName = path.join(process.cwd(), "lib", "sampleRequestPayload.json");
    let responseFileName = path.join(process.cwd(), "lib", "sampleResponsePayload.json");
    new buffer.Buffer(execSync("npm init -y"));
    new buffer.Buffer(execSync("npm i log4js chai mocha supertest request request-promise faker"));
    if (!fs.existsSync("lib")) {
        fs.mkdirSync("lib");
        fs.writeFileSync(requestFileName, samplePayload.toString());
        fs.writeFileSync(responseFileName, sampleResonse.toString());
    }
    if (!fs.existsSync("generatedTests")) fs.mkdirSync("generatedTests");
    if (!fs.existsSync("tests")) {
        fs.mkdirSync("tests");
        fs.writeFileSync(testFileName, sampleTestCase.toString());
    }
    console.log("Done!");
    process.exit();
};

e.clean = () => {
    console.log("Clean up process initiated...");
    if (process.platform == "win32") {
        new buffer.Buffer(execSync("rmdir /s /q node_modules"));
        new buffer.Buffer(execSync("rmdir /s /q lib"));
        new buffer.Buffer(execSync("rmdir /s /q generatedTests"));
        new buffer.Buffer(execSync("rmdir /s /q tests"));
    } else {
        new buffer.Buffer(execSync("rm -rf node_modules"));
        new buffer.Buffer(execSync("rm -rf lib"));
        new buffer.Buffer(execSync("rm -rf generatedTests"));
        new buffer.Buffer(execSync("rm -rf tests"));
    }
    console.log("Done!");
    process.exit();
};

e.demo = () => {
    console.log("Starting the demo server...");
    require("../mockService/app.js");
};

e.getTestFiles = () => {
    let fileName = process.platform == "win32" ? "tests\\" : "tests/";
    let files = fs.readdirSync("tests");
    let fileList = [];
    files.forEach(_f => {
        if (_f && fs.existsSync(fileName + _f)) fileList.push(_f);
    });
    return fileList;
};

e.getTestScripts = () => {
    let fileName = process.platform == "win32" ? "generatedTests\\" : "generatedTests/";
    let files = fs.readdirSync("generatedTests");
    let fileList = [];
    files.forEach(_f => {
        if (_f && fs.existsSync(fileName + _f)) fileList.push(_f);
    });
    return fileList;
};

e.fileExists = (_f) => {
    let fileName = process.platform == "win32" ? _f.split("/").join("\\") : _f;
    if (!fs.existsSync(fileName)) {
        console.log(fileName + " doesn't exist!");
        process.exit();
    }
    return true;
};

e.readFile = (_f) => {
    if (e.fileExists(_f)) {
        let fileName = process.platform == "win32" ? _f.split("/").join("\\") : _f;
        return fs.readFileSync(fileName).toString().replace(/[ ]{2,}/g, " ").replace(/\n/g, "");
    }
};

e.isRATFolder = () => {
    if (!fs.existsSync("generatedTests")) return false;
    if (!fs.existsSync("lib")) return false;
    if (!fs.existsSync("tests")) return false;
    if (!fs.existsSync("node_modules")) return false;
    return true
}

module.exports = e;