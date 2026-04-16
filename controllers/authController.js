require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();

// ✅ DB IMPORT
const db = require('../database/db');

// ✅ IMPORTANT (FIX)
app.locals.db = db;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Static files
app.use(express.static('public'));


// ==========================
// 🔥 ROUTES
// ==========================

// ✅ Import routes
const authRoutes = require('./routes/authRoutes');

// ✅ Use routes
app.use('/api/auth', authRoutes);


// ==========================
// 🔥 TEST ROUTES
// ==========================

// Test DB
app.get('/test-db', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW()');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


// ==========================
// 🚀 START SERVER
// ==========================

const PORT = process.env.PORT || 5000;

// ✅ Render FIX (VERY IMPORTANT)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});