const fetch = require("node-fetch");
const volumes = require("./bible-volume");
const action = /^bible-read/i;

class Bible {
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
        var parameter = this.getParameter(data);
        var action = data.result.action;

        if (action === "bible-read-more")
            parameter.page += 1;

        return this.getVerses(parameter)
            .then(verses => {
                var outMore = {
                    "name": "bible-read-more",
                    "lifespan": 5,
                    "parameters": parameter
                };
                var outVersion = Object.assign({}, outMore);
                outVersion.name = "bible-read-version";

                return {
                    "speech": verses,
                    "displayText": verses,
                    "data": {},
                    "source": "bible-webhook",
                    "contextOut": [outMore, outVersion]
                };
            });
    }

    getVerses(parameter) {
        var damId = `${parameter.version}${volumes.get(parameter.book).volume}2ET`;
        var totalVerse = (parameter.to - parameter.from) + 1;

        var from = totalVerse <= parameter.size ? parameter.from + (parameter.page - 1) * totalVerse : parameter.from + (parameter.page - 1) * parameter.size;
        var to = totalVerse <= parameter.size ? (from + totalVerse - 1) : parameter.page * parameter.size;

        var uri = `http://dbt.io/text/verse?key=${process.env.DBT_KEY}&dam_id=${damId}&book_id=${parameter.book}&chapter_id=${parameter.chapter}&verse_start=${from}&verse_end=${to}&v=2`;
        return fetch(uri)
            .then(result => result.json())
            .then(json => {
                return json.map(verse => `${verse.verse_id}. ${verse.verse_text}`).join("\n");
            });
    }

    getParameter(data) {
        var parameters = data.result.parameters;
        var version = parameters.version;
        var book = parameters.book;
        var chapter = parameters.chapter;

        var from = Math.abs(parseInt(parameters.from || 1, 10));
        var to = Math.abs(parseInt(parameters.to || from || 1, 10));
        var arr = [from, to].sort((a, b) => a - b);

        var page = parseInt(parameters.page || 1, 10);

        var size = parseInt(parameters.size || 5, 10);
        var sizeChange = parseInt(parameters["size-change"] || size, 10);
        size = sizeChange === size ? size : sizeChange;

        return {
            "version": version,
            "book": book,
            "chapter": chapter,
            "from": arr[0],
            "to": arr[1],
            "page": page,
            "size": size
        };
    }
}

module.exports = Bible;
