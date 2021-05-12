const DB = require('pg').Pool;

const db = new DB({
  user: "newuser",
  password: "",
  database: "catwalk_reviews",
  host: "localhost",
  port: "5432"
});

module.exports = db;