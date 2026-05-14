const express = require('express');
const router = express.Router();

const {
    savePost,
    unsavePost,
    getSavedPosts,
} = require('../controllers/savedPostsController');

router.post('/posts/:postId/save', savePost);

router.delete('/posts/:postId/save', unsavePost);

router.get('/profile/saved-posts', getSavedPosts);

module.exports = router;
