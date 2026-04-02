require('dotenv').config();
const express = require('express');
const { handleWebhook, verifyWebhook } = require('./bot/webhook');

const app = express();
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'Atlas Dispatch Bot', version: '1.0.0' });
});

// WhatsApp webhook verification (GET)
app.get('/webhook', verifyWebhook);

// WhatsApp incoming messages (POST)
app.post('/webhook', handleWebhook);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Atlas is running on port ${PORT}`);
});
