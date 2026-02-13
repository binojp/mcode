const express = require('express');
const router = express.Router();
const { getAppContent } = require('../utils/gemini');

// @desc    Get Dynamic App Content
// @route   GET /api/app-content
// @access  Public
router.get('/', async (req, res) => {
  try {
    const content = await getAppContent();
    res.json(content);
  } catch (error) {
    console.error("App Content Route Error:", error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

module.exports = router;
