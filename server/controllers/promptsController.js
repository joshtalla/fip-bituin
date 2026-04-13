// 1. Import the "Chef" (our service file) so the waiter can talk to it
const promptService = require('../services/promptService');

/**
 * Waiter function to handle requests for today's prompt.
 */
const getTodayPrompt = async (req, res) => {
  try {
    const prompt = await promptService.getTodayPrompt();

    if (prompt) {
      res.status(200).json(prompt);
    } else {
      res.status(404).json({ error: 'No prompts found in the database.' });
    }

  } catch (error) {
    console.error("Error in getTodayPrompt controller:", error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

/**
 * Waiter function to handle requests for a specific prompt by its ID.
 */
const getPromptById = async (req, res) => {
  try {
    // req.params pulls the dynamic ID directly out of the URL string
    // Example: If the URL is /api/prompts/123, then req.params.id will be "123"
    const { id } = req.params;
    
    // Ask the Chef to find the prompt with this specific ID
    const prompt = await promptService.getPromptById(id);

    if (prompt) {
      res.status(200).json(prompt);
    } else {
      res.status(404).json({ error: 'Prompt not found.' });
    }
  } catch (error) {
    console.error("Error in getPromptById controller:", error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

/**
 * Waiter function to handle requests for a specific prompt by date.
 */
const getPromptByDate = async (req, res) => {
  try {
    // req.params pulls the dynamic date directly out of the URL string
    // Example: /api/prompts/date/2026-03-30 -> req.params.date will be "2026-03-30"
    const { date } = req.params;
    
    // Ask the Chef to find the prompt with this specific date
    const prompt = await promptService.getPromptByDate(date);

    if (prompt) {
      res.status(200).json(prompt);
    } else {
      res.status(404).json({ error: 'Prompt not found for this date.' });
    }
  } catch (error) {
    console.error("Error in getPromptByDate controller:", error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

/**
 * Waiter function to handle requests for the prompts archive (with pagination).
 */
const getArchivePrompts = async (req, res) => {
  try {
    // req.query pulls variables from the end of the URL (after the '?')
    // We also set default values (page 1, limit 10) just in case the frontend forgets to send them
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    // Ask the Chef to get the specific page of prompts
    const prompts = await promptService.getArchivePrompts(page, limit);

    // For arrays (lists of data), an empty result is just [], not null/undefined
    // So we can just return it directly with a 200 status
    res.status(200).json(prompts);

  } catch (error) {
    console.error("Error in getArchivePrompts controller:", error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Export ALL Waiter functions so the Host (Routes) can assign them
module.exports = {
  getTodayPrompt,
  getPromptById,
  getPromptByDate,
  getArchivePrompts
};