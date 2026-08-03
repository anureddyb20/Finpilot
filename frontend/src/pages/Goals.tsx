import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { 
  Plus, Bot, Edit3, Trash2, X, Target, 
  CalendarDays, TrendingUp, Wallet, Home, Plane, Laptop,
  Trophy, Star, Award, Sliders
} from 'lucide-react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
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

const getGoalIcon = (category: string) => {
  const mapping: Record<string, any> = {
    'Finance': Wallet,
    'Emergency Fund': Wallet,
    'Electronics': Laptop,
    'Travel': Plane,
    'Real Estate': Home,
    'House': Home,
    'Vehicles': Trophy,
    'Car': Trophy,
    'Bike': Trophy,
    'Education': Star,
    'Medical': Award,
  };
  return mapping[category] || Target;
};

const allCategories = ['Emergency Fund', 'Vacation', 'Car', 'Bike', 'House', 'Laptop', 'Phone', 'Education', 'Wedding', 'Retirement', 'Investment', 'Business', 'Custom'];
const presetColors = ['#3B82F6', '#10B981', '#EF4444', '#F59E0B', '#8B5CF6', '#14B8A6', '#EC4899', '#6366F1'];

export function Goals() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modals state
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isAddMoneyModalOpen, setIsAddMoneyModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<any>(null);
  const [selectedGoalForMoney, setSelectedGoalForMoney] = useState<any>(null);
  const [addAmount, setAddAmount] = useState('');
  
  // Simulator State
  const [simulatedContributions, setSimulatedContributions] = useState<Record<string, number>>({});

  // Form State
  const [formData, setFormData] = useState({
    name: '', category: 'Emergency Fund', target: '', deadline: '', 
    priority: 'Medium', color: '#10B981', notes: '', monthly_contribution: ''
  });

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      const [goalsRes, txRes] = await Promise.all([
        supabase.from('goals').select('*').order('created_at', { ascending: false }),
        supabase.from('transactions').select('*').not('goal_id', 'is', null).is('deleted_at', null)
      ]);

      if (goalsRes.data) {
        setGoals(goalsRes.data);
        const sim: Record<string, number> = {};
        goalsRes.data.forEach(g => sim[g.id] = Number(g.monthly_contribution || 0));
        setSimulatedContributions(sim);
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
    const goalSub = supabase.channel('goal_changes').on('postgres_changes', { event: '*', schema: 'public', table: 'goals', filter: `user_id=eq.${user.id}` }, fetchData).subscribe();
    const txSub = supabase.channel('tx_changes_goals').on('postgres_changes', { event: '*', schema: 'public', table: 'transactions', filter: `user_id=eq.${user.id}` }, fetchData).subscribe();

    return () => {
      supabase.removeChannel(goalSub);
      supabase.removeChannel(txSub);
    };
  }, [user, fetchData]);

  // Derived Goals with live computed savings from transactions
  const liveGoals = useMemo(() => {
    return goals.map(g => {
      let saved = 0;
      transactions.forEach(t => {
        if (t.goal_id === g.id) {
          saved += Number(t.amount);
        }
      });
      return { ...g, saved_amount: saved };
    });
  }, [goals, transactions]);

  const totalTarget = liveGoals.reduce((acc, curr) => acc + Number(curr.target_amount), 0);
  const totalSaved = liveGoals.reduce((acc, curr) => acc + curr.saved_amount, 0);
  const totalGoalsCount = liveGoals.length;
  const goalsAchieved = liveGoals.filter(g => g.saved_amount >= g.target_amount).length;

  const handleSaveGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      const payload = {
        user_id: user.id,
        name: formData.name,
        category: formData.category,
        target_amount: Number(formData.target),
        target_date: formData.deadline || null,
        monthly_contribution: Number(formData.monthly_contribution) || 0,
        priority: formData.priority,
        color_theme: formData.color,
        notes: formData.notes,
        icon_name: formData.category
      };

      if (editingGoal) {
        await supabase.from('goals').update(payload).eq('id', editingGoal.id);
      } else {
        await supabase.from('goals').insert(payload);
      }
      closeModals();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddMoney = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedGoalForMoney) return;
    try {
      const today = new Date().toISOString().split('T')[0];
      await supabase.from('transactions').insert({
        user_id: user.id,
        goal_id: selectedGoalForMoney.id,
        amount: Number(addAmount),
        date: today,
        type: 'expense',
        category: 'Goal Contribution',
        payee: selectedGoalForMoney.name,
        payment_method: 'Transfer',
        notes: `Added funds to ${selectedGoalForMoney.name}`
      });
      closeModals();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to permanently delete this goal? All associated contribution records will remain in transactions but unlink from this goal.")) {
      await supabase.from('goals').delete().eq('id', id);
    }
  };

  const openGoalModal = (goal?: any) => {
    if (goal) {
      setEditingGoal(goal);
      setFormData({ 
        name: goal.name, category: goal.category || 'Custom', target: goal.target_amount.toString(), 
        deadline: goal.target_date || '', priority: goal.priority || 'Medium', 
        color: goal.color_theme || '#3B82F6', notes: goal.notes || '',
        monthly_contribution: goal.monthly_contribution?.toString() || ''
      });
    } else {
      setEditingGoal(null);
      setFormData({ 
        name: '', category: 'Emergency Fund', target: '', deadline: '', 
        priority: 'Medium', color: '#10B981', notes: '', monthly_contribution: '' 
      });
    }
    setIsGoalModalOpen(true);
  };

  const openAddMoneyModal = (goal: any) => {
    setSelectedGoalForMoney(goal);
    setAddAmount('');
    setIsAddMoneyModalOpen(true);
  };

  const closeModals = () => {
    setIsGoalModalOpen(false);
    setIsAddMoneyModalOpen(false);
  };

  // AI Insights Generation
  const insights = useMemo(() => {
    const alerts = [];
    liveGoals.forEach(g => {
      const p = (g.saved_amount / g.target_amount) * 100;
      if (p >= 100) alerts.push(`Congratulations! You have completed your ${g.name} goal!`);
      else if (p >= 80) alerts.push(`You are almost there! Only ${formatInr(g.target_amount - g.saved_amount)} left for ${g.name}.`);
      
      if (g.monthly_contribution > 0 && p < 100) {
        const remainingMonths = (g.target_amount - g.saved_amount) / g.monthly_contribution;
        const speedUpMonths = (g.target_amount - g.saved_amount) / (Number(g.monthly_contribution) + 2000);
        const savedTime = remainingMonths - speedUpMonths;
        if (savedTime >= 1) {
          alerts.push(`Increasing ${g.name} contribution by ₹2,000/mo finishes it ${Math.floor(savedTime)} months earlier.`);
        }
      }
    });
    if (alerts.length === 0 && liveGoals.length > 0) alerts.push("Keep contributing consistently to hit your targets faster.");
    if (liveGoals.length === 0) alerts.push("Create your first goal to start getting AI insights.");
    return alerts;
  }, [liveGoals]);

  // Chart Data preparation
  const categoryDistribution = liveGoals.map(g => ({ name: g.name, value: g.saved_amount, color: g.color_theme || '#3B82F6' })).filter(c => c.value > 0);
  
  // Cumulative Savings Trend
  const savingsTrendData = useMemo(() => {
    const months: Record<string, number> = {};
    let runningTotal = 0;
    
    // Sort transactions chronologically
    const sortedTx = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    sortedTx.forEach(t => {
      const d = new Date(t.date);
      const monthStr = d.toLocaleString('default', { month: 'short', year: '2-digit' });
      runningTotal += Number(t.amount);
      months[monthStr] = runningTotal;
    });

    return Object.entries(months).map(([month, savings]) => ({ month, savings }));
  }, [transactions]);

  // Calculate Forecast Completion Date
  const calculateForecastDate = (target: number, saved: number, monthly: number) => {
    if (saved >= target) return "Completed";
    if (!monthly || monthly <= 0) return "No Forecast";
    const remaining = target - saved;
    const monthsRemaining = Math.ceil(remaining / monthly);
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + monthsRemaining);
    return futureDate.toLocaleDateString('default', { month: 'long', year: 'numeric' });
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading Goals...</div>;
  }

  return (
    <div className="space-y-6 pb-20 relative min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Financial Goals</h1>
          <p className="text-slate-500">Plan, track, and achieve your financial milestones.</p>
        </div>
        <button onClick={() => openGoalModal()} className="px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" /> Create Goal
        </button>
      </div>

      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm font-medium text-slate-500 mb-1">Total Goals</p>
            <h4 className="text-2xl font-bold text-slate-900">{totalGoalsCount}</h4>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm font-medium text-slate-500 mb-1">Total Goal Value</p>
            <h4 className="text-2xl font-bold text-slate-900">{formatInr(totalTarget)}</h4>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm font-medium text-slate-500 mb-1">Total Saved</p>
            <h4 className="text-2xl font-bold text-slate-900">{formatInr(totalSaved)}</h4>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm font-medium text-slate-500 mb-1">Goals Achieved</p>
            <h4 className="text-2xl font-bold text-slate-900">{goalsAchieved}</h4>
            <div className="mt-2 flex items-center text-sm font-medium text-slate-500">
              <span className="text-emerald-600 flex items-center mr-1"><Trophy className="w-4 h-4"/></span> lifetime
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column: Active Goals & Simulator */}
        <div className="xl:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Active Goals</h3>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {liveGoals.length > 0 ? liveGoals.map((g) => {
              const percent = Math.min((g.saved_amount / g.target_amount) * 100, 100);
              const remaining = g.target_amount - g.saved_amount;
              const Icon = getGoalIcon(g.category || g.icon_name);
              
              return (
                <Card key={g.id} className="hover:shadow-md transition-all group overflow-hidden relative">
                  <div className="absolute top-0 left-0 w-1 h-full" style={{backgroundColor: g.color_theme || '#3B82F6'}}></div>
                  <CardContent className="p-5 pl-6">
                    <div className="flex flex-col md:flex-row justify-between gap-4 md:items-start mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-slate-50 shadow-sm" style={{ color: g.color_theme || '#3B82F6' }}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-bold text-lg text-slate-900">{g.name}</h4>
                          <div className="flex flex-wrap items-center gap-2 text-xs font-medium mt-1">
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{g.category || 'Custom'}</span>
                            {g.target_date && <span className="text-slate-400 flex items-center gap-1"><CalendarDays className="w-3 h-3"/> {new Date(g.target_date).toLocaleDateString()}</span>}
                            {g.priority === 'High' && <span className="text-red-500 font-bold px-1.5 py-0.5 bg-red-50 rounded text-[10px] uppercase">High Priority</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {percent < 100 && (
                          <button onClick={() => openAddMoneyModal(g)} className="px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg text-sm font-medium transition-colors">
                            Add Funds
                          </button>
                        )}
                        <button onClick={() => openGoalModal(g)} className="p-1.5 text-slate-400 hover:text-primary hover:bg-slate-50 rounded-lg"><Edit3 className="w-4 h-4"/></button>
                        <button onClick={() => handleDelete(g.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4"/></button>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-end">
                        <div>
                          <span className="text-xs text-slate-500 block mb-0.5">Saved so far</span>
                          <span className="font-bold text-xl text-slate-900">{formatInr(g.saved_amount)}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-slate-500 block mb-0.5">Target</span>
                          <span className="font-semibold text-slate-700">{formatInr(g.target_amount)}</span>
                        </div>
                      </div>
                      
                      <div className="relative">
                        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }} 
                            animate={{ width: `${percent}%` }} 
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full rounded-full" 
                            style={{backgroundColor: percent >= 100 ? '#10B981' : (g.color_theme || '#3B82F6')}}
                          ></motion.div>
                        </div>
                        {/* Milestone Markers */}
                        {[25, 50, 75].map(m => (
                          <div key={m} className="absolute top-0 h-3 w-0.5 bg-white/50" style={{left: `${m}%`}}></div>
                        ))}
                      </div>
                      
                      <div className="flex justify-between text-xs mt-1">
                        <span className="text-slate-500 font-medium">{percent.toFixed(0)}% Completed</span>
                        <span className="text-slate-500 font-medium">Contrb: {formatInr(g.monthly_contribution || 0)}/mo</span>
                        <span className="font-medium text-slate-600">{formatInr(remaining > 0 ? remaining : 0)} remaining</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            }) : (
              <div className="col-span-1 p-10 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
                <Target className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-slate-900 mb-1">No Goals Created</h3>
                <p className="text-slate-500 text-sm mb-4">Start your financial journey by creating your first savings goal.</p>
                <button onClick={() => openGoalModal()} className="px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors inline-flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Create Goal
                </button>
              </div>
            )}
          </div>

          {/* What-If Goal Simulator */}
          {liveGoals.length > 0 && (
            <Card className="border-emerald-100">
              <CardHeader className="bg-emerald-50/50 border-b border-emerald-100">
                <CardTitle className="flex items-center gap-2 text-emerald-900">
                  <Sliders className="w-5 h-5 text-emerald-600" />
                  What-If Forecast Simulator
                </CardTitle>
                <p className="text-sm text-emerald-600/80 mt-1">Adjust monthly contributions to instantly preview new completion dates</p>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  {liveGoals.filter(g => g.saved_amount < g.target_amount).map(g => (
                    <div key={g.id} className="border-b border-slate-100 pb-5 last:border-0 last:pb-0">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-slate-800">{g.name}</h4>
                          <p className="text-xs text-slate-500 mt-1">Simulated Contribution: <strong className="text-emerald-600">{formatInr(simulatedContributions[g.id] || 0)}/mo</strong></p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-500">Projected Completion</p>
                          <p className="font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded mt-1">
                            {calculateForecastDate(g.target_amount, g.saved_amount, simulatedContributions[g.id] || 0)}
                          </p>
                        </div>
                      </div>
                      <input 
                        type="range" min="0" max={Math.max(g.target_amount / 2, 50000)} step="500"
                        value={simulatedContributions[g.id] || 0}
                        onChange={(e) => setSimulatedContributions({...simulatedContributions, [g.id]: Number(e.target.value)})}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                      />
                    </div>
                  ))}
                  {liveGoals.filter(g => g.saved_amount < g.target_amount).length === 0 && (
                    <p className="text-sm text-slate-500 text-center py-4">All your goals are complete! No forecasts needed.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Analytics Charts */}
          {savingsTrendData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Cumulative Savings Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={savingsTrendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(value) => `₹${(value/1000).toFixed(0)}k`} />
                      <Tooltip cursor={{stroke: '#e2e8f0', strokeWidth: 2}} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                      <Line type="monotone" dataKey="savings" name="Total Saved" stroke="#10B981" strokeWidth={3} dot={{r: 4, fill: '#10B981', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 6}} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: AI Coach & Analytics */}
        <div className="space-y-6">
          {/* AI Goal Coach Widget */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 shadow-sm relative overflow-hidden text-slate-800 border border-emerald-100">
            <div className="absolute -right-4 -top-4 opacity-10">
              <Bot className="w-32 h-32 text-emerald-600" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center border border-emerald-200">
                  <Bot className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-emerald-900">AI Goal Coach</h3>
                  <p className="text-xs text-emerald-600 font-medium">Smart Insights</p>
                </div>
              </div>
              
              <div className="space-y-3">
                {insights.map((msg, idx) => (
                  <div key={idx} className="bg-white p-3 rounded-lg border border-emerald-50 shadow-sm">
                    <p className="text-sm flex items-start gap-2">
                      {msg.includes('Congratulations') ? <Trophy className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /> : 
                       msg.includes('Increasing') ? <TrendingUp className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" /> :
                       <Star className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />}
                      <span>{msg}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Goal Distribution Pie */}
          {categoryDistribution.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Goal Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[220px] w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={categoryDistribution} cx="50%" cy="50%" innerRadius={65} outerRadius={90} paddingAngle={2} dataKey="value" stroke="none">
                        {categoryDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} formatter={(value: number) => formatInr(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 mt-4">
                  {categoryDistribution.slice(0, 5).map((c, i) => (
                    <div key={i} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-md" style={{backgroundColor: c.color}}></div>
                        <span className="text-slate-600 font-medium">{c.name}</span>
                      </div>
                      <span className="font-bold text-slate-900">{formatInr(c.value)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Achievements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className={`flex items-center gap-3 p-3 rounded-lg border ${totalSaved > 0 ? 'bg-amber-50 border-amber-100' : 'bg-slate-50 border-slate-100 opacity-60 grayscale'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${totalSaved > 0 ? 'bg-amber-100' : 'bg-slate-200'}`}>
                  <Award className={`w-5 h-5 ${totalSaved > 0 ? 'text-amber-600' : 'text-slate-500'}`} />
                </div>
                <div>
                  <h4 className={`font-bold text-sm ${totalSaved > 0 ? 'text-amber-900' : 'text-slate-700'}`}>Saver Journey Started</h4>
                  <p className={`text-xs ${totalSaved > 0 ? 'text-amber-700' : 'text-slate-500'}`}>Made your first contribution.</p>
                </div>
              </div>
              <div className={`flex items-center gap-3 p-3 rounded-lg border ${goalsAchieved > 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100 opacity-60 grayscale'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${goalsAchieved > 0 ? 'bg-emerald-100' : 'bg-slate-200'}`}>
                  <Trophy className={`w-5 h-5 ${goalsAchieved > 0 ? 'text-emerald-600' : 'text-slate-500'}`} />
                </div>
                <div>
                  <h4 className={`font-bold text-sm ${goalsAchieved > 0 ? 'text-emerald-900' : 'text-slate-700'}`}>First Goal Completed</h4>
                  <p className={`text-xs ${goalsAchieved > 0 ? 'text-emerald-700' : 'text-slate-500'}`}>Achieve 100% on any goal to unlock.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add / Edit Goal Modal */}
      <AnimatePresence>
        {isGoalModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={closeModals}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h2 className="text-lg font-bold text-slate-900">{editingGoal ? 'Edit Goal' : 'Create New Goal'}</h2>
                <button onClick={closeModals} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
              </div>
              
              <div className="p-6 overflow-y-auto">
                <form id="goal-form" onSubmit={handleSaveGoal} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Goal Name *</label>
                    <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="e.g. Dream House" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Target Amount (₹) *</label>
                      <input required type="number" value={formData.target} onChange={e => setFormData({...formData, target: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="0" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Monthly Contrib. (₹)</label>
                      <input type="number" value={formData.monthly_contribution} onChange={e => setFormData({...formData, monthly_contribution: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="0" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
                      <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white">
                        {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Priority</label>
                      <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white">
                        <option>High</option>
                        <option>Medium</option>
                        <option>Low</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Target Date</label>
                    <input type="date" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Notes</label>
                    <textarea rows={2} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="Optional notes..." />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Goal Theme Color</label>
                    <div className="flex flex-wrap gap-3">
                      {presetColors.map(c => (
                        <button 
                          key={c} type="button" onClick={() => setFormData({...formData, color: c})}
                          className={`w-8 h-8 rounded-full border-2 transition-transform ${formData.color === c ? 'border-slate-900 scale-110 shadow-sm' : 'border-transparent hover:scale-105'}`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                </form>
              </div>

              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
                <button type="button" onClick={closeModals} className="px-4 py-2 text-slate-700 font-medium hover:bg-slate-100 rounded-lg transition-colors text-sm">Cancel</button>
                <button type="submit" form="goal-form" className="px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors text-sm">
                  {editingGoal ? 'Save Changes' : 'Create Goal'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Money Modal */}
      <AnimatePresence>
        {isAddMoneyModalOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={closeModals}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h2 className="text-lg font-bold text-slate-900">Add Funds</h2>
                <button onClick={closeModals} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
              </div>
              
              <div className="p-6 text-center">
                <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center bg-emerald-50 mb-3 text-emerald-500">
                  <Wallet className="w-6 h-6" />
                </div>
                <h3 className="font-medium text-slate-900 mb-1">Contributing to</h3>
                <p className="text-sm text-slate-500 font-semibold mb-6">{selectedGoalForMoney?.name}</p>
                
                <form id="add-money-form" onSubmit={handleAddMoney}>
                  <div className="relative mb-6">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">₹</span>
                    <input 
                      autoFocus required type="number" 
                      value={addAmount} 
                      onChange={e => setAddAmount(e.target.value)} 
                      className="w-full pl-8 pr-4 py-3 text-lg font-bold text-slate-900 border-2 border-slate-200 rounded-xl focus:ring-0 focus:border-primary text-center" 
                      placeholder="0" 
                    />
                  </div>
                  <div className="flex gap-2 justify-center mb-6">
                    {[1000, 5000, 10000].map(amt => (
                      <button key={amt} type="button" onClick={() => setAddAmount(amt.toString())} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm rounded-lg transition-colors">
                        +₹{amt}
                      </button>
                    ))}
                  </div>
                </form>
              </div>

              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
                <button type="button" onClick={closeModals} className="flex-1 py-2.5 text-slate-700 font-medium hover:bg-slate-100 rounded-xl transition-colors text-sm">Cancel</button>
                <button type="submit" form="add-money-form" className="flex-1 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-200 text-sm">
                  Transfer Money
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
