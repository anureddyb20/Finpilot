const { groq, modelName } = require('../config/groq');

/**
 * Generates a response from Groq based on user message, history, and financial context.
 * 
 * @param {string} userMessage - The current message from the user.
 * @param {Array} history - The chat history.
 * @param {string} financialContext - The pre-constructed structured financial context text.
 * @returns {Promise<string>} The AI's response text.
 */
const generateChatResponse = async (userMessage, history, financialContext) => {
  const systemPrompt = `
You are FinPilot AI — an intelligent personal finance assistant.
Always adhere to the following rules:
- Use Indian Rupees (₹) for all financial amounts.
- Analyze the user's actual financial information.
- Give practical and personalized recommendations.
- Never invent financial information.
- Clearly state when required information is unavailable.
- Never guarantee investment returns.
- Avoid presenting financial predictions as certain outcomes.
- Keep responses understandable and useful.
- Use the user's financial context provided below to answer questions.

User Financial Context:
${financialContext}
  `;

  // Format history for Groq Chat Completion API
  // Groq expects: [{ role: 'system', content: '...' }, { role: 'user', content: '...' }, { role: 'assistant', content: '...' }]
  // Filter out any items without valid structure
  const safeHistory = Array.isArray(history) ? history : [];
  const formattedHistory = safeHistory
    .filter(msg => msg && msg.text && msg.sender)
    .map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text
    }));

  const messages = [
    { role: 'system', content: systemPrompt },
    ...formattedHistory,
    { role: 'user', content: userMessage }
  ];

  try {
    const completion = await groq.chat.completions.create({
      messages,
      model: modelName,
      temperature: 0.5,
      max_tokens: 1024,
    });

    if (!completion.choices || completion.choices.length === 0) {
      throw new Error('Groq API returned an empty completion.');
    }

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error calling Groq API:', error);
    throw error;
  }
};

module.exports = {
  generateChatResponse
};
