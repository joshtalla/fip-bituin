const supabase = require('../supabaseClient');

const containsLikelyEmail = (text = '') =>
  text.split(/\s+/).some((token) => {
    const at = token.indexOf('@');
    const dot = token.lastIndexOf('.');
    return at > 0 && dot > at + 1 && dot < token.length - 1;
  });

const insertPost = async ({ prompt_id, content, auth_user_id }) => {

  // get user profile
  const { data: user } = await supabase
    .from('users')
    .select('anonymous_name')
    .eq('id', auth_user_id)
    .single();

  const containsEmail = containsLikelyEmail(content);

  const { data, error } = await supabase
    .from('posts')
    .insert({
      prompt_id,
      content,
      anonymous_name: user.anonymous_name,
      is_flagged: containsEmail
    })
    .select()
    .single();

  if (error) throw error;

  return data;
};

module.exports = { insertPost };
