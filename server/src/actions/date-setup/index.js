'use strict';
const action = /^date-setup/i;
const Action = require("../action");
const app = require('../../../server');
const apiai = require('../../apiai');

class DateSetup extends Action {
    constructor() {
        super(action);
    }

    getResponse(payload) {
        var session = payload.session.parameters;
        var event = {
            name: "date-event",
            data: {
                name: "param1 value",
                day: 2
            }
        };

        return this.triggerEvent(event, session.userid)
            .then(result => {
                var response = result.result.fulfillment.speech;
                // var response = `please select DATE`;
                // var outContext = Object.assign({}, payload.session);
                // outContext.name = "date-setup";
                // outContext.lifespan = 5;

                return {
                    "speech": response,
                    "displayText": response,
                    "data": {},
                    "source": "date-setup-action",
                    "contextOut": []
                };
            });
    }
}

module.exports = DateSetup;
