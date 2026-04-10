const supabase = require('../supabaseClient');

const insertPost = async (post) => {
  const { data, error } = await supabase
    .from('posts')
    .insert(post)
    .select()
    .single();

  if (error){
    console.error('Supabase insert error:')
    throw error;
  }
  
  return data;
};

module.exports = {
  insertPost
};