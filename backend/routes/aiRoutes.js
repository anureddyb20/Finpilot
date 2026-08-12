const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { requireAuth } = require('../middlewares/auth');

// POST /api/ai/chat
router.post('/chat', requireAuth, aiController.chat);

module.exports = router;
