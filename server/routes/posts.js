const express = require('express');
const router = express.Router();

const { createPost, getPost } = require('../controllers/postsController');

router.post('/', createPost);
router.get('/:id', getPost);

module.exports = router;