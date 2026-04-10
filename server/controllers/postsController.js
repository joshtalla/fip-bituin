const { insertPost } = require('../services/postService');

const createPost = async (req, res) => {
  try {

    const post = await insertPost({
      prompt_id: "testing-pleasework-prompt",
      content: "HELLO FREE NEWJEANS YESSS"
    });

    res.status(201).json(post);

  } catch (err) {
    console.error("FULL ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createPost
};