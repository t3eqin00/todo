import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config()

const { Pool } = pkg;

// Function to create and return a database connection pool
    const pool = new Pool({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.NODE_ENV === 'test' ? process.env.TEST_DB_NAME : process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
    });

// JWT secret configuration with a default fallback
const jwtSecret = process.env.JWT_SECRET_KEY || 'testsecret';


// Test the database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error connecting to the database:', err);
  } else {
    console.log('Database connected successfully:', res.rows[0]);
  }
});

export { pool, jwtSecret };