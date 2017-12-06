var os = require("os");
var fs = require("fs");
var cli = require("../utils/cli");

var e = {};
var _tc = "";

e.initTestSuite = function(_suitName, _url) {
    _tc = "";
    _tc += "var expect = require('chai').expect;var assert = require('chai').assert;";
    "";
    _url.forEach((_url, _i) => {
        _tc += "var api" + (_i + 1) + " = require('supertest')('" + _url + "');"
    });
    _tc += "describe('" + _suitName + "', function () {";
    _tc += "function compareJson(_this, _that) {for (_k_this in _this) {if (!compare(_this[_k_this], _that[_k_this])) return false;}return true;};function compareArrays(_this, _that) {if (_this.length == 0 && _that.length == 0) return true;if (_this.length == 0 && _that.length != 0) return false;for (var i = 0; i < _this.length; i++) {return compare(_this[i], _that[i]);}};function compare(o1, o2) {if (Object.prototype.toString.call(o1) == '[object Object]' && Object.prototype.toString.call(o2) == '[object Object]') {return compareJson(o1, o2);}if (Object.prototype.toString.call(o1) == '[object Array]' && Object.prototype.toString.call(o2) == '[object Array]') {return compareArrays(o1, o2)}if (o1 != o2) {return false;}return true;};";
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

e.test = function(tc, endpoint, request, response) {
    var expectedResponseHeaders = response && response.headers ? response.headers : null;
    _tc += "it('" + tc + "', function (done) {";
    _tc += "logger.info('Title: " + tc + "');";

    if (request.method == "POST") {
        _tc += "var request = api" + endpoint + ".post('" + request.url + "')";
        if (request.payload) _tc += ".send(" + JSON.stringify(request.payload) + ")";
        else if (request.payloadFile) _tc += ".send(" + cli.readFile("lib/" + request.payloadFile) + ")";
        else _tc += ".send({})";
    }

    if (request.method == "GET") {
        if (request.url.indexOf("+") > -1)
            _tc += "api" + endpoint + ".get(" + request.url + ")";
        else
            _tc += "api" + endpoint + ".get('" + request.url + "')";
    }

    if (request.method == "PUT") {
        _tc += "api" + endpoint + ".put('" + request.url + "')";
        if (request.payload) _tc += ".send(" + JSON.stringify(request.payload) + ")";
        else if (request.payloadFile) _tc += ".send(" + cli.readFile("lib/" + request.payloadFile) + ")";
        else _tc += ".send({})";
    }

    if (request.method == "DELETE") {
        _tc += "api" + endpoint + ".del('" + request.url + "')";
    }
    if (request.headers) {
        for (var k in request.headers) {
            _tc += ".set(\"" + k + "\"," + request.headers[k] + ")";
        }
    }

    _tc += ".expect(" + request.responseCode + ")";
    //    if (request.saveResponse || expectedResponse) _tc += ".expect(" + request.responseCode + ")";
    //    else _tc += ".expect(" + request.responseCode + ", done)";

    _tc += ".end(function (err, res) {logger.info('Request');";
    _tc += "logger.info(res.request.method, res.request.url, res.request.header, res.request._data);";
    _tc += "logger.info('Response');";
    _tc += "logger.info(res.res.statusCode, res.res.headers, res.res.body);";
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

        if (response.body) expectedResponse = response.body;
        else if (response.bodyFile) expectedResponse = JSON.parse(cli.readFile("lib/" + response.bodyFile));

        _tc += "expect(err).to.be.null;";
        _tc += "expect(res.body).to.be.not.null;";

        if (Object.prototype.toString.call(expectedResponse) == "[object Array]") {
            if (expectedResponse.length == 0) {
                _tc += "expect(res.body).to.eql(" + JSON.stringify(expectedResponse) + ");";
            } else {
                for (var i = 0; i < expectedResponse.length; i++) {
                    for (k in expectedResponse[i]) {
                        if (expectedResponse[i][k] != null) {
                            if (typeof expectedResponse[i][k] == "boolean") _tc += "expect(res.body[" + i + "]['" + k + "']).to.be." + expectedResponse[i][k] + ";";
                            if (typeof expectedResponse[i][k] == "string") _tc += "expect(res.body[" + i + "]['" + k + "']).to.equal('" + expectedResponse[i][k] + "');";
                            if (typeof expectedResponse[i][k] == "object") _tc += "expect(res.body[" + i + "]['" + k + "']).to.eql(" + JSON.stringify(expectedResponse[i][k]) + ");";
                        } else _tc += "expect(res.body[" + i + "]['" + k + "']).to.be.not.empty;";
                    }
                }
            }
        } else {
            for (k in expectedResponse) {
                if (expectedResponse[k] != null) {
                    if (typeof expectedResponse[k] == "boolean") _tc += "expect(res.body." + k + ").to.be." + expectedResponse[k] + ";";
                    if (typeof expectedResponse[k] == "string") _tc += "expect(res.body." + k + ").to.equal('" + expectedResponse[k] + "');";
                    if (typeof expectedResponse[k] == "object") _tc += "expect(res.body." + k + ").to.eql(" + JSON.stringify(expectedResponse[k]) + ");";
                } else _tc += "expect(res.body." + k + ").to.be.not.empty;";
            }
        }
    }
    _tc += "logger.info('" + tc + " :: PASS');";
    _tc += "}catch (_err){logger.error(_err.message);";
    _tc += "logger.info('" + tc + " :: FAIL');";
    _tc += "assert.fail(_err.actual, _err.expected, _err.message);};";
    _tc += "done();});});";
};

e.generate = function(_f) {
    let suffix = _f.split(".")[0] + ".js";
    var opf = "scripts/" + suffix;
    if (os.platform() == "win32") opf = "scripts\\" + suffix;
    _tc = "var winston = require('winston'); function getDateTime() {var sd = new Date();var syear = sd.getFullYear();var smonth = ('0' + (sd.getMonth() + 1)).slice(-2);var sdate = ('0' + sd.getDate()).slice(-2);var shours = ('0' + sd.getHours()).slice(-2);var sminutes = ('0' + sd.getMinutes()).slice(-2);var sseconds = ('0' + sd.getSeconds()).slice(-2);var startDate = syear + '-' + smonth + '-' + sdate;var startTime = shours + '-' + sminutes + '-' + sseconds;return startDate + '_' + startTime;}; var logger = new (winston.Logger)({transports: [new (winston.transports.File)({ filename: 'logs/Log_'+getDateTime()+'_" + _f + ".log'})]});" + _tc;
    fs.writeFileSync(opf, _tc);
    return opf;
};

module.exports = e;