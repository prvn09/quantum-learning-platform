const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { recordQuizAttempt, getQuestionPlan, getDashboard } = require('../controllers/quizAnalyticsController');
const router = express.Router();
router.use(requireAuth);
router.post('/attempts', recordQuizAttempt);
router.get('/plan/:topicSlug', getQuestionPlan);
router.get('/dashboard', getDashboard);
module.exports = router;
