import pool from "./db.js";

function handleQuery(err, results) {
  if (err) {
    console.error("DB connection error:", err);
    return;
  }
  console.log("Connected! Tables:", results);
  pool.end();
}

pool.query("SHOW TABLES;", handleQuery);