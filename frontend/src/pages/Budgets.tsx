import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { 
  ArrowUpRight, Plus, AlertTriangle, 
  Bot, Edit3, Trash2, X, Target, CheckCircle2,
  ShoppingBag, Utensils, Home, Zap, HeartPulse, Car, FileText, Briefcase, Monitor, RotateCcw,
  Sliders
} from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

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
    'Food & Dining': { icon: Utensils, bg: 'bg-amber-50', text: 'text-amber-600', color: '#F59E0B' },
    'Food': { icon: Utensils, bg: 'bg-amber-50', text: 'text-amber-600', color: '#F59E0B' },
    'Salary': { icon: Briefcase, bg: 'bg-emerald-50', text: 'text-emerald-600', color: '#10B981' },
    'Shopping': { icon: ShoppingBag, bg: 'bg-pink-50', text: 'text-pink-600', color: '#EC4899' },
    'Transport': { icon: Car, bg: 'bg-blue-50', text: 'text-blue-600', color: '#3B82F6' },
    'Travel': { icon: Car, bg: 'bg-blue-50', text: 'text-blue-600', color: '#3B82F6' },
    'Bills & Utilities': { icon: Zap, bg: 'bg-yellow-50', text: 'text-yellow-600', color: '#EAB308' },
    'Bills': { icon: Zap, bg: 'bg-yellow-50', text: 'text-yellow-600', color: '#EAB308' },
    'Entertainment': { icon: Monitor, bg: 'bg-purple-50', text: 'text-purple-600', color: '#8B5CF6' },
    'Refund': { icon: RotateCcw, bg: 'bg-slate-100', text: 'text-slate-600', color: '#64748B' },
    'Freelancing': { icon: Briefcase, bg: 'bg-emerald-50', text: 'text-emerald-600', color: '#10B981' },
    'Investment': { icon: ArrowUpRight, bg: 'bg-indigo-50', text: 'text-indigo-600', color: '#6366F1' },
    'Rent & Housing': { icon: Home, bg: 'bg-orange-50', text: 'text-orange-600', color: '#F97316' },
    'Rent': { icon: Home, bg: 'bg-orange-50', text: 'text-orange-600', color: '#F97316' },
    'Healthcare': { icon: HeartPulse, bg: 'bg-red-50', text: 'text-red-600', color: '#EF4444' },
    'Education': { icon: FileText, bg: 'bg-blue-50', text: 'text-blue-600', color: '#3B82F6' },
    'Business': { icon: Briefcase, bg: 'bg-slate-50', text: 'text-slate-600', color: '#64748B' },
    'Insurance': { icon: FileText, bg: 'bg-teal-50', text: 'text-teal-600', color: '#14B8A6' },
    'Taxes': { icon: FileText, bg: 'bg-red-50', text: 'text-red-600', color: '#EF4444' },
  };
  return mapping[category] || { icon: FileText, bg: 'bg-slate-100', text: 'text-slate-600', color: '#94A3B8' };
};

const allCategories = ['Food & Dining', 'Food', 'Rent & Housing', 'Rent', 'Shopping', 'Transport', 'Travel', 'Bills & Utilities', 'Bills', 'Healthcare', 'Entertainment', 'Education', 'Insurance', 'Business', 'Others'];
const presetColors = ['#3B82F6', '#10B981', '#EF4444', '#F59E0B', '#8B5CF6', '#14B8A6', '#EC4899', '#6366F1'];

export function Budgets() {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<any>(null);
  const [confirmState, setConfirmState] = useState<{isOpen: boolean; id: string | null}>({ isOpen: false, id: null });
  
  // Form State
  const [formData, setFormData] = useState({
    name: '', category: 'Food & Dining', allocated: '', color: '#3B82F6',
    start_date: '', end_date: '', alert_threshold: '75', notes: ''
  });

  // Simulator State
  const [simulatedLimits, setSimulatedLimits] = useState<Record<string, number>>({});

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      const [bgRes, txRes] = await Promise.all([
        supabase.from('budgets').select('*').order('created_at', { ascending: false }),
        supabase.from('transactions').select('*').is('deleted_at', null).eq('type', 'expense')
      ]);

      if (bgRes.data) {
        setBudgets(bgRes.data);
        const sim: Record<string, number> = {};
        bgRes.data.forEach(b => sim[b.id] = Number(b.limit_amount));
        setSimulatedLimits(sim);
      }
      if (txRes.data) setTransactions(txRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();

    if (!user) return;
    const bgSub = supabase.channel('bg_changes_b').on('postgres_changes', { event: '*', schema: 'public', table: 'budgets', filter: `user_id=eq.${user.id}` }, fetchData).subscribe();
    const txSub = supabase.channel('tx_changes_b').on('postgres_changes', { event: '*', schema: 'public', table: 'transactions', filter: `user_id=eq.${user.id}` }, fetchData).subscribe();

    return () => {
      supabase.removeChannel(bgSub);
      supabase.removeChannel(txSub);
    };
  }, [user, fetchData]);

  // Derived Budgets with live computed spending
  const liveBudgets = useMemo(() => {
    return budgets.map(b => {
      let spent = 0;
      transactions.forEach(t => {
        // Match category (allow fuzzy match for 'Food' vs 'Food & Dining')
        if (t.category.includes(b.category) || b.category.includes(t.category)) {
          const tDate = new Date(t.date);
          let inRange = false;
          if (b.start_date && b.end_date) {
            inRange = tDate >= new Date(b.start_date) && tDate <= new Date(b.end_date);
          } else {
            inRange = tDate.getMonth() === b.month && tDate.getFullYear() === b.year;
          }
          if (inRange) spent += Number(t.amount);
        }
      });
      return { ...b, spent_amount: spent };
    });
  }, [budgets, transactions]);

  const totalAllocated = liveBudgets.reduce((acc, curr) => acc + Number(curr.limit_amount), 0);
  const totalSpent = liveBudgets.reduce((acc, curr) => acc + curr.spent_amount, 0);
  const totalRemaining = totalAllocated - totalSpent;
  const overallUtilization = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0;

  // Simulator Derived values
  const simulatedTotalAllocated = Object.values(simulatedLimits).reduce((acc, curr) => acc + curr, 0);
  const simulatedRemaining = simulatedTotalAllocated - totalSpent;
  const simulatedUtilization = simulatedTotalAllocated > 0 ? (totalSpent / simulatedTotalAllocated) * 100 : 0;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      const today = new Date();
      const payload = {
        user_id: user.id,
        name: formData.name || `${formData.category} Budget`,
        category: formData.category,
        limit_amount: Number(formData.allocated),
        month: today.getMonth(),
        year: today.getFullYear(),
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        alert_threshold: Number(formData.alert_threshold),
        notes: formData.notes,
        color: formData.color
      };

      if (editingBudget) {
        await supabase.from('budgets').update(payload).eq('id', editingBudget.id);
      } else {
        await supabase.from('budgets').insert(payload);
      }
      closeModal();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    setConfirmState({ isOpen: true, id });
  };

  const handleConfirmDelete = async () => {
    if (confirmState.id) {
      await supabase.from('budgets').delete().eq('id', confirmState.id);
      setConfirmState({ isOpen: false, id: null });
    }
  };

  const openModal = (budget?: any) => {
    if (budget) {
      setEditingBudget(budget);
      setFormData({ 
        name: budget.name || '', category: budget.category, allocated: budget.limit_amount.toString(), 
        color: budget.color || getCategoryStyles(budget.category).color, start_date: budget.start_date || '', 
        end_date: budget.end_date || '', alert_threshold: budget.alert_threshold?.toString() || '75', notes: budget.notes || '' 
      });
    } else {
      setEditingBudget(null);
      setFormData({ 
        name: '', category: 'Food & Dining', allocated: '', color: '#3B82F6', 
        start_date: '', end_date: '', alert_threshold: '75', notes: '' 
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const getStatusColor = (percent: number) => {
    if (percent > 100) return 'bg-red-500';
    if (percent > 90) return 'bg-orange-500';
    if (percent > 75) return 'bg-amber-400';
    return 'bg-emerald-500';
  };

  const getStatusText = (percent: number) => {
    if (percent > 100) return { text: 'Exceeded', color: 'text-red-600', bg: 'bg-red-50' };
    if (percent > 90) return { text: 'Critical', color: 'text-orange-600', bg: 'bg-orange-50' };
    if (percent > 75) return { text: 'Warning', color: 'text-amber-600', bg: 'bg-amber-50' };
    return { text: 'Safe', color: 'text-emerald-600', bg: 'bg-emerald-50' };
  };

  // AI Insights Generation
  const insights = useMemo(() => {
    const alerts = [];
    liveBudgets.forEach(b => {
      const p = (b.spent_amount / b.limit_amount) * 100;
      if (p > 100) alerts.push(`Your ${b.name || b.category} Budget has exceeded by ${formatInr(b.spent_amount - b.limit_amount)}.`);
      else if (p > Number(b.alert_threshold || 75)) alerts.push(`Warning: You have used ${p.toFixed(0)}% of your ${b.name || b.category} Budget.`);
    });
    if (alerts.length === 0 && liveBudgets.length > 0) alerts.push("Great job! All your budgets are currently in the safe zone.");
    if (liveBudgets.length === 0) alerts.push("Create your first budget to start getting AI insights.");
    return alerts;
  }, [liveBudgets]);

  // Chart Data preparation
  const categoryDistribution = liveBudgets.map(b => ({ name: b.category, value: b.spent_amount, color: b.color || getCategoryStyles(b.category).color })).filter(c => c.value > 0);
  const trendData = liveBudgets.map(b => ({ name: b.category.split(' ')[0], budget: Number(b.limit_amount), actual: b.spent_amount }));

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading Budgets...</div>;
  }

  return (
    <div className="space-y-6 pb-20 relative min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Budgets</h1>
          <p className="text-slate-500">Plan and control your spending efficiently.</p>
        </div>
        <button onClick={() => openModal()} className="px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" /> Create Budget
        </button>
      </div>

      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm font-medium text-slate-500 mb-1">Total Monthly Budget</p>
            <h4 className="text-2xl font-bold text-slate-900">{formatInr(totalAllocated)}</h4>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm font-medium text-slate-500 mb-1">Total Amount Spent</p>
            <h4 className="text-2xl font-bold text-slate-900">{formatInr(totalSpent)}</h4>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm font-medium text-slate-500 mb-1">Remaining Budget</p>
            <h4 className="text-2xl font-bold text-slate-900">{formatInr(totalRemaining > 0 ? totalRemaining : 0)}</h4>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm font-medium text-slate-500 mb-1">Budget Utilization</p>
            <h4 className="text-2xl font-bold text-slate-900">{overallUtilization.toFixed(1)}%</h4>
            <div className="mt-2 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${getStatusColor(overallUtilization)}`} style={{width: `${Math.min(overallUtilization, 100)}%`}}></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column: Category Budgets & Simulator */}
        <div className="xl:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Category Budgets</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {liveBudgets.length > 0 ? liveBudgets.map((b) => {
              const percent = (b.spent_amount / b.limit_amount) * 100;
              const status = getStatusText(percent);
              const isExceeded = percent > 100;
              const styles = getCategoryStyles(b.category);
              
              return (
                <Card key={b.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-slate-50 border border-slate-100" style={{ color: b.color || styles.color }}>
                          {React.createElement(styles.icon, { className: 'w-5 h-5' })}
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900">{b.name || b.category}</h4>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide ${status.bg} ${status.color}`}>
                            {status.text}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 hover:opacity-100 transition-opacity" style={{opacity: 1}}>
                        <button onClick={() => openModal(b)} className="p-1.5 text-slate-400 hover:text-primary hover:bg-slate-50 rounded"><Edit3 className="w-4 h-4"/></button>
                        <button onClick={() => handleDelete(b.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4"/></button>
                      </div>
                    </div>
                    
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Spent: <span className="font-semibold text-slate-900">{formatInr(b.spent_amount)}</span></span>
                        <span className="text-slate-500">Limit: <span className="font-medium">{formatInr(b.limit_amount)}</span></span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${getStatusColor(percent)}`} style={{width: `${Math.min(percent, 100)}%`, backgroundColor: percent <= 75 ? (b.color || styles.color) : undefined }}></div>
                      </div>
                      <div className="flex justify-between text-xs mt-1">
                        <span className={isExceeded ? 'text-red-500 font-medium' : 'text-slate-500'}>
                          {isExceeded ? `Exceeded by ${formatInr(b.spent_amount - b.limit_amount)}` : `${formatInr(b.limit_amount - b.spent_amount)} remaining`}
                        </span>
                        <span className="font-bold text-slate-700">{percent.toFixed(0)}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            }) : (
              <div className="col-span-1 md:col-span-2 p-10 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
                <Target className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-slate-900 mb-1">No Budgets Created</h3>
                <p className="text-slate-500 text-sm mb-4">Create your first budget to start tracking your spending.</p>
                <button onClick={() => openModal()} className="px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors inline-flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Create Budget
                </button>
              </div>
            )}
          </div>

          {/* What-If Simulator */}
          {liveBudgets.length > 0 && (
            <Card className="border-indigo-100">
              <CardHeader className="bg-indigo-50/50 border-b border-indigo-100">
                <CardTitle className="flex items-center gap-2 text-indigo-900">
                  <Sliders className="w-5 h-5 text-indigo-600" />
                  What-If Simulator
                </CardTitle>
                <p className="text-sm text-indigo-600/80 mt-1">Adjust limits to preview your projected savings</p>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    {liveBudgets.map(b => (
                      <div key={b.id}>
                        <div className="flex justify-between text-sm mb-1.5">
                          <span className="font-medium text-slate-700">{b.name || b.category}</span>
                          <span className="text-slate-600 font-bold">{formatInr(simulatedLimits[b.id] || 0)}</span>
                        </div>
                        <input 
                          type="range" min="0" max={Math.max(b.limit_amount * 2, b.spent_amount * 2, 50000)} step="500"
                          value={simulatedLimits[b.id] || 0}
                          onChange={(e) => setSimulatedLimits({...simulatedLimits, [b.id]: Number(e.target.value)})}
                          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="bg-slate-900 rounded-xl p-6 text-white flex flex-col justify-center">
                    <h4 className="text-slate-400 text-sm mb-1">Projected Total Budget</h4>
                    <p className="text-3xl font-bold mb-4">{formatInr(simulatedTotalAllocated)}</p>
                    
                    <div className="space-y-3 pt-4 border-t border-slate-700">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Total Spent</span>
                        <span className="font-medium text-white">{formatInr(totalSpent)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Projected Remaining</span>
                        <span className={`font-medium ${simulatedRemaining < 0 ? 'text-red-400' : 'text-emerald-400'}`}>{formatInr(simulatedRemaining)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Projected Utilization</span>
                        <span className="font-medium text-white">{simulatedUtilization.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Analytics Charts */}
          {liveBudgets.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Budget vs Actual Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full">
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(value) => `₹${(value/1000).toFixed(0)}k`} />
                      <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
                      <Bar dataKey="budget" name="Budget Limit" fill="#94A3B8" radius={[4, 4, 0, 0]} maxBarSize={40} />
                      <Bar dataKey="actual" name="Actual Spent" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: AI Coach & Analytics */}
        <div className="space-y-6">
          {/* AI Coach Widget */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 shadow-sm relative overflow-hidden text-slate-800 border border-indigo-100">
            <div className="absolute -right-4 -top-4 opacity-10">
              <Bot className="w-32 h-32 text-indigo-600" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center border border-indigo-200">
                  <Bot className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-indigo-900">AI Budget Coach</h3>
                  <p className="text-xs text-indigo-600 font-medium">Live Insights</p>
                </div>
              </div>
              
              <div className="space-y-3">
                {insights.map((msg, i) => (
                  <div key={i} className="bg-white p-3 rounded-lg border border-indigo-50 shadow-sm">
                    <p className="text-sm flex items-start gap-2">
                      {msg.includes('exceeded') ? <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" /> : 
                       msg.includes('Warning') ? <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" /> : 
                       <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />}
                      <span>{msg.replace('Warning: ', '')}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Spending Distribution */}
          {categoryDistribution.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Spending Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[220px] w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={categoryDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={2} dataKey="value" stroke="none">
                        {categoryDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} formatter={(value: number) => formatInr(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 mt-2">
                  {categoryDistribution.slice(0, 5).map((c, i) => (
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h2 className="text-lg font-bold text-slate-900">{editingBudget ? 'Edit Budget' : 'Create Budget'}</h2>
                <button onClick={closeModal} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
              </div>
              
              <div className="p-6 overflow-y-auto">
                <form id="budget-form" onSubmit={handleSave} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Budget Name (Optional)</label>
                    <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="e.g. Vacation Food" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Category *</label>
                      <select required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value, color: getCategoryStyles(e.target.value).color})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white">
                        {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Monthly Limit (₹) *</label>
                      <input required type="number" value={formData.allocated} onChange={e => setFormData({...formData, allocated: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="e.g. 15000" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Start Date (Optional)</label>
                      <input type="date" value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">End Date (Optional)</label>
                      <input type="date" value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Alert Threshold (%)</label>
                    <input type="number" min="1" max="100" value={formData.alert_threshold} onChange={e => setFormData({...formData, alert_threshold: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="e.g. 75" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Notes</label>
                    <textarea rows={2} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="Any additional notes..." />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Theme Color</label>
                    <div className="flex flex-wrap gap-2">
                      {presetColors.map(c => (
                        <button 
                          key={c} type="button" onClick={() => setFormData({...formData, color: c})}
                          className={`w-8 h-8 rounded-full border-2 transition-transform ${formData.color === c ? 'border-slate-900 scale-110' : 'border-transparent hover:scale-105'}`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                </form>
              </div>

              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-slate-700 font-medium hover:bg-slate-100 rounded-lg transition-colors text-sm">Cancel</button>
                <button type="submit" form="budget-form" className="px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors text-sm">
                  {editingBudget ? 'Save Changes' : 'Create Budget'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={confirmState.isOpen}
        title="Delete Budget"
        message="Are you sure you want to delete this budget?"
        confirmText="Delete"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmState({ isOpen: false, id: null })}
      />
    </div>
  );
}
