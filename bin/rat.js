#!/usr/bin/env node

"use strict";
var program = require('commander');
var gen = require("../engine/generator");
var harParser = require("../engine/harParser");
var cli = require("../utils/cli");
var ui = require("../utils/ui");

program
    .description('ReST API Tester (RAT). Provide one of the options below')
    .version(cli.version(), '-v, --version')
    .option('-i,--init', 'Initialize the currect folder as a RAT test case location')
    .option('-u,--upgrade', 'Upgrade the current setup of RAT')
    .option('--clean', 'Clean up')
    .option('--ui', 'Start in UI mode.')
    .option('--har [file]', 'Generates RAT test case from HAR file export')
    .option('-g,--generate [file]', 'Generates scripts for all the files under tests folder')
    .option('-r,--run [file]', 'Run all the tests')
    .option('--stopOnError', 'Stop at the first failure while running tests')
    .option('--demo', 'Starts the demo server')
    .parse(process.argv)

if (program.init || program.i) cli.init()
if (program.upgrade || program.u) cli.upgrade();
if (program.clean) cli.clean();
if (program.demo) cli.demo();
if (program.version || program.v) console.log(cli.version());
// if (program.help || program.h) cli.usage();
if (program.generate || program.g) {
    if (process.argv[3]) gen.generate(process.argv[3]);
    else cli.getTestFiles().forEach(_f => gen.generate(_f));
}

if(program.har) {
	if (cli.isRATFolder()) harParser(process.argv[3])
	else {
      console.log("The current folder is not RAT folder or has not be initialized.");
  }
}

if (program.run || program.r) {
    if (program.stopOnError) {
        if (process.argv[4]) gen.run(process.argv[4], true);
        else cli.getTestScripts().forEach(_f => gen.run(_f, true));
    } else {
        if (process.argv[3]) gen.run(process.argv[3], false);
        else cli.getTestScripts().forEach(_f => gen.run(_f, false));
    }
}

if (program.ui || process.argv.length == 2) {
    if (cli.isRATFolder()) {
        ui.start();
    } else {
        console.log("The current folder is not RAT folder or has not be initialized.");
    }
}