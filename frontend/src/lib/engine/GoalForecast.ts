import type { UserFinancialData } from './types';

export class GoalForecast {
  static analyze(data: UserFinancialData) {
    const goalsAnalysis = data.goals.map(g => {
      const remaining = g.target_amount - g.saved_amount;
      const progress = g.target_amount > 0 ? (g.saved_amount / g.target_amount) * 100 : 0;
      
      // Calculate months until deadline
      const deadline = new Date(g.deadline);
      const now = new Date();
      let monthsRemaining = (deadline.getFullYear() - now.getFullYear()) * 12 + (deadline.getMonth() - now.getMonth());
      if (monthsRemaining <= 0) monthsRemaining = 1; // Default to 1 to avoid infinity

      const requiredMonthly = remaining > 0 ? remaining / monthsRemaining : 0;
      const isOnTrack = true; // In a real system, compare to historical savings rate

      return {
        ...g,
        remaining,
        progress,
        monthsRemaining,
        requiredMonthly,
        isOnTrack
      };
    });

    return {
      goals: goalsAnalysis,
      totalSaved: data.goals.reduce((acc, g) => acc + g.saved_amount, 0),
      totalTarget: data.goals.reduce((acc, g) => acc + g.target_amount, 0)
    };
  }
}
