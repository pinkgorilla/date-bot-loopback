const line = require('@line/bot-sdk');
const apiai = require("apiai");


class Maia extends line.Client {

    constructor(config) {
        super(config);
        this.handleEvent = this.handleEvent.bind(this);
    }

    middleware() {
        return (req, res, next) => {
            Promise
                .all(req.body.events.map(this.handleEvent))
                .then((result) => res.json(result));
        };
    }

    handleEvent(event) {
        if (event.type !== 'message' || event.message.type !== 'text') {
            // ignore non-text-message event
            return Promise.resolve(null);
        }
        var userId = event.source.userId;

        var agent = apiai(process.env.APIAI_KEY);
        var request = agent.textRequest(event.message.text, {
            sessionId: userId
        });

        request.on('response', (response) => {
            const echo = { type: 'text', text: response.result.fulfillment.speech };
            // use reply API
            return this.replyMessage(event.replyToken, echo);
        });

        request.on('error', (error) => {
            console.log(error);
        });

        request.end();
    }
}

module.exports = Maia;
