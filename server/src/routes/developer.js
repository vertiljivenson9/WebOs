const express = require('express');
const router = express.Router();
const { apps } = require('./apps');
const { transactions } = require('./payments');

// Get developer dashboard stats
router.get('/stats/:developerId', (req, res) => {
  try {
    const { developerId } = req.params;
    
    const developerApps = Array.from(apps.values())
      .filter(app => app.developerId === developerId);
    
    const appIds = developerApps.map(app => app.id);
    
    // Get sales for developer's apps
    const sales = Array.from(transactions.values())
      .filter(t => appIds.includes(t.appId) && t.status === 'verified');
    
    const totalDownloads = developerApps.reduce((sum, app) => sum + (app.downloads || 0), 0);
    const totalRevenue = sales.reduce((sum, t) => sum + (t.amount || 0), 0);
    
    res.json({
      totalApps: developerApps.length,
      totalDownloads,
      totalSales: sales.length,
      totalRevenue,
      apps: developerApps.map(app => ({
        id: app.id,
        name: app.name,
        price: app.price,
        downloads: app.downloads || 0,
        sales: sales.filter(s => s.appId === app.id).length
      }))
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get sales history
router.get('/sales/:developerId', (req, res) => {
  try {
    const { developerId } = req.params;
    
    const developerApps = Array.from(apps.values())
      .filter(app => app.developerId === developerId);
    
    const appIds = developerApps.map(app => app.id);
    
    const sales = Array.from(transactions.values())
      .filter(t => appIds.includes(t.appId) && t.status === 'verified')
      .map(t => ({
        id: t.id,
        appId: t.appId,
        appName: apps.get(t.appId)?.name || 'Unknown',
        userId: t.userId,
        userEmail: t.userEmail,
        amount: t.amount,
        verifiedAt: t.verifiedAt,
        verificationCode: t.verificationCode
      }));
    
    res.json(sales);
  } catch (error) {
    console.error('Sales error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Generate verification codes batch
router.post('/generate-codes', (req, res) => {
  try {
    const { appId, developerId, count, customerEmails } = req.body;
    
    const app = apps.get(appId);
    if (!app) {
      return res.status(404).json({ error: 'App not found' });
    }
    
    if (app.developerId !== developerId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const codes = [];
    const numCodes = count || (customerEmails ? customerEmails.length : 1);
    
    for (let i = 0; i < numCodes; i++) {
      const code = generateVerificationCode();
      app.verificationCodes.set(code, {
        code,
        customerEmail: customerEmails ? customerEmails[i] : null,
        createdAt: new Date().toISOString(),
        expiresAt: null,
        used: false,
        usedAt: null,
        usedBy: null
      });
      codes.push({
        code,
        customerEmail: customerEmails ? customerEmails[i] : null
      });
    }
    
    res.json({
      success: true,
      codes,
      message: `${codes.length} verification codes generated`
    });
  } catch (error) {
    console.error('Generate codes error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get app analytics
router.get('/analytics/:appId', (req, res) => {
  try {
    const { appId } = req.params;
    const { developerId } = req.query;
    
    const app = apps.get(appId);
    if (!app) {
      return res.status(404).json({ error: 'App not found' });
    }
    
    if (app.developerId !== developerId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const sales = Array.from(transactions.values())
      .filter(t => t.appId === appId && t.status === 'verified');
    
    // Daily downloads (mock data - would come from database)
    const dailyDownloads = generateMockTimeSeries(30, app.downloads || 0);
    
    // Daily sales
    const dailySales = generateMockTimeSeries(30, sales.length);
    
    res.json({
      appId,
      appName: app.name,
      totalDownloads: app.downloads || 0,
      totalSales: sales.length,
      totalRevenue: sales.reduce((sum, s) => sum + (s.amount || 0), 0),
      dailyDownloads,
      dailySales,
      topCountries: [
        { country: 'España', downloads: Math.floor((app.downloads || 0) * 0.4) },
        { country: 'México', downloads: Math.floor((app.downloads || 0) * 0.25) },
        { country: 'Argentina', downloads: Math.floor((app.downloads || 0) * 0.15) },
        { country: 'Colombia', downloads: Math.floor((app.downloads || 0) * 0.1) },
        { country: 'Otros', downloads: Math.floor((app.downloads || 0) * 0.1) }
      ]
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: error.message });
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

function generateMockTimeSeries(days, total) {
  const data = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toISOString().split('T')[0],
      value: Math.floor(Math.random() * (total / days) * 2)
    });
  }
  return data;
}

module.exports = router;
