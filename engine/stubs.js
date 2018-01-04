var os = require("os");
var fs = require("fs");
var cli = require("../utils/cli");

var e = {};
var _tc = "";
var delimiters = ["{{", "}}"];

e.initTestSuite = function(_suitName, _url) {
    _tc = "";
    _tc += "var expect = require('chai').expect;var assert = require('chai').assert;";
    _url.forEach((_url, _i) => {
        _tc += "var api" + (_i + 1) + " = require('supertest')('" + _url + "');"
    });
    _tc += "describe('" + _suitName + "', function () {";
};

e.endTestSuite = function() {
    _tc += "});";
};

e.addGlobalVariable = function(_a) {
    _tc += "var " + _a + "='';";
};

e.addEdpoints = function(_a) {
    _tc += "var urls = " + _a + ";";
};

function whatIsThis(_d) {
    if (Object.prototype.toString.call(_d) == "[object Object]") return 1;
    if (Object.prototype.toString.call(_d) == "[object Array]") return 2;
    if (Object.prototype.toString.call(_d) == "[object String]") return 3;
    if (Object.prototype.toString.call(_d) == "[object Number]") return 4;
    if (Object.prototype.toString.call(_d) == "[object Boolean]") return 5;
    return 0;
}

function generateAssertionsForArray(_p, _d) {
    _tc += "expect(" + _p + ").to.be.an('array');";
    if (_d.length) {
        _d.forEach((_e, _i) => {
            let path = _p + "[" + _i + "]"
            switch (whatIsThis(_e)) {
                case 1:
                    generateAssertionsForJson(path, _e);
                    break;
                case 2:
                    generateAssertionsForArray(path, _e);
                    break;
                case 3:
                    if (_e.indexOf("{{") > -1) {
                        _tc += "expect(" + path + ").to.be.equal(" + _e.split(delimiters[1]).shift().split(delimiters[0]).pop() + ");";
                    } else {
                        _tc += "expect(" + path + ").to.be.a('string');";
                        _tc += "expect(" + path + ").to.be.equal('" + _e + "');";
                    }
                    break;
                case 4:
                    _tc += "expect(" + path + ").to.be.a('number');";
                    _tc += "expect(" + path + ").to.be.equal(" + _e + ");";
                    break;
                case 5:
                    _tc += "expect(" + path + ").to.all.satisfy(bool => typeof bool === 'boolean');"
                    _tc += "expect(" + path + ").to.be.equal(" + _e + ");";
                    break;
                default:
                    if (_p != "res.body") _tc += "expect(" + path + ").to.exist;";
                    break;
            }
        });
    }
};

function generateAssertionsForJson(_p, _d) {
    for (_k in _d) {
        let path = _p + "." + _k;
        switch (whatIsThis(_d[_k])) {
            case 1:
                generateAssertionsForJson(path, _d[_k]);
                break;
            case 2:
                generateAssertionsForArray(path, _d[_k]);
                break;
            case 3:
                if (_d[_k].indexOf("{{") > -1) {
                    _tc += "expect(" + path + ").to.be.equal(" + _d[_k].split(delimiters[1]).shift().split(delimiters[0]).pop() + ");";
                } else {
                    _tc += "expect(" + path + ").to.be.a('string');";
                    _tc += "expect(" + path + ").to.be.equal('" + _d[_k] + "');";
                }
                break;
            case 4:
                _tc += "expect(" + path + ").to.be.a('number');";
                _tc += "expect(" + path + ").to.be.equal(" + _d[_k] + ");";
                break;
            case 5:
                _tc += "expect(" + path + ").to.all.satisfy(bool => typeof bool === 'boolean');"
                _tc += "expect(" + path + ").to.be.equal(" + _d[_k] + ");";
                break;
            default:
                _tc += "expect(" + path + ").to.exist;";
                break;
        }
    }
};

function generateAssertions(_d) {
    let path = "res.body"
    if (whatIsThis(_d) == 1) generateAssertionsForJson(path, _d);
    if (whatIsThis(_d) == 2) generateAssertionsForArray(path, _d);
    if (whatIsThis(_d) == 3) {
        if (_d.indexOf("{{") > -1) {
            _tc += "expect(" + path + ").to.be.equal(" + _d.split(delimiters[1]).shift().split(delimiters[0]).pop() + ");";
        } else {
            _tc += "expect(" + path + ").to.be.a('string');";
            _tc += "expect(" + path + ").to.be.equal('" + _d + "');";
        }
    }
    if (whatIsThis(_d) == 4) {
        _tc += "expect(" + path + ").to.be.a('number');";
        _tc += "expect(" + path + ").to.be.equal(" + _d + ");";
    }
    if (whatIsThis(_d) == 5) {
        _tc += "expect(" + path + ").to.all.satisfy(bool => typeof bool === 'boolean');"
        _tc += "expect(" + path + ").to.be.equal(" + _d + ");";
    }
}

function parseData(_d){
    return _d.replace(/'+delimiters[1]+'\"/gi, "").replace(/\"'+delimiters[1]+'/gi, "");
}

function urlSubstitute(_url) {
    let url = _url.split(delimiters[1]).shift().split(delimiters[0]);
    if (url.length == 1) return "\"" + _url + "\"";
    return "\"" + url[0] + "\" + " + url[1];
}

e.test = function(tc, endpoint, request, response, _delimiters) {
    delimiters = _delimiters ? _delimiters : ["{{", "}}"];
    var expectedResponseHeaders = response && response.headers ? response.headers : null;
    _tc += "it('" + tc + "', function (done) {";
    _tc += "logger.info('Title: " + tc + "');";

    if (request.method == "POST") {
        _tc += "var request = api" + endpoint + ".post('" + request.url + "')";
        if (request.payload) _tc += ".send(" + parseData(JSON.stringify(request.payload)) + ")";
        else if (request.payloadFile) _tc += ".send(" + parseData(cli.readFile("lib/" + request.payloadFile)) + ")";
        else _tc += ".send({})";
    }

    if (request.method == "GET") _tc += "api" + endpoint + ".get(" + urlSubstitute(request.url) + ")";

    if (request.method == "PUT") {
        _tc += "api" + endpoint + ".put(" + urlSubstitute(request.url) + ")";
        if (request.payload) _tc += ".send(" + parseData(JSON.stringify(request.payload)) + ")";
        else if (request.payloadFile) _tc += ".send(" + parseData(cli.readFile("lib/" + request.payloadFile)) + ")";
        else _tc += ".send({})";
    }

    if (request.method == "DELETE") _tc += "api" + endpoint + ".delete(" + urlSubstitute(request.url) + ")";

    if (request.headers) {
        for (var k in request.headers) {
            let val = request.headers[k];
            if (val.indexOf(delimiters[0]) > -1) val = val.split(delimiters[1]).shift().split(delimiters[0]).pop();
            else val = "\"" + val + "\"";
            _tc += ".set(\"" + k + "\"," + val + ")";
        }
    }

    _tc += ".expect(" + request.responseCode + ")";

    _tc += ".end(function (err, res) {logger.info('Request');";
    _tc += "logger.info('Request METHOD', res.request.method);";
    _tc += "logger.info('Request URL', res.request.url);";
    _tc += "logger.info('Request HEADER', res.request.header);";
    _tc += "logger.info('Request DATA', res.request._data);";
    _tc += "logger.info('Response STATUS', res.statusCode);";
    _tc += "logger.info('Response HEADER', res.headers);";
    _tc += "logger.info('Response BODY', res.body);";
    _tc += "try{"
    _tc += "expect(res.status).to.equal(" + request.responseCode + ");";
    if (request.saveResponse)
        _tc += request.saveResponse + " = res.body;";
    if (expectedResponseHeaders) {
        for (var _header in expectedResponseHeaders)
            if (expectedResponseHeaders[_header]) _tc += "expect(res.headers." + _header.toLowerCase() + ").to.equal('" + expectedResponseHeaders[_header] + "');";
            else _tc += "expect(res.headers." + _header.toLowerCase() + ").to.be.not.empty;";
    }
    if (response && (response.body || response.bodyFile)) {
        var expectedResponse = "";

        if (response.body) expectedResponse = parseData(JSON.stringify(response.payload));
        else if (response.bodyFile) expectedResponse = parseData(cli.readFile("lib/" + response.payloadFile));

        _tc += "expect(err).to.be.null;";
        _tc += "expect(res.body).to.be.not.null;";

        generateAssertions(expectedResponse);
    }
    _tc += "logger.info('" + tc + " :: PASS');";
    _tc += "}catch (_err){logger.error(_err.message);";
    _tc += "logger.info('" + tc + " :: FAIL');";
    _tc += "assert.fail(_err.actual, _err.expected, _err.message);};";
    _tc += "done();});});";
};

e.generate = function(_f, _stopOnError) {
    let suffix = _f.split(".")[0] + ".js";
    var opf = "scripts/" + suffix;
    if (os.platform() == "win32") opf = "scripts\\" + suffix;
    let tc = "var winston = require('winston'); function getDateTime() {var sd = new Date();var syear = sd.getFullYear();var smonth = ('0' + (sd.getMonth() + 1)).slice(-2);var sdate = ('0' + sd.getDate()).slice(-2);var shours = ('0' + sd.getHours()).slice(-2);var sminutes = ('0' + sd.getMinutes()).slice(-2);var sseconds = ('0' + sd.getSeconds()).slice(-2);var startDate = syear + '-' + smonth + '-' + sdate;var startTime = shours + '-' + sminutes + '-' + sseconds;return startDate + '_' + startTime;}; var logger = new (winston.Logger)({transports: [new (winston.transports.File)({ filename: 'logs/Log_'+getDateTime()+'_" + _f + ".log'})]});" + _tc;
    fs.writeFileSync(opf, tc);
    return opf;
};

module.exports = e;