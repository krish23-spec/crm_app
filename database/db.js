const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// test connection
pool.connect((err, client, release) => {
  if (err) {
    console.error("❌ DB ERROR FULL:", err);
  } else {
    console.log("✅ PostgreSQL Connected Successfully");
    release();
  }
});

module.exports = pool;