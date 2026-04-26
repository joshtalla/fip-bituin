// Import the Express library and create a new router object from Express
const express = require('express');
const router = express.Router();
const repliesController = require('../controllers/repliesController');

/**
 * 'Test' endpoint for the replies route, this will response to GET requests at
 * /api/test with a JSON message confirming that the route is working. 
 * 
 * Example: GET http://localhost:3000/api/test
 */
router.get('/test', (req, res) => {
    res.status(200).json({ message: 'Replies route is working!' });
});

/**
 * POST /api/posts/:postId/replies
 * Placeholder for creating a top-level reply.
 * 
 * Example: POST http://localhost:3000/api/posts/123/replies
 */
router.post('/posts/:postId/replies', repliesController.createTopLevelReply);

/**
 * POST /api/replies/:replyId/replies
 * Placeholder for creating a nested reply.
 * 
 * Example: POST http://localhost:3000/replies/456/replies
 */
router.post('/replies/:replyId/replies', (req, res) => {
    res.status(501).json({ message: 'Not implemented(POST): create nested reply' });
});

/**
 * GET /api/posts/:postId/replies
 * 
 Example: GET http://localhost:3000/api/posts/123/replies
 */
router.get('/posts/:postId/replies', repliesController.getRepliesForPost);


// Export the router object so it can be used in other parts of the application
module.exports = router;