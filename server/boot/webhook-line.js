const line = require('@line/bot-sdk');
const mia = require("../src/line-bot");

module.exports = function(app) {

    var router = app.loopback.Router();
    router.post('/webhook/line', line.middleware(mia.config), mia.middleware());
    app.use(router);
};
