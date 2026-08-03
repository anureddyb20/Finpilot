import type { UserFinancialData } from './types';
import { HealthAnalyzer } from './HealthAnalyzer';
import { SpendingAnalyzer } from './SpendingAnalyzer';

export class ProfileGenerator {
  static analyze(data: UserFinancialData) {
    const health = HealthAnalyzer.analyze(data);
    const spending = SpendingAnalyzer.analyze(data);
    
    // Determine Money Personality
    let personality = "Balanced Planner";
    
    if (health.breakdown.savingsRate === 30) {
      personality = "Smart Saver";
    } else if (health.breakdown.budgetDiscipline === 0 && spending.monthly > 50000) {
      personality = "Impulse Shopper";
    } else if (health.breakdown.goalProgress >= 10 && health.breakdown.budgetDiscipline >= 15) {
      personality = "Growth Investor";
    }

    return {
      personality,
      healthScore: health.score,
      sections: {
        savingsDiscipline: {
          rating: health.breakdown.savingsRate >= 20 ? 'Excellent' : health.breakdown.savingsRate >= 10 ? 'Good' : 'Needs Work',
          reason: health.reasons.find(r => r.includes("savings")) || "Review your savings rate.",
          advice: health.improvementSuggestions.find(s => s.includes("savings")) || "Try to save more."
        },
        budgetDiscipline: {
          rating: health.breakdown.budgetDiscipline >= 15 ? 'Excellent' : health.breakdown.budgetDiscipline >= 10 ? 'Good' : 'Needs Work',
          reason: health.reasons.find(r => r.includes("budget")) || "Review your budgets.",
          advice: health.improvementSuggestions.find(s => s.includes("budget")) || "Stick to your limits."
        }
      }
    };
  }
}
