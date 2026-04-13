// Load hidden environment variables from the .env file
require('dotenv').config();

// Import the tool needed to connect to Supabase
const { createClient } = require('@supabase/supabase-js');

// Retrieve your specific database URL and secret key from the .env vault
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

// Initialize the Supabase client (this opens the actual connection to the database)
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Fetches today's active prompt.
 * As requested by the ticket: If no prompt exists for today, 
 * it falls back to the most recent past prompt.
 */
const getTodayPrompt = async () => {
  // Get today's date formatted as YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0]; 

  // ATTEMPT 1: Try to find a prompt specifically assigned to today
  let { data, error } = await supabase
    .from('prompts')             // Look inside the 'prompts' table
    .select('*')                 // Select all columns (id, title, etc.)
    .eq('prompt_date', today)    // Where the prompt_date equals today
    .single();                   // We only expect exactly 1 result

  // ATTEMPT 2: The Fallback
  if (error && error.code === 'PGRST116') { 
    const fallback = await supabase
      .from('prompts')
      .select('*')
      .lte('prompt_date', today)                  
      .order('prompt_date', { ascending: false }) 
      .limit(1)                                   
      .single();
      
    data = fallback.data;
    error = fallback.error;
  }

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
    .select('*')
    .eq('id', id)
    .single();

  // PGRST116 means zero rows found. We ignore it so we can send a 404 later.
  if (error && error.code !== 'PGRST116') {
    throw new Error(error.message);
  }

  return data; 
};

// Export ALL functions here at the very bottom!
module.exports = {
  getTodayPrompt,
  getPromptById
};