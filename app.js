const express = require('express');
const { Pool } = require('pg'); // Import thư viện pg

const app = express();
const PORT = 3000;

// Đọc cấu hình từ biến môi trường
const apiUrl = process.env.API_URL || 'No API URL set';
const apiKey = process.env.API_KEY || 'No API Key set';

// --- CẤU HÌNH KẾT NỐI DATABASE ---
// Đọc thông tin kết nối từ các biến môi trường do Kubernetes cung cấp
const dbPool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: 5432,
});


// Heath check endpoint
app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'ok' });
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
    client.release(); // Trả kết nối về pool
    res.json(result.rows);
  } catch (err) {
    console.error('Error executing query', err.stack);
    res.status(500).json({ error: 'Failed to fetch messages from database' });
  }
});

// POST MESSAGE
app.post('/messages', async (req, res) => {
  const { message } = req.body;
  const client = await dbPool.connect();
  const result = await client.query('INSERT INTO messages (message) VALUES ($1)', [message]);
  client.release();
  res.json(result.rows);
});

// UPDATE MESSAGE
app.put('/messages/:id', async (req, res) => {
  const { id } = req.params;
  const { message } = req.body;
  const client = await dbPool.connect();
  const result = await client.query('UPDATE messages SET message = $1 WHERE id = $2', [message, id]);
  client.release();
  res.json(result.rows);
});

// GET MESSAGE BY ID
app.get('/messages/:id', async (req, res) => {
  const { id } = req.params;
  const client = await dbPool.connect();
  const result = await client.query('SELECT * FROM messages WHERE id = $1', [id]);
  client.release();
  res.json(result.rows);
});

// DELETE MESSAGE
app.delete('/messages/:id', async (req, res) => {
  const { id } = req.params;
  const client = await dbPool.connect();
  const result = await client.query('DELETE FROM messages WHERE id = $1', [id]);
  client.release();
  res.json(result.rows);
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});