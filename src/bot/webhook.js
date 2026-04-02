const { processMessage } = require('./conversation');

// Verify webhook with Meta
function verifyWebhook(req, res) {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    console.log('✅ Webhook verified');
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
}

// Handle incoming WhatsApp messages
async function handleWebhook(req, res) {
  // Always respond 200 immediately so Meta doesn't retry
  res.sendStatus(200);

  try {
    const body = req.body;
    if (body.object !== 'whatsapp_business_account') return;

    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;

    // Ignore status updates (delivered, read receipts)
    if (!value?.messages) return;

    const message = value.messages[0];
    const from = message.from; // sender's phone number

    // Only handle text messages for now
    if (message.type !== 'text') {
      const { sendMessage } = require('../utils/whatsapp');
      await sendMessage(from, "Hi! I can only read text messages for now. Please describe your delivery in text 🙏");
      return;
    }

    const text = message.text.body.trim();
    console.log(`📩 Message from ${from}: ${text}`);

    await processMessage(from, text);
  } catch (err) {
    console.error('Webhook error:', err);
  }
}

module.exports = { verifyWebhook, handleWebhook };
