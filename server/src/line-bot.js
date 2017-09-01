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
        var mention = /^(@|!)?bot(:|,)? /i;

        if (event.type !== 'message' || event.message.type !== 'text' || (event.source.type === "group" && !event.message.text.match(mention))) {
            // ignore non-text-message event
            return Promise.resolve(null);
        }

        var message = event.message.text.replace(mention, "");
        var userId = event.source.userId;
        var groupId = event.source.groupId;
        var session = {
            name: 'session',
            parameters: {
                'userid': userId,
                'groupid': groupId,
                'agent': "line"
            }
        };

        var agent = apiai(process.env.APIAI_KEY);
        var data = {
            sessionId: userId,
            contexts: [session]
        };
        if (!session.parameters.groupid)
            delete session.parameters.groupid;

        var request = agent.textRequest(message, data);

        request.on('response', (response) => {
            var message = response.result.fulfillment.speech;
            var messages = [];
            var chunk;
            while (message.length > 0) {
                var offset = message.indexOf("\n", 1500);
                if (offset < 0) {
                    chunk = message;
                    message = "";
                }
                else {
                    chunk = message.substr(0, offset);
                    message = message.substr(offset);
                }
                chunk = chunk.replace(/^[\n\s\r]*|[\n\s\r]*$/g, '');
                messages.push({ type: 'text', text: chunk });
            }
            return this.replyMessage(event.replyToken, messages);
        });

        request.on('error', (error) => {
            console.log(error);
        });

        request.end();
    }
}

module.exports = Maia;
