'use strict';
const action = /^date-setup/i;
const Action = require("../action");
const app = require('../../../server');

class DateSetup extends Action {
    constructor() {
        super(action);
    }

    getResponse(payload) {
        var session = payload.session.parameters;
        var response = `please select DATE`;
        var outContext = Object.assign({}, payload.session)
        outContext.name = "date-setup"
        outContext.lifespan = 5;

        return Promise.resolve({
            "speech": response,
            "displayText": response,
            "data": {},
            "source": "date-setup-action",
            "contextOut": [outContext]
        });
    }
}

module.exports = DateSetup;
