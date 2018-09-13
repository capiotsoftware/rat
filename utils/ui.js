const inquirer = require('inquirer');
const fs = require('fs');
const gen = require('../engine/generator');

let e = {};

e.start = () => {
    inquirer.prompt([{
        type: 'list',
        name: 'action',
        message: '> ',
        choices: ["Run", "Generate"]
    }]).then(_d => {
        if (_d.action == "Run") run();
        if (_d.action == "Generate") generate();
    });
};

function run() {
    let fileName = process.platform == "win32" ? "generatedTests\\" : "generatedTests/";
    let files = fs.readdirSync("generatedTests");
    let fileList = ["All"];
    files.forEach(_f => {
        if (_f && fs.existsSync(fileName + _f)) fileList.push(_f.replace(".js", ""));
    });
    inquirer.prompt([{
            type: 'list',
            name: 'tcName',
            message: 'Run> ',
            pageSize: 10,
            choices: fileList
        },
        { type: 'confirm', name: 'stopOnError', message: 'Stop on error?', default: true }
    ]).then(_d => {
        let tcName = _d.tcName;
        if (tcName == "All") {
            fileList.forEach(_f => {
                if (_f != "All") gen.run(_f + ".js", _d.stopOnError)
            });
        } else gen.run(tcName + ".js", _d.stopOnError);
    });
}

function generate() {
    let fileName = process.platform == "win32" ? "tests\\" : "tests/";
    let files = fs.readdirSync("tests");
    let fileList = ["All"];
    files.forEach(_f => {
        if (_f && fs.existsSync(fileName + _f)) fileList.push(_f.replace(".json", ""));
    });
    inquirer.prompt([{
        type: 'list',
        name: 'tcName',
        message: 'Generate > ',
        pageSize: 10,
        choices: fileList
    }]).then(_d => {
        let tcName = _d.tcName;
        if (tcName == "All") {
            fileList.forEach(_f => {
                if (_f != "All") gen.generate(_f + ".json")
            });
        } else gen.generate(tcName + ".json");
    });
}

module.exports = e;