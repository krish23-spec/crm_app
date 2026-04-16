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

        const result = await this.db.query(
            'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id',
            [name, email, hashedPassword]
        );

        return result.rows[0].id;
    }

    async findByEmail(email) {
        const result = await this.db.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        return result.rows[0];
    }

    async findById(id) {
        const result = await this.db.query(
            'SELECT id, name, email, role, created_at FROM users WHERE id = $1',
            [id]
        );

        return result.rows[0];
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