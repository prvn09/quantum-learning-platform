const express = require('express');
const { requireAuth } = require('../middleware/auth');
const controller = require('../controllers/profileController');
const router = express.Router();
router.use(requireAuth);
router.get('/', controller.getProfile);
router.patch('/', controller.updateProfile);
module.exports = router;
