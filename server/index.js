const express=require('express')
const cors=require('cors');
const path=require('path');
const sqlite3=require('sqlite3').verbose();

const app=express();
const PORT=4000;

app.use(cors());
app.use(express.json());


// Database setup
const dbPath = path.join(__dirname, 'mytodo.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to database:', err);
  } else {
    console.log('Connected to SQLite database at:', dbPath);
    createTable();
  }
});
// Create todos table with better error handling
function createTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS mytodos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        text TEXT NOT NULL,
        completed BOOLEAN DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    db.run(sql, (err) => {
      if (err) {
        console.error('Error creating table:', err);
      } else {
        console.log('Todos table ready');
      }
    });
}

//Api - Get - retrive all the todos from the table
app.get('/api/mytodos',(req,res,next)=>{
    console.log('GET /api/mytodos request received');
    db.all('SELECT * FROM mytodos',[],(error,rows)=>{
        if(error) {
            return res.status(500).json({error: error.message});
        }
        res.json(rows);
    });
});

//API -post to create new Todo -
app.post('/api/mytodos',(req,res,next)=>{
    console.log('Received todo request with body:', req.body);
    
    // Handle both array format and object format
    let todoText;
    if (Array.isArray(req.body) && req.body[0] && Array.isArray(req.body[0])) {
        // Handle array format [['text', 'value']]
        todoText = req.body[0][1];
    } else if (Array.isArray(req.body) && req.body.length === 2) {
        // Handle array format ['text', 'value']
        todoText = req.body[1];
    } else {
        // Handle object format {text: 'value'}
        todoText = req.body.text;
    }
    
    if(!todoText || todoText.trim() === '') {
        console.log('Invalid todo text received:', todoText);
        return res.status(400).json({error: 'Please enter task'});
    }
    
    db.run('INSERT INTO mytodos (text) VALUES (?)', [todoText],
        function (err){
            if(err) {
                console.log("Database Error: ",err);
                return res.status(500).json({error: err.message});
            }
            const newtodo = {
                id: this.lastID,
                text: todoText,
                completed: 0,
            };
            console.log('Successfully created todo:', newtodo);
            res.json(newtodo);
        }
    );
});

//Api Put - request to update changes in the table
app.put('/api/mytodos/:id',(req,res,next)=>{
    const { id } = req.params;
    const { completed, text } = req.body;
    
    // Handle both completed and text updates
    if (completed !== undefined && text === undefined) {
        // Only updating completed status
        db.run('UPDATE mytodos SET completed = ? WHERE id = ?', [completed, id], (err)=> {
            if(err) {
                console.error('Database error:', err);
                return res.status(500).json({error: err.message});
            }
            res.json({id, completed});
        });
    } else if (text !== undefined && completed === undefined) {
        // Only updating text
        db.run('UPDATE mytodos SET text = ? WHERE id = ?', [text, id], (err)=> {
            if(err) {
                console.error('Database error:', err);
                return res.status(500).json({error: err.message});
            }
            res.json({id, text});
        });
    } else {
        // Updating both completed and text
        db.run('UPDATE mytodos SET completed = ?, text = ? WHERE id = ?', [completed, text, id], (err)=> {
            if(err) {
                console.error('Database error:', err);
                return res.status(500).json({error: err.message});
            }
            res.json({id, completed, text});
        });
    }
});

//delete from the table
app.delete('/api/mytodos/:id',(req,res,next)=>{
    const { id } = req.params;
    db.run('DELETE FROM mytodos WHERE id = ?', [id], (err)=>{
        if(err){
            return res.status(500).json({error: err.message});
        }
        res.json({message: 'Task Deleted'});
    });
});

app.get('/test', (req, res) => {
  res.send('Server is working!');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  }); 
