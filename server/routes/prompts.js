const express = require("express");
const router = express.Router();
const promptsController = require("../controllers/promptsController");

// GET routes
router.get("/today", promptsController.getTodayPrompt);
router.get("/archive", promptsController.getArchivePrompts);
router.get("/date/:date", promptsController.getPromptByDate);
router.get("/:id/board", promptsController.getPromptBoard);
router.get("/:id", promptsController.getPromptById);

// POST route (CREATE a new prompt)
// Notice this uses router.post instead of router.get!
router.post("/", promptsController.createPrompt);

module.exports = router;
