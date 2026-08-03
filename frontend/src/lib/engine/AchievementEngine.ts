import type { UserFinancialData } from './types';
import { HealthAnalyzer } from './HealthAnalyzer';

export class AchievementEngine {
  static analyze(data: UserFinancialData) {
    const achievements: { name: string; unlocked: boolean; progress: number }[] = [];
    
    // 1. First Goal Completed
    const goalsCompleted = data.goals.filter(g => g.saved_amount >= g.target_amount && g.target_amount > 0).length;
    achievements.push({ name: "First Goal Completed", unlocked: goalsCompleted > 0, progress: Math.min(goalsCompleted, 1) });

    // 2. Budget Master
    const budgetMaster = data.budgets.length >= 3 && data.budgets.every(b => b.spent_amount <= b.limit_amount);
    achievements.push({ name: "Budget Master", unlocked: budgetMaster, progress: budgetMaster ? 1 : 0 });

    // 3. Health Above 90
    const health = HealthAnalyzer.analyze(data);
    achievements.push({ name: "Financial Health Above 90", unlocked: health.score > 90, progress: Math.min(health.score / 90, 1) });

    return achievements;
  }
}
