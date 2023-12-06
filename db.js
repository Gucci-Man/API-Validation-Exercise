/** Database config for database. */


const { Client } = require("pg");
const { DB } = require("./config");

let db = new Client({
  host: "/var/run/postgresql",
  database: DB
});

db.connect();


module.exports = db;
