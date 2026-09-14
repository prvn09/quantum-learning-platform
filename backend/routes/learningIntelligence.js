const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { analyzeAttempt, getStudentInsights } = require('../controllers/learningIntelligenceController');
const router = express.Router();
router.use(requireAuth);
router.post('/analyze', analyzeAttempt);
router.get('/insights', getStudentInsights);
module.exports = router;
