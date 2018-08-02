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
        _tc += "var url" + (_i + 1) + " = process.env.URL1 ? process.env.URL1 : '" + _url + "';";
        _tc += "var api" + (_i + 1) + " = require('supertest')(url" + (_i + 1) + ");"
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
                    if (_e.indexOf(delimiters[0]) > -1) {
                        _tc += "expect(" + path + ").to.be.equal(" + render(_e) + ");";
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
                if (_d[_k].indexOf(delimiters[0]) > -1) {
                    _tc += "expect(" + path + ").to.be.equal(" + render(_d[_k]) + ");";
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
        if (_d.indexOf(delimiters[0]) > -1) {
            _tc += "expect(" + path + ").to.be.equal(" + render(_d) + ");";
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

function parseData(_d) {
    var re1 = new RegExp(delimiters[0], "g");
    var re2 = new RegExp(delimiters[1], "g");
    return _d.replace(re1, "\" + ").replace(re2, " + \"");
}

function render(_s) {
    if (_s.indexOf(delimiters[0]) > -1) {
        var d = "";
        _s = _s.split(delimiters[0]);
        _s.forEach(_s1 => {
            if (_s1.indexOf(delimiters[1]) > -1) {
                _s1 = _s1.split(delimiters[1]);
                d += ((d.length > 0) ? " + " : "") + _s1[0];
                if (_s1[1].length > 0) d += ' + "' + _s1[1] + '"';
            } else if (_s1.length > 0) d += '"' + _s1 + '"';
        });
        return d;
    } else return '"' + _s + '"';
}

function urlSubstitute(_url) {
    let url = _url.split(delimiters[1]).shift().split(delimiters[0]);
    if (url.length == 1) return "\"" + _url + "\"";
    return "\"" + url[0] + "\" + " + url[1];
}

e.test = function(tc) {
    var name = tc.name;
    delimiters = tc.delimiters ? tc.delimiters : ["{{", "}}"];
    var response = tc.response;
    var request = tc.request;
    var endpoint = tc.endpoint;
    var expectedResponseHeaders = response && response.headers ? response.headers : null;
    _tc += "it('" + name + "', function (done) {";
    _tc += "logger.info('Title: " + name + "');";

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
            if (val.indexOf(delimiters[0]) > -1) val = render(val);
            else val = "\"" + val + "\"";
            _tc += ".set(\"" + k + "\"," + val + ")";
        }
    }

    if (request.responseCode) _tc += ".expect(" + request.responseCode + ")";

    _tc += ".end(function (err, res) {logger.info('Request');";
    _tc += "logger.info('Request METHOD', res.method);";
    _tc += "logger.info('Request URL', res.url);";
    _tc += "logger.info('Request HEADER', res.header);";
    _tc += "logger.info('Request DATA', res._data);";
    _tc += "logger.info('Response STATUS', res.statusCode);";
    _tc += "logger.info('Response HEADER', res.headers);";
    _tc += "logger.info('Response BODY', res.body);";
    _tc += "try{"
    _tc += "expect(res.status).to.equal(" + request.responseCode + ");";
    if (request.saveResponse)
        _tc += request.saveResponse + " = res.body;";
    if (expectedResponseHeaders) {
        for (var _header in expectedResponseHeaders)
            if (expectedResponseHeaders[_header]) _tc += "expect(res.headers." + _header.toLowerCase() + ").to.equal(" + render(expectedResponseHeaders[_header]) + ");";
            else _tc += "expect(res.headers." + _header.toLowerCase() + ").to.be.not.empty;";
    }
    if (response && (response.body || response.bodyFile)) {
        var expectedResponse = "";

        if (response.body) expectedResponse = response.body;
        else if (response.bodyFile) expectedResponse = JSON.parse(cli.readFile("lib/" + response.bodyFile));

        _tc += "expect(err).to.be.null;";
        _tc += "expect(res.body).to.be.not.null;";

        generateAssertions(expectedResponse);
    }
    _tc += "logger.info('" + name + " :: PASS');";
    _tc += "}catch (_err){logger.error(_err.message);";
    _tc += "logger.info('" + name + " :: FAIL');";
    if (!tc.continueOnError) _tc += "assert.fail(_err.actual, _err.expected, _err.message);";
    _tc += "};";
    _tc += "done();});});";
};

e.generate = function(_f, _stopOnError) {
    let suffix = _f.split(".")[0] + ".js";
    var opf = "generatedTests/" + suffix;
    if (os.platform() == "win32") opf = "generatedTests\\" + suffix;
    let tc = "var winston = require('winston'); function getDateTime() {var sd = new Date();var syear = sd.getFullYear();var smonth = ('0' + (sd.getMonth() + 1)).slice(-2);var sdate = ('0' + sd.getDate()).slice(-2);var shours = ('0' + sd.getHours()).slice(-2);var sminutes = ('0' + sd.getMinutes()).slice(-2);var sseconds = ('0' + sd.getSeconds()).slice(-2);var startDate = syear + '-' + smonth + '-' + sdate;var startTime = shours + '-' + sminutes + '-' + sseconds;return startDate + '_' + startTime;}; var logger = winston.createLogger({transports: [new (winston.transports.File)({ filename: 'logs/Log_'+getDateTime()+'_" + _f + ".log'})]});" + _tc;
    fs.writeFileSync(opf, tc);
    return opf;
};

module.exports = e;