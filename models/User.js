const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class User {
    constructor(db) {
        this.db = db;
    }

    async create(userData) {
        const { name, email, password } = userData;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const [result] = await this.db.promise().execute(
            'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
            [name, email, hashedPassword]
        );
        return result.insertId;
    }

    async findByEmail(email) {
        const [rows] = await this.db.promise().execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        return rows[0];
    }

    async findById(id) {
        const [rows] = await this.db.promise().execute(
            'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
            [id]
        );
        return rows[0];
    }

    generateToken(id, email) {
        return jwt.sign(
            { id, email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE }
        );
    }

    async comparePassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }
}

module.exports = User;