require('dotenv').config();
const express = require('express');
const { postAnnouncement } = require('./slack-bot');
const app = express();

const PORT = process.env.PORT || 3454;
const AUTH_KEY = process.env.AUTH_KEY;

app.use(express.json());

app.post('/announcement', async (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || authHeader !== `Bearer ${AUTH_KEY}`) {
    return res.status(401).json({ error: 'Unauthorized: Invalid auth key' });
  }

  const { text, date, author, attachments } = req.body;

  if (!text || !date) {
    return res.status(400).json({ error: 'Missing required fields: text and date' });
  }

  console.log('Received announcement:');
  console.log('Text:', text);
  console.log('Date:', date);
  console.log('Author:', author);
  console.log('Attachments:', attachments);

  try {
    await postAnnouncement(text, date, author, attachments);
    res.status(200).json({ 
      success: true, 
      message: 'Announcement received and sent to Slack',
      data: { text, date, author, attachments }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to send message to Slack'
    });
  }
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
  console.log(`Auth key: ${AUTH_KEY}`);
});
