const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    getDeals,
    createDeal,
    updateDealStatus,
    getRevenueStats
} = require('../controllers/dealController');

router.use(protect);

router.route('/')
    .get(getDeals)
    .post(createDeal);

router.get('/stats/revenue', getRevenueStats);
router.put('/:id/status', updateDealStatus);

module.exports = router;