const express = require('express');
const router = express.Router();
const { apps } = require('./apps');

// WhatsApp API configuration
const WHATSAPP_CONFIG = {
  apiUrl: process.env.WHATSAPP_API_URL || 'https://api.whatsapp.com/v1',
  apiKey: process.env.WHATSAPP_API_KEY || '',
  // For WhatsApp Business API or third-party services like Twilio
};

// Generate WhatsApp click-to-chat link
router.get('/chat-link/:appId', (req, res) => {
  try {
    const { appId } = req.params;
    const { userId, message } = req.query;

    const app = apps.get(appId);
    if (!app) {
      return res.status(404).json({ error: 'App not found' });
    }

    if (!app.whatsappNumber) {
      return res.status(400).json({ error: 'Developer has not configured WhatsApp' });
    }

    // Format phone number (remove non-digits)
    const phoneNumber = app.whatsappNumber.replace(/\D/g, '');

    // Generate pre-filled message
    const defaultMessage = message || 
      `Hola, soy un usuario de WebOS interesado en comprar tu aplicación "${app.name}". ` +
      `Mi ID de usuario es: ${userId || 'N/A'}. ` +
      `Por favor, envíame el código de verificación para completar la compra.`;

    // WhatsApp click-to-chat URL
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(defaultMessage)}`;

    // Also generate QR code data (can be used with QR libraries)
    const qrData = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(defaultMessage)}`;

    res.json({
      success: true,
      whatsappUrl,
      qrData,
      phoneNumber: app.whatsappNumber,
      message: defaultMessage,
      developerName: app.developer
    });
  } catch (error) {
    console.error('WhatsApp link error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Send WhatsApp message (requires WhatsApp Business API)
router.post('/send', async (req, res) => {
  try {
    const { phoneNumber, message, templateName } = req.body;

    // This would integrate with WhatsApp Business API or Twilio
    // For now, return the configuration needed
    res.json({
      success: true,
      message: 'WhatsApp integration ready',
      note: 'To send messages directly, configure WhatsApp Business API or Twilio',
      config: {
        phoneNumber,
        messagePreview: message?.substring(0, 100),
        template: templateName
      }
    });
  } catch (error) {
    console.error('WhatsApp send error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Webhook for incoming WhatsApp messages (for verification automation)
router.post('/webhook', (req, res) => {
  try {
    const { from, body, timestamp } = req.body;

    // Process incoming message
    // Could be used to auto-send verification codes
    console.log('WhatsApp webhook:', { from, body, timestamp });

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Verify webhook (for WhatsApp API setup)
router.get('/webhook', (req, res) => {
  const { hub.mode, hub.verify_token, hub.challenge } = req.query;
  
  if (hub.mode === 'subscribe' && hub.verify_token === process.env.WHATSAPP_VERIFY_TOKEN) {
    console.log('Webhook verified');
    res.send(hub.challenge);
  } else {
    res.sendStatus(403);
  }
});

// Get developer's WhatsApp status
router.get('/status/:appId', (req, res) => {
  const app = apps.get(req.params.appId);
  if (!app) {
    return res.status(404).json({ error: 'App not found' });
  }

  res.json({
    configured: !!app.whatsappNumber,
    phoneNumber: app.whatsappNumber || null,
    developerName: app.developer
  });
});

module.exports = router;
