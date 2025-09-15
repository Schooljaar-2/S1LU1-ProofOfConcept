import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

const isDeployment = process.env.DEV_ENVIRONMENT === "online";

const pool = mysql.createPool({
  host: isDeployment ? process.env.DB_ONLINE_HOST : process.env.DB_HOST,
  user: isDeployment ? process.env.DB_ONLINE_USER : process.env.DB_USER,
  password: isDeployment
    ? process.env.DB_ONLINE_PASSWORD
    : process.env.DB_PASSWORD,
  database: isDeployment ? process.env.DB_ONLINE_NAME : process.env.DB_NAME,
  port: isDeployment ? process.env.DB_ONLINE_PORT : process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const query = (sql, params, callback) => {
  pool.query(sql, params, callback);
};

export default query;
