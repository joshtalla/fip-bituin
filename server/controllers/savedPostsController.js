const supabase = require('../supabaseClient');

const {
  savePostService,
  unsavePostService,
  getSavedPostsService,
} = require('../services/savedPostsService');


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
  
  const authUser = data.user;
  
  const { data: appUser, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('auth_user_id', authUser.id)
    .single();
  
  if (userError || !appUser) {
    return null;
  }
  
  return {
    authUser,
    appUser,
  };
};


const savePost = async (req, res) => {
  try {
    const user = await getAuthenticatedUser(req);
  
    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
      });
    }
  
    const { postId } = req.params;
  
    if (!postId) {
      return res.status(400).json({
        error: 'Post ID is required',
      });
    }
  
    const result = await savePostService({
      userId: user.appUser.id,
      postId,
    });
  
    if (result.error === 'POST_NOT_FOUND') {
      return res.status(404).json({
        error: 'Post not found',
      });
    }
  
    return res.status(200).json({
      message: 'Post saved successfully',
    });
  } catch (error) {
    console.error('savePost controller error:', error);
  
    return res.status(500).json({
      error: 'Internal server error',
    });
  }
};


const unsavePost = async (req, res) => {
  try {
    const user = await getAuthenticatedUser(req);
  
    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
      });
    }
  
    const { postId } = req.params;
  
    if (!postId) {
      return res.status(400).json({
        error: 'Post ID is required',
      });
    }
  
    const result = await unsavePostService({
      userId: user.appUser.id,
      postId,
    });
  
    if (result.error === 'POST_NOT_FOUND') {
      return res.status(404).json({
        error: 'Post not found',
      });
    }
  
    return res.status(200).json({
      message: 'Post unsaved successfully',
    });
  } catch (error) {
    console.error('unsavePost controller error:', error);
  
    return res.status(500).json({
      error: 'Internal server error',
    });
  }
};


const getSavedPosts = async (req, res) => {
  try {
    const user = await getAuthenticatedUser(req);

    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
      });
    }

    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;

    if (page < 1 || limit < 1 || limit > 50) {
      return res.status(400).json({
        error: 'Invalid pagination parameters',
      });
    }

    const result = await getSavedPostsService({
      userId: user.appUser.id,
      page,
      limit,
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error('getSavedPosts controller error:', error);

    return res.status(500).json({
      error: 'Internal server error',
    });
  }
};


module.exports = {
  savePost,
  unsavePost,
  getSavedPosts,
};