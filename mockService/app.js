const express = require("express");
var bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.json());

let ids = [];
let tokens = [];
let data = [];

var loginResponse = () => {
    let _token = new Date().getTime() + "" + new Date().getTime();
    tokens.push(_token);
    return {
        token: _token
    };
};

var sampleError = {
    message: "Invalid request"
};

function validateLogin(req, res) {
    let token = req.get("token");
    if (tokens.indexOf(token) != -1) return true;
    res.status(400).json(sampleError);
}
app.all("*", (req, res, next) => {
    console.log((new Date()).toJSON(), req.method, req.url);
    next();
});
app.get("/", (req, res) => {
    res.status(403).json(sampleError);
});
app.post("/", (req, res) => {
    res.status(400).json(sampleError);
});

app.post("/login", (req, res) => {
    console.log(req.body);
    if (req.body.username && req.body.username == "alice") res.json(loginResponse());
    else res.status(400).json({
        message: "Login error!"
    });
});

app.get("/data/:id", (req, res) => {
    if (validateLogin(req, res)) {
        let index = ids.indexOf(req.params.id);
        if (index > -1) res.json(data[index]);
        else res.status(404).end();
    }
});

app.get("/data", (req, res) => {
    if (validateLogin(req, res)) res.json(data);
});

app.post("/data", (req, res) => {
    if (validateLogin(req, res)) {
        res.set("Time", new Date().toJSON());
        res.set("allOk", "yes");
        let response = req.body ? req.body : {};
        response["_id"] = new Date().getTime().toString();
        ids.push(response._id);
        data.push(response);
        res.json(response);
    }
});

app.put("/data/:id", (req, res) => {
    if (validateLogin(req, res)) {
        let index = ids.indexOf(req.params.id);
        if (index > -1) {
            let _data = req.body ? req.body : {};
            _data["_id"] = req.params.id;
            data[index] = _data;
            res.json(_data);
        } else res.status(404).end();
    }
});

app.delete("/data/:id", (req, res) => {
    if (validateLogin(req, res)) {
        let index = ids.indexOf(req.params.id);
        if (index > -1) {
            ids.splice(index, 1);
            data.splice(index, 1);
            res.json({
                _id: req.params.id
            });
        } else res.status(404).end();
    }
});

app.listen(8080, function() {
    console.log("App listening on 8080!");
});