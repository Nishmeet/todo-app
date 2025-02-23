const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 4000;

// MongoDB Connection URL
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://your-mongodb-url';
let db;

// Connect to MongoDB
async function connectToDb() {
    try {
        const client = await MongoClient.connect(MONGODB_URI);
        db = client.db('tododb');
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('MongoDB connection error:', err);
    }
}

connectToDb();

app.use(cors({
    origin: [
        'http://localhost:3000',
        'https://todo-app-client-q25j.onrender.com',  // Add your Render client URL
        
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Get all todos
app.get('/api/mytodos', async (req, res) => {
    try {
        const todos = await db.collection('todos').find().toArray();
        res.json(todos);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create todo
app.post('/api/mytodos', async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) {
            return res.status(400).json({ error: 'Please enter task' });
        }
        const todo = {
            text,
            completed: false,
            created_at: new Date()
        };
        const result = await db.collection('todos').insertOne(todo);
        res.json({ ...todo, id: result.insertedId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update todo
app.put('/api/mytodos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { completed, text } = req.body;
        const update = {};
        if (completed !== undefined) update.completed = completed;
        if (text !== undefined) update.text = text;

        const result = await db.collection('todos').findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: update },
            { returnDocument: 'after' }
        );
        res.json(result.value);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete todo
app.delete('/api/mytodos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.collection('todos').deleteOne({ _id: new ObjectId(id) });
        res.json({ message: 'Task deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 
