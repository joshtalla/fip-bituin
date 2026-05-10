const express = require('express');
const router = express.Router();
const { translate } = require('../controllers/translateController');

// POST /api/translate: Calls the translate controller to handle language translation requests
router.post('/translate', translate);

module.exports = router;
