import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { 
  ArrowUpRight, ArrowDownRight, Plus, Bot, Edit3, Trash2, X, CalendarDays, 
  CreditCard, Tv, Zap, Wifi, Smartphone, Shield, Car, Home, 
  Activity, CheckCircle2, Clock, AlertTriangle, RefreshCw, BarChart2, PieChart as PieChartIcon,
  Calendar, Sparkles, CheckCircle, ChevronRight, ChevronLeft, Building2, Dumbbell, Server
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
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

const getCategoryIcon = (category: string) => {
  const mapping: Record<string, any> = {
    'Subscriptions': Smartphone,
    'OTT Platforms': Tv,
    'Rent': Building2,
    'Electricity': Zap,
    'Water': Zap,
    'Internet': Wifi,
    'Mobile Recharge': Smartphone,
    'Gas': Zap,
    'Insurance': Shield,
    'Loan EMI': Home,
    'Home Loan': Home,
    'Car Loan': Car,
    'Education Loan': CheckCircle,
    'Mutual Fund SIP': Activity,
    'Stocks SIP': BarChart2,
    'Gym Membership': Dumbbell,
    'Cloud Storage': Server
  };
  return mapping[category] || CreditCard;
};

const allCategories = ['Subscriptions', 'Rent', 'Electricity', 'Water', 'Internet', 'Mobile Recharge', 'Gas', 'Insurance', 'Loan EMI', 'Home Loan', 'Car Loan', 'Education Loan', 'Mutual Fund SIP', 'Stocks SIP', 'Gym Membership', 'OTT Platforms', 'Cloud Storage', 'Medical', 'Education', 'Others'];
const frequencies = ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Half-Yearly', 'Yearly', 'Custom'];
const presetColors = ['#EF4444', '#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#14B8A6', '#EC4899', '#6366F1', '#06B6D4', '#F43F5E'];

export function RecurringPayments() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'All' | 'Subscriptions' | 'Bills' | 'EMI' | 'SIP' | 'Insurance' | 'Calendar' | 'History'>('All');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Form State
  const [formData, setFormData] = useState({
    name: '', category: 'Subscriptions', amount: '', frequency: 'Monthly', nextDue: '', method: 'UPI', merchant: '', autoDebit: true, reminder: '3', color: '#3B82F6', notes: ''
  });

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      const [payRes, txRes] = await Promise.all([
        supabase.from('recurring_payments').select('*').order('next_due_date', { ascending: true }),
        supabase.from('transactions').select('*').in('category', ['Subscription', 'Bill Payment', 'EMI', 'SIP', 'Insurance Premium', 'Recurring']).order('date', { ascending: false }).limit(50)
      ]);

      if (payRes.data) {
        setPayments(payRes.data);
      }
      if (txRes.data) {
        setPaymentHistory(txRes.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();

    if (!user) return;
    const paySub = supabase.channel('recurring_changes').on('postgres_changes', { event: '*', schema: 'public', table: 'recurring_payments', filter: `user_id=eq.${user.id}` }, fetchData).subscribe();
    const txSub = supabase.channel('tx_recurring_changes').on('postgres_changes', { event: '*', schema: 'public', table: 'transactions', filter: `user_id=eq.${user.id}` }, fetchData).subscribe();

    return () => {
      supabase.removeChannel(paySub);
      supabase.removeChannel(txSub);
    };
  }, [user, fetchData]);

  // Derived Live Data
  const livePayments = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return payments.map(p => {
      let liveStatus = 'Upcoming';
      if (p.status === 'Paused') {
        liveStatus = 'Paused';
      } else if (p.next_due_date < today) {
        liveStatus = 'Overdue';
      } else if (p.next_due_date === today) {
        liveStatus = 'Due Today';
      }
      return { ...p, liveStatus };
    });
  }, [payments]);

  // Cost Projections
  const calculateAnnualCost = (amount: number, freq: string) => {
    switch (freq) {
      case 'Daily': return amount * 365;
      case 'Weekly': return amount * 52;
      case 'Monthly': return amount * 12;
      case 'Quarterly': return amount * 4;
      case 'Half-Yearly': return amount * 2;
      case 'Yearly': return amount;
      default: return amount * 12;
    }
  };

  const monthlyCost = livePayments.filter(p => p.liveStatus !== 'Paused').reduce((acc, curr) => acc + (calculateAnnualCost(Number(curr.amount), curr.frequency) / 12), 0);
  const annualCost = monthlyCost * 12;
  const activeCount = livePayments.filter(p => p.liveStatus !== 'Paused').length;
  
  // Next 7 days logic
  const todayObj = new Date();
  const next7DaysObj = new Date();
  next7DaysObj.setDate(next7DaysObj.getDate() + 7);
  const upcoming7DaysCount = livePayments.filter(p => {
    if (!p.next_due_date || p.liveStatus === 'Paused') return false;
    const due = new Date(p.next_due_date);
    return due >= todayObj && due <= next7DaysObj;
  }).length;

  const categoryDistribution = Object.entries(
    livePayments.reduce((acc, curr) => {
      if (curr.liveStatus === 'Paused') return acc;
      const annual = calculateAnnualCost(Number(curr.amount), curr.frequency);
      acc[curr.category || 'Other'] = (acc[curr.category || 'Other'] || 0) + annual;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value], idx) => ({ name, value, color: presetColors[idx % presetColors.length] }));

  // Handlers
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      const payload = {
        user_id: user.id,
        name: formData.name,
        category: formData.category,
        amount: Number(formData.amount),
        frequency: formData.frequency,
        next_due_date: formData.nextDue || null,
        payment_method: formData.method,
        merchant: formData.merchant,
        auto_pay: formData.autoDebit,
        reminder_days: Number(formData.reminder),
        color_theme: formData.color,
        notes: formData.notes,
        due_date: formData.nextDue ? new Date(formData.nextDue).getDate() : 1, // Satisfy deprecated NOT NULL constraint
        is_urgent: false // Satisfy deprecated constraint
      };

      if (editingPayment) {
        const { error } = await supabase.from('recurring_payments').update(payload).eq('id', editingPayment.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('recurring_payments').insert({...payload, status: 'Active'});
        if (error) throw error;
      }
      setIsModalOpen(false);
    } catch (err: any) {
      console.error(err);
      alert("Failed to save payment: " + (err.message || "Unknown error. Did you run the SQL script in Supabase?"));
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to permanently delete this recurring payment?")) {
      await supabase.from('recurring_payments').delete().eq('id', id);
    }
  };

  const togglePause = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Paused' ? 'Active' : 'Paused';
    await supabase.from('recurring_payments').update({ status: newStatus }).eq('id', id);
  };

  const rollDateForward = (dateStr: string, frequency: string) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    switch (frequency) {
      case 'Daily': d.setDate(d.getDate() + 1); break;
      case 'Weekly': d.setDate(d.getDate() + 7); break;
      case 'Monthly': d.setMonth(d.getMonth() + 1); break;
      case 'Quarterly': d.setMonth(d.getMonth() + 3); break;
      case 'Half-Yearly': d.setMonth(d.getMonth() + 6); break;
      case 'Yearly': d.setFullYear(d.getFullYear() + 1); break;
      default: d.setMonth(d.getMonth() + 1);
    }
    return d.toISOString().split('T')[0];
  };

  const markAsPaid = async (p: any) => {
    if (!user) return;
    try {
      // 1. Roll over date
      const newDate = rollDateForward(p.next_due_date, p.frequency);
      
      // 2. Insert transaction
      const today = new Date().toISOString().split('T')[0];
      
      let txCategory = 'Recurring';
      if (p.category.includes('SIP')) txCategory = 'SIP';
      else if (p.category.includes('EMI')) txCategory = 'EMI';
      else if (p.category.includes('Insurance')) txCategory = 'Insurance Premium';
      else if (p.category.includes('Subscription') || p.category.includes('OTT')) txCategory = 'Subscription';
      else txCategory = 'Bill Payment';

      await Promise.all([
        supabase.from('recurring_payments').update({ next_due_date: newDate }).eq('id', p.id),
        supabase.from('transactions').insert({
          user_id: user.id,
          amount: p.amount,
          date: today,
          type: 'expense',
          category: txCategory,
          payee: p.merchant || p.name,
          payment_method: p.payment_method || 'Net Banking',
          notes: `Auto-generated from Recurring Payments`
        })
      ]);
    } catch (err) {
      console.error(err);
    }
  };

  const openModal = (payment?: any, predefinedCategory?: string) => {
    if (payment) {
      setEditingPayment(payment);
      setFormData({ 
        name: payment.name, category: payment.category, amount: payment.amount.toString(), 
        frequency: payment.frequency, nextDue: payment.next_due_date, method: payment.payment_method, 
        merchant: payment.merchant || '', autoDebit: payment.auto_pay, reminder: payment.reminder_days?.toString() || '3', 
        color: payment.color_theme || '#3B82F6', notes: payment.notes || ''
      });
    } else {
      setEditingPayment(null);
      setFormData({ name: '', category: predefinedCategory || 'Subscriptions', amount: '', frequency: 'Monthly', nextDue: '', method: 'UPI', merchant: '', autoDebit: true, reminder: '3', color: '#3B82F6', notes: '' });
    }
    setIsModalOpen(true);
  };

  const renderStatusBadge = (liveStatus: string) => {
    switch(liveStatus) {
      case 'Upcoming': return <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center gap-1"><Clock className="w-3 h-3"/> Upcoming</span>;
      case 'Due Today': return <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> Due Today</span>;
      case 'Overdue': return <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> Overdue</span>;
      case 'Paused': return <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1"><X className="w-3 h-3"/> Paused</span>;
      default: return null;
    }
  };

  // Filter Logic
  const filteredPayments = livePayments.filter(p => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Subscriptions') return p.category === 'Subscriptions' || p.category === 'OTT Platforms' || p.category === 'Gym Membership' || p.category === 'Cloud Storage';
    if (activeTab === 'Bills') return p.category === 'Electricity' || p.category === 'Water' || p.category === 'Gas' || p.category === 'Internet' || p.category === 'Mobile Recharge' || p.category === 'Rent';
    if (activeTab === 'EMI') return p.category.includes('Loan') || p.category === 'Loan EMI';
    if (activeTab === 'SIP') return p.category.includes('SIP');
    if (activeTab === 'Insurance') return p.category.includes('Insurance');
    return true;
  });

  // AI Insights Generation
  const insights = useMemo(() => {
    const alerts = [];
    const subsCost = livePayments.filter(p => p.category === 'Subscriptions' || p.category === 'OTT Platforms').reduce((acc, curr) => acc + (calculateAnnualCost(Number(curr.amount), curr.frequency)), 0);
    
    if (subsCost > 15000) {
      alerts.push(`You spend ${formatInr(subsCost)} every year on subscriptions. Cancelling just 1 or 2 could save you thousands!`);
    }

    const overdues = livePayments.filter(p => p.liveStatus === 'Overdue');
    if (overdues.length > 0) {
      alerts.push(`Warning: You have ${overdues.length} overdue payment(s) (${overdues.map(o => o.name).join(', ')}). Pay them to avoid penalties.`);
    }

    if (activeCount === 0 && livePayments.length > 0) {
      alerts.push(`All your payments are paused. Remember to resume them when necessary.`);
    }
    
    if (livePayments.length === 0) {
      alerts.push(`Start automating your financial life by adding your first recurring bill or subscription!`);
    } else if (alerts.length === 0) {
      alerts.push(`Great job! All your automated payments are on track. Your Financial Health is solid.`);
    }

    return alerts;
  }, [livePayments, activeCount]);

  // Generate days for Calendar View
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading Recurring Payments...</div>;
  }

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
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <p className="text-sm font-medium text-slate-500 mb-1">Upcoming Payments</p>
            <h4 className="text-2xl font-bold text-slate-900">{upcoming7DaysCount}</h4>
            <div className="mt-2 flex items-center text-sm font-medium text-slate-500">
              <span className="text-slate-600 flex items-center mr-1"><Clock className="w-4 h-4"/> Next 7 days</span>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <p className="text-sm font-medium text-slate-500 mb-1">Active Payments</p>
            <h4 className="text-2xl font-bold text-slate-900">{activeCount}</h4>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none">
          <CardContent className="p-5">
            <p className="text-sm font-medium text-slate-300 mb-1">Annual Projected Cost</p>
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
            {['All', 'Subscriptions', 'Bills', 'EMI', 'SIP', 'Insurance', 'Calendar', 'History'].map(tab => (
              <button 
                key={tab} onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${activeTab === tab ? 'bg-primary text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          {(activeTab !== 'Calendar' && activeTab !== 'History') && (
            <Card>
              <CardHeader className="border-b border-slate-100 pb-4 flex flex-row items-center justify-between">
                <CardTitle className="text-lg">{activeTab === 'All' ? 'All Recurring Payments' : activeTab}</CardTitle>
                <div className="flex gap-2">
                  <button onClick={() => openModal()} className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-md transition-colors"><Plus className="w-4 h-4" /></button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-100">
                  {filteredPayments.length > 0 ? filteredPayments.map(p => {
                    const Icon = getCategoryIcon(p.category);
                    const annualProj = calculateAnnualCost(Number(p.amount), p.frequency);
                    
                    return (
                      <div key={p.id} className={`p-5 hover:bg-slate-50 transition-colors group relative ${p.liveStatus === 'Paused' ? 'opacity-50' : ''}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-slate-100 shadow-sm" style={{ color: p.color_theme || '#3B82F6' }}>
                              <Icon className="w-6 h-6" />
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-900">{p.name}</h4>
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs font-medium text-slate-500">
                                <span className="flex items-center gap-1"><RefreshCw className="w-3 h-3"/> {p.frequency}</span>
                                <span className="flex items-center gap-1"><CreditCard className="w-3 h-3"/> {p.payment_method || 'Other'}</span>
                                {p.auto_pay && <span className="text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-1"><Zap className="w-3 h-3"/>Auto Debit</span>}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-right hidden sm:block">
                              <p className="text-sm font-medium text-slate-500 mb-1">Next Due: {p.next_due_date ? new Date(p.next_due_date).toLocaleDateString() : 'N/A'}</p>
                              {renderStatusBadge(p.liveStatus)}
                            </div>
                            <div className="text-right group/impact cursor-help relative">
                              <h4 className="font-bold text-lg text-slate-900">{formatInr(p.amount)}</h4>
                              <p className="text-[10px] text-slate-400 border-b border-dashed border-slate-300">View Impact</p>
                              
                              {/* Lifetime Cost Hover Tooltip */}
                              <div className="absolute top-full right-0 mt-2 w-48 bg-slate-800 text-white p-3 rounded-lg opacity-0 invisible group-hover/impact:opacity-100 group-hover/impact:visible transition-all z-20 shadow-xl">
                                <p className="text-[10px] uppercase font-bold text-slate-400 mb-2 border-b border-slate-700 pb-1">Cost Projection</p>
                                <div className="space-y-1 text-xs font-medium">
                                  <div className="flex justify-between"><span className="text-slate-300">Yearly</span><span>{formatInr(annualProj)}</span></div>
                                  <div className="flex justify-between"><span className="text-slate-300">5-Years</span><span>{formatInr(annualProj * 5)}</span></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Hidden action bar revealed on hover */}
                        <div className="absolute bottom-2 right-5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white shadow-sm border border-slate-100 rounded-lg p-1">
                          <button onClick={() => markAsPaid(p)} className="px-2 py-1 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded text-xs font-bold transition-colors flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3"/> Mark Paid
                          </button>
                          <button onClick={() => togglePause(p.id, p.status)} className="px-2 py-1 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded text-xs font-bold transition-colors">
                            {p.status === 'Paused' ? 'Resume' : 'Pause'}
                          </button>
                          <button onClick={() => openModal(p)} className="p-1.5 text-slate-400 hover:text-primary hover:bg-blue-50 rounded"><Edit3 className="w-3.5 h-3.5"/></button>
                          <button onClick={() => handleDelete(p.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5"/></button>
                        </div>
                      </div>
                    );
                  }) : (
                    <div className="p-10 text-center flex flex-col items-center">
                      <RefreshCw className="w-10 h-10 text-slate-300 mb-3" />
                      <h4 className="font-bold text-slate-900 mb-1">No Payments Found</h4>
                      <p className="text-sm text-slate-500 mb-4">Add your first recurring payment to automate bill tracking.</p>
                      <button onClick={() => openModal()} className="px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors">Add Payment</button>
                    </div>
                  )}
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
                  <span className="font-bold text-slate-900 min-w-[140px] text-center">
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
                    const monthStr = (currentMonth.getMonth() + 1).toString().padStart(2, '0');
                    const dateStr = `${currentMonth.getFullYear()}-${monthStr}-${d.toString().padStart(2, '0')}`;
                    const dayPayments = livePayments.filter(p => p.next_due_date === dateStr && p.liveStatus !== 'Paused');
                    const isToday = d === new Date().getDate() && currentMonth.getMonth() === new Date().getMonth() && currentMonth.getFullYear() === new Date().getFullYear();

                    return (
                      <div key={d} className={`h-24 p-1.5 rounded-lg border ${isToday ? 'border-primary bg-blue-50/30' : 'border-slate-100 hover:border-slate-300'} transition-colors flex flex-col relative`}>
                        <span className={`text-xs font-bold ${isToday ? 'text-primary' : 'text-slate-700'}`}>{d}</span>
                        <div className="mt-1 flex-1 overflow-y-auto space-y-1 scrollbar-hide">
                          {dayPayments.map(p => {
                            const Icon = getCategoryIcon(p.category);
                            return (
                              <div key={p.id} className="text-[10px] p-1 rounded font-medium flex items-center gap-1 truncate" style={{backgroundColor: `${p.color_theme || '#3B82F6'}15`, color: p.color_theme || '#3B82F6'}}>
                                <Icon className="w-3 h-3 shrink-0" /> {p.name}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex gap-4 mt-6 text-xs font-medium text-slate-600 justify-center">
                  <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div> Upcoming</span>
                  <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div> Due Today</span>
                  <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500"></div> Overdue</span>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'History' && (
            <Card>
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle>Payment History (Auto-Generated)</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-xs text-slate-500 font-bold uppercase tracking-wider">
                      <th className="p-4 rounded-tl-lg">Date</th>
                      <th className="p-4">Payment</th>
                      <th className="p-4">Category</th>
                      <th className="p-4 text-right rounded-tr-lg">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paymentHistory.map((h) => (
                      <tr key={h.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 text-sm text-slate-600 whitespace-nowrap">{new Date(h.date).toLocaleDateString()}</td>
                        <td className="p-4">
                          <p className="font-bold text-slate-900">{h.payee}</p>
                          <p className="text-xs text-slate-500">Auto-Generated</p>
                        </td>
                        <td className="p-4 text-sm text-slate-600">
                          <span className="px-2 py-1 bg-slate-100 rounded text-xs font-medium">{h.category}</span>
                        </td>
                        <td className="p-4 text-right font-bold text-slate-900">{formatInr(h.amount)}</td>
                      </tr>
                    ))}
                    {paymentHistory.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-slate-500 text-sm">No transaction history found for recurring payments.</td>
                      </tr>
                    )}
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
                {insights.map((msg, idx) => (
                  <div key={idx} className="bg-white/80 backdrop-blur-sm p-3.5 rounded-xl border border-indigo-50 shadow-sm hover:shadow-md transition-shadow">
                    <p className="text-sm flex items-start gap-2.5">
                      {msg.includes('Warning') ? <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" /> : 
                       msg.includes('thousands') ? <PieChartIcon className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" /> :
                       <Zap className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />}
                      <span className="text-indigo-900">{msg}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Distribution Pie */}
          {categoryDistribution.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Annual Cost Distribution</CardTitle>
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
                  {categoryDistribution.sort((a,b) => b.value - a.value).map((c, i) => (
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
          )}

        </div>
      </div>

      {/* Add / Edit Recurring Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
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
                      <label className="block text-sm font-bold text-slate-700 mb-2">Reminder Before (Days)</label>
                      <input type="number" value={formData.reminder} onChange={e => setFormData({...formData, reminder: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all bg-white text-slate-700" />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-slate-200">
                    <input type="checkbox" id="autoDebit" checked={formData.autoDebit} onChange={e => setFormData({...formData, autoDebit: e.target.checked})} className="w-5 h-5 text-primary rounded focus:ring-primary border-slate-300" />
                    <label htmlFor="autoDebit" className="text-sm font-bold text-slate-700 cursor-pointer">Enable Auto-Pay / Auto-Debit</label>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Color Theme</label>
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

              <div className="px-6 py-4 border-t border-slate-100 bg-white flex justify-end gap-3 sticky bottom-0">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-slate-700 font-bold hover:bg-slate-100 rounded-xl transition-colors text-sm">Cancel</button>
                <button type="submit" form="recurring-form" className="px-5 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20 text-sm">
                  {editingPayment ? 'Save Changes' : 'Create Payment'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
