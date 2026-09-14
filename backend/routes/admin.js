const express = require('express');
const { requireAuth, requireRole } = require('../middleware/auth');
const router = express.Router();
router.get('/overview', requireAuth, requireRole('admin', 'faculty'), (req, res) => res.json({ data: { viewer: req.user, message: 'Role-protected overview' } }));
module.exports = router;
