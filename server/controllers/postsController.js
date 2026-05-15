const {
  getPostById,
  getPostsByPrompt,
  getPostsForAuthUser,
  insertPost,
  likePostById,
  unlikePostById,
} = require('../services/postService');
const supabase = require('../supabaseClient');

const getAuthenticatedUser = async (req) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return null;
  }

  return data.user;
};

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

const getMyPosts = async (req, res) => {
  try {
    const authUser = await getAuthenticatedUser(req);

    if (!authUser) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;

    if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 50) {
      return res.status(400).json({ error: 'Invalid pagination parameters' });
    }

    const result = await getPostsForAuthUser(authUser.id, page, limit);
    return res.status(200).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

const createPost = async (req, res) => {
  try {
    const { prompt_id, content, media_url, media_type, media_width, media_height } = req.body;
    const normalizedContent = typeof content === 'string' ? content.trim() : '';

    
    if (!prompt_id) {
      return res.status(400).json({ error: "Prompt ID required" });
    }

    if (!normalizedContent && !media_url) {
      return res.status(400).json({ error: "Content or media required" });
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

    const post = await insertPost({
      prompt_id,
      content: normalizedContent,
      authUser: data.user,
      media: {
        media_url,
        media_type,
        media_width,
        media_height,
      },
    });

    return res.status(201).json(post);

  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ error: err.message });
    }

    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

const likePost = async (req, res) => {
  try {
    const authUser = await getAuthenticatedUser(req);

    if (!authUser) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { postId } = req.params;

    if (!postId) {
      return res.status(400).json({ error: 'Post ID required' });
    }

    const result = await likePostById(postId);

    if (result.error === 'POST_NOT_FOUND') {
      return res.status(404).json({ error: 'Post not found' });
    }

    return res.status(200).json({
      postId: result.id,
      likes_count: result.likes_count,
      liked: true,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

const unlikePost = async (req, res) => {
  try {
    const authUser = await getAuthenticatedUser(req);

    if (!authUser) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { postId } = req.params;

    if (!postId) {
      return res.status(400).json({ error: 'Post ID required' });
    }

    const result = await unlikePostById(postId);

    if (result.error === 'POST_NOT_FOUND') {
      return res.status(404).json({ error: 'Post not found' });
    }

    return res.status(200).json({
      postId: result.id,
      likes_count: result.likes_count,
      liked: false,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  createPost,
  getPost,
  getMyPosts,
  likePost,
  unlikePost,
  listPostsByPrompt,
};
