// 1. Import the "Chef" (our service file) so the waiter can talk to it
const promptService = require('../services/promptService');

/**
 * Waiter function to handle requests for today's prompt.
 * @param {object} req - The Request (what the frontend is asking for)
 * @param {object} res - The Response (the plate we serve back to the frontend)
 */
const getTodayPrompt = async (req, res) => {
  try {
    // 2. Ask the Chef to get today's prompt (or the fallback)
    const prompt = await promptService.getTodayPrompt();

    // 3. Did the Chef hand us food? 
    if (prompt) {
      // Yes! Serve it to the user with a 200 (Success) status code
      res.status(200).json(prompt);
    } else {
      // No food found at all. Serve a 404 (Not Found) status code
      res.status(404).json({ error: 'No prompts found in the database.' });
    }

  } catch (error) {
    // 4. Did the kitchen catch on fire? (Database down, bad password, etc.)
    // Log the error for ourselves to read in the terminal
    console.error("Error in getTodayPrompt controller:", error.message);
    
    // Serve a generic 500 (Server Error) status code so the frontend doesn't crash
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// 5. Export this Waiter function so the Host (Routes) can assign it to a table
module.exports = {
  getTodayPrompt
};