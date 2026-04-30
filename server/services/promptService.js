const supabase = require('../supabaseClient');

const PROMPT_COLUMNS = 'id, title, prompt_text, category, prompt_date, created_by, is_active, created_at';

/**
 * Fetches today's active prompt.
 * As requested by the ticket: If no prompt exists for today, 
 * it falls back to the most recent past prompt.
 */
const getTodayPrompt = async () => {
  // Get today's date formatted as YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0]; 

  const { data, error } = await supabase
    .from('prompts')             // Look inside the 'prompts' table
    .select(PROMPT_COLUMNS)
    .lte('prompt_date', today)
    .order('prompt_date', { ascending: false })
    .limit(1)
    .single();

  // ERROR HANDLING
  if (error && error.code !== 'PGRST116') {
    throw new Error(error.message);
  }

  return data;
};

/**
 * Fetches a specific prompt by its ID.
 */
const getPromptById = async (id) => {
  const { data, error } = await supabase
    .from('prompts')
    .select(PROMPT_COLUMNS)
    .eq('id', id)
    .single();

  // PGRST116 means zero rows found. We ignore it so we can send a 404 later.
  if (error && error.code !== 'PGRST116') {
    throw new Error(error.message);
  }

  return data; 
};

/**
 * Fetches a specific prompt by its date (YYYY-MM-DD).
 */
const getPromptByDate = async (date) => {
  const { data, error } = await supabase
    .from('prompts')
    .select(PROMPT_COLUMNS)
    .eq('prompt_date', date)
    .single();

  // PGRST116 means zero rows found. We ignore it so we can send a 404 later.
  if (error && error.code !== 'PGRST116') {
    throw new Error(error.message);
  }

  return data; 
};

/**
 * Fetches past prompts with pagination.
 * Ticket requirement: sort archive by newest first.
 */
const getArchivePrompts = async (page = 1, limit = 10) => {
  // Calculate the database range based on the page and limit
  // Example: Page 1, Limit 10 means we want items 0 through 9.
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error } = await supabase
    .from('prompts')
    .select(PROMPT_COLUMNS)
    .order('prompt_date', { ascending: false }) // Sort newest to oldest
    .range(from, to);                           // Apply our pagination math

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

/**
 * Creates a new prompt.
 * Ticket requirements: validate required fields, prevent duplicate prompt dates.
 */
const createPrompt = async (promptData) => {
  // Pull out the pieces of data the user sent us
  const { title, prompt_text, prompt_date, category } = promptData;

  // 1. Validate required fields
  if (!title || !prompt_text || !prompt_date) {
    throw new Error('Missing required fields: title, prompt_text, and prompt_date are required.');
  }

  // 2. Prevent duplicate dates
  // Ask the database if a prompt with this exact date already exists
  const { data: existingPrompt } = await supabase
    .from('prompts')
    .select('id')
    .eq('prompt_date', prompt_date)
    .single();

  if (existingPrompt) {
    throw new Error('A prompt already exists for this date.');
  }

  // 3. If it passes those checks, insert the new prompt into the database!
  const { data, error } = await supabase
    .from('prompts')
    .insert([
      { title, prompt_text, prompt_date, category }
    ])
    .select()    // Tell Supabase to hand the new row back to us
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

// Export ALL functions here at the very bottom
module.exports = {
  getTodayPrompt,
  getPromptById,
  getPromptByDate,
  getArchivePrompts,
  createPrompt   
};
