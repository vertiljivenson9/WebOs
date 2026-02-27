const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

// In-memory storage (replace with database in production)
const apps = new Map();
const purchases = new Map();

// Configure multer for app uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../uploads/apps');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${uuidv4()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/javascript' || 
        file.mimetype === 'application/json' ||
        file.originalname.endsWith('.vpx') ||
        file.originalname.endsWith('.wapp')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only .vpx, .wapp, .js files allowed'));
    }
  }
});

// Get all apps
router.get('/', (req, res) => {
  const appList = Array.from(apps.values()).map(app => ({
    id: app.id,
    name: app.name,
    description: app.description,
    icon: app.icon,
    price: app.price,
    isPaid: app.price > 0,
    developer: app.developer,
    version: app.version,
    category: app.category,
    downloads: app.downloads || 0,
    rating: app.rating || 0,
    createdAt: app.createdAt,
    screenshots: app.screenshots || []
  }));
  res.json(appList);
});

// Get single app
router.get('/:id', (req, res) => {
  const app = apps.get(req.params.id);
  if (!app) return res.status(404).json({ error: 'App not found' });
  
  res.json({
    id: app.id,
    name: app.name,
    description: app.description,
    icon: app.icon,
    price: app.price,
    isPaid: app.price > 0,
    developer: app.developer,
    developerPaypal: app.paypalEmail,
    developerWhatsApp: app.whatsappNumber,
    version: app.version,
    category: app.category,
    downloads: app.downloads || 0,
    rating: app.rating || 0,
    createdAt: app.createdAt,
    screenshots: app.screenshots || [],
    permissions: app.permissions || [],
    size: app.size || 'Unknown'
  });
});

// Upload new app (developer)
router.post('/upload', upload.fields([
  { name: 'appFile', maxCount: 1 },
  { name: 'icon', maxCount: 1 },
  { name: 'screenshots', maxCount: 5 }
]), (req, res) => {
  try {
    const { 
      name, 
      description, 
      price, 
      developerName, 
      developerId,
      paypalEmail, 
      whatsappNumber,
      version,
      category,
      permissions
    } = req.body;

    if (!name || !description || !developerName || !developerId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate PayPal email for paid apps
    const appPrice = parseFloat(price) || 0;
    if (appPrice > 0 && !paypalEmail) {
      return res.status(400).json({ error: 'PayPal email required for paid apps' });
    }

    const appId = uuidv4();
    const appData = {
      id: appId,
      name,
      description,
      price: appPrice,
      developer: developerName,
      developerId,
      paypalEmail: paypalEmail || null,
      whatsappNumber: whatsappNumber || null,
      version: version || '1.0.0',
      category: category || 'Utilities',
      permissions: permissions ? JSON.parse(permissions) : [],
      icon: req.files['icon'] ? `/uploads/apps/${req.files['icon'][0].filename}` : '/default-app-icon.png',
      screenshots: req.files['screenshots'] ? req.files['screenshots'].map(f => `/uploads/apps/${f.filename}`) : [],
      appFile: req.files['appFile'] ? `/uploads/apps/${req.files['appFile'][0].filename}` : null,
      downloads: 0,
      rating: 0,
      createdAt: new Date().toISOString(),
      verificationCodes: new Map() // Store verification codes for purchases
    };

    apps.set(appId, appData);

    res.json({ 
      success: true, 
      appId,
      message: 'App uploaded successfully'
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Download app
router.get('/:id/download', (req, res) => {
  const app = apps.get(req.params.id);
  if (!app) return res.status(404).json({ error: 'App not found' });

  const userId = req.query.userId;
  const verificationCode = req.query.code;

  // For paid apps, verify purchase
  if (app.price > 0) {
    if (!verificationCode || !app.verificationCodes.has(verificationCode)) {
      return res.status(403).json({ 
        error: 'Verification required',
        message: 'This app requires purchase verification'
      });
    }
    
    // Mark code as used
    const codeData = app.verificationCodes.get(verificationCode);
    if (codeData.used) {
      return res.status(403).json({ error: 'Code already used' });
    }
    codeData.used = true;
    codeData.usedAt = new Date().toISOString();
    codeData.usedBy = userId;
  }

  // Increment download count
  app.downloads++;

  if (app.appFile) {
    res.download(path.join(__dirname, '../..', app.appFile), `${app.name}.vpx`);
  } else {
    res.json({
      appId: app.id,
      name: app.name,
      version: app.version,
      main: app.appFile,
      permissions: app.permissions,
      manifest: {
        id: app.id,
        name: app.name,
        version: app.version,
        icon: app.icon,
        entry: 'index.js',
        permissions: app.permissions
      }
    });
  }
});

// Get developer's apps
router.get('/developer/:developerId', (req, res) => {
  const developerApps = Array.from(apps.values())
    .filter(app => app.developerId === req.params.developerId)
    .map(app => ({
      id: app.id,
      name: app.name,
      price: app.price,
      downloads: app.downloads,
      rating: app.rating,
      createdAt: app.createdAt,
      verificationCodes: Array.from(app.verificationCodes.entries()).map(([code, data]) => ({
        code,
        used: data.used,
        createdAt: data.createdAt
      }))
    }));
  
  res.json(developerApps);
});

// Update app
router.put('/:id', (req, res) => {
  const app = apps.get(req.params.id);
  if (!app) return res.status(404).json({ error: 'App not found' });

  const { name, description, price, version } = req.body;
  if (name) app.name = name;
  if (description) app.description = description;
  if (price !== undefined) app.price = parseFloat(price);
  if (version) app.version = version;

  res.json({ success: true, message: 'App updated' });
});

// Delete app
router.delete('/:id', (req, res) => {
  const app = apps.get(req.params.id);
  if (!app) return res.status(404).json({ error: 'App not found' });

  apps.delete(req.params.id);
  res.json({ success: true, message: 'App deleted' });
});

module.exports = router;
module.exports.apps = apps;
