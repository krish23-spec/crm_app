const Reminder = require('../models/Reminder');

exports.getReminders = async (req, res) => {
    try {
        const db = req.app.locals.db;
        const reminderModel = new Reminder(db);
        const reminders = await reminderModel.findAll(req.user.id, true);
        res.json({ success: true, reminders });
    } catch (error) {
        console.error('Get reminders error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.createReminder = async (req, res) => {
    try {
        const db = req.app.locals.db;
        const reminderModel = new Reminder(db);
        
        const reminderData = {
            ...req.body,
            user_id: req.user.id
        };
        
        const reminderId = await reminderModel.create(reminderData);
        res.status(201).json({ success: true, reminderId });
    } catch (error) {
        console.error('Create reminder error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateReminderStatus = async (req, res) => {
    try {
        const db = req.app.locals.db;
        const reminderModel = new Reminder(db);
        
        const updated = await reminderModel.updateStatus(req.params.id, req.user.id, req.body.is_completed);
        if (!updated) {
            return res.status(404).json({ message: 'Reminder not found' });
        }
        
        res.json({ success: true, message: 'Reminder updated' });
    } catch (error) {
        console.error('Update reminder error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteReminder = async (req, res) => {
    try {
        const db = req.app.locals.db;
        const reminderModel = new Reminder(db);
        
        const deleted = await reminderModel.delete(req.params.id, req.user.id);
        if (!deleted) {
            return res.status(404).json({ message: 'Reminder not found' });
        }
        
        res.json({ success: true, message: 'Reminder deleted' });
    } catch (error) {
        console.error('Delete reminder error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};