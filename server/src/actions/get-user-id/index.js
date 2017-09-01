'use strict';

const action = /^get-user-id/i;
const Action = require("../action");

class GetUserId extends Action {
    constructor() {
        super(action);
    }

    getResponse(payload) {
        var session = payload.session;
        var response = `your id is : ${session.parameters.userid}`;
        return Promise.resolve({
            "speech": response,
            "displayText": response,
            "data": {},
            "source": "get-user-id-action",
            "contextOut": []
        });
    }
}

module.exports = GetUserId;
