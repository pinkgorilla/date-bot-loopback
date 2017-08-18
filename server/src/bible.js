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
            })
            .catch((e) => {
                return {
                    "speech": e,
                    "displayText": e,
                    "data": {},
                    "source": "bible-webhook",
                    "contextOut": []
                };
            });
    }

    getVerses(parameter) {
        var book = volumes.get(parameter.book);

        if (parameter.chapter > book.chapters.size)
            return Promise.reject(`the book of ${book.name} only contains ${book.chapters.size} chapters`);
        else {
            var chapter = book.chapters.get(parameter.chapter);

            var damId = `${parameter.version}${book.volume}2ET`;
            var totalVerse = (parameter.to - parameter.from) + 1;

            var from = parameter.from;
            var to = parameter.to;

            if (totalVerse <= parameter.size) {
                from = parameter.from + (parameter.page - 1) * totalVerse;
                to = from + totalVerse - 1;
            }
            else {
                from = parameter.from + (parameter.page - 1) * parameter.size;
                to = from + parameter.size - 1;
                to = parameter.to <= to ? parameter.to : to;
                if (from > parameter.to) {
                    from = parameter.to + 1 + parseInt((from - parameter.to) / 5, 10) * parameter.size;
                    to = from + parameter.size - 1;
                }
            }
            to = to > chapter.length ? chapter.length : to;

            if (from > chapter.length) {
                if (book.chapters.size >= parameter.chapter + 1) {
                    parameter.chapter++;
                    parameter.from = 1;
                    parameter.to = 1;
                    from = parameter.from;
                    to = from + parameter.size - 1;
                    chapter = book.chapters.get(parameter.chapter);
                }
                else {
                    return Promise.reject(`You have reach the end of book of ${book.name}.`);
                }
            }

            var uri = `http://dbt.io/text/verse?key=${process.env.DBT_KEY}&dam_id=${damId}&book_id=${parameter.book}&chapter_id=${parameter.chapter}&verse_start=${from}&verse_end=${to}&v=2`;
            return fetch(uri)
                .then(result => result.json())
                .then(json => {
                    var header = `${book.name} chapter ${parameter.chapter} verse ${from} - ${to} of ${chapter.length} verses.\n`;
                    var footer = `\nsay next to show more...`;
                    return [].concat.apply([], [
                        [header],
                        [].concat.apply([], json.map(verse => `${verse.verse_id}. ${verse.verse_text}`)), [footer]
                    ]).join("\n");
                });
        }
    }

    getParameter(data) {
        var parameters = data.result.parameters;
        var bible = data.result.parameters.bible || {};
        var version = parameters.version;
        var book = bible.book || parameters.book;
        var chapter = Math.abs(parseInt(bible.chapter || parameters.chapter || 1, 10));

        var from = Math.abs(parseInt(bible["verse-start"] || parameters.from || 1, 10));
        var to = Math.abs(parseInt(bible["verse-end"] || parameters.to || from || 1, 10));
        var arr = [from, to].sort((a, b) => a - b);

        var page = parseInt(parameters.page || 1, 10);

        var size = parseInt(parameters.size || 5, 10);
        var sizeChange = parseInt(parameters["size-change"] || 0, 10);
        // size = sizeChange === size ? size : sizeChange;

        return {
            "version": version,
            "book": book,
            "chapter": chapter,
            "from": arr[0],
            "to": arr[1],
            "page": page,
            "size": size,
            "sizeChange": sizeChange
        };
    }
}

module.exports = Bible;
