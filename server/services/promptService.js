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

const getPromptBoard = async (id, { sort, page, limit }) => {
  // Get today's date formatted as YYYY-MM-DD
  const today = new Date().toISOString().split("T")[0];

  // Fetches a specific prompt by its ID.
  const { data, error } = await supabase
    .from("prompts")
    .select("id, title, prompt_text, category, prompt_date, is_active")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(error.message);
  }
  // If the prompt is not found, throw an error
  if (!data) {
    throw new Error("Prompt not found.");
  }

  // If the prompt is inactive, throw an error
  if (data.is_active === false) {
    throw new Error("Prompt is inactive (is_active = FALSE).");
  }

  // If the prompt is today's or a future date, throw an error
  if (data.prompt_date >= today) {
    throw new Error("Prompt is today's or a future date - not in the archive.");
  }

  // Set the sort column based on the sort parameter
  const sortBy = {
    newest: "created_at",
    likes: "likes_count",
    popular: "reply_count",
  };

  const sortColumn = sortBy[sort] || sortBy.newest;

  // Calculate the database range based on the page and limit
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  // Fetches the posts for the specific prompt.
  // Count the number of posts for the specific prompt.
  // Sort by the column.
  // Apply the pagination math.
  const {
    data: posts,
    error: postsError,
    count,
  } = await supabase
    .from("posts")
    .select(
      "id, prompt_id, anonymous_name, content, category, language, country, likes_count, reply_count, created_at", // Select the columns we want to return
      {
        count: "exact", // Count the number of posts for the specific prompt (exact count)
      },
    )
    .eq("prompt_id", id) // Only get posts for the specific prompt
    .order(sortColumn, { ascending: false }) // Sort by the column in descending order (newest to oldest)
    .range(from, to); // Apply the pagination math (from the start of the page to the end of the page)

  if (postsError) {
    throw new Error(postsError.message);
  }

  // Remove the is_active column from the prompt data and return the prompt data without the is_active column
  const { is_active, ...safePrompt } = data;

  return {
    prompt: safePrompt,
    posts: {
      items: posts || [],
      total: count || 0,
      page,
      limit,
    },
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
  getPromptBoard,
  createPrompt,
};
