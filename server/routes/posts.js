const express = require('express');
const router = express.Router();

const { createPost } = require('../controllers/postsController');

router.post('/', createPost);

module.exports = router;