const express = require('express');
const router = express.Router();
const { apps } = require('./apps');

// Verify purchase code
router.post('/code', (req, res) => {
  try {
    const { appId, code, userId } = req.body;

    if (!appId || !code) {
      return res.status(400).json({ error: 'App ID and verification code required' });
    }

    const app = apps.get(appId);
    if (!app) {
      return res.status(404).json({ error: 'App not found' });
    }

    // Check if code exists and is valid
    const codeData = app.verificationCodes.get(code);
    if (!codeData) {
      return res.status(403).json({ 
        error: 'Invalid verification code',
        valid: false
      });
    }

    if (codeData.used) {
      return res.status(403).json({ 
        error: 'Code already used',
        valid: false,
        usedAt: codeData.usedAt
      });
    }

    if (codeData.expiresAt && new Date(codeData.expiresAt) < new Date()) {
      return res.status(403).json({ 
        error: 'Code expired',
        valid: false
      });
    }

    // Code is valid
    res.json({
      valid: true,
      appId,
      code,
      message: 'Verification successful'
    });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Generate verification code (for developers to give to customers)
router.post('/generate', (req, res) => {
  try {
    const { appId, developerId, customerEmail } = req.body;

    const app = apps.get(appId);
    if (!app) {
      return res.status(404).json({ error: 'App not found' });
    }

    if (app.developerId !== developerId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const code = generateVerificationCode();
    app.verificationCodes.set(code, {
      code,
      customerEmail,
      createdAt: new Date().toISOString(),
      expiresAt: null, // No expiration by default
      used: false,
      usedAt: null,
      usedBy: null
    });

    res.json({
      success: true,
      code,
      message: 'Verification code generated'
    });
  } catch (error) {
    console.error('Code generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all codes for an app (developer only)
router.get('/codes/:appId', (req, res) => {
  const app = apps.get(req.params.appId);
  if (!app) {
    return res.status(404).json({ error: 'App not found' });
  }

  const codes = Array.from(app.verificationCodes.entries()).map(([code, data]) => ({
    code,
    customerEmail: data.customerEmail,
    createdAt: data.createdAt,
    used: data.used,
    usedAt: data.usedAt,
    usedBy: data.usedBy
  }));

  res.json(codes);
});

// Revoke a code
router.delete('/code/:appId/:code', (req, res) => {
  const app = apps.get(req.params.appId);
  if (!app) {
    return res.status(404).json({ error: 'App not found' });
  }

  if (app.verificationCodes.has(req.params.code)) {
    app.verificationCodes.delete(req.params.code);
    res.json({ success: true, message: 'Code revoked' });
  } else {
    res.status(404).json({ error: 'Code not found' });
  }
});

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
