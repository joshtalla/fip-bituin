const supabase = require('../supabaseClient');

/**
 * Service for fetching all replies for a post. 
 * Supports pagination via page and limit parameters(20 messages per page). 
 * 
 * Return:Object containing the list of replies and the total count.
 */
exports.getRepliesForPost = async (postId, page = 1, limit = 20) => {
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    // Fetch replies for the given postId, ordered by created_at ASC, with pagination support
    const { data, error, count } = await supabase
        .from('replies')
        .select('id, post_id, parent_reply_id, anonymous_name, content, language, created_at', { count: 'exact' })
        .eq('post_id', postId)
        .order('created_at', { ascending: true })
        .range(from, to);

    if (error) {
        throw error;
    }

    return {
        replies: data || [],
        total: count || 0
    };
};