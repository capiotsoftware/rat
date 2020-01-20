"use strict";
var fs = require("fs");
var rimraf = require("rimraf");
var path = require("path");
var buffer = require("buffer");
var execSync = require("child_process").execSync;
var e = {};

e.version = () => {
    let text = "ReST API Tester (@appveen/rat) version ";
    return text += JSON.parse(fs.readFileSync(`${__dirname}/../package.json`).toString()).version;
};

e.usage = () => {
    var message = "Usage: rat [options] [file ...]\n";
    message += "Options: \n";
    message += "\t -i, --init                 Initialize\n";
    message += "\t -u, --upgrade              Upgrade\n";
    message += "\t --clean                   Clean up\n";
    message += "\t --ui                      Start in UI mode.\n";
    message += "\t -g, --generate             Generates scripts for all the files under tests folder\n";
    message += "\t -g, --generate [file ...]  Generate the script for only the specifed test file\n";
    message += "\t -r, --run                  Run all the tests\n";
    message += "\t -r, --run [file ...]       Run the specific test\n";
    message += "\t --stopOnError            Stop at the first failure while running tests\n";
    message += "\t -v, --version              Run the specific test\n";
    message += "\t --demo                    Starts the demo server\n";
    message += "Some of the available options might overwrite your files without warning.\n";
    console.log(message);
    process.exit();
};

e.init = () => {
    console.log("Initializing folder...");
    var sampleTestCase = fs.readFileSync(__dirname + "/../testCases/sample.json");
    var samplePayload = fs.readFileSync(__dirname + "/../testCases/payload.json");
    var sampleResonse = fs.readFileSync(__dirname + "/../testCases/response.json");
    var sampleModule = fs.readFileSync(__dirname + "/../testCases/sampleFunction.js");
    let testFileName = path.join(process.cwd(), "tests", "sample.json");
    let requestFileName = path.join(process.cwd(), "lib", "sampleRequestPayload.json");
    let responseFileName = path.join(process.cwd(), "lib", "sampleResponsePayload.json");
    let moduleFileName = path.join(process.cwd(), "modules", "sampleFunction.js");
    if (!fs.existsSync("lib")) {
        fs.mkdirSync("lib");
        fs.writeFileSync(requestFileName, samplePayload.toString());
        fs.writeFileSync(responseFileName, sampleResonse.toString());
    }
    if (!fs.existsSync("modules")) {
        fs.mkdirSync("modules");
        fs.writeFileSync(moduleFileName, sampleModule.toString());
    }
    if (!fs.existsSync("generatedTests")) fs.mkdirSync("generatedTests");
    if (!fs.existsSync("tests")) {
        fs.mkdirSync("tests");
        fs.writeFileSync(testFileName, sampleTestCase.toString());
    }
    new buffer.Buffer(execSync("npm init -y"));
    new buffer.Buffer(execSync("npm i log4js chai mocha supertest request request-promise faker"));
    console.log("Done!");
    process.exit();
};

e.upgrade = () => {
    console.log("Upgrading current RAT folder...");
    if (!fs.existsSync("package.json")) {
        console.log("ERROR :: Unable to find package.json. Are you sure you are in the right RAT folder?")
        process.exit(1);
    }
    rimraf.sync("node_modules");
    fs.unlinkSync("package.json")
    fs.unlinkSync("package-lock.json")
    new buffer.Buffer(execSync("npm init -y"));
    new buffer.Buffer(execSync("npm i log4js chai mocha supertest request request-promise faker"));
    console.log("Done!");
    process.exit();
};

e.clean = () => {
    console.log("To clean up, please manually remove these files. ");
    console.log("RAT files are,");
    console.log("  - package.json")
    console.log("  - package-lock.json");
    console.log("  - /node_modules");
    console.log("  - /generatedTests");
    console.log("  - /tests");
    console.log("  - /lib");
    console.log("There could also be log files that needs to be cleared.")
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
    let files = fs.readdirSync(path.join(process.cwd(), "generatedTests"));
    let fileList = [];
    files.forEach(_f => {
        if (_f && fs.existsSync(path.join(process.cwd(), "generatedTests", _f))) fileList.push(_f);
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