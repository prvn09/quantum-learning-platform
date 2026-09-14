const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { getDashboardAnalytics } = require('../controllers/analyticsController');
const router = express.Router();
router.use(requireAuth);
router.get('/dashboard', getDashboardAnalytics);
module.exports = router;
