'use strict';

const action = /^get-group-id/i;
const Action = require("../action");

class GetGroupId extends Action {
    constructor() {
        super(action);
    }

    getResponse(payload) {
        var session = payload.session;
        var response = "unable to resolve group id";
        if (session.parameters.groupid)
            response = `the group id is : ${session.parameters.groupid}`;

        return Promise.resolve({
            "speech": response,
            "displayText": response,
            "data": {},
            "source": "get-group-id-action",
            "contextOut": []
        });
    }
}

module.exports = GetGroupId;
