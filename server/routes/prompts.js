const express = require('express');
const router = express.Router();
const promptsController = require('../controllers/promptsController');

// 1. Get today's prompt
router.get('/today', promptsController.getTodayPrompt);

// 2. Get the archive of past prompts (Must come BEFORE /:id)
router.get('/archive', promptsController.getArchivePrompts);

// 3. Get a prompt by date (Must come BEFORE /:id)
router.get('/date/:date', promptsController.getPromptByDate);

// 4. Get a specific prompt by its ID
// The colon (:) tells Express that "id" is a dynamic variable
router.get('/:id', promptsController.getPromptById);

module.exports = router;