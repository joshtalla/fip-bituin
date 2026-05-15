const express = require('express');
const router = express.Router();

const {
	createPost,
	getPost,
	getMyPosts,
	likePost,
	unlikePost,
} = require('../controllers/postsController');

router.post('/', createPost);
router.get('/mine', getMyPosts);
router.post('/:postId/like', likePost);
router.delete('/:postId/like', unlikePost);
router.get('/:id', getPost);

module.exports = router;