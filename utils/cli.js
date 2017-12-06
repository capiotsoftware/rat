"use strict";
var fs = require("fs");
var buffer = require("buffer");
var execSync = require("child_process").execSync;
var e = {};

e.usage = () => {
    var message = "rat <options> \n";
    message += "Avilable options are \n";
    message += "\t rat init                  Initialize\n";
    message += "\t rat clean                 Clean up\n";
    message += "\t rat clear                 Removes all the logs.\n";
    message += "\t rat generate              Generates scripts for all the files under tests folder\n";
    message += "\t rat generate <testFile>   Generate the script for only the specifed test file\n";
    message += "\t rat run                   Run all the tests\n";
    message += "\t rat run <generatedFIle>   Run the specific test\n";
    message += "\t rat demo                  Starts the demo server\n";
    console.log(message);
    process.exit();
};

e.init = () => {
    console.log("Initializing folder...");
    var sampleTestCase = require("../testCases/sample.js");
    var samplePayload = require("../testCases/payload.js");
    let testFileName = process.cwd() + (process.platform == "win32" ? "\\tests\\" : "/tests/") + "sample.json";
    let requestFileName = process.cwd() + (process.platform == "win32" ? "\\lib\\" : "/lib/") + "sampleRequestPayload.json";
    let responseFileName = process.cwd() + (process.platform == "win32" ? "\\lib\\" : "/lib/") + "sampleResponsePayload.json";
    new buffer.Buffer(execSync("npm link winston"));
    new buffer.Buffer(execSync("npm link chai"));
    new buffer.Buffer(execSync("npm link mocha"));
    new buffer.Buffer(execSync("npm link supertest"));
    if (!fs.existsSync("logs")) fs.mkdirSync("logs");
    if (!fs.existsSync("lib")) fs.mkdirSync("lib");
    if (!fs.existsSync("scripts")) fs.mkdirSync("scripts");
    if (!fs.existsSync("tests")) fs.mkdirSync("tests");
    fs.writeFileSync(testFileName, JSON.stringify(sampleTestCase, null, " "));
    fs.writeFileSync(requestFileName, JSON.stringify(samplePayload, null, " "));
    fs.writeFileSync(responseFileName, JSON.stringify(samplePayload, null, " "));
    console.log("Done!");
    process.exit();
};

e.clean = () => {
    console.log("Clean up process initiated...");
    if (process.platform == "win32") {
        new buffer.Buffer(execSync("rmdir /s /q node_modules"));
        new buffer.Buffer(execSync("rmdir /s /q logs"));
        new buffer.Buffer(execSync("rmdir /s /q lib"));
        new buffer.Buffer(execSync("rmdir /s /q scripts"));
        new buffer.Buffer(execSync("rmdir /s /q tests"));
    } else {
        new buffer.Buffer(execSync("rm -rf node_modules"));
        new buffer.Buffer(execSync("rm -rf logs"));
        new buffer.Buffer(execSync("rm -rf lib"));
        new buffer.Buffer(execSync("rm -rf scripts"));
        new buffer.Buffer(execSync("rm -rf tests"));
    }
    console.log("Done!");
    process.exit();
};

e.clearLogs = () => {
    console.log("Cleaning up the logs...");
    if (process.platform == "win32") {
        new buffer.Buffer(execSync("rmdir /s /q logs"));
    } else {
        new buffer.Buffer(execSync("rm -rf logs"));
    }
    if (!fs.existsSync("logs")) fs.mkdirSync("logs");
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
    let fileName = process.platform == "win32" ? "scripts\\" : "scripts/";
    let files = fs.readdirSync("scripts");
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

module.exports = e;