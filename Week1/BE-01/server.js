const express = require('express');
const app = express();
const PORT = 3000;

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello, world!' });
});

app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
