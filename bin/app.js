#!/usr/bin/env node

"use strict";
var gen = require("../engine/generator.js");
var cli = require("../utils/cli");

let version = "1.0";

if (process.argv.length < 3) cli.usage();
let option = process.argv[2].toString().toLowerCase();
if (option == "init" || option == "i") cli.init();
if (option == "clean") cli.clean();
if (option == "demo") cli.demo();
if (option == "clear") cli.clearLogs();
if (option == "v" || option == "version") console.log(version);

if (option == "generate" || option == "g") {
    if (process.argv[3]) gen.generate(process.argv[3]);
    else cli.getTestFiles().forEach(_f => gen.generate(_f));
}

if (option == "run" || option == "r") {
    if (process.argv[3]) gen.run(process.argv[3]);
    else cli.getTestScripts().forEach(_f => gen.run(_f));
}