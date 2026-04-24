const supabase = require("../supabaseClient");

/**
 * Fetches today's active prompt.
 * As requested by the ticket: If no prompt exists for today,
 * it falls back to the most recent past prompt.
 */
const getTodayPrompt = async () => {
  // Get today's date formatted as YYYY-MM-DD
  const today = new Date().toISOString().split("T")[0];

  // ATTEMPT 1: Try to find a prompt specifically assigned to today
  let { data, error } = await supabase
    .from("prompts") // Look inside the 'prompts' table
    .select("*") // Select all columns (id, title, etc.)
    .eq("prompt_date", today) // Where the prompt_date equals today
    .single(); // We only expect exactly 1 result

  // ATTEMPT 2: The Fallback
  if (error && error.code === "PGRST116") {
    const fallback = await supabase
      .from("prompts")
      .select("*")
      .lte("prompt_date", today)
      .order("prompt_date", { ascending: false })
      .limit(1)
      .single();

    data = fallback.data;
    error = fallback.error;
  }

  // ERROR HANDLING
  if (error && error.code !== "PGRST116") {
    throw new Error(error.message);
  }

  return data;
};

/**
 * Fetches a specific prompt by its ID.
 */
const getPromptById = async (id) => {
  const { data, error } = await supabase
    .from("prompts")
    .select("*")
    .eq("id", id)
    .single();

  // PGRST116 means zero rows found. We ignore it so we can send a 404 later.
  if (error && error.code !== "PGRST116") {
    throw new Error(error.message);
  }

  return data;
};

/**
 * Fetches a specific prompt by its date (YYYY-MM-DD).
 */
const getPromptByDate = async (date) => {
  const { data, error } = await supabase
    .from("prompts")
    .select("*")
    .eq("prompt_date", date)
    .single();

  // PGRST116 means zero rows found. We ignore it so we can send a 404 later.
  if (error && error.code !== "PGRST116") {
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

  // Get today's date formatted as YYYY-MM-DD
  const today = new Date().toISOString().split("T")[0];
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  // Get paginated prompts + total count of prompts
  const { data, error, count } = await supabase
    .from("prompts")
    .select("id, title, prompt_text, category, prompt_date", {
      count: "exact",
    }) // Count the number of posts for each prompt
    .lt("prompt_date", today) // Only get prompts from the past excluding today
    .eq("is_active", true) // Only get active prompts
    .order("prompt_date", { ascending: false }) // Sort newest to oldest
    .range(from, to); // Apply our pagination math

  if (error) {
    throw new Error(error.message);
  }

  // If no prompts are found, return an empty array with the total count, page, and limit
  if (!data || data.length === 0) {
    return {
      prompts: [],
      total: count || 0,
      page,
      limit,
    };
  }

  // If prompts are found, fetch the posts for each prompt
  // Fetch the posts for each prompt
  const promptIds = data.map((prompt) => prompt.id);
  const { data: posts, error: postsError } = await supabase
    .from("posts")
    .select("prompt_id")
    .in("prompt_id", promptIds);

  if (postsError) {
    throw new Error(postsError.message);
  }

  // Count the number of posts for each prompt
  const postCounts = {};
  for (const post of posts || []) {
    postCounts[post.prompt_id] = (postCounts[post.prompt_id] || 0) + 1;
  }

  // Add the post counts to the prompts
  const promptsWithCounts = data.map((prompt) => ({
    ...prompt,
    post_count: postCounts[prompt.id] || 0,
  }));

  // Return the prompts with post counts, total prompts count, page, and limit
  return {
    prompts: promptsWithCounts,
    total: count || 0,
    page,
    limit,
  };
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
    throw new Error(
      "Missing required fields: title, prompt_text, and prompt_date are required.",
    );
  }

  // 2. Prevent duplicate dates
  // Ask the database if a prompt with this exact date already exists
  const { data: existingPrompt } = await supabase
    .from("prompts")
    .select("id")
    .eq("prompt_date", prompt_date)
    .single();

  if (existingPrompt) {
    throw new Error("A prompt already exists for this date.");
  }

  // 3. If it passes those checks, insert the new prompt into the database!
  const { data, error } = await supabase
    .from("prompts")
    .insert([{ title, prompt_text, prompt_date, category }])
    .select() // Tell Supabase to hand the new row back to us
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
  createPrompt,
};
