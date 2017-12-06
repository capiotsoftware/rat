module.exports = {
    "testName": "Sample API Tests",
    "url": ["http://localhost:8080"],
    "globals": ["loginResponse"],
    "tests": [{
            "endpoint": "1",
            "name": "Error API - GET",
            "request": {
                "method": "GET",
                "url": "/",
                "responseCode": 403
            }
        },
        {
            "endpoint": "1",
            "name": "Error API - POST",
            "request": {
                "method": "POST",
                "url": "/",
                "responseCode": 400
            }
        },
        {
            "endpoint": "1",
            "name": "Login - Valid",
            "request": {
                "method": "POST",
                "url": "/login",
                "payload": {
                    "username": "alice",
                    "password": "password"
                },
                "responseCode": 200,
                "saveResponse": "loginResponse",
            },
            "response": {
                "body": {
                    "token": null
                }
            }
        },
        {
            "endpoint": "1",
            "name": "Login - Invalid",
            "request": {
                "method": "POST",
                "url": "/login",
                "payload": {
                    "username": "alice123",
                    "password": "password"
                },
                "responseCode": 400,
                "saveResponse": false
            },
            "response": {
                "body": {
                    "message": "Login error!"
                }
            }
        },
        {
            "endpoint": "1",
            "name": "Fetch data - Valid",
            "request": {
                "method": "GET",
                "url": "/data",
                "headers": {
                    "token": "loginResponse.token"
                },
                "responseCode": 200,
                "saveResponse": false
            },
            "response": {
                "bodyFile": "sampleResponsePayload.json"
            }
        },
        {
            "endpoint": "1",
            "name": "Fetch data - Inalid",
            "request": {
                "method": "GET",
                "url": "/data",
                "headers": {
                    "token": "'asdasdasdasd'"
                },
                "responseCode": 400,
                "saveResponse": false
            },
            "response": {
                "body": {
                    "message": "Invalid request"
                }
            }
        },
        {
            "endpoint": "1",
            "name": "Send data",
            "request": {
                "method": "POST",
                "url": "/data",
                "headers": {
                    "token": "loginResponse.token"
                },
                "payloadFile": "sampleRequestPayload.json",
                "responseCode": 200,
                "saveResponse": false
            },
            "response": {
                "headers": {
                    "time": null,
                    "allOk": "yes"
                },
                "body": {
                    "name": "Alice Cooper",
                    "address": {
                        "line1": "#404 Pritam Woods",
                        "line2": "Bellandur",
                        "city": "Bangalore",
                        "state": "Karnataka",
                        "country": "India",
                        "pin": "560103"
                    },
                    "mobile": "+91 987 654 4323",
                    "nameOfChildren": ["Alpha Cooper", "Beta Cooper", "Charlie Cooper"],
                    "dateOfBirths": null
                }
            }
        }
    ]
};