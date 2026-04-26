const replyService = require('../services/replyService');

// Regex to validate UUID format
function isValidUUID(uuid) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid);
}

/**
 * POST /api/posts/:postId/replies
 * 
 * 
 * Controller for creating a top-level reply to a post.
 */
exports.createTopLevelReply = async (req, res) => {
  res.status(501).json({ message: 'Not implemented: create top-level reply' });
};

/**
 * GET /api/posts/:postId/replies
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
