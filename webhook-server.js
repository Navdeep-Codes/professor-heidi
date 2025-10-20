require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();

const WEBHOOK_PORT = process.env.WEBHOOK_PORT;
const API_URL = `http://localhost:${process.env.PORT}/announcement`;
const AUTH_KEY = process.env.AUTH_KEY;

app.use(express.json());

app.post('/webhook', async (req, res) => {
  console.log('Webhook received:', req.body);
  
  try {
    const { text, date } = req.body;
    
    if (!text || !date) {
      return res.status(400).json({ 
        error: 'Missing required fields: text and date' 
      });
    }
    
    console.log(`Forwarding to ${API_URL}...`);
    
    const response = await axios.post(API_URL, {
      text: text,
      date: date
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AUTH_KEY}`
      }
    });
    
    console.log('Successfully forwarded to announcement API');
    
    res.status(200).json({
      success: true,
      message: 'Webhook received and forwarded to announcement API',
      announcementResponse: response.data
    });
    
  } catch (error) {
    console.error('Error forwarding to announcement API:', error.message);
    
    if (error.response) {
      res.status(error.response.status).json({
        success: false,
        error: 'Failed to forward to announcement API',
        details: error.response.data
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to forward to announcement API',
        details: error.message
      });
    }
  }
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    forwardingTo: API_URL
  });
});

app.listen(WEBHOOK_PORT, () => {
  console.log(`Webhook server running on http://localhost:${WEBHOOK_PORT}`);
  console.log(`Will forward requests to: ${API_URL}`);
  console.log(`Using auth key: ${AUTH_KEY}`);
});
