require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;

// Database configuration
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// Test database connection
async function connectDB() {
    try {
        const client = await pool.connect();
        console.log('Connected to PostgreSQL database');
        await createTable();
        client.release();
    } catch (err) {
        console.error('Database connection error:', err);
        console.error('Connection details:', {
            error: err.message,
            code: err.code
        });
    }
}

// Create table if not exists
async function createTable() {
    const sql = `
        CREATE TABLE IF NOT EXISTS mytodos (
            id SERIAL PRIMARY KEY,
            text TEXT NOT NULL,
            completed BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;
    try {
        await pool.query(sql);
        console.log('Table check/creation successful');
    } catch (err) {
        console.error('Error creating table:', err.message);
    }
}

// Initialize database connection
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/build')));

// API Routes
app.get('/api/mytodos', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM mytodos ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/mytodos', async (req, res) => {
    const { text } = req.body;
    if (!text || text.trim() === '') {
        return res.status(400).json({ error: 'Please enter task' });
    }
    try {
        const result = await pool.query(
            'INSERT INTO mytodos (text) VALUES ($1) RETURNING *',
            [text.trim()]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/mytodos/:id', async (req, res) => {
    const { id } = req.params;
    const { completed, text } = req.body;
    try {
        let result;
        if (completed !== undefined && text === undefined) {
            result = await pool.query(
                'UPDATE mytodos SET completed = $1 WHERE id = $2 RETURNING *',
                [completed, id]
            );
        } else if (text !== undefined) {
            result = await pool.query(
                'UPDATE mytodos SET text = $1 WHERE id = $2 RETURNING *',
                [text, id]
            );
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/mytodos/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM mytodos WHERE id = $1', [id]);
        res.json({ message: 'Task deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Serve React app
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 
