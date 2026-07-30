import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { 
  ArrowUpRight, ArrowDownRight, Plus, Bot, Edit3, Trash2, X, CalendarDays, 
  CreditCard, Tv, Zap, Wifi, Smartphone, Shield, Car, Home, 
  Activity, CheckCircle2, Clock, AlertTriangle, RefreshCw, BarChart2, PieChart as PieChartIcon,
  Calendar, Sparkles, CheckCircle, ChevronRight, ChevronLeft, Building2, Dumbbell, Server
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

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
  { id: '5', name: 'Gym Membership', category: 'Gym Membership', icon: Dumbbell, amount: 1200, frequency: 'Monthly', nextDue: '2026-08-01', status: 'Upcoming', autoDebit: true, method: 'UPI', color: '#8B5CF6' },
  { id: '6', name: 'Apartment Rent', category: 'Rent', icon: Building2, amount: 18000, frequency: 'Monthly', nextDue: '2026-08-05', status: 'Upcoming', autoDebit: false, method: 'Net Banking', color: '#14B8A6' },
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
  { id: 'i2', name: 'Term Life Insurance', premium: 12000, nextDate: '2027-01-15', provider: 'ICICI Prudential', icon: Shield },
];

const paymentHistory = [
  { id: 'h1', date: '2026-07-15', name: 'Electricity Bill', amount: 2450, method: 'Net Banking', status: 'Paid', ref: 'UPI/3196238491/Elect' },
  { id: 'h2', date: '2026-07-05', name: 'Apartment Rent', amount: 18000, method: 'Net Banking', status: 'Paid', ref: 'IMPS/318529384/Rent' },
  { id: 'h3', date: '2026-07-01', name: 'Gym Membership', amount: 1200, method: 'UPI', status: 'Paid', ref: 'UPI/318229384/Gym' },
  { id: 'h4', date: '2026-06-25', name: 'Spotify', amount: 119, method: 'Credit Card', status: 'Paid', ref: 'CC/AUTH/847293' },
  { id: 'h5', date: '2026-06-20', name: 'Netflix', amount: 649, method: 'UPI', status: 'Paid', ref: 'UPI/317529384/Netfl' },
];

const autoDetectTransactions = [
  { id: 'ad1', name: 'Jio Fiber', category: 'Internet', icon: Wifi, amount: 999, frequency: 'Monthly', lastPaid: '2026-07-03' },
  { id: 'ad2', name: 'Google One', category: 'Cloud Storage', icon: Server, amount: 1300, frequency: 'Yearly', lastPaid: '2025-08-14' },
];

const expenseTrendData = [
  { month: 'Jan', amount: 31500 },
  { month: 'Feb', amount: 32000 },
  { month: 'Mar', amount: 31800 },
  { month: 'Apr', amount: 34500 },
  { month: 'May', amount: 35000 },
  { month: 'Jun', amount: 34800 },
  { month: 'Jul', amount: 35200 },
];

const monthlyExpenseBarData = [
  { name: 'Rent', amount: 18000 },
  { name: 'EMI', amount: 47500 },
  { name: 'SIP', amount: 7000 },
  { name: 'Bills', amount: 3449 },
];

const allCategories = ['Subscriptions', 'Rent', 'Electricity', 'Water', 'Internet', 'Mobile Recharge', 'Gas', 'Insurance', 'Loan EMI', 'Home Loan', 'Car Loan', 'Education Loan', 'Mutual Fund SIP', 'Stocks SIP', 'Gym Membership', 'OTT Platforms', 'Cloud Storage', 'Software Licenses', 'Medical', 'Education', 'Others'];
const frequencies = ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Half-Yearly', 'Yearly', 'Custom'];
const presetColors = ['#EF4444', '#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#14B8A6', '#EC4899', '#6366F1', '#06B6D4', '#F43F5E'];

export function RecurringPayments() {
  const [payments, setPayments] = useState(initialRecurring);
  
  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'All' | 'Bills' | 'EMI' | 'SIP' | 'Insurance' | 'Calendar' | 'History'>('All');
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 6)); // July 2026
  
  // Form State
  const [formData, setFormData] = useState({
    name: '', category: 'Subscriptions', amount: '', frequency: 'Monthly', nextDue: '', method: 'UPI', autoDebit: true, reminder: '3 Days Before', color: '#3B82F6', notes: ''
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

  const openModal = (payment?: any, predefinedCategory?: string) => {
    if (payment) {
      setEditingPayment(payment);
      setFormData({ 
        name: payment.name, category: payment.category, amount: payment.amount.toString(), 
        frequency: payment.frequency, nextDue: payment.nextDue, method: payment.method, 
        autoDebit: payment.autoDebit, reminder: payment.reminder || '3 Days Before', color: payment.color || '#3B82F6', notes: payment.notes || ''
      });
    } else {
      setEditingPayment(null);
      setFormData({ name: '', category: predefinedCategory || 'Subscriptions', amount: '', frequency: 'Monthly', nextDue: '', method: 'UPI', autoDebit: true, reminder: '3 Days Before', color: '#3B82F6', notes: '' });
    }
    setIsModalOpen(true);
  };

  const renderStatusBadge = (status: string) => {
    switch(status) {
      case 'Upcoming': return <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center gap-1"><Clock className="w-3 h-3"/> Upcoming</span>;
      case 'Paid': return <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Paid</span>;
      case 'Overdue': return <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> Overdue</span>;
      case 'Cancelled': return <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1"><X className="w-3 h-3"/> Cancelled</span>;
      default: return null;
    }
  };

  // Generate days for Calendar View
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  return (
    <div className="space-y-6 pb-20 relative min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Recurring Payments</h1>
          <p className="text-slate-500">Manage subscriptions, bills, EMIs, and SIPs intelligently.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setActiveTab('Calendar')} className="px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-2">
            <CalendarDays className="w-4 h-4" /> Calendar
          </button>
          <button onClick={() => window.alert('Opening AI Advisor Chat')} className="px-4 py-2 bg-indigo-50 text-indigo-700 font-medium rounded-lg hover:bg-indigo-100 transition-colors flex items-center gap-2">
            <Bot className="w-4 h-4" /> Ask AI
          </button>
          <button onClick={() => openModal()} className="px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-sm">
            <Plus className="w-4 h-4" /> Add Payment
          </button>
        </div>
      </div>

      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <p className="text-sm font-medium text-slate-500 mb-1">Monthly Recurring Cost</p>
            <h4 className="text-2xl font-bold text-slate-900">{formatInr(monthlyCost)}</h4>
            <div className="mt-2 flex items-center text-sm font-medium text-slate-500">
              <span className="text-red-600 flex items-center mr-1"><ArrowUpRight className="w-4 h-4"/> 4%</span> vs last month
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <p className="text-sm font-medium text-slate-500 mb-1">Upcoming Payments</p>
            <h4 className="text-2xl font-bold text-slate-900">4</h4>
            <div className="mt-2 flex items-center text-sm font-medium text-slate-500">
              <span className="text-slate-600 flex items-center mr-1"><Clock className="w-4 h-4"/> Next 7 days</span>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <p className="text-sm font-medium text-slate-500 mb-1">Active Subscriptions</p>
            <h4 className="text-2xl font-bold text-slate-900">6</h4>
            <div className="mt-2 flex items-center text-sm font-medium text-slate-500">
              <span className="text-emerald-600 flex items-center mr-1"><ArrowDownRight className="w-4 h-4"/> 1</span> cancelled recently
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none">
          <CardContent className="p-5">
            <p className="text-sm font-medium text-slate-300 mb-1">Annual Subscription Cost</p>
            <h4 className="text-2xl font-bold text-white">{formatInr(annualCost)}</h4>
            <div className="mt-2 flex items-center text-sm font-medium text-slate-300">
              <span className="text-emerald-400 flex items-center mr-1"><Shield className="w-4 h-4"/></span> Tracked & Optimized
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column: Trackers */}
        <div className="xl:col-span-2 space-y-6">
          
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {['All', 'Bills', 'EMI', 'SIP', 'Insurance', 'Calendar', 'History'].map(tab => (
              <button 
                key={tab} onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${activeTab === tab ? 'bg-primary text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          {(activeTab === 'All' || activeTab === 'Bills') && (
            <Card>
              <CardHeader className="border-b border-slate-100 pb-4 flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Bills & Subscriptions</CardTitle>
                <div className="flex gap-2">
                  <button onClick={() => openModal(null, 'Subscriptions')} className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-md transition-colors"><Plus className="w-4 h-4" /></button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-100">
                  {payments.map(p => (
                    <div key={p.id} className="p-5 hover:bg-slate-50 transition-colors group">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-slate-100 shadow-sm" style={{ color: p.color }}>
                            <p.icon className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900">{p.name}</h4>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs font-medium text-slate-500">
                              <span className="flex items-center gap-1"><RefreshCw className="w-3 h-3"/> {p.frequency}</span>
                              <span className="flex items-center gap-1"><CreditCard className="w-3 h-3"/> {p.method}</span>
                              {p.autoDebit && <span className="text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-1"><Zap className="w-3 h-3"/>Auto Debit</span>}
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
                              <button onClick={() => openModal(p)} className="p-1.5 text-slate-400 hover:text-primary hover:bg-blue-50 rounded-md"><Edit3 className="w-4 h-4"/></button>
                              <button onClick={() => handleDelete(p.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md"><Trash2 className="w-4 h-4"/></button>
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
              <CardHeader className="border-b border-slate-100 pb-4 flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Loan EMIs</CardTitle>
                <button onClick={() => openModal(null, 'Loan EMI')} className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-md transition-colors"><Plus className="w-4 h-4" /></button>
              </CardHeader>
              <CardContent className="p-5 space-y-5">
                {initialEmis.map(e => (
                  <div key={e.id} className="border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-colors shadow-sm">
                    <div className="flex justify-between items-start mb-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                          <e.icon className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900">{e.name}</h4>
                          <p className="text-sm font-medium text-slate-500">{e.interest} Interest Rate</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <h4 className="font-bold text-lg text-slate-900">{formatInr(e.emi)}<span className="text-sm text-slate-500 font-normal">/mo</span></h4>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm font-bold text-slate-700 mb-2">
                        <span>Paid: {e.progress}%</span>
                        <span>{e.remainingMonths} Months Left</span>
                      </div>
                      <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full transition-all duration-1000" style={{width: `${e.progress}%`}}></div>
                      </div>
                      <div className="flex justify-between mt-2">
                        <p className="text-xs text-slate-500">Remaining: {formatInr(e.remainingAmount)}</p>
                        <p className="text-xs text-emerald-600 font-medium">Auto Debit Active</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {(activeTab === 'All' || activeTab === 'SIP') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {initialSips.map(s => (
                <Card key={s.id} className="border border-slate-200 shadow-sm hover:border-slate-300 transition-colors">
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                        <s.icon className="w-6 h-6" />
                      </div>
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">SIP</span>
                    </div>
                    <h4 className="font-bold text-slate-900 mb-1">{s.name}</h4>
                    <p className="text-2xl font-bold text-slate-900 mb-5">{formatInr(s.amount)}<span className="text-sm text-slate-500 font-normal">/mo</span></p>
                    <div className="space-y-3 border-t border-slate-100 pt-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Total Invested</span>
                        <span className="font-semibold text-slate-700">{formatInr(s.totalInvested)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Current Value</span>
                        <span className="font-bold text-emerald-600">{formatInr(s.currentValue)}</span>
                      </div>
                      <div className="flex justify-between text-xs mt-2 pt-2 border-t border-slate-50">
                        <span className="text-slate-400">Next Due: {s.nextDate}</span>
                        <span className="text-blue-600 font-medium flex items-center gap-1">View Goal <ArrowUpRight className="w-3 h-3"/></span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <div onClick={() => openModal(null, 'Mutual Fund SIP')} className="border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-500 hover:text-primary hover:border-primary hover:bg-primary/5 transition-all cursor-pointer min-h-[200px]">
                <Plus className="w-8 h-8 mb-2" />
                <span className="font-medium">Add New SIP</span>
              </div>
            </div>
          )}

          {(activeTab === 'All' || activeTab === 'Insurance') && (
            <Card>
               <CardHeader className="border-b border-slate-100 pb-4 flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Insurance Premiums</CardTitle>
                <button onClick={() => openModal(null, 'Insurance')} className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-md transition-colors"><Plus className="w-4 h-4" /></button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-100">
                  {initialInsurances.map((ins) => (
                    <div key={ins.id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                          <ins.icon className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900">{ins.name}</h4>
                          <p className="text-sm font-medium text-slate-500">{ins.provider} • Yearly</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <h4 className="font-bold text-lg text-slate-900">{formatInr(ins.premium)}</h4>
                        <p className="text-xs font-medium text-slate-500 mt-1">Renews {ins.nextDate}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'Calendar' && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
                <CardTitle>Payment Calendar</CardTitle>
                <div className="flex items-center gap-4">
                  <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="p-1 hover:bg-slate-100 rounded">
                    <ChevronLeft className="w-5 h-5 text-slate-600" />
                  </button>
                  <span className="font-bold text-slate-900 min-w-[100px] text-center">
                    {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </span>
                  <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="p-1 hover:bg-slate-100 rounded">
                    <ChevronRight className="w-5 h-5 text-slate-600" />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="p-5">
                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-xs font-bold text-slate-500 py-2">{day}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {blanks.map(b => <div key={`blank-${b}`} className="h-24 bg-slate-50/50 rounded-lg border border-slate-100/50"></div>)}
                  {days.map(d => {
                    // Very simple mock matching for calendar
                    const dateStr = `2026-07-${d.toString().padStart(2, '0')}`;
                    const dayPayments = payments.filter(p => p.nextDue === dateStr);
                    const isToday = d === 20 && currentMonth.getMonth() === 6; // Mock today

                    return (
                      <div key={d} className={`h-24 p-1.5 rounded-lg border ${isToday ? 'border-primary bg-blue-50/30' : 'border-slate-100 hover:border-slate-300'} transition-colors flex flex-col relative`}>
                        <span className={`text-xs font-bold ${isToday ? 'text-primary' : 'text-slate-700'}`}>{d}</span>
                        <div className="mt-1 flex-1 overflow-y-auto space-y-1 scrollbar-hide">
                          {dayPayments.map(p => (
                            <div key={p.id} className="text-[10px] p-1 rounded font-medium flex items-center gap-1 truncate" style={{backgroundColor: `${p.color}15`, color: p.color}}>
                              <p.icon className="w-3 h-3 shrink-0" /> {p.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex gap-4 mt-6 text-xs font-medium text-slate-600 justify-center">
                  <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div> Upcoming</span>
                  <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div> Paid</span>
                  <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500"></div> Missed</span>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'History' && (
            <Card>
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle>Payment History</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-xs text-slate-500 font-bold uppercase tracking-wider">
                      <th className="p-4 rounded-tl-lg">Date</th>
                      <th className="p-4">Payment</th>
                      <th className="p-4">Method</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right rounded-tr-lg">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paymentHistory.map((h) => (
                      <tr key={h.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 text-sm text-slate-600 whitespace-nowrap">{h.date}</td>
                        <td className="p-4">
                          <p className="font-bold text-slate-900">{h.name}</p>
                          <p className="text-xs text-slate-500">Ref: {h.ref}</p>
                        </td>
                        <td className="p-4 text-sm text-slate-600">{h.method}</td>
                        <td className="p-4">{renderStatusBadge(h.status)}</td>
                        <td className="p-4 text-right font-bold text-slate-900">{formatInr(h.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}

        </div>

        {/* Right Column: AI Insights & Analytics */}
        <div className="space-y-6">
          
          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-slate-500 uppercase">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <button onClick={() => openModal(null, 'Subscriptions')} className="flex flex-col items-center justify-center gap-2 p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors border border-slate-100">
                <Tv className="w-5 h-5 text-indigo-500" />
                <span className="text-xs font-bold text-slate-700">Add Sub</span>
              </button>
              <button onClick={() => openModal(null, 'Loan EMI')} className="flex flex-col items-center justify-center gap-2 p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors border border-slate-100">
                <Home className="w-5 h-5 text-blue-500" />
                <span className="text-xs font-bold text-slate-700">Add EMI</span>
              </button>
              <button onClick={() => openModal(null, 'Mutual Fund SIP')} className="flex flex-col items-center justify-center gap-2 p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors border border-slate-100">
                <Activity className="w-5 h-5 text-emerald-500" />
                <span className="text-xs font-bold text-slate-700">Add SIP</span>
              </button>
              <button onClick={() => setActiveTab('Calendar')} className="flex flex-col items-center justify-center gap-2 p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors border border-slate-100">
                <Calendar className="w-5 h-5 text-amber-500" />
                <span className="text-xs font-bold text-slate-700">Calendar</span>
              </button>
            </CardContent>
          </Card>

          {/* AI Insights Widget */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 shadow-sm relative overflow-hidden text-slate-800 border border-indigo-100">
            <div className="absolute -right-4 -top-4 opacity-10">
              <Bot className="w-32 h-32 text-indigo-600" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center border border-indigo-200 shadow-inner">
                  <Bot className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-indigo-900">AI Subscription Insights</h3>
                  <p className="text-xs text-indigo-600 font-medium">Smart Optimizer</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="bg-white/80 backdrop-blur-sm p-3.5 rounded-xl border border-indigo-50 shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-sm flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span className="text-indigo-900">You currently spend <strong>{formatInr(2850)}/mo</strong> on subscriptions. Cancelling Amazon Prime would save {formatInr(1499)}/yr.</span>
                  </p>
                </div>
                <div className="bg-white/80 backdrop-blur-sm p-3.5 rounded-xl border border-indigo-50 shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-sm flex items-start gap-2.5">
                    <PieChartIcon className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <span className="text-indigo-900">Your OTT subscriptions have increased by 28% this year. Consider downgrading Netflix to Mobile-only.</span>
                  </p>
                </div>
                <div className="bg-white/80 backdrop-blur-sm p-3.5 rounded-xl border border-indigo-50 shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-sm flex items-start gap-2.5">
                    <Zap className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <span className="text-indigo-900">Electricity bills are increasing every month. This is reducing your budget surplus for the Vacation Goal.</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Auto Detection */}
          <Card className="border-emerald-100 bg-emerald-50/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-emerald-800"><Sparkles className="w-4 h-4 text-emerald-600"/> Auto-Detected Recurring</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-emerald-700 mb-3">We found 2 transactions that look like recurring payments.</p>
              <div className="space-y-3">
                {autoDetectTransactions.map(ad => (
                  <div key={ad.id} className="bg-white p-3 rounded-lg border border-emerald-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                        <ad.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{ad.name}</p>
                        <p className="text-xs text-slate-500">{formatInr(ad.amount)} • {ad.frequency}</p>
                      </div>
                    </div>
                    <button className="text-xs font-bold text-emerald-600 hover:bg-emerald-50 px-2 py-1 rounded transition-colors">Add</button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

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
                    <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(value: number) => formatInr(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-4 max-h-[150px] overflow-y-auto pr-2">
                {categoryDistribution.map((c, i) => (
                  <div key={i} className="flex justify-between items-center text-sm p-1 hover:bg-slate-50 rounded">
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

          {/* Expense Trend Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyExpenseBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(value) => `₹${value/1000}k`} />
                    <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(value: number) => formatInr(value)} />
                    <Bar dataKey="amount" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          {/* Analytics Line Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Recurring Expense Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={expenseTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(value) => `₹${value/1000}k`} />
                    <Tooltip cursor={{stroke: '#e2e8f0', strokeWidth: 2}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(value: number) => formatInr(value)} />
                    <Line type="monotone" dataKey="amount" name="Expenses" stroke="#8B5CF6" strokeWidth={3} dot={{r: 4, fill: '#8B5CF6', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 6}} />
                  </LineChart>
                </ResponsiveContainer>
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
              className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                <h2 className="text-xl font-bold text-slate-900">{editingPayment ? 'Edit Payment' : 'Add Recurring Payment'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors"><X className="w-5 h-5"/></button>
              </div>
              
              <div className="p-6 overflow-y-auto bg-slate-50/30">
                <form id="recurring-form" onSubmit={handleSave} className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Payment Name *</label>
                    <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all bg-white" placeholder="e.g. Netflix, Rent, Car Loan" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Amount (₹) *</label>
                      <div className="relative">
                        <span className="absolute left-4 top-2.5 text-slate-500 font-medium">₹</span>
                        <input required type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full pl-8 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all bg-white" placeholder="0" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Frequency</label>
                      <select value={formData.frequency} onChange={e => setFormData({...formData, frequency: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all bg-white">
                        {frequencies.map(f => <option key={f} value={f}>{f}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
                      <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all bg-white">
                        {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Payment Method</label>
                      <select value={formData.method} onChange={e => setFormData({...formData, method: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all bg-white">
                        <option>UPI</option>
                        <option>Credit Card</option>
                        <option>Debit Card</option>
                        <option>Net Banking</option>
                        <option>Auto Debit Setup</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Next Due Date</label>
                      <input required type="date" value={formData.nextDue} onChange={e => setFormData({...formData, nextDue: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all bg-white text-slate-700" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Reminder Before</label>
                      <select value={formData.reminder} onChange={e => setFormData({...formData, reminder: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all bg-white">
                        <option>1 Day Before</option>
                        <option>2 Days Before</option>
                        <option>3 Days Before</option>
                        <option>1 Week Before</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm cursor-pointer hover:border-primary/30 transition-colors" onClick={() => setFormData({...formData, autoDebit: !formData.autoDebit})}>
                    <input type="checkbox" id="autoDebit" checked={formData.autoDebit} onChange={e => setFormData({...formData, autoDebit: e.target.checked})} className="w-5 h-5 text-primary rounded border-slate-300 focus:ring-primary pointer-events-none" />
                    <div>
                      <label className="text-sm font-bold text-slate-900 block cursor-pointer">Auto Debit Enabled</label>
                      <span className="text-xs text-slate-500">Automatically deducted from linked bank account</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3">Badge Color Theme</label>
                    <div className="flex flex-wrap gap-3">
                      {presetColors.map(c => (
                        <button 
                          key={c} type="button" onClick={() => setFormData({...formData, color: c})}
                          className={`w-10 h-10 rounded-full border-2 transition-all shadow-sm flex items-center justify-center ${formData.color === c ? 'border-slate-900 scale-110 ring-4 ring-slate-100' : 'border-white hover:scale-110'}`}
                          style={{ backgroundColor: c }}
                        >
                          {formData.color === c && <CheckCircle className="w-5 h-5 text-white/90" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Notes (Optional)</label>
                    <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all bg-white resize-none" placeholder="Add any details, account numbers, or links..." rows={3}></textarea>
                  </div>

                </form>
              </div>

              <div className="px-6 py-5 border-t border-slate-100 bg-white flex justify-end gap-3 sticky bottom-0 z-10">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-slate-700 font-bold hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
                <button type="submit" form="recurring-form" className="px-5 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2">
                  {editingPayment ? <><Edit3 className="w-4 h-4"/> Save Changes</> : <><Plus className="w-4 h-4"/> Add Payment</>}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
