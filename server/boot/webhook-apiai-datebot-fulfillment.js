var bodyParser = require("body-parser");
var jsonParser = bodyParser.json();
// create application/x-www-form-urlencoded parser 
var urlencodedParser = bodyParser.urlencoded({ extended: false });
const fetch = require("node-fetch");
const RestClient = require('node-rest-client').Client;
const rest = new RestClient();
module.exports = function(app) {
    var router = app.loopback.Router();
    router.post('/webhook/api-ai/date-bot/fulfillment', jsonParser, function(req, res) {
        var data = req.body;
        loadBible(data)
            .then(result => {
                var response = result;
                res.setHeader('Content-Type', 'application/json'); //Requires application/json MIME type
                res.send(JSON.stringify({
                    "speech": response,
                    "displayText": response
                    //"speech" is the spoken version of the response, "displayText" is the visual version
                }));
            })
            .catch(e => {
                var response = e;
                res.setHeader('Content-Type', 'application/json'); //Requires application/json MIME type
                res.send(JSON.stringify({
                    "speech": response,
                    "displayText": response
                }));
            });
    });
    app.use(router);
};

const oldTestaments = ["Gen", "Exod", "Lev", "Num", "Deut", "Josh", "Judg", "Ruth", "1Sam", "2Sam", "1Kgs", "2Kgs", "1Chr", "2Chr", "Ezra", "Neh", "Esth", "Job", "Ps", "Prov", "Eccl", "Song", "Isa", "Jer", "Lam", "Ezek", "Dan", "Hos", "Joel", "Amos", "Obad", "Jonah", "Mic", "Nah", "Hab", "Zeph", "Hag", "Zech", "Mal"];
const newTestaments = ["Matt", "Mark", "Luke", "John", "Acts", "Rom", "1Cor", "2Cor", "Gal", "Eph", "Phil", "Col", "1Thess", "2Thess", "1Tim", "2Tim", "Titus", "Phlm", "Heb", "Jas", "1Pet", "2Pet", "1John", "2John", "3John", "Jude", "Rev"];
const bookMap = new Map();
for (var book of oldTestaments)
    bookMap.set(book, "O");
for (var book of newTestaments)
    bookMap.set(book, "N");

function loadBible(data) {
    var parameters = data.result.parameters;
    var version = parameters.bible.version || parameters.version;
    var book = parameters.bible.book || parameters.book;
    var chapter = parameters.bible.chapter || parameters.chapter;
    var verseStart = parameters.bible["verse-start"] || 1;
    var verseEnd = parameters.bible["verse-end"] || verseStart;

    var damId = `${version}${bookMap.get(book)}2ET`;
    // var uri = `https://private-50b60-pinkgorilla.apiary-mock.com/bible`;
    var uri = `http://dbt.io/text/verse?key=${process.env.DBT_KEY}&dam_id=${damId}&book_id=${book}&chapter_id=${chapter}&verse_start=${verseStart}&verse_end=${verseEnd}&v=2`;
    // rest.get(uri, function(data, response){
    //     console.log(data);
    // })
    return fetch(uri)
        .then(result => result.json())
        .then(json => {
            return json.map(verse => `${verse.verse_id}. ${verse.verse_text}`).join("\n");
        });
}
