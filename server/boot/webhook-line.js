const line = require('@line/bot-sdk');
const LineBot = require("../src/line-bot");
const config = {
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
    channelSecret: process.env.LINE_CHANNEL_SECRET,
};

module.exports = function(app) {

    const bot = new LineBot(config);
    var router = app.loopback.Router();
    router.post('/webhook/line', line.middleware(config), bot.middleware());
    app.use(router);
};
