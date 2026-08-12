const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

if (!process.env.GEMINI_API_KEY) {
  console.warn('Warning: GEMINI_API_KEY is not set in the environment variables.');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key_if_not_set');

// We will use gemini-1.5-flash or gemini-pro.
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

module.exports = {
  genAI,
  model
};
