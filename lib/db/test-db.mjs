import pg from 'pg';
import * as dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

console.log("Connecting to:", process.env.DATABASE_URL.replace(/:[^:@]+@/, ':***@'));

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Connection error:', err.message);
  } else {
    console.log('Connected successfully:', res.rows[0]);
  }
  pool.end();
});
