const express = require('express');
const app = express();
const PORT = 3000;

// Đọc cấu hình từ biến môi trường
const apiUrl = process.env.API_URL || 'No API URL set';
const apiKey = process.env.API_KEY || 'No API Key set';

app.get('/', (req, res) => {
  res.json({
    message: "Hello from my CI/CD pipeline!",
    hostname: req.hostname,
    podName: process.env.HOSTNAME,
    // Trả về cấu hình đã đọc được
    config: {
      apiUrl: apiUrl,
      apiKey: apiKey
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});