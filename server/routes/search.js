const express = require("express");
const router = express.Router();

const { searchPosts } = require("../controllers/searchController");

router.get("/posts", searchPosts);

module.exports = router;