var bodyParser = require("body-parser");
var jsonParser = bodyParser.json();
// create application/x-www-form-urlencoded parser 

const Bible = require('../src/actions/bible-read/index');
const bible = new Bible();

const Uid = require('../src/actions/get-user-id/index');
const uid = new Uid();

const Gid = require('../src/actions/get-group-id/index');
const gid = new Gid();

const DateInit = require('../src/actions/date-init/index');
const dateInit = new DateInit();

const DateSetup = require('../src/actions/date-setup/index');
const dateSetup = new DateSetup();

module.exports = function(app) {
    var router = app.loopback.Router();
    router.post('/webhook/api-ai/date-bot/fulfillment',
        jsonParser,
        uid.middleware(),
        gid.middleware(),
        dateInit.middleware(),
        dateSetup.middleware(),
        bible.middleware(),
        function(req, res) {
            var response = "i cannot process the information you provided";
            res.setHeader('Content-Type', 'application/json'); //Requires application/json MIME type
            res.send(JSON.stringify({
                "speech": response,
                "displayText": response
            }));
        });
    app.use(router);
};
