/**
 * -----------------------------------------------------------------------------
 * Replies Routes
 * -----------------------------------------------------------------------------
 * Purpose:
 *   Defines HTTP routes for reply-related API endpoints.
 *
 * How this file connects to others:
 *   - Mounted in server/index.js under /api
 *   - Delegates request handling to controllers/repliesController.js
 *   - Controllers then call services/replyService.js for business/data logic
 *
 * Notes:
 *   - Routes should stay thin (path + method + controller binding only).
 *   - Validation, auth, and DB behavior belong in controller/service layers.
 * -----------------------------------------------------------------------------
 */

const express = require('express');
const router = express.Router();
const repliesController = require('../controllers/repliesController');

/**
 * Health/test endpoint for reply routes.
 * Confirms that the replies router is mounted and reachable.
 *
 * Route:
 * Example: GET http://localhost:3000/api/test
 */
router.get('/test', (req, res) => {
    res.status(200).json({ message: 'Replies route is working!' });
});

/**
 * Create a top-level reply on a post.
 *
 * Route:
 *   POST /api/posts/:postId/replies
 *
 * Delegates to:
 *   repliesController.createTopLevelReply
 *
 * Example: POST http://localhost:3000/api/posts/123/replies
 */
router.post('/posts/:postId/replies', repliesController.createTopLevelReply);

/**
 * Create a nested reply.
 *
 * Route:
 *   POST /api/replies/:replyId/replies
 *
 * Delegates to:
 *   repliesController.createNestedReply
 *
 * Example: POST http://localhost:3000/replies/456/replies
 */
router.post('/replies/:replyId/replies', repliesController.createNestedReply);

/**
 * Fetch replies for a post (flat list, paginated).
 *
 * Route:
 *   GET /api/posts/:postId/replies
 *
 * Delegates to:
 *   repliesController.getRepliesForPost
 *
 * Example: GET http://localhost:3000/api/posts/123/replies?page=1&limit=20
 */
router.get('/posts/:postId/replies', repliesController.getRepliesForPost);

// Export router for mounting in server/index.js
module.exports = router;