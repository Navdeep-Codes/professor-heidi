constrequire('dotenv').config();
const express = require('express');
const app = express();

const PORT = process.env.PORT;
const AUTH_KEY = process.env.AUTH_KEY;

app.use(express.json());

app.post('/announcement', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || authHeader !== `Bearer ${AUTH_KEY}`) {
    return res.status(401).json({ error: 'Unauthorized: Invalid auth key' });
  }

  const { text, date } = req.body;

  if (!text || !date) {
    return res.status(400).json({ error: 'Missing required fields: text and date' });
  }

  console.log('Received announcement:');
  console.log('Text:', text);
  console.log('Date:', date);
  

  res.status(200).json({ 
    success: true, 
    message: 'Announcement received',
    data: { text, date }
  });
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
  console.log(`Auth key: ${AUTH_KEY}`);
});

