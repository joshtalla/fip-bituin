const express = require('express');
const router = express.Router();
const promptsController = require('../controllers/promptsController');

// 1. Get today's prompt (Must come BEFORE /:id)
router.get('/today', promptsController.getTodayPrompt);

// 2. Get a specific prompt by its ID
// The colon (:) tells Express that "id" is a dynamic variable
router.get('/:id', promptsController.getPromptById);

module.exports = router;