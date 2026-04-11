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
  // PGRST116 is Supabase's specific error code for "I found 0 rows"
  if (error && error.code === 'PGRST116') { 
    // Ask the database for the most recent prompt instead
    const fallback = await supabase
      .from('prompts')
      .select('*')
      .lte('prompt_date', today)                  // Less Than or Equal to today
      .order('prompt_date', { ascending: false }) // Sort newest to oldest
      .limit(1)                                   // Grab just the top 1 result
      .single();
      
    // Overwrite our initial empty variables with this new fallback data
    data = fallback.data;
    error = fallback.error;
  }

  // ERROR HANDLING
  // If there's an actual database error (not just missing data), throw it
  if (error && error.code !== 'PGRST116') {
    throw new Error(error.message);
  }

  // Send the found prompt back to whoever asked for it
  return data;
};

// Export the function so other files (like our Controller) can use it
module.exports = {
  getTodayPrompt
};