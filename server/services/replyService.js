/**
 * -----------------------------------------------------------------------------
 * Replies Service
 * -----------------------------------------------------------------------------
 * Purpose:
 *   Encapsulates reply-related business logic and data access.
 *
 * How this file connects to others:
 *   - Called by controllers/repliesController.js
 *   - Uses server/supabaseClient.js for database operations
 *   - Powers routes in routes/replies.js through controller delegation
 *
 * Responsibilities:
 *   - Create top-level and nested replies
 *   - Fetch paginated replies for a post
 *   - Enforce/assist reply constraints (post existence checks, parent lookup)
 *   - Apply content flagging + moderation logging
 *   - Update reply_count on parent posts
 *   - Shape public API reply payloads by removing internal fields
 * -----------------------------------------------------------------------------
 */

const supabase = require('../supabaseClient');

/**
 * Create a top-level reply.
 *
 * @param {string} postId - Parent post UUID.
 * @param {{ id: string, anonymous_name: string, language: string }} user
 * @param {string} content
 * @returns {Promise<object>} Public reply shape.
 */
exports.createTopLevelReply = async (postId, user, content) => {
    // Content safety filtering: Check if content contains email or phone number and flag it if so
    const isFlagged = containsEmailOrPhone(content);

    // Insert reply row and fetch inserted data
    const { data, error } = await supabase
        .from('replies')
        .insert([{
            post_id: postId,
            parent_reply_id: null,
            user_id: user.id,
            anonymous_name: user.anonymous_name,
            content: content.trim(),
            language: user.language,
            is_flagged: isFlagged
        }])
        .select('id, post_id, parent_reply_id, anonymous_name, content, language, is_flagged, user_id, created_at')
        .single();

    if (error) {
        throw error;
    }

    // Optional moderation side effect
    if (data.is_flagged) {
        await exports.logModerationFlag(data, "auto-flagged: email/phone detected");
    }

    await exports.incrementReplyCount(postId);

    // Remove internal fields before controller returns response
    return toPublicReply(data);
};

/**
 * Create a nested reply under a parent reply.
 *
 * Note:
 *   Parent depth validation is performed in the controller before calling this.
 *
 * @param {{ id: string, post_id: string }} parentReply
 * @param {{ id: string, anonymous_name: string, language: string }} user
 * @param {string} content
 * @returns {Promise<object>} Public reply shape.
 */

exports.createNestedReply = async (parentReply, user, content) => {
    // Content safety flagging
    const isFlagged = containsEmailOrPhone(content);

    const { data, error } = await supabase
        .from('replies')
        .insert([{
            post_id: parentReply.post_id,
            parent_reply_id: parentReply.id,
            user_id: user.id,
            anonymous_name: user.anonymous_name,
            content: content.trim(),
            language: user.language,
            is_flagged: isFlagged
        }])
        .select('id, post_id, parent_reply_id, anonymous_name, content, language, is_flagged, user_id, created_at')
        .single();

    if (error) {
        throw error;
    }

    // Optional moderation side effect
    if (data.is_flagged) {
        await exports.logModerationFlag(data, "auto-flagged: email/phone detected");
    }

    await exports.incrementReplyCount(parentReply.post_id);

    // Remove internal fields before controller returns response
    return toPublicReply(data);
};

/**
 * Fetch paginated replies for a post.
 *
 * Returns replies in chronological order, as a flat list.
 * Frontend is expected to reconstruct hierarchy via parent_reply_id.
 *
 * @param {string} postId
 * @param {number} page
 * @param {number} limit
 * @returns {Promise<{replies: object[], total: number}>}
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

/**
 * Check whether a post exists.
 *
 * @param {string} postId
 * @returns {Promise<boolean>}
 */
exports.checkPostExists = async (postId) => {
    const { data, error } = await supabase
        .from('posts')
        .select('id')
        .eq('id', postId)
        .maybeSingle();

    if (error) {
        throw error;
    }

    return !!data;
};

/**
 * Resolve reply identity defaults from users table.
 *
 * @param {string} authUserId
 * @returns {Promise<{anonymous_name: string, language: string}>}
 */
exports.getUserProfile = async (authUserId) => {
    const { data, error } = await supabase
        .from('users')
        .select('anonymous_name, language')
        .eq('id', authUserId)
        .single();

    if (error) {
        throw error;
    }

    if (!data?.anonymous_name || !data?.language) {
        throw new Error('User profile not found');
    }

    return data;
};

function containsEmailOrPhone(text) {
    // Simple regex for email and phone (can be improved)
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    const phoneRegex = /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/;
    return emailRegex.test(text) || phoneRegex.test(text);
}

/**
 * Increment reply_count on a post.
 *
 * @param {string} postId
 * @returns {Promise<void>}
 */
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

/**
 * Fetch a reply by ID.
 *
 * Used by controller to validate nested-reply parent existence/depth.
 *
 * @param {string} replyId
 * @returns {Promise<{id: string, post_id: string, parent_reply_id: string | null} | null>}
 */
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
 * Write moderation audit record for flagged reply content.
 *
 * @param {{ id: string, user_id: string, content: string }} reply
 * @param {string} reason
 * @returns {Promise<void>}
 */
exports.logModerationFlag = async (reply, reason) => {
    const { error } = await supabase
        .from('moderation_logs')
        .insert([{
            reply_id: reply.id,
            user_id: reply.user_id,
            content: reply.content,
            reason: reason,
            created_at: new Date().toISOString()
        }]);
    if (error) throw error;
};

function toPublicReply(reply) {
    if (!reply) {
        return reply;
    }

    const { user_id, is_flagged, updated_at, ...publicReply } = reply;
    return publicReply;
}