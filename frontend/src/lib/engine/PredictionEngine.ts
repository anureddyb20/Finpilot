import type { UserFinancialData } from './types';
import { SpendingAnalyzer } from './SpendingAnalyzer';
import { SavingsAnalyzer } from './SavingsAnalyzer';

export class PredictionEngine {
  static analyze(data: UserFinancialData) {
    const spending = SpendingAnalyzer.analyze(data);
    const savings = SavingsAnalyzer.analyze(data);
    
    // Very simple linear prediction based on current month
    const nextMonthExpenses = spending.monthly * 1.05; // Assuming 5% inflation/variance
    const nextMonthSavings = Math.max(0, savings.totalSavings); // Assuming steady state

    return {
      nextMonthExpenses,
      nextMonthSavings,
      expectedCashFlow: nextMonthSavings - nextMonthExpenses,
    };
  }
}
