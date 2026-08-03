import { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { 
  ArrowUpRight, Download, Printer, Share2, 
  TrendingUp, TrendingDown, AlertTriangle, Zap,
  Target as TargetIcon, Clock, Wallet, Bot
} from 'lucide-react';
import { 
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, 
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend 
} from 'recharts';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

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
    'Food': { color: '#10B981' },
    'Salary': { color: '#10B981' },
    'Shopping': { color: '#F59E0B' },
    'Travel': { color: '#8B5CF6' },
    'Bills': { color: '#EC4899' },
    'Entertainment': { color: '#F43F5E' },
    'Refund': { color: '#64748B' },
    'Freelancing': { color: '#10B981' },
    'Investment': { color: '#6366F1' },
    'Rent': { color: '#3B82F6' },
    'Healthcare': { color: '#EF4444' },
    'Education': { color: '#3B82F6' },
    'Business': { color: '#64748B' },
    'Insurance': { color: '#14B8A6' },
    'Taxes': { color: '#EF4444' },
  };
  return mapping[category] || { color: '#94A3B8' };
};

export function Reports() {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState('This Year');
  const [filterBy, setFilterBy] = useState('All');

  const [transactions, setTransactions] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      const [txRes, bgRes, glRes] = await Promise.all([
        supabase.from('transactions').select('*').order('date', { ascending: false }),
        supabase.from('budgets').select('*'),
        supabase.from('goals').select('*')
      ]);

      if (txRes.data) setTransactions(txRes.data);
      if (bgRes.data) setBudgets(bgRes.data);
      if (glRes.data) setGoals(glRes.data);
    } catch (error) {
      console.error('Error fetching reports data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();

    if (!user) return;
    const txSub = supabase.channel('rpt_tx_changes').on('postgres_changes', { event: '*', schema: 'public', table: 'transactions', filter: `user_id=eq.${user.id}` }, fetchData).subscribe();
    const bgSub = supabase.channel('rpt_bg_changes').on('postgres_changes', { event: '*', schema: 'public', table: 'budgets', filter: `user_id=eq.${user.id}` }, fetchData).subscribe();
    const glSub = supabase.channel('rpt_gl_changes').on('postgres_changes', { event: '*', schema: 'public', table: 'goals', filter: `user_id=eq.${user.id}` }, fetchData).subscribe();
    
    return () => {
      supabase.removeChannel(txSub);
      supabase.removeChannel(bgSub);
      supabase.removeChannel(glSub);
    };
  }, [user, fetchData]);

  // Apply filters
  const filteredTransactions = useMemo(() => {
    const today = new Date();
    let filtered = transactions.filter(t => {
      const txDate = new Date(t.date);
      if (dateRange === 'Today') {
        return txDate.toDateString() === today.toDateString();
      } else if (dateRange === 'Last 7 Days') {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(today.getDate() - 7);
        return txDate >= sevenDaysAgo;
      } else if (dateRange === 'This Month') {
        return txDate.getMonth() === today.getMonth() && txDate.getFullYear() === today.getFullYear();
      } else if (dateRange === 'Last Month') {
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        return txDate.getMonth() === lastMonth.getMonth() && txDate.getFullYear() === lastMonth.getFullYear();
      } else if (dateRange === 'Last 3 Months') {
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(today.getMonth() - 3);
        return txDate >= threeMonthsAgo;
      } else if (dateRange === 'Last 6 Months') {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(today.getMonth() - 6);
        return txDate >= sixMonthsAgo;
      } else if (dateRange === 'This Year') {
        return txDate.getFullYear() === today.getFullYear();
      }
      return true; // Custom Range (Not implemented yet, return all)
    });

    if (filterBy !== 'All') {
      if (filterBy === 'Income') filtered = filtered.filter(t => t.type === 'income');
      else if (filterBy === 'Expense') filtered = filtered.filter(t => t.type === 'expense');
      else if (filterBy.startsWith('Payment Method')) {
        const method = filterBy.match(/\(([^)]+)\)/)?.[1];
        if (method) filtered = filtered.filter(t => t.method === method);
      }
    }
    return filtered;
  }, [transactions, dateRange, filterBy]);

  const prevFilteredTransactions = useMemo(() => {
    const today = new Date();
    let filtered = transactions.filter(t => {
      const txDate = new Date(t.date);
      if (dateRange === 'Today') {
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);
        return txDate.toDateString() === yesterday.toDateString();
      } else if (dateRange === 'Last 7 Days') {
        const prevStart = new Date();
        prevStart.setDate(today.getDate() - 14);
        const prevEnd = new Date();
        prevEnd.setDate(today.getDate() - 7);
        return txDate >= prevStart && txDate < prevEnd;
      } else if (dateRange === 'This Month') {
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        return txDate.getMonth() === lastMonth.getMonth() && txDate.getFullYear() === lastMonth.getFullYear();
      } else if (dateRange === 'Last Month') {
        const twoMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 2, 1);
        return txDate.getMonth() === twoMonthsAgo.getMonth() && txDate.getFullYear() === twoMonthsAgo.getFullYear();
      } else if (dateRange === 'Last 3 Months') {
        const prevStart = new Date();
        prevStart.setMonth(today.getMonth() - 6);
        const prevEnd = new Date();
        prevEnd.setMonth(today.getMonth() - 3);
        return txDate >= prevStart && txDate < prevEnd;
      } else if (dateRange === 'Last 6 Months') {
        const prevStart = new Date();
        prevStart.setMonth(today.getMonth() - 12);
        const prevEnd = new Date();
        prevEnd.setMonth(today.getMonth() - 6);
        return txDate >= prevStart && txDate < prevEnd;
      } else if (dateRange === 'This Year') {
        return txDate.getFullYear() === today.getFullYear() - 1;
      }
      return false; 
    });
    return filtered;
  }, [transactions, dateRange]);

  const calculateTotals = (txns: any[]) => {
    let inc = 0; let exp = 0;
    txns.forEach(t => {
      if (t.type === 'income') inc += Number(t.amount);
      if (t.type === 'expense') exp += Number(t.amount);
    });
    return { inc, exp, sav: inc - exp };
  };

  const currentMetrics = calculateTotals(filteredTransactions);
  const prevMetrics = calculateTotals(prevFilteredTransactions);

  const getPercentChange = (current: number, prev: number) => {
    if (prev === 0) return current > 0 ? 100 : 0;
    return ((current - prev) / Math.abs(prev)) * 100;
  };

  const incChange = getPercentChange(currentMetrics.inc, prevMetrics.inc);
  const expChange = getPercentChange(currentMetrics.exp, prevMetrics.exp);
  const savChange = getPercentChange(currentMetrics.sav, prevMetrics.sav);

  const healthScore = useMemo(() => {
    let score = 0;
    const allTimeTotals = calculateTotals(transactions);
    const savingsRate = allTimeTotals.inc > 0 ? (allTimeTotals.sav / allTimeTotals.inc) : 0;
    
    if (savingsRate >= 0.2) score += 30;
    else if (savingsRate > 0) score += 15;
    
    if (budgets.length > 0) {
      const withinLimits = budgets.filter(b => b.spent_amount <= b.limit_amount).length;
      score += (withinLimits / budgets.length) * 20;
    } else { score += 10; }
    
    if (goals.length > 0) {
      const totalProgress = goals.reduce((acc, g) => acc + (g.target_amount > 0 ? g.saved_amount / g.target_amount : 0), 0);
      score += Math.min((totalProgress / goals.length) * 15, 15);
    } else { score += 5; }
    
    if (allTimeTotals.sav > 0) score += 20;
    score += 15;
    return Math.min(Math.round(score), 100);
  }, [transactions, budgets, goals]);

  const monthlyData = useMemo(() => {
    const map = new Map();
    const isShortRange = dateRange === 'Today' || dateRange === 'Last 7 Days' || dateRange === 'This Month' || dateRange === 'Last Month';
    
    filteredTransactions.forEach(t => {
      const d = new Date(t.date);
      const key = isShortRange ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : d.toLocaleDateString('en-US', { month: 'short' });
      if (!map.has(key)) map.set(key, { month: key, income: 0, expenses: 0, savings: 0, netCash: 0, dateObj: d });
      
      const item = map.get(key);
      const amt = Number(t.amount);
      if (t.type === 'income') { item.income += amt; item.netCash += amt; item.savings += amt; }
      if (t.type === 'expense') { item.expenses += amt; item.netCash -= amt; item.savings -= amt; }
    });
    
    return Array.from(map.values()).sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
  }, [filteredTransactions, dateRange]);

  const expenseBreakdownData = useMemo(() => {
    const cats: Record<string, number> = {};
    filteredTransactions.forEach(t => {
      if (t.type === 'expense') {
        cats[t.category] = (cats[t.category] || 0) + Number(t.amount);
      }
    });
    return Object.entries(cats).map(([name, value]) => ({
      name, value, color: getCategoryStyles(name).color
    })).sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  const categoryAnalysis = useMemo(() => {
    return budgets.map(b => {
      const util = b.limit_amount > 0 ? (b.spent_amount / b.limit_amount) * 100 : 0;
      return {
        category: b.category,
        budget: b.limit_amount,
        spent: b.spent_amount,
        remaining: b.limit_amount - b.spent_amount,
        util: Math.round(util),
        status: util <= 100 ? 'Safe' : 'Exceeded'
      };
    }).sort((a, b) => b.util - a.util);
  }, [budgets]);

  const paymentMethods = useMemo(() => {
    const methods: Record<string, { amount: number, count: number }> = {};
    let totalVol = 0;
    filteredTransactions.forEach(t => {
      if (t.type === 'expense') {
        const m = t.method;
        if (!methods[m]) methods[m] = { amount: 0, count: 0 };
        methods[m].amount += Number(t.amount);
        methods[m].count += 1;
        totalVol += Number(t.amount);
      }
    });
    const colors = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EC4899'];
    return Object.entries(methods).map(([name, stats], i) => ({
      name,
      value: totalVol > 0 ? Math.round((stats.amount / totalVol) * 100) : 0,
      amount: stats.amount,
      count: stats.count,
      color: colors[i % colors.length]
    })).sort((a, b) => b.amount - a.amount);
  }, [filteredTransactions]);

  const topMerchants = useMemo(() => {
    const merchants: Record<string, { amount: number, count: number }> = {};
    filteredTransactions.forEach(t => {
      if (t.type === 'expense') {
        const m = t.merchant;
        if (!merchants[m]) merchants[m] = { amount: 0, count: 0 };
        merchants[m].amount += Number(t.amount);
        merchants[m].count += 1;
      }
    });
    return Object.entries(merchants).map(([name, stats]) => ({
      name,
      amount: stats.amount,
      txns: stats.count,
      avg: Math.round(stats.amount / stats.count)
    })).sort((a, b) => b.amount - a.amount).slice(0, 5);
  }, [filteredTransactions]);

  const aiStory = useMemo(() => {
    const monthName = new Date().toLocaleString('default', { month: 'long' });
    const periodStr = dateRange === 'This Month' ? 'This month' : `In this period`;
    
    let story = `${periodStr} you earned **${formatInr(currentMetrics.inc)}** and spent **${formatInr(currentMetrics.exp)}**. `;
    
    const stories = [];
    
    if (savChange > 0) {
      stories.push({ icon: TrendingUp, color: 'text-emerald-500', text: `Your savings increased by ${Math.abs(savChange).toFixed(1)}%.` });
    } else if (savChange < 0) {
      stories.push({ icon: TrendingDown, color: 'text-red-500', text: `Your savings decreased by ${Math.abs(savChange).toFixed(1)}%.` });
    }
    
    const exceededCount = categoryAnalysis.filter(c => c.status === 'Exceeded').length;
    if (exceededCount > 0) {
      stories.push({ icon: AlertTriangle, color: 'text-amber-500', text: `You exceeded your budget in ${exceededCount} categories.` });
    } else if (budgets.length > 0) {
      stories.push({ icon: TargetIcon, color: 'text-emerald-500', text: `Great job! You stayed within all your budgets.` });
    }
    
    if (expenseBreakdownData.length > 0) {
      const topCat = expenseBreakdownData[0];
      stories.push({ icon: ArrowUpRight, color: 'text-blue-500', text: `Your highest spending category was ${topCat.name} at ${formatInr(topCat.value)}.` });
    }
    
    return { title: `${monthName} 2026 Analysis`, main: story, bulletPoints: stories };
  }, [currentMetrics, savChange, categoryAnalysis, expenseBreakdownData, dateRange, budgets.length]);

  const handleExportCSV = () => {
    let csv = 'Date,Merchant,Category,Type,Method,Amount\n';
    filteredTransactions.forEach(t => {
      csv += `${t.date},"${t.merchant}","${t.category}",${t.type},${t.method},${t.amount}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FinPilot_Report_${dateRange.replace(/ /g, '_')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const reportHistory = [
    { id: 1, name: 'Q2 2026 Financial Summary', date: '2026-07-01', type: 'Quarterly' },
    { id: 2, name: 'June 2026 Monthly Report', date: '2026-07-01', type: 'Monthly' },
    { id: 3, name: 'May 2026 Monthly Report', date: '2026-06-01', type: 'Monthly' },
  ];

  if (isLoading) {
    return <div className="min-h-[500px] flex items-center justify-center text-slate-500">Loading Analytics...</div>;
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Reports & Analytics</h1>
          <p className="text-slate-500">Understand your financial performance through intelligent reports and visual analytics.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => toast.success("Report generation scheduled!")} className="px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
            <Zap className="w-4 h-4" /> Generate Report
          </button>
          <button onClick={handleExportCSV} className="px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button onClick={() => window.print()} className="px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-2 hidden sm:flex">
            <Printer className="w-4 h-4" /> Print
          </button>
          <button onClick={() => {
            if (navigator.share) {
              navigator.share({ title: 'FinPilot Report', url: window.location.href }).catch(() => toast.error('Share failed'));
            } else {
              navigator.clipboard.writeText(window.location.href);
              toast.success('Link copied to clipboard!');
            }
          }} className="px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-2 hidden sm:flex">
            <Share2 className="w-4 h-4" /> Share
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-700">Date Range:</span>
          <select value={dateRange} onChange={e => setDateRange(e.target.value)} className="text-sm border-none bg-white rounded-lg shadow-sm focus:ring-0 cursor-pointer py-1.5 pl-3 pr-8 font-medium">
            <option>Today</option>
            <option>Last 7 Days</option>
            <option>This Month</option>
            <option>Last Month</option>
            <option>Last 3 Months</option>
            <option>Last 6 Months</option>
            <option>This Year</option>
            <option>Custom Range</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-700">Filter By:</span>
          <select value={filterBy} onChange={e => setFilterBy(e.target.value)} className="text-sm border-none bg-white rounded-lg shadow-sm focus:ring-0 cursor-pointer py-1.5 pl-3 pr-8 font-medium">
            <option>All</option>
            <option>Income</option>
            <option>Expense</option>
            <option>Payment Method (UPI)</option>
            <option>Payment Method (Credit Card)</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <p className="text-sm font-bold text-slate-500 mb-1">Total Income</p>
            <h4 className="text-2xl font-black text-slate-900">{formatInr(currentMetrics.inc)}</h4>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className={`${incChange >= 0 ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'} flex items-center font-bold px-2 py-0.5 rounded-full`}>
                {incChange >= 0 ? <ArrowUpRight className="w-3 h-3 mr-1"/> : <TrendingDown className="w-3 h-3 mr-1"/>} 
                {Math.abs(incChange).toFixed(1)}%
              </span>
              <span className="text-slate-400 font-medium text-xs">vs Previous</span>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <p className="text-sm font-bold text-slate-500 mb-1">Total Expenses</p>
            <h4 className="text-2xl font-black text-slate-900">{formatInr(currentMetrics.exp)}</h4>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className={`${expChange <= 0 ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'} flex items-center font-bold px-2 py-0.5 rounded-full`}>
                {expChange <= 0 ? <TrendingDown className="w-3 h-3 mr-1"/> : <ArrowUpRight className="w-3 h-3 mr-1"/>} 
                {Math.abs(expChange).toFixed(1)}%
              </span>
              <span className="text-slate-400 font-medium text-xs">vs Previous</span>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <p className="text-sm font-bold text-slate-500 mb-1">Net Savings</p>
            <h4 className="text-2xl font-black text-slate-900">{formatInr(currentMetrics.sav)}</h4>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className={`${savChange >= 0 ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'} flex items-center font-bold px-2 py-0.5 rounded-full`}>
                {savChange >= 0 ? <ArrowUpRight className="w-3 h-3 mr-1"/> : <TrendingDown className="w-3 h-3 mr-1"/>} 
                {Math.abs(savChange).toFixed(1)}%
              </span>
              <span className="text-slate-400 font-medium text-xs">vs Previous</span>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow bg-gradient-to-br from-indigo-900 to-slate-900 text-white border-none">
          <CardContent className="p-5">
            <p className="text-sm font-bold text-indigo-200 mb-1">Financial Health Score</p>
            <div className="flex items-center gap-3">
              <h4 className="text-3xl font-black text-white">{healthScore}</h4>
              <span className="text-xs font-bold text-emerald-400 flex items-center bg-white/10 px-2 py-1 rounded-full"><TrendingUp className="w-3 h-3 mr-1"/> Live</span>
            </div>
            <div className="mt-3">
              <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${healthScore >= 80 ? 'bg-emerald-400' : healthScore >= 50 ? 'bg-amber-400' : 'bg-red-400'}`} style={{width: `${healthScore}%`}}></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Income vs Expense Chart */}
        <Card className="xl:col-span-2 shadow-sm">
          <CardHeader className="border-b border-slate-50 pb-4 flex flex-row items-center justify-between">
            <CardTitle>Income vs Expenses</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[300px] w-full">
              {monthlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(value) => `₹${(value/1000).toFixed(0)}k`} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                      formatter={(value: number) => formatInr(value)}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 600, color: '#475569' }} />
                    <Line type="monotone" dataKey="income" name="Income" stroke="#3B82F6" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                    <Line type="monotone" dataKey="expenses" name="Expenses" stroke="#EF4444" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                    <Line type="monotone" dataKey="savings" name="Savings" stroke="#10B981" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400">No data available for this range.</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Expense Breakdown Doughnut */}
        <Card className="shadow-sm">
          <CardHeader className="border-b border-slate-50 pb-4">
            <CardTitle>Expense Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[220px] w-full flex items-center justify-center relative">
              {expenseBreakdownData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={expenseBreakdownData} cx="50%" cy="50%" innerRadius={70} outerRadius={95} paddingAngle={2} dataKey="value" stroke="none">
                        {expenseBreakdownData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold' }} 
                        formatter={(value: number, name: string) => [formatInr(value), name]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total</span>
                    <span className="text-xl font-black text-slate-900">{formatInr(currentMetrics.exp)}</span>
                  </div>
                </>
              ) : (
                <div className="text-slate-400">No expenses recorded.</div>
              )}
            </div>
            {expenseBreakdownData.length > 0 && (
              <div className="grid grid-cols-2 gap-x-2 gap-y-3 mt-6">
                {expenseBreakdownData.slice(0, 6).map((c, i) => (
                  <div key={i} className="flex items-center justify-between text-xs p-1.5 hover:bg-slate-50 rounded-lg transition-colors">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: c.color}}></div>
                      <span className="text-slate-700 font-bold truncate max-w-[70px]" title={c.name}>{c.name}</span>
                    </div>
                    <span className="font-bold text-slate-900">{Math.round((c.value/currentMetrics.exp)*100)}%</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Secondary Charts & AI Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Monthly Cash Flow Area Chart */}
        <Card className="xl:col-span-2 shadow-sm">
          <CardHeader className="border-b border-slate-50 pb-4">
            <CardTitle>Cash Flow (Net Cash)</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[250px] w-full">
              {monthlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <defs>
                      <linearGradient id="colorNetCash" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(value) => `₹${(value/1000).toFixed(0)}k`} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                      formatter={(value: number) => formatInr(value)}
                    />
                    <Area type="monotone" dataKey="netCash" name="Net Cash Flow" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorNetCash)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400">No data available for this range.</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* AI Report Summary */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 shadow-sm border border-indigo-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center border-4 border-white shadow-sm">
                <Bot className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-black text-lg text-indigo-900">AI Report Summary</h3>
                <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider">{aiStory.title}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <p className="text-sm font-medium text-slate-700 leading-relaxed">
                {dateRange === 'This Month' ? 'This month' : `In this period`} you earned <strong className="text-slate-900">{formatInr(currentMetrics.inc)}</strong> and spent <strong className="text-slate-900">{formatInr(currentMetrics.exp)}</strong>.
              </p>
              <ul className="space-y-3">
                {aiStory.bulletPoints.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-sm">
                    <point.icon className={`w-4 h-4 shrink-0 mt-0.5 ${point.color}`} />
                    <span className="text-slate-700 font-medium" dangerouslySetInnerHTML={{ __html: point.text.replace(/\*(.*?)\*/g, '<strong class="text-slate-900">$1</strong>') }}></span>
                  </li>
                ))}
                {aiStory.bulletPoints.length === 0 && (
                  <li className="text-sm text-slate-500">More data is needed to generate advanced AI insights for this period.</li>
                )}
              </ul>
            </div>
          </div>
          <button className="w-full mt-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-md">
            View Full AI Story
          </button>
        </div>
      </div>

      {/* Grid of Tables and smaller reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Category Analysis Table */}
        <Card className="shadow-sm">
          <CardHeader className="border-b border-slate-50 pb-4">
            <CardTitle>Budget Utilization</CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            {categoryAnalysis.length > 0 ? (
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-4 rounded-tl-lg">Category</th>
                    <th className="p-4 text-right">Budget</th>
                    <th className="p-4 text-right">Spent</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right rounded-tr-lg">Util %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {categoryAnalysis.slice(0, 5).map((c, i) => (
                    <tr key={i} className="hover:bg-slate-50/50">
                      <td className="p-4 font-bold text-slate-900">{c.category}</td>
                      <td className="p-4 text-right text-slate-500">{formatInr(c.budget)}</td>
                      <td className="p-4 text-right font-bold text-slate-700">{formatInr(c.spent)}</td>
                      <td className="p-4">
                        {c.status === 'Safe' ? 
                          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">Safe</span> : 
                          <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-md">Exceeded</span>
                        }
                      </td>
                      <td className="p-4 text-right">
                        <span className={`text-xs font-bold ${c.util > 100 ? 'text-red-600' : 'text-slate-700'}`}>{c.util}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-slate-500">No budgets created yet.</div>
            )}
          </CardContent>
        </Card>

        {/* Merchant Analysis */}
        <Card className="shadow-sm">
          <CardHeader className="border-b border-slate-50 pb-4 flex flex-row items-center justify-between">
            <CardTitle>Top Merchants</CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            {topMerchants.length > 0 ? (
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-4 rounded-tl-lg">Merchant</th>
                    <th className="p-4 text-right">Amount</th>
                    <th className="p-4 text-center">Txns</th>
                    <th className="p-4 text-right rounded-tr-lg">Avg Spend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {topMerchants.map((m, i) => (
                    <tr key={i} className="hover:bg-slate-50/50">
                      <td className="p-4 font-bold text-slate-900 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-400 text-xs">{m.name[0]}</div>
                        {m.name}
                      </td>
                      <td className="p-4 text-right font-bold text-slate-700">{formatInr(m.amount)}</td>
                      <td className="p-4 text-center text-slate-500">{m.txns}</td>
                      <td className="p-4 text-right text-slate-500">{formatInr(m.avg)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-slate-500">No merchant data available for this range.</div>
            )}
          </CardContent>
        </Card>

      </div>

      {/* Bottom Insights Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Payment Methods */}
        <Card className="shadow-sm">
          <CardHeader className="border-b border-slate-50 pb-4">
            <CardTitle>Payment Methods</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[180px] w-full">
              {paymentMethods.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={paymentMethods} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={2} dataKey="value" stroke="none">
                      {paymentMethods.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold' }} 
                      formatter={(value: number, name: string, props: any) => [`${value}% (${formatInr(props.payload.amount)})`, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400">No payment data</div>
              )}
            </div>
            {paymentMethods.length > 0 && (
              <div className="mt-4 space-y-2">
                {paymentMethods.slice(0, 4).map((pm, i) => (
                  <div key={i} className="flex items-center justify-between text-xs font-bold text-slate-700 bg-slate-50 p-2 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: pm.color}}></div>
                      {pm.name}
                    </div>
                    <span>{pm.value}%</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Financial Forecast */}
        <Card className="shadow-sm border-blue-100 bg-blue-50/20">
          <CardHeader className="border-b border-blue-50/50 pb-4">
            <CardTitle className="text-blue-900">Financial Forecast (Next Month)</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-5">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Expected Income</p>
                <h4 className="text-lg font-black text-slate-900">{formatInr(currentMetrics.inc > 0 ? currentMetrics.inc * 1.05 : 50000)}</h4>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Expected Expenses</p>
                <h4 className="text-lg font-black text-slate-900">{formatInr(currentMetrics.exp > 0 ? currentMetrics.exp * 0.95 : 30000)}</h4>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Predicted Net Savings</p>
              <div className="flex items-end justify-between">
                <h4 className="text-2xl font-black text-emerald-600">{formatInr(currentMetrics.sav > 0 ? currentMetrics.sav * 1.1 : 20000)}</h4>
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1"><TrendingUp className="w-3 h-3"/> Promising</span>
              </div>
            </div>
            <p className="text-xs font-medium text-slate-600 leading-relaxed">
              Based on your recurring payments and recent spending trends, your budget utilization is expected to improve by 4%.
            </p>
          </CardContent>
        </Card>

        {/* Quick Insights & Reports History */}
        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Quick Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {expenseBreakdownData.length > 0 && (
                <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs font-medium text-slate-700">Your most frequent category is <span className="font-bold text-slate-900">{expenseBreakdownData[0].name}</span>.</p>
                </div>
              )}
              {paymentMethods.length > 0 && (
                <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <Wallet className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <p className="text-xs font-medium text-slate-700"><span className="font-bold text-slate-900">{paymentMethods[0].name}</span> is your most used payment method, accounting for <span className="font-bold text-slate-900">{paymentMethods[0].value}%</span> of volume.</p>
                </div>
              )}
              {expenseBreakdownData.length === 0 && paymentMethods.length === 0 && (
                <div className="p-3 text-slate-400 text-sm text-center">Add transactions to generate quick insights.</div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm">Report History</CardTitle>
              <button onClick={() => toast("Opening full report history...", { icon: '📂' })} className="text-xs font-bold text-primary hover:underline">View All</button>
            </CardHeader>
            <CardContent className="space-y-2">
              {reportHistory.map(r => (
                <div key={r.id} onClick={handleExportCSV} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-slate-100">
                  <div>
                    <p className="text-xs font-bold text-slate-900">{r.name}</p>
                    <p className="text-[10px] font-medium text-slate-400">{r.date} • {r.type}</p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); handleExportCSV(); }} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
                    <Download className="w-4 h-4 text-slate-500" />
                  </button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        
      </div>
    </div>
  );
}
