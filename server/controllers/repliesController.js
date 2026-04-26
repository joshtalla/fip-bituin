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
    const { content } = req.body;

    // Validate postId is in UUID format
    if (!isValidUUID(postId)) {
        return res.status(400).json({ message: 'Invalid postId format (must be UUID)' });
    }
    // Validate content of reply after trimming it
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
        return res.status(400).json({ message: 'Content is required and cannot be empty.' });
    }
    // Enforce a maximum length for the content
    if (content.length > 1000) {
        return res.status(400).json({ message: 'Content must be under 1000 characters.' });
    }

    // Auth logic
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: "No auth token" });
    }
    const [scheme, token] = authHeader.split(" ");
    if (scheme !== "Bearer" || !token) {
        return res.status(401).json({ message: "Invalid authorization format" });
    }
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) {
        return res.status(401).json({ message: "Invalid token" });
    }
    const auth_user_id = data.user.id;

    // For now, use a placeholder user object if skipping real user lookup
    const user = {
        id: auth_user_id, // Replace with real user id when ready
        username: "TestUser", // Replace with real username from DB
        language: "English"   // Replace with real language from DB
    };

    try {
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

    // Validate replyId
    if (!isValidUUID(replyId)) {
        return res.status(400).json({ message: 'Invalid replyId format (must be UUID)' });
    }
    // Validate content
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
        return res.status(400).json({ message: 'Content is required and cannot be empty.' });
    }
    if (content.length > 1000) {
        return res.status(400).json({ message: 'Content must be under 1000 characters.' });
    }

    // (Optional) Auth logic (reuse from createTopLevelReply)
    // For now, use a placeholder user object if skipping auth:
    const user = {
        id: "test-user-id",
        username: "TestUser",
        language: "English"
    };

    try {
        // Fetch parent reply
        const parentReply = await replyService.getReplyById(replyId);
        if (!parentReply) {
            return res.status(404).json({ message: 'Parent reply not found.' });
        }
        if (parentReply.parent_reply_id !== null) {
            return res.status(400).json({ message: 'Replies can only be nested one level deep.' });
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
