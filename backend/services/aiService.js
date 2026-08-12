const { createClient } = require('@supabase/supabase-js');
const { model } = require('../config/gemini');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const formatInr = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount || 0);
};

const getFinancialContext = async (userId) => {
  try {
    const [transactionsReq, budgetsReq, goalsReq, recurringReq, healthScore] = await Promise.all([
      supabase.from('transactions').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(50),
      supabase.from('budgets').select('*').eq('user_id', userId),
      supabase.from('goals').select('*').eq('user_id', userId),
      supabase.from('recurring_payments').select('*').eq('user_id', userId),
      // Mocking a health score or we could calculate it. Let's calculate a simple one.
      supabase.from('profiles').select('*').eq('id', userId).single()
    ]);

    const transactions = transactionsReq.data || [];
    const budgets = budgetsReq.data || [];
    const goals = goalsReq.data || [];
    const recurring = recurringReq.data || [];

    const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + Number(curr.amount), 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + Number(curr.amount), 0);
    
    // Simple summary text
    let contextStr = `Here is the user's current financial context:\n\n`;
    contextStr += `- Total Income (Recent): ${formatInr(totalIncome)}\n`;
    contextStr += `- Total Expense (Recent): ${formatInr(totalExpense)}\n\n`;

    if (budgets.length > 0) {
      contextStr += `Budgets:\n`;
      budgets.forEach(b => {
        contextStr += `  - ${b.category || b.name}: Spent ${formatInr(b.spent_amount)} of ${formatInr(b.limit_amount)}\n`;
      });
      contextStr += `\n`;
    }

    if (goals.length > 0) {
      contextStr += `Goals:\n`;
      goals.forEach(g => {
        contextStr += `  - ${g.name}: Saved ${formatInr(g.saved_amount)} of ${formatInr(g.target_amount)} (${g.status})\n`;
      });
      contextStr += `\n`;
    }

    if (recurring.length > 0) {
      contextStr += `Recurring Payments:\n`;
      recurring.forEach(r => {
        contextStr += `  - ${r.name}: ${formatInr(r.amount)} (${r.frequency})\n`;
      });
      contextStr += `\n`;
    }

    return contextStr;
  } catch (error) {
    console.error('Error fetching financial context:', error);
    return 'Unable to fetch financial context at this time.';
  }
};

const generateChatResponse = async (userId, userMessage, history) => {
  const financialContext = await getFinancialContext(userId);

  const systemPrompt = `
You are FinPilot AI, a professional Indian personal finance coach.
Always adhere to the following rules:
- Provide personalized financial advice based on the user's data.
- Always use Indian Rupees (₹) for currency.
- Maintain a professional, encouraging, and friendly tone.
- NEVER invent missing data or hallucinate transactions.
- NEVER give guaranteed investment returns or specific stock tips.
- Provide practical, actionable recommendations.

${financialContext}
  `;

  // Format history for Gemini API
  // Gemini expects history as: [{role: "user", parts: [{text: "..."}]}, {role: "model", parts: [{text: "..."}]}]
  const formattedHistory = history.map(msg => ({
    role: msg.sender === 'user' ? 'user' : 'model',
    parts: [{ text: msg.text }]
  }));

  const chat = model.startChat({
    history: formattedHistory,
    systemInstruction: systemPrompt,
  });

  const result = await chat.sendMessage(userMessage);
  const responseText = result.response.text();

  return responseText;
};

module.exports = {
  generateChatResponse
};
