const supabase = require('../supabaseClient');

/**
 * Service for fetching all replies for a post.
 */
exports.getRepliesForPost = async (postId) => {
    // Fetch replies for the given postId, ordered by created_at ASC
    const { data, error } = await supabase
        .from('replies')
        .select('id, post_id, parent_reply_id, anonymous_name, content, language, created_at')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

    if (error) {
        throw error;
    }

    return data || [];
};