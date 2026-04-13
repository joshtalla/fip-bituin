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

// Export ALL Waiter functions so the Host (Routes) can assign them
module.exports = {
  getTodayPrompt,
  getPromptById
};