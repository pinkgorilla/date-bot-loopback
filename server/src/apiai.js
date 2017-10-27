const apiai = require("apiai");
const agent = apiai(process.env.APIAI_KEY);

module.exports = agent;