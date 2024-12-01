import { Pool } from 'pg';


export const pool = new Pool({
  user: process.env.POSTGRESQL_USER,
  host: process.env.POSTGRESQL_HOST,
  database: process.env.POSTGRESQL_DB,
  password: process.env.POSTGRESQL_PASSWORD,
  port: Number(process.env.POSTGRESQL_PORT) || 5432, 
});


export default async function dbConnect() {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query("SELECT NOW();");
      console.log("Connected to database! ", result.rows);
    } finally {
      client.release();
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Error connecting to database:", err.message);
    } else {
      console.error("Unknown error:", err);
    }
  }
}