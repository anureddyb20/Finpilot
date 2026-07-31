import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { 
  ArrowUpRight, ArrowDownRight, Wallet, PiggyBank, CreditCard, TrendingUp,
  Search, Bell, Plus, Minus, Send, Target, Sparkles, Brain, Clock, 
  ShoppingCart, Utensils, Zap, Car, Briefcase, Activity, CheckCircle2,
  AlertTriangle, Laptop, Plane, FileText, RotateCcw, Monitor
} from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, PieChart, Pie, Cell } from 'recharts';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

// Helper to format currency
const formatInr = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

const getCategoryStyles = (category: string) => {
  const mapping: Record<string, any> = {
    'Food': { icon: Utensils, bg: 'bg-amber-50', text: 'text-amber-600', color: '#F59E0B' },
    'Salary': { icon: Briefcase, bg: 'bg-emerald-50', text: 'text-emerald-600', color: '#10B981' },
    'Shopping': { icon: ShoppingCart, bg: 'bg-pink-50', text: 'text-pink-600', color: '#EC4899' },
    'Travel': { icon: Car, bg: 'bg-blue-50', text: 'text-blue-600', color: '#3B82F6' },
    'Bills': { icon: Zap, bg: 'bg-yellow-50', text: 'text-yellow-600', color: '#EAB308' },
    'Entertainment': { icon: Monitor, bg: 'bg-purple-50', text: 'text-purple-600', color: '#8B5CF6' },
    'Refund': { icon: RotateCcw, bg: 'bg-slate-100', text: 'text-slate-600', color: '#64748B' },
    'Freelancing': { icon: Briefcase, bg: 'bg-emerald-50', text: 'text-emerald-600', color: '#10B981' },
    'Investment': { icon: ArrowUpRight, bg: 'bg-indigo-50', text: 'text-indigo-600', color: '#6366F1' },
    'Rent': { icon: FileText, bg: 'bg-orange-50', text: 'text-orange-600', color: '#F97316' },
    'Healthcare': { icon: FileText, bg: 'bg-red-50', text: 'text-red-600', color: '#EF4444' },
    'Education': { icon: FileText, bg: 'bg-blue-50', text: 'text-blue-600', color: '#3B82F6' },
    'Business': { icon: Briefcase, bg: 'bg-slate-50', text: 'text-slate-600', color: '#64748B' },
    'Insurance': { icon: FileText, bg: 'bg-teal-50', text: 'text-teal-600', color: '#14B8A6' },
    'Taxes': { icon: FileText, bg: 'bg-red-50', text: 'text-red-600', color: '#EF4444' },
  };
  return mapping[category] || { icon: FileText, bg: 'bg-slate-100', text: 'text-slate-600', color: '#94A3B8' };
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const income = payload.find((p: any) => p.dataKey === 'income')?.value || 0;
    const expense = payload.find((p: any) => p.dataKey === 'expense')?.value || 0;
    return (
      <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-100 z-50">
        <p className="font-semibold mb-2">{label}</p>
        <div className="space-y-1">
          <p className="text-blue-600 text-sm font-medium">Income: {formatInr(income)}</p>
          <p className="text-emerald-600 text-sm font-medium">Expense: {formatInr(expense)}</p>
          <div className="border-t pt-2 mt-2">
            <p className="text-slate-900 font-bold text-sm">Net Flow: {formatInr(income - expense)}</p>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const PieTooltip = ({ active, payload, total }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const percentage = ((data.value / (total || 1)) * 100).toFixed(1);
    
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-100 z-50">
        <p className="font-semibold text-slate-800 flex items-center gap-2">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: data.color }}></span>
          {data.name}
        </p>
        <p className="text-slate-600 font-medium mt-1">{formatInr(data.value)} ({percentage}%)</p>
      </div>
    );
  }
  return null;
};

export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [timeframe, setTimeframe] = useState<'Weekly' | 'Monthly' | 'Yearly'>('Monthly');
  const [insightIndex, setInsightIndex] = useState(0);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [newBudget, setNewBudget] = useState({ category: 'Food', limit: '' });
  const [newGoal, setNewGoal] = useState({ name: '', target: '', date: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);
    try {
      const today = new Date();
      const { error } = await supabase.from('budgets').insert({
        user_id: user.id,
        category: newBudget.category,
        limit_amount: Number(newBudget.limit),
        spent_amount: 0,
        month: today.getMonth(),
        year: today.getFullYear()
      });
      if (error) throw error;
      setShowBudgetModal(false);
      setNewBudget({ category: 'Food', limit: '' });
    } catch (err: any) {
      console.error(err);
      alert("Failed to create budget: " + (err.message || "Unknown error"));
    }
    setIsSubmitting(false);
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('goals').insert({
        user_id: user.id,
        name: newGoal.name,
        target_amount: Number(newGoal.target),
        saved_amount: 0,
        target_date: newGoal.date || null,
        color_theme: 'blue',
        icon_name: 'Target'
      });
      if (error) throw error;
      setShowGoalModal(false);
      setNewGoal({ name: '', target: '', date: '' });
    } catch (err: any) {
      console.error(err);
      alert("Failed to create goal: " + (err.message || "Unknown error"));
    }
    setIsSubmitting(false);
  };


  // DB States
  const [transactions, setTransactions] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [recurring, setRecurring] = useState<any[]>([]);

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      const [txRes, bgRes, glRes, recRes] = await Promise.all([
        supabase.from('transactions').select('*').is('deleted_at', null).order('date', { ascending: false }).order('time', { ascending: false }),
        supabase.from('budgets').select('*'),
        supabase.from('goals').select('*'),
        supabase.from('recurring_payments').select('*')
      ]);

      if (txRes.data) setTransactions(txRes.data);
      if (bgRes.data) setBudgets(bgRes.data);
      if (glRes.data) setGoals(glRes.data);
      if (recRes.data) setRecurring(recRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();

    if (!user) return;
    const txSub = supabase.channel('tx_changes').on('postgres_changes', { event: '*', schema: 'public', table: 'transactions', filter: `user_id=eq.${user.id}` }, fetchData).subscribe();
    const bgSub = supabase.channel('bg_changes').on('postgres_changes', { event: '*', schema: 'public', table: 'budgets', filter: `user_id=eq.${user.id}` }, fetchData).subscribe();
    const glSub = supabase.channel('gl_changes').on('postgres_changes', { event: '*', schema: 'public', table: 'goals', filter: `user_id=eq.${user.id}` }, fetchData).subscribe();
    const recSub = supabase.channel('rec_changes').on('postgres_changes', { event: '*', schema: 'public', table: 'recurring_payments', filter: `user_id=eq.${user.id}` }, fetchData).subscribe();

    return () => {
      supabase.removeChannel(txSub);
      supabase.removeChannel(bgSub);
      supabase.removeChannel(glSub);
      supabase.removeChannel(recSub);
    };
  }, [user, fetchData]);

  // Derived Calculations
  const metrics = useMemo(() => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    let totalInc = 0;
    let totalExp = 0;
    let currMonthInc = 0;
    let currMonthExp = 0;
    let lastMonthInc = 0;
    let lastMonthExp = 0;

    const categoryExp: Record<string, number> = {};

    transactions.forEach(t => {
      const amt = Number(t.amount) || 0;
      const tDate = new Date(t.date);
      const isCurrMonth = tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
      const isLastMonth = tDate.getMonth() === lastMonth && tDate.getFullYear() === lastMonthYear;

      if (t.type === 'income') {
        totalInc += amt;
        if (isCurrMonth) currMonthInc += amt;
        if (isLastMonth) lastMonthInc += amt;
      } else if (t.type === 'expense') {
        totalExp += amt;
        if (isCurrMonth) {
          currMonthExp += amt;
          categoryExp[t.category] = (categoryExp[t.category] || 0) + amt;
        }
        if (isLastMonth) lastMonthExp += amt;
      }
    });

    const incChange = lastMonthInc ? ((currMonthInc - lastMonthInc) / lastMonthInc) * 100 : 0;
    const expChange = lastMonthExp ? ((currMonthExp - lastMonthExp) / lastMonthExp) * 100 : 0;
    const balance = totalInc - totalExp;
    
    // For net savings, let's compare all time savings to something? Or just month's savings?
    // Let's use month's savings for the card.
    const currMonthSavings = currMonthInc - currMonthExp;
    const lastMonthSavings = lastMonthInc - lastMonthExp;
    const savChange = lastMonthSavings ? ((currMonthSavings - lastMonthSavings) / Math.abs(lastMonthSavings)) * 100 : 0;

    // Format Spending Data for Pie Chart
    const spendingData = Object.entries(categoryExp)
      .map(([name, value]) => ({ name, value, color: getCategoryStyles(name).color }))
      .sort((a, b) => b.value - a.value);

    return {
      balance, currMonthInc, currMonthExp, currMonthSavings,
      incChange, expChange, savChange, spendingData
    };
  }, [transactions]);

  const insights = useMemo(() => {
    const list = [];
    if (metrics.currMonthSavings > 0) {
      list.push(`You saved ${formatInr(metrics.currMonthSavings)} this month. Great job!`);
    } else {
      list.push(`You spent more than you earned this month. Try to cut back on expenses!`);
    }
    if (metrics.savChange > 0) {
      list.push(`Your savings increased by ${metrics.savChange.toFixed(1)}% compared to last month.`);
    }
    if (metrics.spendingData.length > 0) {
      const topCat = metrics.spendingData[0];
      list.push(`Your highest expense this month is ${topCat.name} at ${formatInr(topCat.value)}.`);
    }
    if (list.length === 0) list.push("Welcome! Add some transactions to see AI insights here.");
    return list;
  }, [metrics]);

  useEffect(() => {
    if (insights.length === 0) return;
    const interval = setInterval(() => {
      setInsightIndex((prev) => (prev + 1) % insights.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [insights]);

  // Cash Flow Chart Data
  const getChartData = () => {
    // Generate simple aggregation for demo based on real data
    const chartData = [];
    if (timeframe === 'Monthly') {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      for (let i = 0; i < 12; i++) {
        chartData.push({ name: months[i], income: 0, expense: 0, monthIdx: i });
      }
      const currentYear = new Date().getFullYear();
      transactions.forEach(t => {
        const d = new Date(t.date);
        if (d.getFullYear() === currentYear) {
          const amt = Number(t.amount);
          if (t.type === 'income') chartData[d.getMonth()].income += amt;
          if (t.type === 'expense') chartData[d.getMonth()].expense += amt;
        }
      });
      return chartData.filter(d => d.income > 0 || d.expense > 0 || d.monthIdx <= new Date().getMonth());
    } else if (timeframe === 'Yearly') {
      const yearsMap: any = {};
      transactions.forEach(t => {
        const y = new Date(t.date).getFullYear().toString();
        if(!yearsMap[y]) yearsMap[y] = { name: y, income: 0, expense: 0 };
        if(t.type === 'income') yearsMap[y].income += Number(t.amount);
        if(t.type === 'expense') yearsMap[y].expense += Number(t.amount);
      });
      return Object.values(yearsMap).sort((a: any, b: any) => a.name.localeCompare(b.name));
    } else {
      // Weekly - basic mock using last 7 days of real data
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      for(let i=6; i>=0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        chartData.push({ name: days[d.getDay()], income: 0, expense: 0, dateStr: d.toISOString().split('T')[0] });
      }
      transactions.forEach(t => {
        const match = chartData.find(c => c.dateStr === t.date);
        if (match) {
          if (t.type === 'income') match.income += Number(t.amount);
          if (t.type === 'expense') match.expense += Number(t.amount);
        }
      });
      return chartData;
    }
  };

  // Financial Health Score Calculation (Simplified logic)
  const healthScore = useMemo(() => {
    let score = 0;
    // Savings Rate (30 points): Target > 20%
    const savingsRate = metrics.currMonthInc > 0 ? (metrics.currMonthSavings / metrics.currMonthInc) : 0;
    if (savingsRate >= 0.2) score += 30;
    else if (savingsRate > 0) score += 15;

    // Budget Discipline (20 points): Budgets not exceeded
    if (budgets.length > 0) {
      const withinLimits = budgets.filter(b => b.spent_amount <= b.limit_amount).length;
      score += (withinLimits / budgets.length) * 20;
    } else {
      score += 10; // Neutral if no budgets
    }

    // Goal Progress (15 points): Average progress
    if (goals.length > 0) {
      const totalProgress = goals.reduce((acc, g) => acc + (g.target_amount > 0 ? g.saved_amount / g.target_amount : 0), 0);
      score += Math.min((totalProgress / goals.length) * 15, 15);
    } else {
      score += 5; 
    }

    // Cash flow positive (20 points)
    if (metrics.currMonthSavings > 0) score += 20;

    // Base buffer
    score += 15;

    return Math.min(Math.round(score), 100);
  }, [metrics, budgets, goals]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading Dashboard...</div>;
  }

  return (
    <div className="space-y-8 pb-20 relative min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Good Morning, {user?.user_metadata?.full_name?.split(' ')[0] || 'User'} 👋</h1>
          <p className="text-slate-500">You have saved {formatInr(metrics.currMonthSavings > 0 ? metrics.currMonthSavings : 0)} this month. Keep it up!</p>
        </div>
      </div>

      {/* Top Summary Cards */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ staggerChildren: 0.1 }}
      >
        {/* Balance */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Available Balance</p>
                <h4 className="text-3xl font-bold text-slate-900">{formatInr(metrics.balance)}</h4>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-emerald-50 text-emerald-600">
                <Wallet className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-1">
              <div className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                <Clock className="w-3 h-3" /> Live from Database
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Income */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Monthly Income</p>
                <h4 className="text-3xl font-bold text-slate-900">{formatInr(metrics.currMonthInc)}</h4>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-50 text-blue-600">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className={`flex items-center text-sm font-medium ${metrics.incChange >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {metrics.incChange >= 0 ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
                {Math.abs(metrics.incChange).toFixed(1)}%
              </span>
              <span className="text-sm text-slate-500">vs last month</span>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Expenses */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Monthly Expenses</p>
                <h4 className="text-3xl font-bold text-slate-900">{formatInr(metrics.currMonthExp)}</h4>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-red-50 text-red-600">
                <CreditCard className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className={`flex items-center text-sm font-medium ${metrics.expChange <= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {metrics.expChange <= 0 ? <ArrowDownRight className="w-4 h-4 mr-1" /> : <ArrowUpRight className="w-4 h-4 mr-1" />}
                {Math.abs(metrics.expChange).toFixed(1)}%
              </span>
              <span className="text-sm text-slate-500">vs last month</span>
            </div>
          </CardContent>
        </Card>

        {/* Net Savings */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Net Savings</p>
                <h4 className="text-3xl font-bold text-slate-900">{formatInr(metrics.currMonthSavings)}</h4>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-purple-50 text-purple-600">
                <PiggyBank className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className={`flex items-center text-sm font-medium ${metrics.savChange >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {metrics.savChange >= 0 ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
                {Math.abs(metrics.savChange).toFixed(1)}%
              </span>
              <span className="text-sm text-slate-500">vs last month</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* AI Insights Banner */}
      {insights.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-2xl p-6 border border-indigo-100/50 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
            <Brain className="w-32 h-32 text-indigo-600" />
          </div>
          <div className="flex items-start gap-4 relative z-10">
            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-indigo-900 mb-1 flex items-center gap-2">
                AI Financial Insight
                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-[10px] uppercase tracking-wider">Live</span>
              </h3>
              <AnimatePresence mode="wait">
                <motion.p 
                  key={insightIndex}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}
                  className="text-slate-700 font-medium leading-relaxed"
                >
                  {insights[insightIndex] || insights[0]}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Cash Flow Chart */}
        <Card className="xl:col-span-2 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Cash Flow</CardTitle>
              <p className="text-sm text-slate-500 mt-1">Income vs Expenses over time</p>
            </div>
            <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
              {['Weekly', 'Monthly', 'Yearly'].map((t) => (
                <button 
                  key={t} onClick={() => setTimeframe(t as any)}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${timeframe === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="flex items-center gap-6 mb-4 px-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-sm font-medium text-slate-600">Income</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span className="text-sm font-medium text-slate-600">Expenses</span>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={getChartData()} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIncomeChart" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpenseChart" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} width={60} tickFormatter={(value) => `₹${(value/1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="income" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorIncomeChart)" />
                  <Area type="monotone" dataKey="expense" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorExpenseChart)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Financial Health Score */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Financial Health</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <div className="flex flex-col items-center justify-center py-4">
              <div className="relative w-40 h-40 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90 drop-shadow-sm">
                  <circle cx="80" cy="80" r="72" stroke="#F1F5F9" strokeWidth="12" fill="none" />
                  <circle 
                    cx="80" cy="80" r="72" 
                    stroke={healthScore >= 80 ? "#10B981" : healthScore >= 50 ? "#F59E0B" : "#EF4444"} 
                    strokeWidth="12" 
                    fill="none" 
                    strokeDasharray="452.39" 
                    strokeDashoffset={452.39 - (452.39 * healthScore) / 100}
                    strokeLinecap="round" 
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-4xl font-bold text-slate-900">{healthScore}</span>
                  <span className={`text-sm font-bold px-2 py-0.5 rounded-full mt-1 ${healthScore >= 80 ? 'text-emerald-600 bg-emerald-50' : healthScore >= 50 ? 'text-amber-600 bg-amber-50' : 'text-red-600 bg-red-50'}`}>
                    {healthScore >= 80 ? 'Excellent' : healthScore >= 50 ? 'Fair' : 'Needs Imp.'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3 mt-4 flex-1">
              <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-2">Breakdown</h4>
              <div className="flex justify-between items-center p-2 hover:bg-slate-50 rounded-lg transition-colors">
                <span className="text-sm text-slate-600">Savings Rate</span>
                {metrics.currMonthSavings > 0 ? (
                  <span className="text-sm font-medium text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Good</span>
                ) : (
                  <span className="text-sm font-medium text-amber-600 flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> Low</span>
                )}
              </div>
              <div className="flex justify-between items-center p-2 hover:bg-slate-50 rounded-lg transition-colors">
                <span className="text-sm text-slate-600">Expense Control</span>
                <span className="text-sm font-medium text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Good</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-100">
            <CardTitle>Recent Transactions</CardTitle>
            <button onClick={() => navigate('/transactions')} className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">View All</button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100 max-h-[380px] overflow-y-auto">
              {transactions.slice(0, 6).map((tx) => {
                const styles = getCategoryStyles(tx.category);
                return (
                  <div key={tx.id} onClick={() => navigate('/transactions')} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${styles.bg} ${styles.text}`}>
                        {React.createElement(styles.icon, { className: 'w-5 h-5' })}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{tx.merchant}</p>
                        <p className="text-xs text-slate-500">{tx.date} • {tx.method}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${tx.type === 'income' ? 'text-emerald-600' : 'text-slate-900'}`}>
                        {tx.type === 'income' ? '+' : ''}{tx.type === 'expense' ? '-' : ''}{formatInr(tx.amount)}
                      </p>
                      <span className={`inline-block mt-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${tx.type === 'income' ? 'bg-emerald-50 text-emerald-700' : tx.type === 'refund' ? 'bg-slate-100 text-slate-700' : 'bg-red-50 text-red-700'}`}>
                        {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                      </span>
                    </div>
                  </div>
                )
              })}
              {transactions.length === 0 && (
                <div className="p-8 text-center text-slate-500 text-sm">
                  No transactions found. Add your first transaction!
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Spending Breakdown Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Spending Breakdown</CardTitle>
            <p className="text-sm text-slate-500 mt-1">This month's expenses by category</p>
          </CardHeader>
          <CardContent>
            {metrics.spendingData.length > 0 ? (
              <>
                <div className="h-[280px] w-full flex items-center justify-center relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={metrics.spendingData}
                        cx="50%" cy="50%"
                        innerRadius={70} outerRadius={110}
                        paddingAngle={2} dataKey="value" stroke="none"
                      >
                        {metrics.spendingData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<PieTooltip total={metrics.currMonthExp} />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-xs font-medium text-slate-500">Total</span>
                    <span className="text-xl font-bold text-slate-900">{formatInr(metrics.currMonthExp)}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                  {metrics.spendingData.slice(0, 4).map((cat, i) => (
                    <div key={i} className="flex flex-col">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }}></div>
                        {cat.name}
                      </div>
                      <span className="font-semibold text-slate-900 text-sm pl-4">{formatInr(cat.value)}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-slate-500 text-sm">
                No expenses recorded this month.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Budget Progress */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Budget Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {budgets.length > 0 ? budgets.slice(0,4).map((budget) => {
              const percent = (budget.spent_amount / budget.limit_amount) * 100;
              const styles = getCategoryStyles(budget.category);
              return (
                <div key={budget.id}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium text-slate-700">{budget.category}</span>
                    <span className="text-slate-500">{formatInr(budget.spent_amount)} / {formatInr(budget.limit_amount)}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${percent > 90 ? 'bg-red-500' : ''}`} 
                      style={{ width: `${Math.min(percent, 100)}%`, backgroundColor: percent <= 90 ? styles.color : undefined }}
                    ></div>
                  </div>
                  {percent > 90 && (
                    <p className="text-[10px] text-red-500 mt-1 font-medium flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Near limit
                    </p>
                  )}
                </div>
              );
            }) : (
              <div className="text-center py-8 text-slate-500 text-sm">Create a budget to track spending limits.</div>
            )}
          </CardContent>
        </Card>

        {/* Savings Goals */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Savings Goals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {goals.length > 0 ? goals.slice(0,3).map((goal) => {
              const percent = (goal.saved_amount / goal.target_amount) * 100;
              return (
                <div key={goal.id} className="p-3 border border-slate-100 rounded-xl hover:shadow-sm transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg bg-${goal.color_theme}-50 text-${goal.color_theme}-600`}>
                      <Target className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <h5 className="font-semibold text-slate-900 text-sm">{goal.name}</h5>
                      {goal.target_date && <p className="text-xs text-slate-500">Target: {goal.target_date}</p>}
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-slate-900">{percent.toFixed(0)}%</span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mb-2">
                    <div className="h-full rounded-full bg-slate-900" style={{ width: `${Math.min(percent, 100)}%` }}></div>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Saved: {formatInr(goal.saved_amount)}</span>
                    <span>Target: {formatInr(goal.target_amount)}</span>
                  </div>
                </div>
              );
            }) : (
              <div className="text-center py-8 text-slate-500 text-sm">Add goals to visualize your savings progress.</div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Bills & Monthly Summary */}
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle>Upcoming Bills</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recurring.length > 0 ? recurring.map((bill) => (
                <div key={bill.id} className="flex items-center justify-between p-2.5 rounded-lg border border-slate-50 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-8 rounded-full ${bill.is_urgent ? 'bg-red-500' : 'bg-slate-300'}`}></div>
                    <div>
                      <p className="font-medium text-sm text-slate-900">{bill.name}</p>
                      <p className={`text-xs ${bill.is_urgent ? 'text-red-500 font-medium' : 'text-slate-500'}`}>Due Date: {bill.due_date}</p>
                    </div>
                  </div>
                  <span className="font-semibold text-slate-900">{formatInr(bill.amount)}</span>
                </div>
              )) : (
                <div className="text-center py-4 text-slate-500 text-sm">No recurring payments found.</div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-slate-900 text-white">
            <CardContent className="p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <FileText className="w-24 h-24" />
              </div>
              <h3 className="font-bold text-lg mb-4 relative z-10">Monthly Summary</h3>
              <div className="space-y-2 mb-4 relative z-10 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Income</span>
                  <span className="font-semibold text-emerald-400">{formatInr(metrics.currMonthInc)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Expenses</span>
                  <span className="font-semibold text-red-400">{formatInr(metrics.currMonthExp)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-700">
                  <span className="text-slate-300">Net Savings</span>
                  <span className="font-bold">{formatInr(metrics.currMonthSavings)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Floating Quick Actions */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        <AnimatePresence>
          {showQuickActions && (
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="flex flex-col gap-2 mb-2"
            >
              {[
                { label: 'Create Goal', icon: Target, color: 'text-purple-600', bg: 'bg-purple-50', action: () => { setShowGoalModal(true); setShowQuickActions(false); } },
                { label: 'Create Budget', icon: Activity, color: 'text-orange-600', bg: 'bg-orange-50', action: () => { setShowBudgetModal(true); setShowQuickActions(false); } },
                { label: 'Add Transaction', icon: Plus, color: 'text-emerald-600', bg: 'bg-emerald-50', action: () => navigate('/transactions') },
              ].map((action, i) => (
                <motion.button 
                  key={i} onClick={action.action}
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-lg border border-slate-100 hover:shadow-xl transition-all"
                >
                  <span className="font-medium text-sm text-slate-700">{action.label}</span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${action.bg} ${action.color}`}>
                    <action.icon className="w-4 h-4" />
                  </div>
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        <button 
          onClick={() => setShowQuickActions(!showQuickActions)}
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all ${showQuickActions ? 'bg-slate-900 text-white rotate-45' : 'bg-primary text-white hover:bg-primary/90 hover:scale-105'}`}
        >
          {showQuickActions ? <Plus className="w-6 h-6" /> : <Zap className="w-6 h-6" />}
        </button>
      </div>


      {/* Quick Add Budget Modal */}
      {showBudgetModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-4">Create Quick Budget</h2>
            <form onSubmit={handleCreateBudget} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select 
                  required className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  value={newBudget.category} onChange={e => setNewBudget({...newBudget, category: e.target.value})}
                >
                  <option value="Food">Food & Dining</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Travel">Travel</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Bills">Bills & Utilities</option>
                  <option value="Rent">Rent</option>
                  <option value="Healthcare">Healthcare</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Monthly Limit (₹)</label>
                <input 
                  type="number" required placeholder="e.g. 10000"
                  className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  value={newBudget.limit} onChange={e => setNewBudget({...newBudget, limit: e.target.value})}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowBudgetModal(false)} className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50">Create Budget</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Quick Add Goal Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-4">Create Savings Goal</h2>
            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Goal Name</label>
                <input 
                  type="text" required placeholder="e.g. New Laptop"
                  className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  value={newGoal.name} onChange={e => setNewGoal({...newGoal, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Target Amount (₹)</label>
                <input 
                  type="number" required placeholder="e.g. 80000"
                  className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  value={newGoal.target} onChange={e => setNewGoal({...newGoal, target: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Target Date (Optional)</label>
                <input 
                  type="date"
                  className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                  value={newGoal.date} onChange={e => setNewGoal({...newGoal, date: e.target.value})}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowGoalModal(false)} className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50">Create Goal</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

