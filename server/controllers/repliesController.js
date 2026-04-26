const supabase = require('../supabaseClient');
const replyService = require('../services/replyService');

// Regex to validate UUID format
function isValidUUID(uuid) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid);
}

/**
 * Related: POST /api/posts/:postId/replies
 * 
 * Controller for creating a top-level reply to a post.
 */
exports.createTopLevelReply = async (req, res) => {
    const postId = req.params.postId;
    const { content } = req.body || {};

    // 400: Validate postId is in UUID format
    if (!isValidUUID(postId)) {
        return res.status(400).json({ message: 'Invalid field: postId (must be UUID)' });
    }
    // 400: Validate content of reply after trimming it
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
        return res.status(400).json({ message: 'Invalid field: content (required and cannot be empty)' });
    }
    // 400: Enforce a maximum length for the content
    if (content.length > 1000) {
        return res.status(400).json({ message: 'Invalid field: content (must be under 1000 characters)' });
    }

    try {
        // 401: Auth logic
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: "Unauthenticated: No auth token" });
        }
        const [scheme, token] = authHeader.split(" ");
        if (scheme !== "Bearer" || !token) {
            return res.status(401).json({ message: "Unauthenticated: Invalid authorization format" });
        }
        const { data, error } = await supabase.auth.getUser(token);
        if (error || !data.user) {
            return res.status(401).json({ message: "Unauthenticated: Invalid token" });
        }

        const auth_user_id = data.user.id;
        const userProfile = await replyService.getUserProfile(auth_user_id);

        const user = {
            id: auth_user_id,
            anonymous_name: userProfile.anonymous_name,
            language: userProfile.language
        };

        const postExists = await replyService.checkPostExists(postId);
        if (!postExists) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        // Call the service to insert the reply
        const reply = await replyService.createTopLevelReply(postId, user, content);

        // Respond with the created reply
        res.status(201).json(reply);
    } catch (err) {
        console.error('Error creating reply:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Related: POST /api/replies/:replyId/replies
 * 
 * Controller for creating a nested reply to an existing reply.
 */
exports.createNestedReply = async (req, res) => {
    const replyId = req.params.replyId;
    const { content } = req.body || {};

    // 400: Validate replyId
    if (!isValidUUID(replyId)) {
        return res.status(400).json({ message: 'Invalid field: replyId (must be UUID)' });
    }
    // 400: Validate content
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
        return res.status(400).json({ message: 'Invalid field: content (required and cannot be empty)' });
    }
    if (content.length > 1000) {
        return res.status(400).json({ message: 'Invalid field: content (must be under 1000 characters)' });
    }

    try {
        // 401: Auth logic (reuse from createTopLevelReply)
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: "Unauthenticated: No auth token" });
        }
        const [scheme, token] = authHeader.split(" ");
        if (scheme !== "Bearer" || !token) {
            return res.status(401).json({ message: "Unauthenticated: Invalid authorization format" });
        }
        const { data, error } = await supabase.auth.getUser(token);
        if (error || !data.user) {
            return res.status(401).json({ message: "Unauthenticated: Invalid token" });
        }

        const auth_user_id = data.user.id;
        const userProfile = await replyService.getUserProfile(auth_user_id);

        const user = {
            id: auth_user_id,
            anonymous_name: userProfile.anonymous_name,
            language: userProfile.language
        };

        // Fetch parent reply
        const parentReply = await replyService.getReplyById(replyId);
        if (!parentReply) {
            return res.status(404).json({ message: 'Parent reply not found.' });
        }
        // 400: Enforce one-level nesting
        if (parentReply.parent_reply_id !== null) {
            return res.status(400).json({ message: 'Nesting depth exceeded: Replies can only be nested one level deep.' });
        }

        // Insert nested reply
        const reply = await replyService.createNestedReply(parentReply, user, content);

        res.status(201).json(reply);
    } catch (err) {
        console.error('Error creating nested reply:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Related: GET /api/posts/:postId/replies
 * 
 * Controller for fetching all replies for a post.
 * Responds with a placeholder message for now.
 */
exports.getRepliesForPost = async (req, res) => {
    const postId = req.params.postId;
    if (!isValidUUID(postId)) {
        return res.status(400).json({ message: 'Invalid postId format (must be UUID)' });
    }

    // Parse pagination params with defaults
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;

    try {
        const postExists = await replyService.checkPostExists(postId);
        if (!postExists) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        const { replies, total } = await replyService.getRepliesForPost(postId, page, limit);
        res.status(200).json({
            replies,
            total,
            page,
            limit
        });
    } catch (err) {
        console.error('Error fetching replies:', err);
        res.status(500).json({ message: 'Error(500):Internal server error' });
    }
};
