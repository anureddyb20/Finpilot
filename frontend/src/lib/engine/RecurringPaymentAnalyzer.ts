import type { UserFinancialData } from './types';

export class RecurringPaymentAnalyzer {
  static analyze(data: UserFinancialData) {
    let monthlyCost = 0;
    
    data.recurringPayments.forEach(r => {
      const amt = Number(r.amount);
      if (r.frequency === 'Monthly') monthlyCost += amt;
      else if (r.frequency === 'Yearly') monthlyCost += amt / 12;
      else if (r.frequency === 'Weekly') monthlyCost += (amt * 52) / 12;
    });

    const yearlyCost = monthlyCost * 12;
    const fiveYearCost = yearlyCost * 5;

    const suggestions: string[] = [];
    if (monthlyCost > 15000) {
      suggestions.push("Your recurring expenses are quite high. Review subscriptions for cancellation.");
    } else {
      suggestions.push("Your fixed costs are well-managed.");
    }

    return {
      monthlyCost,
      yearlyCost,
      fiveYearCost,
      suggestions
    };
  }
}
