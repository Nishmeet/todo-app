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

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client/build')));

// Function to get IPv4 address
async function getIPv4Address(hostname) {
    try {
        const addresses = await dns.resolve4(hostname);
        return addresses[0];
    } catch (err) {
        console.error('DNS resolution error:', err);
        return hostname;
    }
}

// Initialize database connection
async function initializeDatabase() {
    try {
        // Extract hostname from DATABASE_URL
        const url = new URL(process.env.DATABASE_URL);
        const ipv4 = await getIPv4Address(url.hostname);
        
        // Reconstruct connection string with IPv4
        const connectionString = process.env.DATABASE_URL.replace(url.hostname, ipv4);
        
        return new Pool({
            connectionString,
            ssl: {
                rejectUnauthorized: false
            }
        });
    } catch (err) {
        console.error('Database initialization error:', err);
        process.exit(1);
    }
}

let pool;

// Initialize pool
initializeDatabase().then(p => {
    pool = p;
    console.log('Database pool initialized');
}).catch(err => {
    console.error('Failed to initialize database:', err);
});

// Test connection endpoint
app.get('/', async (req, res) => {
    try {
        if (!pool) {
            return res.status(500).json({ status: 'Error', message: 'Database not initialized' });
        }
        const client = await pool.connect();
        await client.query('SELECT NOW()');
        client.release();
        res.json({ status: 'Connected to database!' });
    } catch (err) {
        res.status(500).json({ status: 'Error', message: err.message });
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

// CORS configuration
app.use(cors({
    origin: [
        'http://localhost:3000',
        process.env.CLIENT_URL || '*'
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

// The "catch all" handler for React app
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 
