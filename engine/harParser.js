const fs = require("fs");
const path = require("path");


function __parseHarFile(_harFile){
	let harData = fs.readFileSync(path.join(process.cwd(), _harFile)).toString()
	harData = JSON.parse(harData)
	let tc = [];
	harData.log.entries.forEach((_entry, _index) => {
		console.log(_entry.request.url)
		let test = {
			"endpoint": "1",
			"delimiters": ["<%", "%>"],
			"name": `TEST - ${_index + 1}`,
			"request": {
				"method": _entry.request.method,
				"url": _entry.request.url,
				"headers": {},
				"responseCode": _entry.response.status
			},
			"response": {
				"headers": {},
				"body": _entry.response.content.mimeType.indexOf("application/json") != -1 ? JSON.parse(_entry.response.content.text) : _entry.response.content.text
			}
		}
		_entry.request.headers.forEach(_h => test.request.headers[_h.name] = _h.value)
		_entry.response.headers.forEach(_h => test.response.headers[_h.name] = _h.value)
		if(["POST", "PUT"].indexOf(test.request.method) != -1 ) {
			test.request["payload"] = _entry.request.postData.mimeType.indexOf("application/json") != -1 ? JSON.parse(_entry.request.postData.text) : _entry.request.postData.text
		}
		tc.push(JSON.stringify(test))
	})
	return tc
}

function init(_harFile){
	let head = `{"testName": "HAR Generated file : ${_harFile}","url": [""],"modules": [],"globals": [],"tests":[`
	let tests = __parseHarFile(_harFile)
	let tail = `]}`
	let testCaseData = `${head}${tests.join(",")}${tail}`
	fs.writeFileSync(path.join(process.cwd(), "tests", `${_harFile}.json`), testCaseData);
}

module.exports = init;