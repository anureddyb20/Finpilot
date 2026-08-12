const { Groq } = require('groq-sdk');
require('dotenv').config();

if (!process.env.GROQ_API_KEY) {
  console.warn('Warning: GROQ_API_KEY is not set in the environment variables.');
}

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || 'dummy_key_if_not_set',
});

// Using a currently supported production-ready Groq model
const modelName = 'llama-3.3-70b-versatile';

module.exports = {
  groq,
  modelName
};
