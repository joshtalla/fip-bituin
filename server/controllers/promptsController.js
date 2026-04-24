// 1. Import the "Chef" (our service file) so the waiter can talk to it
const promptService = require("../services/promptService");

/**
 * Waiter function to handle requests for today's prompt.
 */
const getTodayPrompt = async (req, res) => {
  try {
    const prompt = await promptService.getTodayPrompt();

    if (prompt) {
      res.status(200).json(prompt);
    } else {
      res.status(404).json({ error: "No prompts found in the database." });
    }
  } catch (error) {
    console.error("Error in getTodayPrompt controller:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
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
      res.status(404).json({ error: "Prompt not found." });
    }
  } catch (error) {
    console.error("Error in getPromptById controller:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
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
      res.status(404).json({ error: "Prompt not found for this date." });
    }
  } catch (error) {
    console.error("Error in getPromptByDate controller:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * Waiter function to handle requests for the prompts archive (with pagination).
 */
const getArchivePrompts = async (req, res) => {
  try {
    // req.query pulls variables from the end of the URL (after the '?')
    // We also set default values (page 1, limit 10) just in case the frontend forgets to send them
    const rawPage = req.query.page ?? 1;
    const rawLimit = req.query.limit ?? 10;

    // Standardize the page and limit values to numbers, and clamp the limit to 50 to prevent abuse
    const page = Number(rawPage);
    const limit = Math.min(Number(rawLimit), 50);

    // If the page is not a positive number, return a 400 error
    if (!Number.isInteger(page) || page <= 0) {
      return res
        .status(400)
        .json({ error: "Invalid page value (non-numeric, zero, or negative)" });
    }

    // If the limit is not a positive number, return a 400 error
    if (!Number.isInteger(limit) || limit <= 0) {
      return res.status(400).json({
        error: "Invalid limit value (non-numeric, zero, or negative)",
      });
    }

    // Ask the Chef to get the specific page of prompts
    const prompts = await promptService.getArchivePrompts(page, limit);

    // For arrays (lists of data), an empty result is just [], not null/undefined
    // So we can just return it directly with a 200 status
    res.status(200).json(prompts);
  } catch (error) {
    console.error("Error in getArchivePrompts controller:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * Waiter function to handle creating a new prompt (POST request).
 */
const createPrompt = async (req, res) => {
  try {
    // For POST requests, the data comes in the "body" of the request
    const promptData = req.body;

    // Ask the Chef to create this new prompt
    const newPrompt = await promptService.createPrompt(promptData);

    // 201 is the specific HTTP status code for "Created successfully"
    res.status(201).json(newPrompt);
  } catch (error) {
    console.error("Error in createPrompt controller:", error.message);

    // If the error was our custom validation error (missing fields or duplicate date),
    // we send a 400 Bad Request to tell the frontend they messed up the form.
    res.status(400).json({ error: error.message });
  }
};

// Export ALL Waiter functions so the Host (Routes) can assign them
module.exports = {
  getTodayPrompt,
  getPromptById,
  getPromptByDate,
  getArchivePrompts,
  createPrompt,
};
