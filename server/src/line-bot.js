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
        var mention = /^(@|!)?mia(:|,)? /i;

        if (event.type !== 'message' || event.message.type !== 'text' || (event.source.type === "group" && !event.message.text.match(mention))) {
            // ignore non-text-message event
            return Promise.resolve(null);
        }

        var message = event.message.text.replace(mention, "");
        var userId = event.source.userId;

        var agent = apiai(process.env.APIAI_KEY);
        var request = agent.textRequest(message, {
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
