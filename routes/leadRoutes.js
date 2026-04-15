const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    getAllLeads,
    getLead,
    createLead,
    updateLead,
    deleteLead,
    recordOutreach,
    getLeadStats
} = require('../controllers/leadController');

router.use(protect);

router.route('/')
    .get(getAllLeads)
    .post(createLead);

router.get('/stats', getLeadStats);
router.post('/:id/outreach', recordOutreach);
router.route('/:id')
    .get(getLead)
    .put(updateLead)
    .delete(deleteLead);

module.exports = router;