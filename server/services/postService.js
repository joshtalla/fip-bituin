const supabase = require('../supabaseClient');

const POST_LIST_COLUMNS = 'id, prompt_id, anonymous_name, content, likes_count, reply_count, created_at';
const POST_DETAIL_COLUMNS = 'id, prompt_id, user_id, anonymous_name, content, category, language, country, is_flagged, likes_count, reply_count, created_at, updated_at';
const PROMPT_DETAIL_COLUMNS = 'id, title, prompt_text, category, prompt_date';

const containsLikelyEmail = (text = '') =>
  text.split(/\s+/).some((token) => {
    const at = token.indexOf('@');
    const dot = token.lastIndexOf('.');
    return at > 0 && dot > at + 1 && dot < token.length - 1;
  });

const getPostsByPrompt = async (promptId, page = 1, limit = 18) => {
  const from = (page - 1) * limit;
  const to = from + limit;

  const { data, error } = await supabase
    .from('posts')
    .select(POST_LIST_COLUMNS)
    .eq('prompt_id', promptId)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;

  const posts = data.slice(0, limit);

  return {
    posts,
    hasMore: data.length > limit,
  };
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

const insertPost = async ({ prompt_id, content, auth_user_id }) => {

  // get user profile
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id, username')
    .eq('auth_user_id', auth_user_id)
    .single();
  if (userError || !user?.username) {
    throw new Error('User profile not found');
  }

  const containsEmail = containsLikelyEmail(content);

  const { data, error } = await supabase
    .from('posts')
    .insert({
      prompt_id,
      user_id: user.id,
      content,
      anonymous_name: user.username,
      is_flagged: containsEmail
    })
    .select()
    .single();

  if (error) throw error;

  return data;
};

module.exports = { getPostsByPrompt, getPostById, insertPost };
