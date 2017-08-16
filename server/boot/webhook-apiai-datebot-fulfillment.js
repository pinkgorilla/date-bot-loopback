var bodyParser = require("body-parser");
var jsonParser = bodyParser.json();
// create application/x-www-form-urlencoded parser 

const Bible = require('../src/bible');
const bible = new Bible();

module.exports = function(app) {
    var router = app.loopback.Router();
    router.post('/webhook/api-ai/date-bot/fulfillment',
        jsonParser,
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
