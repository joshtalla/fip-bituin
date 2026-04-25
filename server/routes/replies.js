// Import the Express library and create a new router object from Express
const express = require('express');
const router = express.Router();

/**
 * Test endpoint for the replies route, this will response to GET requests at
 * /api/test with a JSON message confirming that the route is working. 
 * 
 * Example: GET http://localhost:3000/api/test
 */
router.get('/test', (req, res) => {
  res.status(200).json({ message: 'Replies route is working!' });
});

// Export the router object so it can be used in other parts of the application
module.exports = router;