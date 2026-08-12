const aiService = require('../services/aiService');

const chat = async (req, res, next) => {
  try {
    const { userId, message, history } = req.body;

    if (!userId || !message) {
      return res.status(400).json({ error: { message: 'Missing userId or message in request body.' } });
    }

    const safeHistory = Array.isArray(history) ? history : [];

    const aiResponse = await aiService.generateChatResponse(userId, message, safeHistory);

    res.status(200).json({
      success: true,
      response: aiResponse
    });
  } catch (error) {
    next(error); // Pass to centralized error handler
  }
};

module.exports = {
  chat
};
