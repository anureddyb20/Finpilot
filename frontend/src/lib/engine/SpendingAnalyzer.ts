import type { UserFinancialData } from './types';

export class SpendingAnalyzer {
  static analyze(data: UserFinancialData) {
    const expenses = data.transactions.filter(t => t.type === 'expense');
    const now = new Date();
    
    // Time-based calculations
    let today = 0, thisWeek = 0, thisMonth = 0;
    const categoryTotals: Record<string, number> = {};
    const weekendVsWeekday = { weekend: 0, weekday: 0 };
    
    expenses.forEach(t => {
      const amt = Number(t.amount);
      const d = new Date(t.date);
      
      // Totals
      if (d.toDateString() === now.toDateString()) today += amt;
      if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) thisMonth += amt;
      // Week
      const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
      if (diff <= 7) thisWeek += amt;
      
      // Category
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + amt;
      
      // Weekend (0 = Sun, 6 = Sat)
      if (d.getDay() === 0 || d.getDay() === 6) weekendVsWeekday.weekend += amt;
      else weekendVsWeekday.weekday += amt;
    });

    const categories = Object.entries(categoryTotals).map(([name, amount]) => ({ name, amount })).sort((a, b) => b.amount - a.amount);
    
    const largestExpense = expenses.length > 0 
      ? expenses.reduce((prev, current) => (Number(prev.amount) > Number(current.amount)) ? prev : current) 
      : null;

    return {
      daily: today,
      weekly: thisWeek,
      monthly: thisMonth,
      topCategory: categories.length > 0 ? categories[0] : null,
      categoryBreakdown: categories,
      weekendVsWeekday,
      largestExpense,
      averageTransaction: expenses.length > 0 ? thisMonth / expenses.length : 0 // Rough average
    };
  }
}
