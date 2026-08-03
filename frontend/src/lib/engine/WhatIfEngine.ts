import type { UserFinancialData } from './types';
import { HealthAnalyzer } from './HealthAnalyzer';
import { GoalForecast } from './GoalForecast';

export class WhatIfEngine {
  // Simulates modifications to the user's data and returns updated scores/forecasts
  static simulate(data: UserFinancialData, modifiers: {
    salaryIncrease?: number;
    reduceExpensesBy?: number;
    extraGoalContribution?: number;
  }) {
    // Deep clone data to avoid mutating real data
    const simulatedData: UserFinancialData = JSON.parse(JSON.stringify(data));

    if (modifiers.salaryIncrease) {
      simulatedData.transactions.push({
        id: 'sim-1', user_id: 'sim', type: 'income', amount: modifiers.salaryIncrease, category: 'Salary', date: new Date().toISOString(), description: 'Simulation', merchant: 'Sim', method: 'Sim'
      });
    }

    if (modifiers.reduceExpensesBy) {
        // Technically we would remove expenses, but for simplicity we add a positive cashflow equivalent to reduction
        simulatedData.transactions.push({
            id: 'sim-2', user_id: 'sim', type: 'income', amount: modifiers.reduceExpensesBy, category: 'Refund', date: new Date().toISOString(), description: 'Simulation (Reduced Expense)', merchant: 'Sim', method: 'Sim'
        });
    }

    if (modifiers.extraGoalContribution && simulatedData.goals.length > 0) {
        simulatedData.goals[0].saved_amount += modifiers.extraGoalContribution;
    }

    const newHealth = HealthAnalyzer.analyze(simulatedData);
    const newGoals = GoalForecast.analyze(simulatedData);

    return {
      simulatedHealthScore: newHealth.score,
      simulatedGoalCompletion: newGoals,
      cashFlowChange: (modifiers.salaryIncrease || 0) + (modifiers.reduceExpensesBy || 0) - (modifiers.extraGoalContribution || 0)
    };
  }
}
