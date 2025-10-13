require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');

const app = express();
const PORT = 3000;

// Middleware to parse JSON request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const dbPool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT || 5432,
});


app.get('/', (req, res) => {
  res.json({
    message: "Hello from my CI/CD pipeline V3!",
    hostname: req.hostname,
    podName: process.env.HOSTNAME,
    // Trả về cấu hình đã đọc được
    ...(process.env ?? {})
  });
});

// INSEERT NEW MESSAGE TO DATABASE
app.get('/messages', async (req, res) => {
  try {
    const client = await dbPool.connect();
    const result = await client.query('SELECT * FROM messages');
    client.release(); 
    res.json(result.rows);
  } catch (err) {
    console.error('Error executing query', err.stack);
    res.status(500).json({ error: 'Failed to fetch messages from database' });
  }
});

// POST MESSAGE
app.post('/messages', async (req, res) => {
  try {
    const { content } = req.body;
    const client = await dbPool.connect();
    const result = await client.query('INSERT INTO messages (content) VALUES ($1)', [content]);
    client.release();
    res.send(!!result.rowCount)
  } catch (error) {
    console.error('Error executing query', error.stack);
    res.status(500).json({ error: 'Failed to insert message into database' });
  }
});

// UPDATE MESSAGE
app.put('/messages/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const client = await dbPool.connect();
    const result = await client.query('UPDATE messages SET content = $1 WHERE id = $2', [content, id]);
    client.release();
    res.send(!!result.rowCount);
  } catch (error) {
    console.error('Error executing query', error.stack);
    res.status(500).json({ error: 'Failed to update message in database' });
  }
});

// GET MESSAGE BY ID
app.get('/messages/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const client = await dbPool.connect();
    const result = await client.query('SELECT * FROM messages WHERE id = $1', [id]);
    client.release();
    if(!result.rows.length) {
      res.status(404).json({ error: 'Message not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error executing query', error.stack);
    res.status(500).json({ error: 'Failed to get message from database' });
  }

});

// DELETE MESSAGE
app.delete('/messages/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const client = await dbPool.connect();
    const result = await client.query('DELETE FROM messages WHERE id = $1', [id]);
    client.release();
    res.send(!!result.rowCount);
  } catch (error) {
    console.error('Error executing query', error.stack);
    res.status(500).json({ error: 'Failed to delete message from database' });
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});