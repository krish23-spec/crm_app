const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    getReminders,
    createReminder,
    updateReminderStatus,
    deleteReminder
} = require('../controllers/reminderController');

router.use(protect);

router.route('/')
    .get(getReminders)
    .post(createReminder);

router.put('/:id/status', updateReminderStatus);
router.delete('/:id', deleteReminder);

module.exports = router;