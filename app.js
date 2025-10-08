const express = require('express');
const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
  res.json({
    message: "Hello from my own backend app!",
    hostname: req.hostname,
    podName: process.env.HOSTNAME // Lấy tên Pod từ biến môi trường
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
