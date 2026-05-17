const supabase = require('../supabaseClient');
const { normalizeLanguageCode } = require('./languageService');

const POST_LIST_COLUMNS = 'id, prompt_id, anonymous_name, content, media_url, media_type, media_width, media_height, likes_count, reply_count, created_at';
const POST_DETAIL_COLUMNS = 'id, prompt_id, user_id, anonymous_name, content, category, language, country, media_url, media_type, media_width, media_height, is_flagged, likes_count, reply_count, created_at, updated_at';
const PROMPT_DETAIL_COLUMNS = 'id, title, prompt_text, category, prompt_date';
const FILIPINO_AMERICAN_PREFIXES = [
  'Manila',
  'Mabuhay',
  'Harana',
  'Sampaguita',
  'Jeepney',
  'Bituin',
  'Tagpuan',
  'Barkada',
  'HaloHalo',
  'Kundiman',
];
const FILIPINO_AMERICAN_SUFFIXES = [
  'Dreamer',
  'Voyager',
  'Storyteller',
  'Sunrise',
  'Bridge',
  'Rhythm',
  'Lantern',
  'Skylark',
  'Trail',
  'Wave',
];

const containsLikelyEmail = (text = '') =>
  text.split(/\s+/).some((token) => {
    const at = token.indexOf('@');
    const dot = token.lastIndexOf('.');
    return at > 0 && dot > at + 1 && dot < token.length - 1;
  });

const pickRandom = (values) => values[Math.floor(Math.random() * values.length)];

const buildUsername = (username) => {
  if (username?.trim()) {
    return username.trim();
  }

  const prefix = pickRandom(FILIPINO_AMERICAN_PREFIXES);
  const suffix = pickRandom(FILIPINO_AMERICAN_SUFFIXES);
  return `${prefix}${suffix}${Math.floor(1000 + Math.random() * 9000)}`;
};

const createHttpError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const normalizeMediaPayload = ({ media_url, media_type, media_width, media_height } = {}) => {
  const hasAnyMediaField = [media_url, media_type, media_width, media_height].some(
    (value) => value !== undefined && value !== null && value !== '',
  );

  if (!hasAnyMediaField) {
    return {
      media_url: null,
      media_type: null,
      media_width: null,
      media_height: null,
    };
  }

  if (!media_url || typeof media_url !== 'string') {
    throw createHttpError(400, 'Media URL is required when attaching media');
  }

  if (!['image', 'gif'].includes(media_type)) {
    throw createHttpError(400, 'Media type must be image or gif');
  }

  const width = Number(media_width);
  const height = Number(media_height);

  if (!Number.isInteger(width) || width <= 0 || !Number.isInteger(height) || height <= 0) {
    throw createHttpError(400, 'Media width and height must be positive integers');
  }

  return {
    media_url,
    media_type,
    media_width: width,
    media_height: height,
  };
};

const resolveUserProfile = async (authUser) => {
  const authUserId = authUser?.id;

  if (!authUserId) {
    throw new Error('Authenticated user is required');
  }

  const { data: existingUser, error: existingUserError } = await supabase
    .from('users')
    .select('id, username, language')
    .eq('auth_user_id', authUserId)
    .maybeSingle();

  if (existingUserError) {
    throw existingUserError;
  }

  const username = buildUsername(authUser.user_metadata?.username);
  const existingLanguage = normalizeLanguageCode(existingUser?.language);
  const metadataLanguage = normalizeLanguageCode(authUser.user_metadata?.language);
  const language = existingLanguage || metadataLanguage || null;

  if (existingUser?.id) {
    if (existingUser.username && existingLanguage === language && existingUser.language === language) {
      return existingUser;
    }

    const updates = {};

    if (!existingUser.username) {
      updates.username = username;
    }

    if (language && existingUser.language !== language) {
      updates.language = language;
    }

    if (Object.keys(updates).length === 0) {
      return existingUser;
    }

    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update(updates)
      .eq('id', existingUser.id)
      .select('id, username, language')
      .single();

    if (updateError) {
      throw updateError;
    }

    return updatedUser;
  }

  const { data: createdUser, error: createError } = await supabase
    .from('users')
    .insert({
      auth_user_id: authUserId,
      username,
      country: authUser.user_metadata?.country || null,
      language,
    })
    .select('id, username, language')
    .single();

  if (createError) {
    throw createError;
  }

  return createdUser;
};

const resolvePromptCategory = async (promptId) => {
  const { data: prompt, error } = await supabase
    .from('prompts')
    .select('category')
    .eq('id', promptId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!prompt) {
    throw createHttpError(404, 'Prompt not found');
  }

  if (!prompt.category) {
    throw createHttpError(400, 'Prompt category not found');
  }

  return prompt.category;
};

const getPostsByPrompt = async (promptId, page = 1, limit = 18) => {
  const from = (page - 1) * limit;
  const to = from + limit;

  const { data, error } = await supabase
    .from('posts')
    .select(POST_LIST_COLUMNS)
    .eq('prompt_id', promptId)
    .order('likes_count', { ascending: false })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;

  const posts = data.slice(0, limit);

  return {
    posts,
    hasMore: data.length > limit,
  };
};

const getPostsForAuthUser = async (authUserId, page = 1, limit = 10) => {
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('id')
    .eq('auth_user_id', authUserId)
    .maybeSingle();

  if (profileError) {
    throw profileError;
  }

  if (!profile) {
    return {
      posts: [],
      total: 0,
      page,
      limit,
    };
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from('posts')
    .select(POST_LIST_COLUMNS, { count: 'exact' })
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    throw error;
  }

  return {
    posts: data || [],
    total: count || 0,
    page,
    limit,
  };
};

const likePostById = async (postId) => {
  const { data: post, error } = await supabase
    .from('posts')
    .select('id, likes_count')
    .eq('id', postId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!post) {
    return {
      error: 'POST_NOT_FOUND',
    };
  }

  const nextLikesCount = (post.likes_count ?? 0) + 1;

  const { data: updatedPost, error: updateError } = await supabase
    .from('posts')
    .update({ likes_count: nextLikesCount })
    .eq('id', postId)
    .select('id, likes_count')
    .single();

  if (updateError) {
    throw updateError;
  }

  return updatedPost;
};

const unlikePostById = async (postId) => {
  const { data: post, error } = await supabase
    .from('posts')
    .select('id, likes_count')
    .eq('id', postId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!post) {
    return {
      error: 'POST_NOT_FOUND',
    };
  }

  const nextLikesCount = Math.max((post.likes_count ?? 0) - 1, 0);

  const { data: updatedPost, error: updateError } = await supabase
    .from('posts')
    .update({ likes_count: nextLikesCount })
    .eq('id', postId)
    .select('id, likes_count')
    .single();

  if (updateError) {
    throw updateError;
  }

  return updatedPost;
};

const getPostById = async (postId) => {
  const { data: post, error } = await supabase
    .from('posts')
    .select(POST_DETAIL_COLUMNS)
    .eq('id', postId)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  if (!post) {
    return null;
  }

  const { data: prompt, error: promptError } = await supabase
    .from('prompts')
    .select(PROMPT_DETAIL_COLUMNS)
    .eq('id', post.prompt_id)
    .maybeSingle();

  if (promptError && promptError.code !== 'PGRST116') {
    throw promptError;
  }

  return {
    ...post,
    prompt: prompt || null,
  };
};

const insertPost = async ({ prompt_id, content, authUser, media }) => {
  const [user, category] = await Promise.all([
    resolveUserProfile(authUser),
    resolvePromptCategory(prompt_id),
  ]);
  const normalizedContent = typeof content === 'string' ? content.trim() : '';
  const mediaPayload = normalizeMediaPayload(media);

  if (!normalizedContent && !mediaPayload.media_url) {
    throw createHttpError(400, 'Post content or media is required');
  }

  const containsEmail = containsLikelyEmail(normalizedContent);

  const { data, error } = await supabase
    .from('posts')
    .insert({
      prompt_id,
      user_id: user.id,
      content: normalizedContent,
      category,
      language: user.language,
      anonymous_name: user.username,
      is_flagged: containsEmail,
      ...mediaPayload,
    })
    .select()
    .single();

  if (error) throw error;

  return data;
};

module.exports = {
  getPostsByPrompt,
  getPostsForAuthUser,
  getPostById,
  insertPost,
  likePostById,
  unlikePostById,
  normalizeMediaPayload,
};
