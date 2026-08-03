import type { UserFinancialData, FinancialHealthScore } from './types';

export class HealthAnalyzer {
  static analyze(data: UserFinancialData): FinancialHealthScore {
    let score = 0;
    const breakdown = {
      savingsRate: 0,
      budgetDiscipline: 0,
      goalProgress: 0,
      recurringExpenses: 0,
      emergencyFund: 0,
      incomeStability: 0
    };
    const reasons: string[] = [];
    const suggestions: string[] = [];

    // Calculate total income and expenses
    let totalIncome = 0;
    let totalExpense = 0;
    data.transactions.forEach(t => {
      if (t.type === 'income') totalIncome += Number(t.amount);
      if (t.type === 'expense') totalExpense += Number(t.amount);
    });

    const netSavings = totalIncome - totalExpense;
    
    // 1. Savings Rate (30 Points)
    if (totalIncome > 0) {
      const savingsRate = netSavings / totalIncome;
      if (savingsRate >= 0.20) {
        breakdown.savingsRate = 30;
        reasons.push("Excellent savings rate (20%+)");
      } else if (savingsRate > 0) {
        breakdown.savingsRate = Math.round((savingsRate / 0.20) * 30);
        reasons.push(`Positive savings rate (${Math.round(savingsRate*100)}%)`);
        suggestions.push("Try to reach a 20% savings rate.");
      } else {
        suggestions.push("You are spending more than you earn. Review expenses.");
      }
    } else {
      suggestions.push("Log your income to calculate savings rate.");
    }

    // 2. Budget Discipline (20 Points)
    if (data.budgets.length > 0) {
      const withinLimits = data.budgets.filter(b => b.spent_amount <= b.limit_amount).length;
      breakdown.budgetDiscipline = Math.round((withinLimits / data.budgets.length) * 20);
      if (breakdown.budgetDiscipline === 20) {
        reasons.push("Perfect budget discipline.");
      } else {
        suggestions.push(`You exceeded ${data.budgets.length - withinLimits} budgets this period.`);
      }
    } else {
      breakdown.budgetDiscipline = 10; // Default if no budgets
      suggestions.push("Create budgets to track your spending.");
    }

    // 3. Goal Progress (15 Points)
    if (data.goals.length > 0) {
      const progress = data.goals.reduce((acc, g) => acc + (g.target_amount > 0 ? g.saved_amount / g.target_amount : 0), 0);
      breakdown.goalProgress = Math.min(Math.round((progress / data.goals.length) * 15), 15);
      if (breakdown.goalProgress >= 10) reasons.push("Strong progress on financial goals.");
    } else {
      breakdown.goalProgress = 5;
      suggestions.push("Set financial goals to plan for the future.");
    }

    // 4. Recurring Expenses (10 Points)
    const recurringTotal = data.recurringPayments.reduce((acc, r) => acc + Number(r.amount), 0);
    if (totalIncome > 0) {
      const recurringRatio = recurringTotal / totalIncome;
      if (recurringRatio < 0.3) {
        breakdown.recurringExpenses = 10;
        reasons.push("Low fixed recurring expenses.");
      } else if (recurringRatio < 0.5) {
        breakdown.recurringExpenses = 5;
      } else {
        suggestions.push("Your fixed recurring expenses are high. Consider canceling unused subscriptions.");
      }
    }

    // 5. Emergency Fund (15 Points)
    const emergencyGoal = data.goals.find(g => g.name.toLowerCase().includes('emergency'));
    if (emergencyGoal) {
      const progress = emergencyGoal.target_amount > 0 ? emergencyGoal.saved_amount / emergencyGoal.target_amount : 0;
      breakdown.emergencyFund = Math.min(Math.round(progress * 15), 15);
      if (progress >= 1) reasons.push("Emergency fund is fully funded.");
      else suggestions.push("Keep building your emergency fund.");
    } else {
      suggestions.push("Create a goal specifically for an Emergency Fund.");
    }

    // 6. Income Stability (10 Points)
    // Heuristic: If they have multiple income transactions in the last 90 days.
    const recentIncome = data.transactions.filter(t => t.type === 'income').length;
    if (recentIncome >= 3) {
      breakdown.incomeStability = 10;
      reasons.push("Stable and frequent income sources detected.");
    } else if (recentIncome > 0) {
      breakdown.incomeStability = 5;
    }

    // Calculate Total Score
    score = Object.values(breakdown).reduce((a, b) => a + b, 0);

    return {
      score,
      breakdown,
      reasons,
      improvementSuggestions: suggestions,
      historicalComparison: 'same', // To be implemented by looking at historical slices
      trend: 0
    };
  }
}
