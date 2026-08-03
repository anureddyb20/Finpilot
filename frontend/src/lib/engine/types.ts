export type Transaction = {
  id: string;
  user_id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  description: string;
  merchant: string;
  method: string;
};

export type Budget = {
  id: string;
  user_id: string;
  category: string;
  limit_amount: number;
  spent_amount: number;
  period: string;
};

export type Goal = {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  saved_amount: number;
  deadline: string;
  color: string;
  icon: string;
};

export type RecurringPayment = {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  category: string;
  frequency: string;
  next_date: string;
  status: string;
};

export type FinancialHealthScore = {
  score: number;
  breakdown: {
    savingsRate: number; // Max 30
    budgetDiscipline: number; // Max 20
    goalProgress: number; // Max 15
    recurringExpenses: number; // Max 10
    emergencyFund: number; // Max 15
    incomeStability: number; // Max 10
  };
  reasons: string[];
  improvementSuggestions: string[];
  historicalComparison: 'better' | 'worse' | 'same';
  trend: number; // Percent change
};

export type UserFinancialData = {
  transactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
  recurringPayments: RecurringPayment[];
};
