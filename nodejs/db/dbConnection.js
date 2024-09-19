//! This file contains the connection to the database, and the functions to get a connection to the database.
const mysql = require("mysql");
require("dotenv").config();

const pool = mysql.createPool({
  connectionLimit: 10, //* Maximum number of connections to create at once
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

pool.on("connection", () => {
  console.log("\u001b[32m","Connected to the database.", "\u001b[0m");
  
});

const getConnection = (callback) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Error connecting to database: ", err);
      return callback(err, null);
    }
    callback(null, connection);
  });
};

module.exports = {
  getConnection,
};
