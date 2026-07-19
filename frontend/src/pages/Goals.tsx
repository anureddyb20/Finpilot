import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { 
  ArrowUpRight, Plus, Bot, Edit3, Trash2, X, Target, 
  CalendarDays, CheckCircle2, TrendingUp, Wallet, Car, Home, 
  Briefcase, HeartPulse, GraduationCap, Plane, Laptop, Smartphone,
  Trophy, Star, Award
} from 'lucide-react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

const formatInr = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// --- Mock Data ---
const initialGoals = [
  { id: '1', name: 'Emergency Fund', category: 'Finance', icon: Wallet, target: 200000, saved: 120000, deadline: '2026-12-31', color: '#10B981', monthlyRequired: 10000, priority: 'High' },
  { id: '2', name: 'New Laptop', category: 'Electronics', icon: Laptop, target: 85000, saved: 60000, deadline: '2026-10-15', color: '#3B82F6', monthlyRequired: 8333, priority: 'Medium' },
  { id: '3', name: 'Bali Vacation', category: 'Travel', icon: Plane, target: 150000, saved: 45000, deadline: '2027-03-01', color: '#8B5CF6', monthlyRequired: 13125, priority: 'Low' },
  { id: '4', name: 'House Downpayment', category: 'Real Estate', icon: Home, target: 2500000, saved: 500000, deadline: '2029-01-01', color: '#F59E0B', monthlyRequired: 66666, priority: 'High' },
];

const savingsTrendData = [
  { month: 'Jan', savings: 45000 },
  { month: 'Feb', savings: 55000 },
  { month: 'Mar', savings: 62000 },
  { month: 'Apr', savings: 80000 },
  { month: 'May', savings: 95000 },
  { month: 'Jun', savings: 110000 },
  { month: 'Jul', savings: 125000 },
];

const categoryDistribution = initialGoals.map(g => ({ name: g.name, value: g.saved, color: g.color }));
const allCategories = ['Finance', 'Electronics', 'Travel', 'Real Estate', 'Vehicles', 'Education', 'Medical', 'Marriage', 'Retirement', 'Business', 'Others'];
const presetColors = ['#3B82F6', '#10B981', '#EF4444', '#F59E0B', '#8B5CF6', '#14B8A6', '#EC4899', '#6366F1'];

export function Goals() {
  const [goals, setGoals] = useState(initialGoals);
  
  // Modals state
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isAddMoneyModalOpen, setIsAddMoneyModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<any>(null);
  const [selectedGoalForMoney, setSelectedGoalForMoney] = useState<any>(null);
  const [addAmount, setAddAmount] = useState('');
  
  // Form State
  const [formData, setFormData] = useState({
    name: '', category: 'Finance', target: '', saved: '', deadline: '', priority: 'Medium', color: '#3B82F6', notes: ''
  });

  const totalTarget = goals.reduce((acc, curr) => acc + curr.target, 0);
  const totalSaved = goals.reduce((acc, curr) => acc + curr.saved, 0);
  const totalGoals = goals.length;
  const goalsAchieved = goals.filter(g => g.saved >= g.target).length;

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingGoal) {
      setGoals(goals.map(g => g.id === editingGoal.id ? { 
        ...g, 
        name: formData.name, 
        category: formData.category, 
        target: Number(formData.target), 
        saved: Number(formData.saved),
        deadline: formData.deadline,
        priority: formData.priority,
        color: formData.color 
      } : g));
    } else {
      const newG = {
        id: Math.random().toString(),
        name: formData.name,
        category: formData.category,
        icon: Target, 
        target: Number(formData.target),
        saved: Number(formData.saved) || 0,
        deadline: formData.deadline,
        color: formData.color,
        monthlyRequired: Math.floor(Number(formData.target) / 12),
        priority: formData.priority
      };
      setGoals([...goals, newG]);
    }
    closeModals();
  };

  const handleAddMoney = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedGoalForMoney) {
      setGoals(goals.map(g => g.id === selectedGoalForMoney.id ? { 
        ...g, 
        saved: g.saved + Number(addAmount) 
      } : g));
    }
    closeModals();
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to permanently delete this goal?")) {
      setGoals(goals.filter(g => g.id !== id));
    }
  };

  const openGoalModal = (goal?: any) => {
    if (goal) {
      setEditingGoal(goal);
      setFormData({ 
        name: goal.name, category: goal.category, target: goal.target.toString(), 
        saved: goal.saved.toString(), deadline: goal.deadline, priority: goal.priority, 
        color: goal.color, notes: '' 
      });
    } else {
      setEditingGoal(null);
      setFormData({ name: '', category: 'Finance', target: '', saved: '', deadline: '', priority: 'Medium', color: '#3B82F6', notes: '' });
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
            <h4 className="text-2xl font-bold text-slate-900">{totalGoals}</h4>
            <div className="mt-2 flex items-center text-sm font-medium text-slate-500">
              <span className="text-emerald-600 flex items-center mr-1"><ArrowUpRight className="w-4 h-4"/> 1</span> vs last month
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm font-medium text-slate-500 mb-1">Total Goal Value</p>
            <h4 className="text-2xl font-bold text-slate-900">{formatInr(totalTarget)}</h4>
            <div className="mt-2 flex items-center text-sm font-medium text-slate-500">
              <span className="text-emerald-600 flex items-center mr-1"><ArrowUpRight className="w-4 h-4"/> 12%</span> vs last month
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm font-medium text-slate-500 mb-1">Total Saved</p>
            <h4 className="text-2xl font-bold text-slate-900">{formatInr(totalSaved)}</h4>
            <div className="mt-2 flex items-center text-sm font-medium text-slate-500">
              <span className="text-emerald-600 flex items-center mr-1"><TrendingUp className="w-4 h-4"/> 8%</span> vs last month
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm font-medium text-slate-500 mb-1">Goals Achieved</p>
            <h4 className="text-2xl font-bold text-slate-900">{goalsAchieved}</h4>
            <div className="mt-2 flex items-center text-sm font-medium text-slate-500">
              <span className="text-emerald-600 flex items-center mr-1"><Trophy className="w-4 h-4"/> 1</span> lifetime
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column: Active Goals */}
        <div className="xl:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Active Goals</h3>
            <button className="text-sm font-medium text-primary hover:text-primary/80">View Timeline</button>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {goals.map((g) => {
              const percent = Math.min((g.saved / g.target) * 100, 100);
              const remaining = g.target - g.saved;
              
              return (
                <Card key={g.id} className="hover:shadow-md transition-all group overflow-hidden relative">
                  <div className="absolute top-0 left-0 w-1 h-full" style={{backgroundColor: g.color}}></div>
                  <CardContent className="p-5 pl-6">
                    <div className="flex flex-col md:flex-row justify-between gap-4 md:items-start mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-slate-50 shadow-sm" style={{ color: g.color }}>
                          {<g.icon className="w-6 h-6" />}
                        </div>
                        <div>
                          <h4 className="font-bold text-lg text-slate-900">{g.name}</h4>
                          <div className="flex items-center gap-2 text-xs font-medium mt-1">
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{g.category}</span>
                            <span className="text-slate-400 flex items-center gap-1"><CalendarDays className="w-3 h-3"/> {g.deadline}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => openAddMoneyModal(g)} className="px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg text-sm font-medium transition-colors">
                          Add Funds
                        </button>
                        <button onClick={() => openGoalModal(g)} className="p-1.5 text-slate-400 hover:text-primary hover:bg-slate-50 rounded-lg"><Edit3 className="w-4 h-4"/></button>
                        <button onClick={() => handleDelete(g.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4"/></button>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-end">
                        <div>
                          <span className="text-xs text-slate-500 block mb-0.5">Saved so far</span>
                          <span className="font-bold text-xl text-slate-900">{formatInr(g.saved)}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-slate-500 block mb-0.5">Target</span>
                          <span className="font-semibold text-slate-700">{formatInr(g.target)}</span>
                        </div>
                      </div>
                      
                      <div className="relative">
                        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }} 
                            animate={{ width: `${percent}%` }} 
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full rounded-full" 
                            style={{backgroundColor: g.color}}
                          ></motion.div>
                        </div>
                        {/* Milestone Markers */}
                        {[25, 50, 75].map(m => (
                          <div key={m} className="absolute top-0 h-3 w-0.5 bg-white/50" style={{left: `${m}%`}}></div>
                        ))}
                      </div>
                      
                      <div className="flex justify-between text-xs mt-1">
                        <span className="text-slate-500 font-medium">{percent.toFixed(0)}% Completed</span>
                        <span className="text-slate-500 font-medium">Req: {formatInr(g.monthlyRequired)}/mo</span>
                        <span className="font-medium text-slate-600">{formatInr(remaining > 0 ? remaining : 0)} remaining</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Analytics Charts */}
          <Card>
            <CardHeader>
              <CardTitle>Total Savings Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={savingsTrendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(value) => `₹${value/1000}k`} />
                    <Tooltip cursor={{stroke: '#e2e8f0', strokeWidth: 2}} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Line type="monotone" dataKey="savings" name="Total Saved" stroke="#10B981" strokeWidth={3} dot={{r: 4, fill: '#10B981', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 6}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
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
                <div className="bg-white p-3 rounded-lg border border-emerald-50 shadow-sm">
                  <p className="text-sm flex items-start gap-2">
                    <Star className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span>You have reached <strong>60%</strong> of your Emergency Fund! You are currently ahead of schedule.</span>
                  </p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-emerald-50 shadow-sm">
                  <p className="text-sm flex items-start gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <span>Increasing your monthly savings for the <strong>Laptop Goal</strong> by ₹2,000 will help you reach it 2 months earlier.</span>
                  </p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-emerald-50 shadow-sm">
                  <p className="text-sm flex items-start gap-2">
                    <Target className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>You saved ₹2,500 from your Food Budget last month. Would you like to allocate it to your Vacation Goal?</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Goal Distribution Pie */}
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
                {categoryDistribution.slice(0, 4).map((c, i) => (
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

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Achievements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <Award className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-amber-900">Savings Milestone</h4>
                  <p className="text-xs text-amber-700">Crossed ₹5,00,000 in total savings.</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100 opacity-60 grayscale">
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-slate-500" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-700">First Goal Completed</h4>
                  <p className="text-xs text-slate-500">Achieve 100% on any goal to unlock.</p>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* Add / Edit Goal Modal */}
      <AnimatePresence>
        {isGoalModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={closeModals}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
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
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Current Savings (₹)</label>
                      <input type="number" value={formData.saved} onChange={e => setFormData({...formData, saved: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="0" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
                      <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary">
                        {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Priority</label>
                      <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary">
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
                    <label className="block text-sm font-medium text-slate-700 mb-2">Goal Color</label>
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
                  Add Money
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
