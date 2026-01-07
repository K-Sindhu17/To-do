const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'rootpassword',
    database: process.env.DB_NAME || 'tododb',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

let pool;

// Initialize database connection with retry logic
async function initializeDatabase() {
    let retries = 10;
    while (retries > 0) {
        try {
            pool = mysql.createPool(dbConfig);
            const connection = await pool.getConnection();
            console.log('Connected to MySQL database');
            connection.release();
            return;
        } catch (err) {
            console.log(`Database connection failed. Retries left: ${retries - 1}`);
            retries--;
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
    console.error('Could not connect to database after multiple attempts');
    process.exit(1);
}

// API Routes

// Get all todos
app.get('/api/todos', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM todos ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) {
        console.error('Error fetching todos:', err);
        res.status(500).json({ error: 'Failed to fetch todos' });
    }
});

// Add a new todo
app.post('/api/todos', async (req, res) => {
    const { task } = req.body;

    if (!task || task.trim() === '') {
        return res.status(400).json({ error: 'Task is required' });
    }

    try {
        const [result] = await pool.execute(
            'INSERT INTO todos (task) VALUES (?)',
            [task.trim()]
        );

        const [newTodo] = await pool.execute(
            'SELECT * FROM todos WHERE id = ?',
            [result.insertId]
        );

        res.status(201).json(newTodo[0]);
    } catch (err) {
        console.error('Error adding todo:', err);
        res.status(500).json({ error: 'Failed to add todo' });
    }
});

// Delete a todo
app.delete('/api/todos/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await pool.execute('DELETE FROM todos WHERE id = ?', [id]);
        res.json({ message: 'Todo deleted successfully' });
    } catch (err) {
        console.error('Error deleting todo:', err);
        res.status(500).json({ error: 'Failed to delete todo' });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

// Start server
initializeDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});
