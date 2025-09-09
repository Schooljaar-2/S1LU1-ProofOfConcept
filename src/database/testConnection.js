import pool from "./db.js";

async function test() {
  try {
    const [rows] = await pool.query("SHOW TABLES;");
    console.log("Connected! Tables:", rows);
  } catch (err) {
    console.error("DB connection error:", err);
  } finally {
    pool.end(); // close pool when done
  }
}

test();