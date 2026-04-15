const Deal = require('../models/Deal');

exports.getDeals = async (req, res) => {
    try {
        const db = req.app.locals.db;
        const dealModel = new Deal(db);
        const deals = await dealModel.findAll(req.user.id);
        res.json({ success: true, deals });
    } catch (error) {
        console.error('Get deals error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.createDeal = async (req, res) => {
    try {
        const db = req.app.locals.db;
        const dealModel = new Deal(db);
        
        const dealData = {
            ...req.body,
            user_id: req.user.id
        };
        
        const dealId = await dealModel.create(dealData);
        res.status(201).json({ success: true, dealId });
    } catch (error) {
        console.error('Create deal error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateDealStatus = async (req, res) => {
    try {
        const db = req.app.locals.db;
        const dealModel = new Deal(db);
        
        const updated = await dealModel.updateStatus(req.params.id, req.user.id, req.body.status, req.body.closed_date);
        if (!updated) {
            return res.status(404).json({ message: 'Deal not found' });
        }
        
        res.json({ success: true, message: 'Deal status updated' });
    } catch (error) {
        console.error('Update deal error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getRevenueStats = async (req, res) => {
    try {
        const db = req.app.locals.db;
        const dealModel = new Deal(db);
        const stats = await dealModel.getRevenueStats(req.user.id);
        res.json({ success: true, stats });
    } catch (error) {
        console.error('Get revenue stats error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};