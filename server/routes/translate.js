const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const { translate } = require('../controllers/translateController');

// Set up rate limiting for the translate endpoint
const translateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 30 // limit each IP address to 30 requests per windowMs
});

/**
 * Calls the translate controller to handle language translation requests.
 *
 * Route:
 *   POST /api/translate
 *
 * Delegates to:
 *   translateController.translate
 *
 * Example: POST http://localhost:3000/api/translate
 */
router.post('/translate', translateLimiter, translate);
module.exports = router;
