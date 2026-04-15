const Lead = require('../models/Lead');
const Reminder = require('../models/Reminder');
const Deal = require('../models/Deal');

exports.getDashboardAnalytics = async (req, res) => {
    try {
        const db = req.app.locals.db;
        const leadModel = new Lead(db);
        const reminderModel = new Reminder(db);
        const dealModel = new Deal(db);
        
        const leadStats = await leadModel.getStats(req.user.id);
        const revenueStats = await dealModel.getRevenueStats(req.user.id);
        const upcomingReminders = await reminderModel.findAll(req.user.id, true);
        const reminderCount = await reminderModel.getUpcomingCount(req.user.id);
        
        // Calculate total outreach (sum of outreach_count across leads)
        const [outreachResult] = await db.promise().execute(
            'SELECT SUM(outreach_count) as total FROM leads WHERE user_id = ?',
            [req.user.id]
        );
        
        // Monthly performance
        const [monthlyLeads] = await db.promise().execute(
            `SELECT DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as count 
             FROM leads WHERE user_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
             GROUP BY DATE_FORMAT(created_at, '%Y-%m') ORDER BY month`,
            [req.user.id]
        );
        
        const [monthlyRevenue] = await db.promise().execute(
            `SELECT DATE_FORMAT(closed_date, '%Y-%m') as month, SUM(deal_value) as revenue 
             FROM deals WHERE user_id = ? AND status = "Won" AND closed_date IS NOT NULL
             AND closed_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
             GROUP BY DATE_FORMAT(closed_date, '%Y-%m') ORDER BY month`,
            [req.user.id]
        );
        
        res.json({
            success: true,
            analytics: {
                totalLeads: leadStats.total,
                totalOutreach: outreachResult[0].total || 0,
                dealsClosed: revenueStats.totalRevenue > 0 ? 
                    (await db.promise().execute('SELECT COUNT(*) as count FROM deals WHERE user_id = ? AND status = "Won"', [req.user.id]))[0][0].count : 0,
                totalRevenue: revenueStats.totalRevenue,
                conversionRate: revenueStats.conversionRate,
                upcomingReminders: reminderCount,
                remindersList: upcomingReminders,
                monthlyLeads: monthlyLeads,
                monthlyRevenue: monthlyRevenue,
                leadStatus: leadStats.byStatus
            }
        });
    } catch (error) {
        console.error('Dashboard analytics error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getMonthlyReport = async (req, res) => {
    try {
        const db = req.app.locals.db;
        const { year, month } = req.query;
        const targetDate = year && month ? `${year}-${month}` : null;
        
        let query = `
            SELECT 
                DATE_FORMAT(l.created_at, '%Y-%m') as month,
                COUNT(DISTINCT l.id) as leads_added,
                SUM(l.outreach_count) as outreach_count,
                COUNT(DISTINCT d.id) as deals_closed,
                SUM(CASE WHEN d.status = 'Won' THEN d.deal_value ELSE 0 END) as revenue
            FROM leads l
            LEFT JOIN deals d ON l.id = d.lead_id AND d.status = 'Won'
            WHERE l.user_id = ?
        `;
        
        const params = [req.user.id];
        
        if (targetDate) {
            query += ` AND DATE_FORMAT(l.created_at, '%Y-%m') = ?`;
            params.push(targetDate);
        } else {
            query += ` AND l.created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)`;
        }
        
        query += ` GROUP BY DATE_FORMAT(l.created_at, '%Y-%m') ORDER BY month DESC`;
        
        const [rows] = await db.promise().execute(query, params);
        
        res.json({ success: true, report: rows });
    } catch (error) {
        console.error('Monthly report error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.exportLeadsCSV = async (req, res) => {
    try {
        const db = req.app.locals.db;
        const leadModel = new Lead(db);
        const leads = await leadModel.findAll(req.user.id, {});
        
        // Create CSV
        const headers = ['ID', 'Name', 'Country', 'Email', 'Phone', 'Business Type', 'Source', 'Status', 'Outreach Count', 'Last Outreach', 'Created At'];
        const csvRows = [headers];
        
        leads.forEach(lead => {
            csvRows.push([
                lead.id,
                lead.name,
                lead.country,
                lead.email || '',
                lead.phone || '',
                lead.business_type || '',
                lead.source,
                lead.status,
                lead.outreach_count,
                lead.last_outreach_date || '',
                new Date(lead.created_at).toLocaleDateString()
            ]);
        });
        
        const csvContent = csvRows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=leads_export_${Date.now()}.csv`);
        res.send(csvContent);
    } catch (error) {
        console.error('Export CSV error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};