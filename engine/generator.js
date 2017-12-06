var stubs = require("./stubs");
var fs = require("fs");
var buffer = require("buffer");
var spawnSync = require("child_process").spawnSync;
var Mocha = require("mocha");
var mocha = new Mocha();

var tcFile;

var e = {};

var testCases = [];

e.generate = (_tcFile) => {
    let fileName = process.platform == "win32" ? "tests\\" : "tests/";
    tcFile = fileName + _tcFile;

    var testCase = JSON.parse(fs.readFileSync(tcFile).toString());
    stubs.initTestSuite(testCase.testName, testCase.url);

    testCase.globals.forEach(function(x) {
        stubs.addGlobalVariable(x);
    });

    testCase.tests.forEach(_test => {
        stubs.test(_test.name, _test.endpoint, _test.request, _test.response);
    });

    stubs.endTestSuite();

    testCases.push(stubs.generate(_tcFile));
};

e.run = function(_tcFile) {
    let fileName = process.platform == "win32" ? "scripts\\" : "scripts/";
    tcFile = fileName + _tcFile;
    mocha.addFile(tcFile);
    var op = spawnSync("mocha", [tcFile], { stdio: [0, 1, 2, 3] });
    // var data = "";
    // op.stdout.on('data', (_d) => data += _d);
    // op.stderr.on('data', (data) => {
    //     console.log(data.toString());
    // });
    // op.on('close', (code) => console.log(data));
    if (op.stdout) console.log(op.stdout);
};

module.exports = e;