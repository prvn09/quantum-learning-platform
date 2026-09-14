const express = require('express');
const { listLessons, getLesson } = require('../controllers/lessonController');
const router = express.Router();
router.get('/', listLessons);
router.get('/:id', getLesson);
module.exports = router;
