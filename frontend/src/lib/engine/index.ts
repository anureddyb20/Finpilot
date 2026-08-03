export * from './types';
export * from './Core';
export * from './HealthAnalyzer';
export * from './SpendingAnalyzer';
export * from './SavingsAnalyzer';
export * from './GoalForecast';
export * from './BudgetIntelligence';
export * from './RecurringPaymentAnalyzer';
export * from './ProfileGenerator';
export * from './AIGenerator';
export * from './PredictionEngine';
export * from './WhatIfEngine';
export * from './AchievementEngine';

import { useEngineStore } from './Core';
import { HealthAnalyzer } from './HealthAnalyzer';
import { SpendingAnalyzer } from './SpendingAnalyzer';
import { SavingsAnalyzer } from './SavingsAnalyzer';
import { GoalForecast } from './GoalForecast';
import { BudgetIntelligence } from './BudgetIntelligence';
import { RecurringPaymentAnalyzer } from './RecurringPaymentAnalyzer';
import { ProfileGenerator } from './ProfileGenerator';
import { AIGenerator } from './AIGenerator';
import { PredictionEngine } from './PredictionEngine';
import { WhatIfEngine } from './WhatIfEngine';
import { AchievementEngine } from './AchievementEngine';

// Centralized facade for easy access
export const FinancialEngine = {
  getStore: () => useEngineStore,
  
  // Expose analyzer methods that automatically pull from the current store data
  getHealthScore: () => HealthAnalyzer.analyze(useEngineStore.getState().getData()),
  getSpendingAnalysis: () => SpendingAnalyzer.analyze(useEngineStore.getState().getData()),
  getSavingsAnalysis: () => SavingsAnalyzer.analyze(useEngineStore.getState().getData()),
  getGoalForecast: () => GoalForecast.analyze(useEngineStore.getState().getData()),
  getBudgetIntelligence: () => BudgetIntelligence.analyze(useEngineStore.getState().getData()),
  getRecurringAnalysis: () => RecurringPaymentAnalyzer.analyze(useEngineStore.getState().getData()),
  getProfile: () => ProfileGenerator.analyze(useEngineStore.getState().getData()),
  getCoachAdvice: () => AIGenerator.generateCoachAdvice(useEngineStore.getState().getData()),
  getTodayDigest: () => AIGenerator.generateTodayDigest(useEngineStore.getState().getData()),
  getPredictions: () => PredictionEngine.analyze(useEngineStore.getState().getData()),
  getAchievements: () => AchievementEngine.analyze(useEngineStore.getState().getData()),
  
  simulateWhatIf: (modifiers: any) => WhatIfEngine.simulate(useEngineStore.getState().getData(), modifiers)
};
