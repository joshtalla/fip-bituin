const { searchPostsService } = require("../services/searchService");

const searchPosts = async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;

    //checks if search is empty
    if (!q || q.trim() === "") {
      return res.status(400).json({
        error: "Search query is required",
      });
    }

    const results = await searchPostsService({
      query: q,
      page: Number(page),
      limit: Number(limit),
    });

    res.json(results);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to search posts",
    });
  }
};

module.exports = {
  searchPosts,
};