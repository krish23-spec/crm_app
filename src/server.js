require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();

// ✅ Import DB
const db = require('./database/db');

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use(express.static('public'));

// ==========================
// 🔐 AUTH ROUTES (ADD THIS)
// ==========================
app.use('/api/auth', require('./routes/authRoutes'));


// ==========================
// 🔥 ROUTES
// ==========================

// 🔥 Test DB
app.get('/test-db', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW()');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 🔥 Add User
app.get('/add-user', async (req, res) => {
  try {
    await db.query(`
      INSERT INTO users (name, email, password)
      VALUES ('Test User', 'test@gmail.com', '123456')
    `);
    res.send("✅ User Added");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding user");
  }
});

// 🔥 Get Users
app.get('/users', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM users');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching users");
  }
});

// ==========================
// 🚀 START SERVER
// ==========================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});