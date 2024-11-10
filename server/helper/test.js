import fs from 'fs';
import path from 'path';
import { pool } from './db.js';
import { hash } from 'bcrypt';
import jwt from 'jsonwebtoken';
import { jwtSecret } from './db.js';

const __dirname = import.meta.dirname;

const initializeTestDb = () => {
    const sql = fs.readFileSync(path.resolve(__dirname, "../todo.sql"), "utf8");
    pool.query(sql);
};

const insertTestUser = async (email, password) => {
    try {
        // Log the database that will be used
        console.log("Connected to database:", process.env.NODE_ENV === 'development' ? process.env.DB_NAME : process.env.TEST_DB_NAME);

        const hashedPassword = await new Promise((resolve, reject) => {
            hash(password, 10, (error, hashedPassword) => {
                if (error) reject(error);
                else resolve(hashedPassword);
            });
        });
        
        await pool.query('INSERT INTO account (email, password) VALUES ($1, $2)', [email, hashedPassword]);
        console.log(`Inserted test user: ${email}`);
        console.log(`Hashed password: ${hashedPassword}`);
    } catch (error) {
        console.error("Error inserting test user:", error);
        throw error;
    }
};

// Use jsonwebtoken's sign method with the imported jwtSecret
const getToken = (email) => {
    return jwt.sign({ user: email }, jwtSecret, { expiresIn: '24h' });
};

export { initializeTestDb, insertTestUser, getToken };
