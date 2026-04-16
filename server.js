require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const { Pool } = require('pg');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const leadRoutes = require('./routes/leadRoutes');
const reminderRoutes = require('./routes/reminderRoutes');
const dealRoutes = require('./routes/dealRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const { errorHandler } = require('./middleware/errorHandler');

// Initialize Express
const app = express();

// PostgreSQL Connection
const db = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// Test DB Connection + Create Tables
db.connect((err, client, release) => {
    if (err) {
        console.error('❌ PostgreSQL connection failed:', err);
        process.exit(1);
    }
    console.log('✅ Connected to PostgreSQL database');

    // Create Tables
    client.query(`
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100),
            email VARCHAR(100),
            password VARCHAR(255)
        );

        CREATE TABLE IF NOT EXISTS leads (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100),
            email VARCHAR(100),
            status VARCHAR(50)
        );

        CREATE TABLE IF NOT EXISTS deals (
            id SERIAL PRIMARY KEY,
            lead_id INT,
            deal_value INT,
            status VARCHAR(50)
        );

        CREATE TABLE IF NOT EXISTS reminders (
            id SERIAL PRIMARY KEY,
            title VARCHAR(100),
            description TEXT
        );
    `, (err) => {
        if (err) {
            console.error("❌ Table create error:", err);
        } else {
            console.log("✅ Tables created successfully");
        }
        release();
    });
});

// Make db accessible to routes
app.locals.db = db;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/deals', dealRoutes);
app.use('/api/analytics', analyticsRoutes);

// Serve HTML Pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/leads', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'leads.html'));
});

app.get('/analytics', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'analytics.html'));
});

// Error Handler
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});