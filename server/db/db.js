const DB = require('pg').Pool;

const db = new DB({
  user: "postgres",
  password: "postgres",
  database: "postgres",
  host: "40.88.137.31",
  port: "5432"
});

module.exports = db;