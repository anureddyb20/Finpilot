import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { 
  ArrowUpRight, ArrowDownRight, Plus, AlertTriangle, 
  Bot, Edit3, Trash2, X, Target, CalendarDays, PieChart as PieChartIcon, CheckCircle2, TrendingDown,
  ShoppingBag, Utensils, Home, Zap, HeartPulse, GraduationCap, Car, Briefcase
} from 'lucide-react';
import { BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

const formatInr = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// --- Mock Data ---
const initialBudgets = [
  { id: '1', category: 'Food & Dining', icon: Utensils, allocated: 15000, spent: 12500, color: '#3B82F6' },
  { id: '2', category: 'Rent & Housing', icon: Home, allocated: 25000, spent: 25000, color: '#10B981' },
  { id: '3', category: 'Shopping', icon: ShoppingBag, allocated: 10000, spent: 11200, color: '#EF4444' }, // Exceeded
  { id: '4', category: 'Transport', icon: Car, allocated: 5000, spent: 2500, color: '#F59E0B' },
  { id: '5', category: 'Bills & Utilities', icon: Zap, allocated: 4500, spent: 3450, color: '#8B5CF6' },
  { id: '6', category: 'Healthcare', icon: HeartPulse, allocated: 3000, spent: 1500, color: '#14B8A6' },
];

const trendData = [
  { name: 'Week 1', budget: 15000, actual: 12000 },
  { name: 'Week 2', budget: 30000, actual: 28000 },
  { name: 'Week 3', budget: 45000, actual: 47000 },
  { name: 'Week 4', budget: 62500, actual: 56150 },
];

const categoryDistribution = initialBudgets.map(b => ({ name: b.category, value: b.spent, color: b.color }));
const allCategories = ['Food & Dining', 'Rent & Housing', 'Shopping', 'Transport', 'Bills & Utilities', 'Healthcare', 'Entertainment', 'Education', 'Insurance', 'Business', 'Others'];
const presetColors = ['#3B82F6', '#10B981', '#EF4444', '#F59E0B', '#8B5CF6', '#14B8A6', '#EC4899', '#6366F1'];

export function Budgets() {
  const [budgets, setBudgets] = useState(initialBudgets);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<any>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    category: 'Entertainment', allocated: '', color: '#3B82F6', duration: 'Monthly'
  });

  const totalAllocated = budgets.reduce((acc, curr) => acc + curr.allocated, 0);
  const totalSpent = budgets.reduce((acc, curr) => acc + curr.spent, 0);
  const totalRemaining = totalAllocated - totalSpent;
  const overallUtilization = (totalSpent / totalAllocated) * 100;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBudget) {
      setBudgets(budgets.map(b => b.id === editingBudget.id ? { ...b, category: formData.category, allocated: Number(formData.allocated), color: formData.color } : b));
    } else {
      const newB = {
        id: Math.random().toString(),
        category: formData.category,
        icon: Target, 
        allocated: Number(formData.allocated),
        spent: 0,
        color: formData.color
      };
      setBudgets([...budgets, newB]);
    }
    closeModal();
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this budget?")) {
      setBudgets(budgets.filter(b => b.id !== id));
    }
  };

  const openModal = (budget?: any) => {
    if (budget) {
      setEditingBudget(budget);
      setFormData({ category: budget.category, allocated: budget.allocated.toString(), color: budget.color, duration: 'Monthly' });
    } else {
      setEditingBudget(null);
      setFormData({ category: 'Entertainment', allocated: '', color: '#3B82F6', duration: 'Monthly' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const getStatusColor = (percent: number) => {
    if (percent > 100) return 'bg-red-500';
    if (percent > 90) return 'bg-orange-500';
    if (percent > 70) return 'bg-amber-400';
    return 'bg-emerald-500';
  };

  const getStatusText = (percent: number) => {
    if (percent > 100) return { text: 'Exceeded', color: 'text-red-600', bg: 'bg-red-50' };
    if (percent > 90) return { text: 'Critical', color: 'text-orange-600', bg: 'bg-orange-50' };
    if (percent > 70) return { text: 'Warning', color: 'text-amber-600', bg: 'bg-amber-50' };
    return { text: 'Safe', color: 'text-emerald-600', bg: 'bg-emerald-50' };
  };

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
            <div className="mt-2 flex items-center text-sm font-medium text-slate-500">
              <span className="text-emerald-600 flex items-center mr-1"><ArrowUpRight className="w-4 h-4"/> 4%</span> vs last month
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm font-medium text-slate-500 mb-1">Total Amount Spent</p>
            <h4 className="text-2xl font-bold text-slate-900">{formatInr(totalSpent)}</h4>
            <div className="mt-2 flex items-center text-sm font-medium text-slate-500">
              <span className="text-emerald-600 flex items-center mr-1"><TrendingDown className="w-4 h-4"/> 12%</span> vs last month
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm font-medium text-slate-500 mb-1">Remaining Budget</p>
            <h4 className="text-2xl font-bold text-slate-900">{formatInr(totalRemaining > 0 ? totalRemaining : 0)}</h4>
            <div className="mt-2 flex items-center text-sm font-medium text-slate-500">
              <span className="text-emerald-600 flex items-center mr-1"><ArrowUpRight className="w-4 h-4"/> 15%</span> vs last month
            </div>
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
        {/* Left Column: Category Budgets */}
        <div className="xl:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Category Budgets</h3>
            <button className="text-sm font-medium text-primary hover:text-primary/80">View All</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {budgets.map((b) => {
              const percent = (b.spent / b.allocated) * 100;
              const status = getStatusText(percent);
              const isExceeded = percent > 100;
              
              return (
                <Card key={b.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-slate-50 border border-slate-100" style={{ color: b.color }}>
                          {<b.icon className="w-5 h-5" />}
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900">{b.category}</h4>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide ${status.bg} ${status.color}`}>
                            {status.text}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 hover:opacity-100 transition-opacity" style={{opacity: 1}}> {/* Kept visible for UI demo */}
                        <button onClick={() => openModal(b)} className="p-1.5 text-slate-400 hover:text-primary hover:bg-slate-50 rounded"><Edit3 className="w-4 h-4"/></button>
                        <button onClick={() => handleDelete(b.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4"/></button>
                      </div>
                    </div>
                    
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Spent: <span className="font-semibold text-slate-900">{formatInr(b.spent)}</span></span>
                        <span className="text-slate-500">Budget: <span className="font-medium">{formatInr(b.allocated)}</span></span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${getStatusColor(percent)}`} style={{width: `${Math.min(percent, 100)}%`}}></div>
                      </div>
                      <div className="flex justify-between text-xs mt-1">
                        <span className={isExceeded ? 'text-red-500 font-medium' : 'text-slate-500'}>
                          {isExceeded ? `Exceeded by ${formatInr(b.spent - b.allocated)}` : `${formatInr(b.allocated - b.spent)} remaining`}
                        </span>
                        <span className="font-bold text-slate-700">{percent.toFixed(0)}%</span>
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
              <CardTitle>Budget vs Actual Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(value) => `₹${value/1000}k`} />
                    <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
                    <Bar dataKey="budget" name="Budget" fill="#94A3B8" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    <Bar dataKey="actual" name="Actual Spent" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
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
                <div className="bg-white p-3 rounded-lg border border-indigo-50 shadow-sm">
                  <p className="text-sm flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <span>Your <strong>Shopping Budget</strong> has exceeded by ₹1,200. Avoid non-essential purchases this week.</span>
                  </p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-indigo-50 shadow-sm">
                  <p className="text-sm flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>You have kept Food spending 15% lower than average!</span>
                  </p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-indigo-50 shadow-sm">
                  <p className="text-sm flex items-start gap-2">
                    <PieChartIcon className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <span>Consider re-allocating ₹2,000 from Transport to Shopping to balance out your overspending.</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Spending Distribution */}
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
                {categoryDistribution.slice(0, 4).map((c, i) => (
                  <div key={i} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: c.color}}></div>
                      <span className="text-slate-600">{c.name}</span>
                    </div>
                    <span className="font-semibold text-slate-900">{formatInr(c.value)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions List */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <button onClick={() => openModal()} className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700">
                <span className="flex items-center gap-2"><Plus className="w-4 h-4 text-primary" /> Create Budget</span>
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
              </button>
              <button className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700">
                <span className="flex items-center gap-2"><CalendarDays className="w-4 h-4 text-primary" /> Budget Calendar</span>
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
              </button>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={closeModal}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h2 className="text-lg font-bold text-slate-900">{editingBudget ? 'Edit Budget' : 'Create Budget'}</h2>
                <button onClick={closeModal} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
              </div>
              
              <div className="p-6 overflow-y-auto">
                <form id="budget-form" onSubmit={handleSave} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Category *</label>
                    <select required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary">
                      {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Budget Amount (₹) *</label>
                    <input required type="number" value={formData.allocated} onChange={e => setFormData({...formData, allocated: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="e.g. 15000" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Duration</label>
                    <select value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary">
                      <option>Monthly</option>
                      <option>Weekly</option>
                      <option>Yearly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Category Color</label>
                    <div className="flex gap-2">
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
    </div>
  );
}
