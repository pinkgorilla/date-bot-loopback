const action = /^user-id/i;

class UserId {
    constructor() {
        this.load = this.load.bind(this);
    }
    middleware() {
        return (req, res, next) => {
            var payload = req.body;
            if (!payload.result.action.match(action) || payload.result.actionIncomplete)
                next();
            else {
                this.load(payload)
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
    }
    load(data) {
        var action = data.result.action;

        var session = {
            "name": "session",
            "lifespan": 5,
            "parameters": {
                "userid": data.result.parameters.userid,
                "agent": data.result.parameters.agent
            }
        };

        var response = `your id is : ${data.result.parameters.userid}`;
        return Promise.resolve({
            "speech": response,
            "displayText": response,
            "data": {},
            "source": "userid-webhook",
            "contextOut": [session]
        });
    }
}

module.exports = UserId;
