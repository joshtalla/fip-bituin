const { getPostById, getPostsByPrompt, insertPost } = require('../services/postService');
const supabase = require('../supabaseClient');

const listPostsByPrompt = async (req, res) => {
  try {
    const { promptId } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 18;

    const result = await getPostsByPrompt(promptId, page, limit);
    return res.status(200).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

const getPost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await getPostById(id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    return res.status(200).json(post);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

const createPost = async (req, res) => {
  try {
    const { prompt_id, content } = req.body;

    
    if (!prompt_id) {
      return res.status(400).json({ error: "Prompt ID required" });
    }

    if (!content) {
      return res.status(400).json({ error: "Content required" });
    }

    
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "No auth token" });
    }

    const [scheme, token] = authHeader.split(" ");
    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({ error: "Invalid authorization format" });
    }

    
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const auth_user_id = data.user.id;

    const post = await insertPost({
      prompt_id,
      content,
      auth_user_id
    });

    return res.status(201).json(post);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { createPost, getPost, listPostsByPrompt };
