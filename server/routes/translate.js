const express = require('express');
const router = express.Router();
const { translate } = require('../controllers/translateController');

// POST /api/translate
router.post('/translate', translate);

module.exports = router;
