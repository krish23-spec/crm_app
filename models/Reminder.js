class Reminder {
    constructor(db) {
        this.db = db;
    }

    async create(reminderData) {
        const { lead_id, user_id, reminder_date, title, description } = reminderData;
        
        const [result] = await this.db.promise().execute(
            `INSERT INTO reminders (lead_id, user_id, reminder_date, title, description) 
             VALUES (?, ?, ?, ?, ?)`,
            [lead_id, user_id, reminder_date, title, description]
        );
        return result.insertId;
    }

    async findAll(user_id, upcoming = true) {
        let query = 'SELECT r.*, l.name as lead_name FROM reminders r JOIN leads l ON r.lead_id = l.id WHERE r.user_id = ?';
        const params = [user_id];

        if (upcoming) {
            query += ' AND r.reminder_date >= NOW() AND r.is_completed = FALSE';
        }
        
        query += ' ORDER BY r.reminder_date ASC LIMIT 20';
        
        const [rows] = await this.db.promise().execute(query, params);
        return rows;
    }

    async findById(id, user_id) {
        const [rows] = await this.db.promise().execute(
            'SELECT * FROM reminders WHERE id = ? AND user_id = ?',
            [id, user_id]
        );
        return rows[0];
    }

    async updateStatus(id, user_id, is_completed) {
        const [result] = await this.db.promise().execute(
            'UPDATE reminders SET is_completed = ? WHERE id = ? AND user_id = ?',
            [is_completed, id, user_id]
        );
        return result.affectedRows > 0;
    }

    async delete(id, user_id) {
        const [result] = await this.db.promise().execute(
            'DELETE FROM reminders WHERE id = ? AND user_id = ?',
            [id, user_id]
        );
        return result.affectedRows > 0;
    }

    async getUpcomingCount(user_id) {
        const [rows] = await this.db.promise().execute(
            'SELECT COUNT(*) as count FROM reminders WHERE user_id = ? AND reminder_date >= NOW() AND is_completed = FALSE',
            [user_id]
        );
        return rows[0].count;
    }
}

module.exports = Reminder;