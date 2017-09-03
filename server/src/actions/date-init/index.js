'use strict';
const action = /^date-init/i;
const Action = require("../action");
const app = require('../../../server');

class DateInit extends Action {
    constructor() {
        super(action);
    }

    getResponse(payload) {
        var session = payload.session.parameters;
        var Date = app.models.Date;
        return new Promise((resolve, reject) => {
            var data = {
                realm: session.agent,
                id: session.groupid,
                creator: session.userid,
                name: session.groupid,
                day: 1
            };
            Date.upsert(data, function(err, result) {
                var response;
                if (err)
                    response = err;
                else {
                    response = "done";
                }
                resolve({
                    "speech": response,
                    "displayText": response,
                    "data": {},
                    "source": "date-init-action",
                    "contextOut": []
                });
            });
        });
    }
}

module.exports = DateInit;
