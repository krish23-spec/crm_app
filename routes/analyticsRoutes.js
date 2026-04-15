const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    getDashboardAnalytics,
    getMonthlyReport,
    exportLeadsCSV
} = require('../controllers/analyticsController');

router.use(protect);

router.get('/dashboard', getDashboardAnalytics);
router.get('/monthly-report', getMonthlyReport);
router.get('/export-leads', exportLeadsCSV);

module.exports = router;