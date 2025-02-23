require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 4000;

// Database configuration
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// Add health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Test database connection with better error logging
async function connectDB() {
    let retries = 5;
    while (retries) {
        try {
            const client = await pool.connect();
            console.log('Connected to PostgreSQL database');
            console.log('Connection info:', {
                host: process.env.PGHOST,
                port: process.env.PGPORT,
                database: process.env.PGDATABASE,
                user: process.env.PGUSER?.split('@')[0] // Log without password
            });
            await createTable();
            client.release();
            return;
        } catch (err) {
            console.error(`Connection attempt ${6 - retries} failed:`, err.message);
            console.error('Connection error details:', {
                code: err.code,
                syscall: err.syscall,
                address: err.address
            });
            retries -= 1;
            if (!retries) {
                console.log('Failed to connect after 5 attempts, but continuing...');
                return;
            }
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
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
connectDB().catch(console.error);

app.use(cors({
    origin: [
        'http://localhost:3000',
        'https://todo-app-myclient.onrender.com',
        'https://your-render-server-url.onrender.com'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Add at the start of your routes
app.get('/', (req, res) => {
    res.json({ message: 'Server is running' });
});

// Get all todos
app.get('/api/mytodos', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM mytodos ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create todo
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

// Update todo
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

// Delete todo
app.delete('/api/mytodos/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM mytodos WHERE id = $1', [id]);
        res.json({ message: 'Task deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 
