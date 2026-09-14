const express = require('express');
const { simulateCircuit } = require('../controllers/quantumController');
const router = express.Router();
router.post('/simulate', simulateCircuit);
module.exports = router;
