const Lead = require('../models/Lead');

exports.getAllLeads = async (req, res) => {
    try {
        const db = req.app.locals.db;
        const leadModel = new Lead(db);
        const { status, country, search } = req.query;
        
        const leads = await leadModel.findAll(req.user.id, { status, country, search });
        res.json({ success: true, leads });
    } catch (error) {
        console.error('Get leads error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getLead = async (req, res) => {
    try {
        const db = req.app.locals.db;
        const leadModel = new Lead(db);
        const lead = await leadModel.findById(req.params.id, req.user.id);
        
        if (!lead) {
            return res.status(404).json({ message: 'Lead not found' });
        }
        
        res.json({ success: true, lead });
    } catch (error) {
        console.error('Get lead error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.createLead = async (req, res) => {
    try {
        const db = req.app.locals.db;
        const leadModel = new Lead(db);
        
        const leadData = {
            ...req.body,
            user_id: req.user.id
        };
        
        const leadId = await leadModel.create(leadData);
        const newLead = await leadModel.findById(leadId, req.user.id);
        
        res.status(201).json({ success: true, lead: newLead });
    } catch (error) {
        console.error('Create lead error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateLead = async (req, res) => {
    try {
        const db = req.app.locals.db;
        const leadModel = new Lead(db);
        
        const updated = await leadModel.update(req.params.id, req.user.id, req.body);
        if (!updated) {
            return res.status(404).json({ message: 'Lead not found or no changes made' });
        }
        
        const lead = await leadModel.findById(req.params.id, req.user.id);
        res.json({ success: true, lead });
    } catch (error) {
        console.error('Update lead error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteLead = async (req, res) => {
    try {
        const db = req.app.locals.db;
        const leadModel = new Lead(db);
        
        const deleted = await leadModel.delete(req.params.id, req.user.id);
        if (!deleted) {
            return res.status(404).json({ message: 'Lead not found' });
        }
        
        res.json({ success: true, message: 'Lead deleted successfully' });
    } catch (error) {
        console.error('Delete lead error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.recordOutreach = async (req, res) => {
    try {
        const db = req.app.locals.db;
        const leadModel = new Lead(db);
        
        const updated = await leadModel.incrementOutreach(req.params.id, req.user.id);
        if (!updated) {
            return res.status(404).json({ message: 'Lead not found' });
        }
        
        res.json({ success: true, message: 'Outreach recorded successfully' });
    } catch (error) {
        console.error('Record outreach error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getLeadStats = async (req, res) => {
    try {
        const db = req.app.locals.db;
        const leadModel = new Lead(db);
        
        const stats = await leadModel.getStats(req.user.id);
        res.json({ success: true, stats });
    } catch (error) {
        console.error('Get lead stats error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};