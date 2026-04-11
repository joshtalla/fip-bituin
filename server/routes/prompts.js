// 1. Bring in Express so we can create a "Router" (a mini-map for our URLs)
const express = require('express');
const router = express.Router();

// 2. Import our "Waiter" (the controller) so we know who to hand the request to
const promptsController = require('../controllers/promptsController');

// 3. Define the Route
// When a GET request comes in for the '/today' path, trigger the getTodayPrompt function
router.get('/today', promptsController.getTodayPrompt);

// 4. Export this map so the main server (index.js) can see it
module.exports = router;