const replyService = require('../services/replyService');

// Regex to validate UUID format
function isValidUUID(uuid) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid);
}

/**
 * Controller for fetching all replies for a post.
 * Responds with a placeholder message for now.
 */
exports.getRepliesForPost = async (req, res) => {
    const postId = req.params.postId;
    if (!isValidUUID(postId)) {
        return res.status(400).json({ message: 'Invalid postId format (must be UUID)' });
    }
    try {
        const replies = await replyService.getRepliesForPost(postId);
        res.status(200).json({ replies });
    } catch (err) {
        console.error('Error fetching replies:', err);
        res.status(500).json({ message: 'Error(500):Internal server error' });
    }
};