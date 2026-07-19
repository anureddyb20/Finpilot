import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { 
  ArrowUpRight, ArrowDownRight, Plus, Bot, Edit3, Trash2, X, CalendarDays, 
  CreditCard, Tv, Zap, Wifi, Droplet, Smartphone, Shield, Car, Home, 
  Briefcase, Activity, CheckCircle2, Clock, AlertTriangle, RefreshCw, BarChart2, PieChart as PieChartIcon
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

const formatInr = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// --- Mock Data ---
const initialRecurring = [
  { id: '1', name: 'Netflix', category: 'OTT Platforms', icon: Tv, amount: 649, frequency: 'Monthly', nextDue: '2026-07-20', status: 'Upcoming', autoDebit: true, method: 'UPI', color: '#EF4444' },
  { id: '2', name: 'Spotify', category: 'Subscriptions', icon: Smartphone, amount: 119, frequency: 'Monthly', nextDue: '2026-07-25', status: 'Upcoming', autoDebit: true, method: 'Credit Card', color: '#10B981' },
  { id: '3', name: 'Electricity Bill', category: 'Electricity', icon: Zap, amount: 2450, frequency: 'Monthly', nextDue: '2026-07-15', status: 'Paid', autoDebit: false, method: 'Net Banking', color: '#F59E0B' },
  { id: '4', name: 'Amazon Prime', category: 'OTT Platforms', icon: Tv, amount: 1499, frequency: 'Yearly', nextDue: '2026-11-10', status: 'Upcoming', autoDebit: true, method: 'Credit Card', color: '#3B82F6' },
];

const initialEmis = [
  { id: 'e1', name: 'Car Loan', emi: 12500, interest: '8.5%', remainingAmount: 450000, remainingMonths: 36, progress: 45, icon: Car },
  { id: 'e2', name: 'Home Loan', emi: 35000, interest: '7.2%', remainingAmount: 3500000, remainingMonths: 100, progress: 30, icon: Home },
];

const initialSips = [
  { id: 's1', name: 'Nifty 50 Index Fund', amount: 5000, nextDate: '2026-08-05', totalInvested: 150000, currentValue: 185000, icon: Activity },
  { id: 's2', name: 'Small Cap Fund', amount: 2000, nextDate: '2026-08-10', totalInvested: 48000, currentValue: 62000, icon: BarChart2 },
];

const initialInsurances = [
  { id: 'i1', name: 'Health Insurance', premium: 18000, nextDate: '2026-12-01', provider: 'HDFC Ergo', icon: Shield },
];

const expenseTrendData = [
  { month: 'Jan', amount: 18500 },
  { month: 'Feb', amount: 19000 },
  { month: 'Mar', amount: 18800 },
  { month: 'Apr', amount: 21500 },
  { month: 'May', amount: 22000 },
  { month: 'Jun', amount: 21800 },
];

const allCategories = ['Subscriptions', 'Rent', 'Electricity', 'Water', 'Internet', 'Mobile Recharge', 'Gas', 'Insurance', 'Loan EMI', 'Mutual Fund SIP', 'OTT Platforms', 'Gym Membership', 'Others'];
const frequencies = ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Half-Yearly', 'Yearly'];
const presetColors = ['#EF4444', '#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#14B8A6', '#EC4899', '#6366F1'];

export function RecurringPayments() {
  const [payments, setPayments] = useState(initialRecurring);
  
  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'All' | 'Bills' | 'EMI' | 'SIP' | 'Insurance'>('All');
  
  // Form State
  const [formData, setFormData] = useState({
    name: '', category: 'Subscriptions', amount: '', frequency: 'Monthly', nextDue: '', method: 'UPI', autoDebit: true, reminder: '3 Days Before', color: '#3B82F6'
  });

  const monthlyCost = payments.filter(p => p.frequency === 'Monthly').reduce((acc, curr) => acc + curr.amount, 0) + 
                      initialEmis.reduce((acc, curr) => acc + curr.emi, 0) +
                      initialSips.reduce((acc, curr) => acc + curr.amount, 0);
                      
  const annualCost = (monthlyCost * 12) + payments.filter(p => p.frequency === 'Yearly').reduce((acc, curr) => acc + curr.amount, 0) + initialInsurances.reduce((acc, curr) => acc + curr.premium, 0);

  const categoryDistribution = Object.entries(
    payments.reduce((acc, curr) => {
      const annual = curr.frequency === 'Monthly' ? curr.amount * 12 : curr.frequency === 'Yearly' ? curr.amount : curr.amount * 4;
      acc[curr.category] = (acc[curr.category] || 0) + annual;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value], idx) => ({ name, value, color: presetColors[idx % presetColors.length] }));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPayment) {
      setPayments(payments.map(p => p.id === editingPayment.id ? { 
        ...p, ...formData, amount: Number(formData.amount) 
      } : p));
    } else {
      const newP = {
        id: Math.random().toString(),
        icon: CreditCard, 
        status: 'Upcoming',
        ...formData,
        amount: Number(formData.amount)
      };
      setPayments([...payments, newP]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to permanently delete this recurring payment?")) {
      setPayments(payments.filter(p => p.id !== id));
    }
  };

  const openModal = (payment?: any) => {
    if (payment) {
      setEditingPayment(payment);
      setFormData({ 
        name: payment.name, category: payment.category, amount: payment.amount.toString(), 
        frequency: payment.frequency, nextDue: payment.nextDue, method: payment.method, 
        autoDebit: payment.autoDebit, reminder: '3 Days Before', color: payment.color || '#3B82F6'
      });
    } else {
      setEditingPayment(null);
      setFormData({ name: '', category: 'Subscriptions', amount: '', frequency: 'Monthly', nextDue: '', method: 'UPI', autoDebit: true, reminder: '3 Days Before', color: '#3B82F6' });
    }
    setIsModalOpen(true);
  };

  const renderStatusBadge = (status: string) => {
    switch(status) {
      case 'Upcoming': return <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center gap-1"><Clock className="w-3 h-3"/> Upcoming</span>;
      case 'Paid': return <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Paid</span>;
      case 'Overdue': return <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> Overdue</span>;
      default: return null;
    }
  };

  return (
    <div className="space-y-6 pb-20 relative min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Recurring Payments</h1>
          <p className="text-slate-500">Manage subscriptions, bills, EMIs, and SIPs.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-2">
            <CalendarDays className="w-4 h-4" /> Calendar
          </button>
          <button onClick={() => openModal()} className="px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Payment
          </button>
        </div>
      </div>

      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm font-medium text-slate-500 mb-1">Monthly Cost</p>
            <h4 className="text-2xl font-bold text-slate-900">{formatInr(monthlyCost)}</h4>
            <div className="mt-2 flex items-center text-sm font-medium text-slate-500">
              <span className="text-red-600 flex items-center mr-1"><ArrowUpRight className="w-4 h-4"/> 4%</span> vs last month
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm font-medium text-slate-500 mb-1">Upcoming Payments</p>
            <h4 className="text-2xl font-bold text-slate-900">4</h4>
            <div className="mt-2 flex items-center text-sm font-medium text-slate-500">
              <span className="text-slate-600 flex items-center mr-1"><Clock className="w-4 h-4"/> Next 7 days</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm font-medium text-slate-500 mb-1">Active Subscriptions</p>
            <h4 className="text-2xl font-bold text-slate-900">6</h4>
            <div className="mt-2 flex items-center text-sm font-medium text-slate-500">
              <span className="text-emerald-600 flex items-center mr-1"><ArrowDownRight className="w-4 h-4"/> 1</span> cancelled recently
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm font-medium text-slate-500 mb-1">Annual Projections</p>
            <h4 className="text-2xl font-bold text-slate-900">{formatInr(annualCost)}</h4>
            <div className="mt-2 flex items-center text-sm font-medium text-slate-500">
              <span className="text-emerald-600 flex items-center mr-1"><Shield className="w-4 h-4"/></span> Fully Tracked
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column: Trackers */}
        <div className="xl:col-span-2 space-y-6">
          
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {['All', 'Bills', 'EMI', 'SIP', 'Insurance'].map(tab => (
              <button 
                key={tab} onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${activeTab === tab ? 'bg-primary text-white' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          {(activeTab === 'All' || activeTab === 'Bills') && (
            <Card>
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="text-lg">Bills & Subscriptions</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-100">
                  {payments.map(p => (
                    <div key={p.id} className="p-5 hover:bg-slate-50 transition-colors group">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-slate-100" style={{ color: p.color }}>
                            <p.icon className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900">{p.name}</h4>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs font-medium text-slate-500">
                              <span className="flex items-center gap-1"><RefreshCw className="w-3 h-3"/> {p.frequency}</span>
                              <span className="flex items-center gap-1"><CreditCard className="w-3 h-3"/> {p.method}</span>
                              {p.autoDebit && <span className="text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Auto Debit</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right hidden sm:block">
                            <p className="text-sm font-medium text-slate-500 mb-1">Next Due: {p.nextDue}</p>
                            {renderStatusBadge(p.status)}
                          </div>
                          <div className="text-right">
                            <h4 className="font-bold text-lg text-slate-900">{formatInr(p.amount)}</h4>
                            <div className="flex items-center justify-end gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => openModal(p)} className="p-1 text-slate-400 hover:text-primary"><Edit3 className="w-4 h-4"/></button>
                              <button onClick={() => handleDelete(p.id)} className="p-1 text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4"/></button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {(activeTab === 'All' || activeTab === 'EMI') && (
            <Card>
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="text-lg">Loan EMIs</CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-5">
                {initialEmis.map(e => (
                  <div key={e.id} className="border border-slate-200 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                          <e.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900">{e.name}</h4>
                          <p className="text-xs font-medium text-slate-500">{e.interest} Interest Rate</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <h4 className="font-bold text-slate-900">{formatInr(e.emi)}<span className="text-sm text-slate-500 font-normal">/mo</span></h4>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-700 mb-2">
                        <span>Paid: {e.progress}%</span>
                        <span>{e.remainingMonths} Months Left</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{width: `${e.progress}%`}}></div>
                      </div>
                      <p className="text-xs text-slate-500 mt-2 text-right">Remaining: {formatInr(e.remainingAmount)}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {(activeTab === 'All' || activeTab === 'SIP') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {initialSips.map(s => (
                <Card key={s.id} className="border border-slate-200 shadow-none">
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                        <s.icon className="w-5 h-5" />
                      </div>
                      <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded text-xs font-bold">SIP</span>
                    </div>
                    <h4 className="font-bold text-slate-900 mb-1">{s.name}</h4>
                    <p className="text-xl font-bold text-slate-900 mb-4">{formatInr(s.amount)}<span className="text-sm text-slate-500 font-normal">/mo</span></p>
                    <div className="space-y-2 border-t border-slate-100 pt-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Invested</span>
                        <span className="font-semibold text-slate-700">{formatInr(s.totalInvested)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Current Value</span>
                        <span className="font-semibold text-emerald-600">{formatInr(s.currentValue)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {(activeTab === 'All' || activeTab === 'Insurance') && (
            <Card>
              <CardContent className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Health Insurance</h4>
                    <p className="text-xs font-medium text-slate-500">HDFC Ergo • Yearly Premium</p>
                  </div>
                </div>
                <div className="text-right">
                  <h4 className="font-bold text-lg text-slate-900">{formatInr(18000)}</h4>
                  <p className="text-xs font-medium text-slate-500">Renews Dec 01, 2026</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Analytics Line Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Recurring Expense Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={expenseTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(value) => `₹${value/1000}k`} />
                    <Tooltip cursor={{stroke: '#e2e8f0', strokeWidth: 2}} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    <Line type="monotone" dataKey="amount" name="Expenses" stroke="#3B82F6" strokeWidth={3} dot={{r: 4, fill: '#3B82F6', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 6}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: AI Insights & Analytics */}
        <div className="space-y-6">
          {/* AI Insights Widget */}
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
                  <h3 className="font-bold text-lg text-indigo-900">AI Subscription Insights</h3>
                  <p className="text-xs text-indigo-600 font-medium">Smart Optimizer</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="bg-white p-3 rounded-lg border border-indigo-50 shadow-sm">
                  <p className="text-sm flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span>You currently spend <strong>₹2,850/month</strong> on subscriptions. Cancelling Amazon Prime would save ₹1,499/year.</span>
                  </p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-indigo-50 shadow-sm">
                  <p className="text-sm flex items-start gap-2">
                    <PieChartIcon className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <span>Your OTT subscriptions have increased by 28% this year. Consider downgrading Netflix to Mobile-only.</span>
                  </p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-indigo-50 shadow-sm">
                  <p className="text-sm flex items-start gap-2">
                    <Zap className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <span>Electricity bills are increasing every month. This is reducing your budget surplus for the Vacation Goal.</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Distribution Pie */}
          <Card>
            <CardHeader>
              <CardTitle>Annual Distribution</CardTitle>
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
              <div className="space-y-2 mt-4 max-h-[150px] overflow-y-auto pr-2">
                {categoryDistribution.map((c, i) => (
                  <div key={i} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-md" style={{backgroundColor: c.color}}></div>
                      <span className="text-slate-600 font-medium truncate max-w-[120px]">{c.name}</span>
                    </div>
                    <span className="font-bold text-slate-900">{formatInr(c.value)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* Add / Edit Recurring Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h2 className="text-lg font-bold text-slate-900">{editingPayment ? 'Edit Payment' : 'Add Recurring Payment'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
              </div>
              
              <div className="p-6 overflow-y-auto">
                <form id="recurring-form" onSubmit={handleSave} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Payment Name *</label>
                    <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="e.g. Netflix, Rent" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Amount (₹) *</label>
                      <input required type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="0" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Frequency</label>
                      <select value={formData.frequency} onChange={e => setFormData({...formData, frequency: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary">
                        {frequencies.map(f => <option key={f} value={f}>{f}</option>)}
                      </select>
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
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Payment Method</label>
                      <select value={formData.method} onChange={e => setFormData({...formData, method: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary">
                        <option>UPI</option>
                        <option>Credit Card</option>
                        <option>Debit Card</option>
                        <option>Net Banking</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Next Due Date</label>
                      <input required type="date" value={formData.nextDue} onChange={e => setFormData({...formData, nextDue: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Reminder Before</label>
                      <select value={formData.reminder} onChange={e => setFormData({...formData, reminder: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary">
                        <option>1 Day Before</option>
                        <option>2 Days Before</option>
                        <option>3 Days Before</option>
                        <option>1 Week Before</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <input type="checkbox" id="autoDebit" checked={formData.autoDebit} onChange={e => setFormData({...formData, autoDebit: e.target.checked})} className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary" />
                    <div>
                      <label htmlFor="autoDebit" className="text-sm font-bold text-slate-900 block">Auto Debit Enabled</label>
                      <span className="text-xs text-slate-500">Is this automatically deducted from your account?</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Badge Color</label>
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
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-700 font-medium hover:bg-slate-100 rounded-lg transition-colors text-sm">Cancel</button>
                <button type="submit" form="recurring-form" className="px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors text-sm">
                  {editingPayment ? 'Save Changes' : 'Add Payment'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
