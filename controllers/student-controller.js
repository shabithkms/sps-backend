const collection = require("../config/collection");
const db = require("../config/connection");

module.exports = {
  doSignup: (req, res) => {
    return new Promise((resolve, reject) => {
        console.log(req.body);
    });
  },
};
