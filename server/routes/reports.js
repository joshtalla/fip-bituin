const express = require('express');
const router = express.Router();

const {
  reportPost,
  reportReply,
} = require('../controllers/reportsController');

router.post('/posts/:id/report', reportPost);
router.post('/replies/:id/report', reportReply);

module.exports = router;