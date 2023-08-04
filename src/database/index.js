import { Pool } from "pg";

const pool = new Pool({
  user: "zahin",
  host: "localhost",
  database: "blog-project",
  password: "",
  port: 5432,
});

async function query(text, value) {
  const start = Date.now();
  const res = await pool.query(text, value);
  const duration = Date.now() - start;
  console.log("executed query", { text, duration, rows: res.rowCount });
  return res;
}

export default query;
