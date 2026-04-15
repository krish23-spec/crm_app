class Lead {
    constructor(db) {
        this.db = db;
    }

    async create(leadData) {
       const { user_id, name, country, email, phone, business_type, source, notes, status, amount } = leadData;
        
        const [result] = await this.db.promise().execute(
            `INSERT INTO leads (user_id, name, country, email, phone, business_type, source,  notes, status, amount)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [user_id, name, country, email, phone, business_type, source, notes, status || 'New', amount || 0]
        );
        return result.insertId;
    }

    async findAll(user_id, filters = {}) {
        let query = 'SELECT * FROM leads WHERE user_id = ?';
        const params = [user_id];

        if (filters.status && filters.status !== 'all') {
            query += ' AND status = ?';
            params.push(filters.status);
        }
        if (filters.country && filters.country !== 'all') {
            query += ' AND country = ?';
            params.push(filters.country);
        }
        if (filters.search) {
            query += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)';
            params.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
        }

        query += ' ORDER BY created_at DESC';
        
        const [rows] = await this.db.promise().execute(query, params);
        return rows;
    }

    async findById(id, user_id) {
        const [rows] = await this.db.promise().execute(
            'SELECT * FROM leads WHERE id = ? AND user_id = ?',
            [id, user_id]
        );
        return rows[0];
    }

    async update(id, user_id, updateData) {
        const fields = [];
        const values = [];

        Object.keys(updateData).forEach(key => {
            if (updateData[key] !== undefined) {
                fields.push(`${key} = ?`);
                values.push(updateData[key]);
            }
        });

        if (fields.length === 0) return false;

        values.push(id, user_id);
        const [result] = await this.db.promise().execute(
            `UPDATE leads SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`,
            values
        );
        return result.affectedRows > 0;
    }

    async delete(id, user_id) {
        const [result] = await this.db.promise().execute(
            'DELETE FROM leads WHERE id = ? AND user_id = ?',
            [id, user_id]
        );
        return result.affectedRows > 0;
    }

    async incrementOutreach(id, user_id) {
        const [result] = await this.db.promise().execute(
            'UPDATE leads SET outreach_count = outreach_count + 1, last_outreach_date = CURDATE() WHERE id = ? AND user_id = ?',
            [id, user_id]
        );
        return result.affectedRows > 0;
    }

    async getStats(user_id) {
        const [totalLeads] = await this.db.promise().execute(
            'SELECT COUNT(*) as total FROM leads WHERE user_id = ?',
            [user_id]
        );
        
        const [statusStats] = await this.db.promise().execute(
            `SELECT status, COUNT(*) as count FROM leads WHERE user_id = ? GROUP BY status`,
            [user_id]
        );
        
        const [monthlyStats] = await this.db.promise().execute(
            `SELECT DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as count 
             FROM leads WHERE user_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
             GROUP BY DATE_FORMAT(created_at, '%Y-%m') ORDER BY month DESC`,
            [user_id]
        );

        const [closedDeals] = await this.db.promise().execute(
    `SELECT COUNT(*) as total FROM leads 
     WHERE user_id = ? AND status = 'closed (won)'`,
    [user_id]
     );

     const [revenue] = await this.db.promise().execute(
    `SELECT SUM(amount) as total FROM leads 
     WHERE user_id = ? AND status = 'closed (won)'`,
    [user_id]
    );


       // return {
            //total: totalLeads[0].total,
            //byStatus: statusStats,
          //  monthly: monthlyStats
        //};


        return {
        total: totalLeads[0].total,
        byStatus: statusStats,
        monthly: monthlyStats,

        dealsClosed: closedDeals[0].total || 0,
        totalRevenue: revenue[0].total || 0
        };

    }
}

module.exports = Lead;