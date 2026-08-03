import type { UserFinancialData } from './types';
import { HealthAnalyzer } from './HealthAnalyzer';
import { SpendingAnalyzer } from './SpendingAnalyzer';
import { BudgetIntelligence } from './BudgetIntelligence';

export class AIGenerator {
  
  static generateCoachAdvice(data: UserFinancialData): string[] {
    const advice: string[] = [];
    const health = HealthAnalyzer.analyze(data);
    const budgets = BudgetIntelligence.analyze(data);
    
    if (health.breakdown.savingsRate < 10) advice.push("Increase monthly savings. Try to cut back on discretionary spending.");
    if (budgets.exceededCount > 0) {
      const worst = budgets.exceededBudgets[0];
      advice.push(`Reduce ${worst?.category || 'your top category'} expenses to stay within budget.`);
    }
    if (health.breakdown.emergencyFund < 10) advice.push("Build your Emergency Fund to handle unexpected expenses.");
    
    if (advice.length === 0) advice.push("You are doing great! Consider exploring investment opportunities.");
    
    return advice;
  }

  static generateTodayDigest(data: UserFinancialData) {
    const spending = SpendingAnalyzer.analyze(data);
    const advice = this.generateCoachAdvice(data);
    
    return {
      todaySpending: spending.daily,
      topAdvice: advice[0],
      alerts: BudgetIntelligence.analyze(data).exceededCount
    };
  }
}
