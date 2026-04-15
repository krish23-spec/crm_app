class Deal {
    constructor(db) {
        this.db = db;
    }

    async create(dealData) {
        const { lead_id, user_id, deal_value, currency, status, notes } = dealData;
        
        const [result] = await this.db.promise().execute(
            `INSERT INTO deals (lead_id, user_id, deal_value, currency, status, notes) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [lead_id, user_id, deal_value, currency || 'INR', status || 'Negotiation', notes]
        );
        return result.insertId;
    }

    async findAll(user_id) {
        const [rows] = await this.db.promise().execute(
            `SELECT d.*, l.name as lead_name, l.country 
             FROM deals d 
             JOIN leads l ON d.lead_id = l.id 
             WHERE d.user_id = ? 
             ORDER BY d.created_at DESC`,
            [user_id]
        );
        return rows;
    }

    async updateStatus(id, user_id, status, closed_date = null) {
        let query = 'UPDATE deals SET status = ?';
        const params = [status];

        if (closed_date || status === 'Won' || status === 'Lost') {
            query += ', closed_date = ?';
            params.push(closed_date || new Date().toISOString().split('T')[0]);
        }

        query += ' WHERE id = ? AND user_id = ?';
        params.push(id, user_id);

        const [result] = await this.db.promise().execute(query, params);
        return result.affectedRows > 0;
    }

    async getRevenueStats(user_id) {
        const [totalRevenue] = await this.db.promise().execute(
            'SELECT SUM(deal_value) as total FROM deals WHERE user_id = ? AND status = "Won"',
            [user_id]
        );
        
        const [monthlyRevenue] = await this.db.promise().execute(
            `SELECT DATE_FORMAT(closed_date, '%Y-%m') as month, SUM(deal_value) as revenue 
             FROM deals WHERE user_id = ? AND status = "Won" AND closed_date IS NOT NULL 
             GROUP BY DATE_FORMAT(closed_date, '%Y-%m') ORDER BY month DESC LIMIT 6`,
            [user_id]
        );
        
        const [conversionRate] = await this.db.promise().execute(
            `SELECT 
                COUNT(CASE WHEN status IN ("Won", "Lost") THEN 1 END) as total_closed,
                COUNT(CASE WHEN status = "Won" THEN 1 END) as won
             FROM deals WHERE user_id = ?`,
            [user_id]
        );

        return {
            totalRevenue: totalRevenue[0].total || 0,
            monthlyRevenue,
            conversionRate: conversionRate[0].total_closed > 0 
                ? (conversionRate[0].won / conversionRate[0].total_closed * 100).toFixed(2)
                : 0
        };
    }
}

module.exports = Deal;