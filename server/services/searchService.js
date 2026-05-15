const supabase = require("../supabaseClient");

const searchPostsService = async ({ query, page, limit }) => {
  const normalizedQuery = String(query || "").trim();
  const skip = (page - 1) * limit;
  const from = skip;
  const to = skip + limit - 1;

  const { data: posts, error, count } = await supabase
    .from("posts")
    .select("id, content, anonymous_name, created_at", { count: "exact" })
    .ilike("content", `%${normalizedQuery}%`)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw error;
  }

  return {
    results: posts || [],
    total: count || 0,
    page,
    limit,
    query: normalizedQuery,
  };
};

module.exports = {
  searchPostsService,
};