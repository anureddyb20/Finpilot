import type { UserFinancialData } from './types';

export class BudgetIntelligence {
  static analyze(data: UserFinancialData) {
    const budgetsAnalysis = data.budgets.map(b => {
      const remaining = b.limit_amount - b.spent_amount;
      const utilization = b.limit_amount > 0 ? (b.spent_amount / b.limit_amount) * 100 : 0;
      const status = utilization > 100 ? 'Exceeded' : utilization > 80 ? 'Warning' : 'Safe';
      
      return {
        ...b,
        remaining,
        utilization,
        status
      };
    });

    const exceeded = budgetsAnalysis.filter(b => b.status === 'Exceeded');
    const mostEfficient = budgetsAnalysis.length > 0 
      ? budgetsAnalysis.reduce((prev, curr) => prev.utilization < curr.utilization ? prev : curr) 
      : null;

    return {
      budgets: budgetsAnalysis,
      exceededCount: exceeded.length,
      exceededBudgets: exceeded,
      mostEfficient,
      overallDiscipline: exceeded.length === 0 ? 'Excellent' : 'Needs Improvement'
    };
  }
}
