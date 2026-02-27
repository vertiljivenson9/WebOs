const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const JWT_SECRET = process.env.JWT_SECRET || 'webos-secret-key-change-in-production';

// In-memory user storage (replace with database in production)
const users = new Map();

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, isDeveloper } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (users.has(email)) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    const user = {
      id: userId,
      username,
      email,
      password: hashedPassword,
      isDeveloper: isDeveloper || false,
      developerProfile: isDeveloper ? {
        companyName: '',
        paypalEmail: '',
        whatsappNumber: '',
        website: '',
        verified: false
      } : null,
      createdAt: new Date().toISOString(),
      lastLogin: null,
      purchasedApps: [],
      settings: {}
    };

    users.set(email, user);

    const token = jwt.sign({ userId, email, isDeveloper: user.isDeveloper }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      token,
      user: {
        id: userId,
        username,
        email,
        isDeveloper: user.isDeveloper
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = users.get(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    user.lastLogin = new Date().toISOString();

    const token = jwt.sign(
      { userId: user.id, email, isDeveloper: user.isDeveloper },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        isDeveloper: user.isDeveloper,
        developerProfile: user.developerProfile
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get current user
router.get('/me', authenticateToken, (req, res) => {
  const user = users.get(req.user.email);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({
    id: user.id,
    username: user.username,
    email: user.email,
    isDeveloper: user.isDeveloper,
    developerProfile: user.developerProfile,
    purchasedApps: user.purchasedApps,
    createdAt: user.createdAt,
    lastLogin: user.lastLogin
  });
});

// Update developer profile
router.put('/developer-profile', authenticateToken, (req, res) => {
  const user = users.get(req.user.email);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (!user.isDeveloper) {
    return res.status(403).json({ error: 'Not a developer account' });
  }

  const { companyName, paypalEmail, whatsappNumber, website } = req.body;

  user.developerProfile = {
    ...user.developerProfile,
    companyName: companyName || user.developerProfile?.companyName,
    paypalEmail: paypalEmail || user.developerProfile?.paypalEmail,
    whatsappNumber: whatsappNumber || user.developerProfile?.whatsappNumber,
    website: website || user.developerProfile?.website
  };

  res.json({
    success: true,
    profile: user.developerProfile
  });
});

// Middleware to authenticate JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
}

module.exports = router;
module.exports.authenticateToken = authenticateToken;
module.exports.users = users;
