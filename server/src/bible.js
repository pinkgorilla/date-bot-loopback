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

        var damId = `${parameter.version}${volumes.get(parameter.book).volume}2ET`;
        var from = 1 + (parameter.page - 1) * parameter.size;
        var to = parameter.page * parameter.size;

        var uri = `http://dbt.io/text/verse?key=${process.env.DBT_KEY}&dam_id=${damId}&book_id=${parameter.book}&chapter_id=${parameter.chapter}&verse_start=${from}&verse_end=${to}&v=2`;

        var outMore = {
            "name": "bible-read-more",
            "lifespan": 5,
            "parameters": parameter
        };
        var outVersion = Object.assign({}, outMore);
        outVersion.name = "bible-read-version";

        return fetch(uri)
            .then(result => result.json())
            .then(json => {
                var response = json.map(verse => `${verse.verse_id}. ${verse.verse_text}`).join("\n");
                return {
                    "speech": response,
                    "displayText": response,
                    "data": {},
                    "source": "bible-webhook",
                    "contextOut": [outMore, outVersion]
                };
            });
    }

    getParameter(data) {
        var parameters = data.result.parameters;
        var version = parameters.version;
        var book = parameters.book;
        var chapter = parameters.chapter;
        var from = Math.abs(parseInt(parameters.from || 1, 10));
        var to = Math.abs(parseInt(parameters.to || from || 1, 10));

        var page = parseInt(parameters.page || 1, 10);

        var size = from === to ? 1 : parseInt(parameters.size || 5, 10);
        var sizeChange = parseInt(parameters["size-change"] || size, 10);
        size = sizeChange === size ? size : sizeChange;

        return {
            "version": version,
            "book": book,
            "chapter": chapter,
            "from": from,
            "to": to,
            "page": page,
            "size": size
        };
    }
}

module.exports = Bible;
