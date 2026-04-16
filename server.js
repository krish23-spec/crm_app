require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

// DB
const db = require('./db');

// Routes (agar hai to use karo)
let authRoutes, leadRoutes, reminderRoutes, dealRoutes, analyticsRoutes;
try {
  authRoutes = require('./routes/authRoutes');
  leadRoutes = require('./routes/leadRoutes');
  reminderRoutes = require('./routes/reminderRoutes');
  dealRoutes = require('./routes/dealRoutes');
  analyticsRoutes = require('./routes/analyticsRoutes');
} catch (e) {
  console.log("⚠️ Routes not found, skipping...");
}

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));

// Routes (optional)
if (authRoutes) app.use('/api/auth', authRoutes);
if (leadRoutes) app.use('/api/leads', leadRoutes);
if (reminderRoutes) app.use('/api/reminders', reminderRoutes);
if (dealRoutes) app.use('/api/deals', dealRoutes);
if (analyticsRoutes) app.use('/api/analytics', analyticsRoutes);

// 🔥 DB test route
app.get('/test-db', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW()');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔥 Insert test data
app.get('/add-user', async (req, res) => {
  try {
    await db.query(`
      INSERT INTO users (name, email, password)
      VALUES ('Test User', 'test@gmail.com', '123456')
    `);
    res.send("User Added");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Pages
app.get('/', (req, res) => {
  res.send("🚀 CRM App Running Successfully");
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});