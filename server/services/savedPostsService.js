const supabase = require('../supabaseClient');

const savePostService = async ({ userId, postId }) => {
  const { data: post, error: postError } = await supabase
    .from('posts')
    .select('id')
    .eq('id', postId)
    .single();
  
  if (postError || !post) {
    return {
      error: 'POST_NOT_FOUND',
    };
  }
  
  const { error: insertError } = await supabase
    .from('saved_posts')
    .upsert(
      {
        user_id: userId,
        post_id: postId,
      },
      {
        onConflict: 'user_id,post_id',
        ignoreDuplicates: true,
      }
    );
  
  if (insertError) {
    throw insertError;
  }
  
  return {
    success: true,
  };
};


const unsavePostService = async ({ userId, postId }) => {
  const { data: post, error: postError } = await supabase
    .from('posts')
    .select('id')
    .eq('id', postId)
    .single();
  
  if (postError || !post) {
    return {
      error: 'POST_NOT_FOUND',
    };
  }
  
  const { error: deleteError } = await supabase
    .from('saved_posts')
    .delete()
    .eq('user_id', userId)
    .eq('post_id', postId);
  
  if (deleteError) {
    throw deleteError;
  }
  
  return {
    success: true,
  };
};


const getSavedPostsService = async ({
  userId,
  page,
  limit,
}) => {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from('saved_posts')
    .select(
      `
      created_at,
      posts (
        id,
        content,
        anonymous_name
      )
      `,
      { count: 'exact' }
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    throw error;
  }

  const posts = data.map((savedPost) => ({
    id: savedPost.posts.id,
    content: savedPost.posts.content,
    anonymous_name: savedPost.posts.anonymous_name,
    saved_at: savedPost.created_at,
  }));

  return {
    posts,
    total: count,
    page,
    limit,
  };
};

module.exports = {
  savePostService,
  unsavePostService,
  getSavedPostsService,
};