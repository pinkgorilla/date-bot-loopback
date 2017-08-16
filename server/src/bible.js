const fetch = require("node-fetch");

const oldTestaments = ["Gen", "Exod", "Lev", "Num", "Deut", "Josh", "Judg", "Ruth", "1Sam", "2Sam", "1Kgs", "2Kgs", "1Chr", "2Chr", "Ezra", "Neh", "Esth", "Job", "Ps", "Prov", "Eccl", "Song", "Isa", "Jer", "Lam", "Ezek", "Dan", "Hos", "Joel", "Amos", "Obad", "Jonah", "Mic", "Nah", "Hab", "Zeph", "Hag", "Zech", "Mal"];
const newTestaments = ["Matt", "Mark", "Luke", "John", "Acts", "Rom", "1Cor", "2Cor", "Gal", "Eph", "Phil", "Col", "1Thess", "2Thess", "1Tim", "2Tim", "Titus", "Phlm", "Heb", "Jas", "1Pet", "2Pet", "1John", "2John", "3John", "Jude", "Rev"];
const bookMap = new Map();
for (var book of oldTestaments)
    bookMap.set(book, "O");
for (var book of newTestaments)
    bookMap.set(book, "N");


class Bible {
    constructor() {
        this.load = this.load.bind(this);
    }
    middleware() {
        return (req, res, next) => {
            var payload = req.body;
            if (payload.result.action !== "bible.read" || payload.result.actionIncomplete)
                next();
            else {
                this.load(payload)
                    .then(result => {
                        var response = result;
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
        var parameters = data.result.parameters;
        var bible = parameters.bible || {};
        var version = bible.version || parameters.version;
        var book = bible.book || parameters.book;
        var chapter = bible.chapter || parameters.chapter;
        var verseStart = Math.abs(parseInt(bible["verse-start"] || parameters["verse-start"] || 1, 10));
        var verseEnd = Math.abs(parseInt(bible["verse-end"] || parameters["verse-end"] || verseStart || 1, 10));

        var totalVerses = verseEnd - (verseStart - 1);
        var page = parseInt(parameters.page || 1);
        var size = parseInt(parameters.size || 5);

        var from = page === 1 ? verseStart : (page - 1) * size;
        var to = verseEnd > (from + size - 1) ? (from + size - 1) : verseEnd;

        var damId = `${version}${bookMap.get(book)}2ET`;

        var uri = `http://dbt.io/text/verse?key=${process.env.DBT_KEY}&dam_id=${damId}&book_id=${book}&chapter_id=${chapter}&verse_start=${from}&verse_end=${to}&v=2`;

        return fetch(uri)
            .then(result => result.json())
            .then(json => {
                var response = json.map(verse => `${verse.verse_id}. ${verse.verse_text}`).join("\n");
                return {
                    "speech": response,
                    "displayText": response,
                    "contextOut": [{
                        "name": "bible-reading-followup ",
                        "lifespan": 1,
                        "parameters": {
                            "version": version,
                            "book": version,
                            "chapter": version,
                            "verse-start": version,
                            "verse-end": version,
                            "page": page+1,
                            "size": size


                        }
                    }]
                };
            });
    }
}

module.exports = Bible;
