const { insertPost } = require('../services/postService');

const createPost = async (req, res) => {
  try {
    const { prompt_id, content } = req.body;

    
    if (!content) {
      return res.status(400).json({ error: "Content required" });
    }

    
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "No auth token" });
    }

    const token = authHeader.split(" ")[1];

    
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

module.exports = { createPost };