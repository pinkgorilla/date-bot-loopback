'use strict';

class Action {
    constructor(action) {
        this.execute = this.execute.bind(this);
        this.action = action;
    }

    middleware() {
        var func = function(req, res, next) {
            var payload = req.body;
            if (!payload.result.action.match(this.action) || payload.result.actionIncomplete)
                next();
            else {
                this.execute(payload)
                    .then(result => {
                        res.setHeader('Content-Type', 'application/json'); //Requires application/json MIME type
                        res.send(JSON.stringify(result));
                    })
                    .catch(e => {
                        var response = e;
                        res.setHeader('Content-Type', 'application/json'); //Requires application/json MIME type
                        res.send(JSON.stringify({
                            "speech": response,
                            "displayText": response
                        }));
                    });
            }
        };
        return func.bind(this);
    }
    loadSessionContext(payload) {
        var parameters = payload.result.parameters;
        var sessionContext = {
            "name": "session",
            "lifespan": 0,
            "parameters": {
                "userid": parameters.userid,
                "groupid": parameters.groupid,
                "agent": parameters.agent
            }
        };
        return Promise.resolve(sessionContext);
    }

    execute(payload) {
        return this.loadSessionContext(payload)
            .then(sessionContext => {
                payload.session = sessionContext;

                return this.getResponse(payload)
                    .then(response => {
                        response.contextOut = response.contextOut || [];
                        if (response.contextOut.indexOf(sessionContext) < 0)
                            response.contextOut.push(sessionContext);
                        return response;
                    });
            });
    }

    getResponse(payload) {
        return Promise.reject("not implemented");
    }
}

module.exports = Action;
