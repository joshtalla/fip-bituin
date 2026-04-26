const supabase = require('../supabaseClient');

/**
 * Related: POST /api/posts/:postId/replies
 * 
 * Service for handling replies related operations, such as creating replies and fetching replies for a post.
 */
exports.createTopLevelReply = async (postId, user, content) => {
    // Insert the reply into Supabase
    const { data, error } = await supabase
      .from('replies')
      .insert([{
        post_id: postId,
        parent_reply_id: null,
        user_id: user.id,
        anonymous_name: user.username,
        content: content.trim(),
        language: user.language
      }])
      .select('id, post_id, parent_reply_id, anonymous_name, content, language, created_at')
      .single();

    if (error) {
      throw error;
    }

    await exports.incrementReplyCount(postId);

    return data;
};

exports.incrementReplyCount = async (postId) => {
    // Fetch current count
    const { data, error: fetchError } = await supabase
        .from('posts')
        .select('reply_count')
        .eq('id', postId)
        .single();

    if (fetchError) throw fetchError;

    const newCount = (data.reply_count || 0) + 1;

    // Update count
    const { error: updateError } = await supabase
        .from('posts')
        .update({ reply_count: newCount })
        .eq('id', postId);

    if (updateError) throw updateError;
};

exports.getReplyById = async (replyId) => {
    const { data, error } = await supabase
        .from('replies')
        .select('id, post_id, parent_reply_id')
        .eq('id', replyId)
        .single();

    if (error && error.code !== 'PGRST116') {
        throw error;
    }
    return data;
};

/**
 * Related: POST /api/replies/:replyId/replies
 * 
 * Service for creating a nested reply to an existing reply. 
 * 
 * Return: The created nested reply object.
 */

exports.createNestedReply = async (parentReply, user, content) => {
    const { data, error } = await supabase
        .from('replies')
        .insert([{
            post_id: parentReply.post_id,
            parent_reply_id: parentReply.id,
            user_id: user.id,
            anonymous_name: user.username,
            content: content.trim(),
            language: user.language
        }])
        .select('id, post_id, parent_reply_id, anonymous_name, content, language, created_at')
        .single();

    if (error) {
        throw error;
    }

    await exports.incrementReplyCount(parentReply.post_id);

    return data;
};

/**
 * Related: GET /api/posts/:postId/replies
 * 
 * Service for fetching all replies for a post. 
 * Supports pagination via page and limit parameters(20 messages per page). 
 * 
 * Return: Object containing the list of replies and the total count.
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