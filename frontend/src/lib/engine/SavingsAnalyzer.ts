import type { UserFinancialData } from './types';

export class SavingsAnalyzer {
  static analyze(data: UserFinancialData) {
    let totalIncome = 0;
    let totalExpense = 0;
    data.transactions.forEach(t => {
      if (t.type === 'income') totalIncome += Number(t.amount);
      if (t.type === 'expense') totalExpense += Number(t.amount);
    });

    const netSavings = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;
    
    const goalContributions = data.goals.reduce((acc, g) => acc + g.saved_amount, 0);

    return {
      totalSavings: netSavings,
      savingsRate,
      goalContributions,
      suggestions: savingsRate < 20 ? ["Aim to save at least 20% of your income."] : ["Excellent savings rate!"]
    };
  }
}
