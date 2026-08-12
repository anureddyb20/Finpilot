const { createClient } = require('@supabase/supabase-js');
const aiService = require('../services/aiService');
require('dotenv').config();

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL;
// Use service role key if it's set and not a placeholder, otherwise fall back to anon key
const supabaseKey = (process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_SERVICE_ROLE_KEY.startsWith('YOUR_'))
  ? process.env.SUPABASE_SERVICE_ROLE_KEY
  : process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const formatInr = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount || 0);
};

// Calculate financial health score matching frontend HealthAnalyzer logic
const computeHealthScore = (transactions, budgets, goals, recurringPayments) => {
  let score = 0;
  const breakdown = {
    savingsRate: 0,
    budgetDiscipline: 0,
    goalProgress: 0,
    recurringExpenses: 0,
    emergencyFund: 0,
    incomeStability: 0
  };

  let totalIncome = 0;
  let totalExpense = 0;
  transactions.forEach(t => {
    if (t.type === 'income') totalIncome += Number(t.amount);
    if (t.type === 'expense') totalExpense += Number(t.amount);
  });

  const netSavings = totalIncome - totalExpense;
  
  // 1. Savings Rate (30 Points)
  if (totalIncome > 0) {
    const savingsRate = netSavings / totalIncome;
    if (savingsRate >= 0.20) {
      breakdown.savingsRate = 30;
    } else if (savingsRate > 0) {
      breakdown.savingsRate = Math.round((savingsRate / 0.20) * 30);
    }
  }

  // 2. Budget Discipline (20 Points)
  if (budgets.length > 0) {
    let withinLimits = 0;
    budgets.forEach(b => {
      const spent = transactions.filter(t => 
        t.type === 'expense' && 
        t.category === b.category &&
        new Date(t.date).getMonth() === (b.month - 1) &&
        new Date(t.date).getFullYear() === b.year
      ).reduce((sum, t) => sum + Number(t.amount), 0);
      
      if (spent <= Number(b.limit_amount)) {
        withinLimits++;
      }
    });
    breakdown.budgetDiscipline = Math.round((withinLimits / budgets.length) * 20);
  } else {
    breakdown.budgetDiscipline = 10;
  }

  // 3. Goal Progress (15 Points)
  if (goals.length > 0) {
    const progress = goals.reduce((acc, g) => acc + (Number(g.target_amount) > 0 ? Number(g.saved_amount) / Number(g.target_amount) : 0), 0);
    breakdown.goalProgress = Math.min(Math.round((progress / goals.length) * 15), 15);
  } else {
    breakdown.goalProgress = 5;
  }

  // 4. Recurring Expenses (10 Points)
  const recurringTotal = recurringPayments.reduce((acc, r) => acc + Number(r.amount), 0);
  if (totalIncome > 0) {
    const recurringRatio = recurringTotal / totalIncome;
    if (recurringRatio < 0.3) {
      breakdown.recurringExpenses = 10;
    } else if (recurringRatio < 0.5) {
      breakdown.recurringExpenses = 5;
    }
  }

  // 5. Emergency Fund (15 Points)
  const emergencyGoal = goals.find(g => g.name.toLowerCase().includes('emergency'));
  if (emergencyGoal) {
    const progress = Number(emergencyGoal.target_amount) > 0 ? Number(emergencyGoal.saved_amount) / Number(emergencyGoal.target_amount) : 0;
    breakdown.emergencyFund = Math.min(Math.round(progress * 15), 15);
  }

  // 6. Income Stability (10 Points)
  const recentIncome = transactions.filter(t => t.type === 'income').length;
  if (recentIncome >= 3) {
    breakdown.incomeStability = 10;
  } else if (recentIncome > 0) {
    breakdown.incomeStability = 5;
  }

  score = Object.values(breakdown).reduce((a, b) => a + b, 0);
  return score;
};

const chat = async (req, res, next) => {
  try {
    const { message, history } = req.body;

    // 1. Validate that the message exists and is not empty
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: { message: 'Message is required and cannot be empty.' } });
    }

    // 2. Identify the currently authenticated user
    const userId = req.user && req.user.userId;
    if (!userId) {
      return res.status(401).json({ error: { message: 'User not authenticated' } });
    }

    // Extract Bearer token to initialize user-scoped Supabase client
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: { message: 'Authentication token missing' } });
    }

    const userSupabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    });

    // 3. Fetch user's financial data from Supabase (using user-scoped client to satisfy RLS)
    const [
      transactionsRes,
      budgetsRes,
      goalsRes,
      recurringRes,
      notificationsRes
    ] = await Promise.all([
      userSupabase.from('transactions').select('*').eq('user_id', userId).is('deleted_at', null).order('date', { ascending: false }),
      userSupabase.from('budgets').select('*').eq('user_id', userId),
      userSupabase.from('goals').select('*').eq('user_id', userId),
      userSupabase.from('recurring_payments').select('*').eq('user_id', userId),
      userSupabase.from('notifications').select('*').eq('user_id', userId).eq('is_read', false).order('created_at', { ascending: false }).limit(5)
    ]);

    // Handle any Supabase query errors
    if (transactionsRes.error) throw transactionsRes.error;
    if (budgetsRes.error) throw budgetsRes.error;
    if (goalsRes.error) throw goalsRes.error;
    if (recurringRes.error) throw recurringRes.error;
    if (notificationsRes.error) throw notificationsRes.error;

    const transactions = transactionsRes.data || [];
    const budgets = budgetsRes.data || [];
    const goals = goalsRes.data || [];
    const recurring = recurringRes.data || [];
    const notifications = notificationsRes.data || [];

    // 4. Calculate metrics for structured context
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + Number(curr.amount), 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + Number(curr.amount), 0);
    const netBalance = totalIncome - totalExpense;

    // Filter current month metrics
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const currentMonthTransactions = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const currentMonthIncome = currentMonthTransactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + Number(curr.amount), 0);
    const currentMonthExpense = currentMonthTransactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + Number(curr.amount), 0);
    const monthlySavings = currentMonthIncome - currentMonthExpense;
    const savingsRate = currentMonthIncome > 0 ? (monthlySavings / currentMonthIncome) * 100 : 0;

    // Budget usage calculation
    const budgetsWithUsage = budgets.map(b => {
      const spent = transactions.filter(t => 
        t.type === 'expense' && 
        t.category === b.category &&
        new Date(t.date).getMonth() === (b.month - 1) &&
        new Date(t.date).getFullYear() === b.year
      ).reduce((sum, t) => sum + Number(t.amount), 0);

      return {
        category: b.category,
        limit: Number(b.limit_amount),
        spent: spent,
        utilization: Number(b.limit_amount) > 0 ? (spent / Number(b.limit_amount)) * 100 : 0
      };
    });

    // Goals progress calculation
    const goalsProgress = goals.map(g => ({
      name: g.name,
      target: Number(g.target_amount),
      saved: Number(g.saved_amount),
      progress: Number(g.target_amount) > 0 ? (Number(g.saved_amount) / Number(g.target_amount)) * 100 : 0,
      status: g.status
    }));

    // Recurring payments
    const recurringPaymentsList = recurring.map(r => ({
      name: r.name,
      amount: Number(r.amount),
      frequency: r.frequency
    }));

    // Notifications
    const unreadNotifications = notifications.map(n => `${n.title}: ${n.description}`);

    // Financial Health Score
    const healthScore = computeHealthScore(transactions, budgets, goals, recurring);

    // 5. Build structured financial context
    let contextStr = '';
    contextStr += `Income:\n${formatInr(currentMonthIncome)}/month\n\n`;
    contextStr += `Expenses:\n${formatInr(currentMonthExpense)}/month\n\n`;
    contextStr += `Savings:\n${formatInr(monthlySavings)}/month\n\n`;
    contextStr += `Available Balance:\n${formatInr(netBalance)}\n\n`;

    contextStr += `Budgets:\n`;
    if (budgetsWithUsage.length > 0) {
      budgetsWithUsage.forEach(b => {
        contextStr += `${b.category} — ${formatInr(b.limit)} limit, ${formatInr(b.spent)} spent\n`;
      });
    } else {
      contextStr += `No active budgets set.\n`;
    }
    contextStr += `\n`;

    contextStr += `Goals:\n`;
    if (goalsProgress.length > 0) {
      goalsProgress.forEach(g => {
        contextStr += `${g.name} — ${formatInr(g.saved)} saved out of ${formatInr(g.target)}\n`;
      });
    } else {
      contextStr += `No active financial goals set.\n`;
    }
    contextStr += `\n`;

    contextStr += `Recurring Payments:\n`;
    if (recurringPaymentsList.length > 0) {
      recurringPaymentsList.forEach(r => {
        contextStr += `${r.name} — ${formatInr(r.amount)}/${r.frequency.toLowerCase()}\n`;
      });
    } else {
      contextStr += `No recurring payments set.\n`;
    }
    contextStr += `\n`;

    contextStr += `Financial Health:\n${healthScore}/100\n\n`;

    if (unreadNotifications.length > 0) {
      contextStr += `Recent Alerts:\n`;
      unreadNotifications.forEach(n => {
        contextStr += `- ${n}\n`;
      });
      contextStr += `\n`;
    }

    // 6. Send the context + user's question to aiService
    const safeHistory = Array.isArray(history) ? history : [];
    const aiResponse = await aiService.generateChatResponse(message, safeHistory, contextStr);

    // 7. Return the response
    res.status(200).json({
      success: true,
      response: aiResponse
    });
  } catch (error) {
    // 8. Handle errors gracefully (never expose internal trace or keys)
    console.error('AI Controller Error:', error);
    res.status(500).json({
      error: {
        message: 'Sorry, I encountered an error while processing your request. Please try again.'
      }
    });
  }
};

module.exports = {
  chat
};
