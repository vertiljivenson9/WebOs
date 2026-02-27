const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// In-memory storage
const transactions = new Map();
const pendingPayments = new Map();

// PayPal configuration
const PAYPAL_CONFIG = {
  mode: process.env.PAYPAL_MODE || 'sandbox',
  client_id: process.env.PAYPAL_CLIENT_ID || '',
  client_secret: process.env.PAYPAL_CLIENT_SECRET || ''
};

// Create payment intent
router.post('/create', async (req, res) => {
  try {
    const { appId, userId, userEmail, developerPaypal } = req.body;
    
    if (!appId || !userId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const paymentId = uuidv4();
    const paymentData = {
      id: paymentId,
      appId,
      userId,
      userEmail,
      developerPaypal,
      status: 'pending',
      createdAt: new Date().toISOString(),
      completedAt: null
    };

    pendingPayments.set(paymentId, paymentData);

    // Generate PayPal payment link
    // In production, use PayPal SDK to create actual payment
    const paypalLink = `https://www.paypal.com/paypalme/${developerPaypal}/${req.body.amount}`;

    res.json({
      success: true,
      paymentId,
      paypalLink,
      message: 'Payment intent created'
    });
  } catch (error) {
    console.error('Payment creation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Verify payment (called after user pays via PayPal)
router.post('/verify', async (req, res) => {
  try {
    const { paymentId, paypalTransactionId, userId } = req.body;
    
    const payment = pendingPayments.get(paymentId);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // In production, verify with PayPal API
    // For now, simulate verification
    payment.status = 'verified';
    payment.paypalTransactionId = paypalTransactionId;
    payment.verifiedAt = new Date().toISOString();

    // Generate verification code for app download
    const verificationCode = generateVerificationCode();
    payment.verificationCode = verificationCode;

    // Store transaction
    transactions.set(paymentId, payment);

    res.json({
      success: true,
      verificationCode,
      message: 'Payment verified successfully'
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get payment status
router.get('/status/:paymentId', (req, res) => {
  const payment = pendingPayments.get(req.params.paymentId) || 
                  transactions.get(req.params.paymentId);
  
  if (!payment) {
    return res.status(404).json({ error: 'Payment not found' });
  }

  res.json({
    id: payment.id,
    status: payment.status,
    appId: payment.appId,
    createdAt: payment.createdAt,
    completedAt: payment.completedAt
  });
});

// Get user's purchase history
router.get('/history/:userId', (req, res) => {
  const userPurchases = Array.from(transactions.values())
    .filter(t => t.userId === req.params.userId)
    .map(t => ({
      id: t.id,
      appId: t.appId,
      status: t.status,
      createdAt: t.createdAt,
      verificationCode: t.verificationCode
    }));

  res.json(userPurchases);
});

// Generate unique verification code
function generateVerificationCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 16; i++) {
    if (i > 0 && i % 4 === 0) code += '-';
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

module.exports = router;
module.exports.transactions = transactions;
