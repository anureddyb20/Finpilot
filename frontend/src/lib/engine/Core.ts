import { create } from 'zustand';
import { supabase } from '../supabase';
import type { UserFinancialData, Transaction, Budget, Goal, RecurringPayment } from './types';

interface EngineState extends UserFinancialData {
  isInitialized: boolean;
  isLoading: boolean;
  userId: string | null;
  lastUpdated: number | null;
  
  initialize: (userId: string) => Promise<void>;
  refresh: () => Promise<void>;
  clear: () => void;
  getData: () => UserFinancialData;
}

export const useEngineStore = create<EngineState>((set, get) => ({
  isInitialized: false,
  isLoading: false,
  userId: null,
  lastUpdated: null,
  
  transactions: [],
  budgets: [],
  goals: [],
  recurringPayments: [],

  initialize: async (userId: string) => {
    if (get().isInitialized && get().userId === userId) return;
    
    set({ userId, isLoading: true });
    await get().refresh();
    
    set({ isInitialized: true, isLoading: false });
    
    // Set up Realtime subscriptions to keep the Engine always up-to-date
    supabase.channel('engine_tx')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions', filter: `user_id=eq.${userId}` }, () => get().refresh())
      .subscribe();
      
    supabase.channel('engine_bg')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'budgets', filter: `user_id=eq.${userId}` }, () => get().refresh())
      .subscribe();
      
    supabase.channel('engine_gl')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'goals', filter: `user_id=eq.${userId}` }, () => get().refresh())
      .subscribe();
      
    supabase.channel('engine_rp')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'recurring_payments', filter: `user_id=eq.${userId}` }, () => get().refresh())
      .subscribe();
  },

  refresh: async () => {
    const userId = get().userId;
    if (!userId) return;

    try {
      const [txRes, bgRes, glRes, rpRes] = await Promise.all([
        supabase.from('transactions').select('*').order('date', { ascending: false }),
        supabase.from('budgets').select('*'),
        supabase.from('goals').select('*'),
        supabase.from('recurring_payments').select('*')
      ]);

      set({
        transactions: (txRes.data || []) as Transaction[],
        budgets: (bgRes.data || []) as Budget[],
        goals: (glRes.data || []) as Goal[],
        recurringPayments: (rpRes.data || []) as RecurringPayment[],
        lastUpdated: Date.now()
      });
    } catch (error) {
      console.error('Engine data refresh failed:', error);
    }
  },
  
  clear: () => {
    set({
      isInitialized: false,
      userId: null,
      transactions: [],
      budgets: [],
      goals: [],
      recurringPayments: [],
      lastUpdated: null
    });
    // Cleanup subscriptions... (omitted for brevity, handled by AuthContext on sign out)
  },

  getData: () => ({
    transactions: get().transactions,
    budgets: get().budgets,
    goals: get().goals,
    recurringPayments: get().recurringPayments
  })
}));
