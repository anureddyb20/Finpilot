import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { 
  ArrowUpRight, Wallet, PiggyBank, CreditCard, TrendingUp,
  Search, Bell, Plus, Minus, Send, Target, Sparkles, Brain, Clock, 
  ShoppingCart, Utensils, Zap, Car, Briefcase, Activity, CheckCircle2,
  AlertTriangle, Laptop, Plane, FileText
} from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, PieChart, Pie, Cell } from 'recharts';

// Data Mocks
const cashFlowDataWeekly = [
  { name: 'Mon', income: 14000, expense: 4000 },
  { name: 'Tue', income: 3000, expense: 1980 },
  { name: 'Wed', income: 20000, expense: 9800 },
  { name: 'Thu', income: 2780, expense: 3908 },
  { name: 'Fri', income: 1890, expense: 4800 },
  { name: 'Sat', income: 2390, expense: 3800 },
  { name: 'Sun', income: 3490, expense: 4300 },
];
const cashFlowDataMonthly = [
  { name: 'Jan', income: 84000, expense: 31000 },
  { name: 'Feb', income: 81000, expense: 33000 },
  { name: 'Mar', income: 88000, expense: 30000 },
  { name: 'Apr', income: 82000, expense: 34000 },
  { name: 'May', income: 85000, expense: 32000 },
  { name: 'Jun', income: 83000, expense: 31500 },
  { name: 'Jul', income: 84500, expense: 32400 },
];
const cashFlowDataYearly = [
  { name: '2021', income: 800000, expense: 400000 },
  { name: '2022', income: 950000, expense: 450000 },
  { name: '2023', income: 1050000, expense: 500000 },
  { name: '2024', income: 1200000, expense: 550000 },
];

const spendingData = [
  { name: 'Food', value: 12500, color: '#F59E0B' },
  { name: 'Rent', value: 12000, color: '#3B82F6' },
  { name: 'Bills', value: 3450, color: '#10B981' },
  { name: 'Travel', value: 2500, color: '#8B5CF6' },
  { name: 'Shopping', value: 4500, color: '#EC4899' },
  { name: 'Healthcare', value: 1500, color: '#EF4444' },
  { name: 'Entertainment', value: 3000, color: '#14B8A6' },
  { name: 'Others', value: 2000, color: '#64748B' },
];

const insights = [
  "You spent 18% more on restaurants this month.",
  "Reducing dining expenses by ₹2,000 will help you reach your Laptop Goal one month earlier.",
  "Your electricity bill has increased for three consecutive months.",
  "You currently save 61% of your monthly income, which is better than your average over the last six months."
];

// Helper to format currency
const formatInr = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
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
            <p className="text-slate-900 font-bold text-sm">Net Savings: {formatInr(income - expense)}</p>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const PieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const total = spendingData.reduce((acc, curr) => acc + curr.value, 0);
    const percentage = ((data.value / total) * 100).toFixed(1);
    
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
  const [timeframe, setTimeframe] = useState<'Weekly' | 'Monthly' | 'Yearly'>('Monthly');
  const [insightIndex, setInsightIndex] = useState(0);
  const [showQuickActions, setShowQuickActions] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setInsightIndex((prev) => (prev + 1) % insights.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const getChartData = () => {
    switch(timeframe) {
      case 'Weekly': return cashFlowDataWeekly;
      case 'Monthly': return cashFlowDataMonthly;
      case 'Yearly': return cashFlowDataYearly;
    }
  };

  return (
    <div className="space-y-8 pb-20 relative min-h-screen">
      {/* Header section with Personalization and Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Good Morning, Anu 👋</h1>
          <p className="text-slate-500">You have saved {formatInr(18200)} this month. Keep it up!</p>
        </div>

      </div>

      {/* Top Summary Cards */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ staggerChildren: 0.1 }}
      >
        {/* Card 1: Total Balance */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Available Balance</p>
                <h4 className="text-3xl font-bold text-slate-900">{formatInr(245620)}</h4>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-emerald-50 text-emerald-600">
                <Wallet className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="flex items-center text-sm font-medium text-emerald-600">
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                  12.5%
                </span>
                <span className="text-sm text-slate-500">from last month</span>
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                <Clock className="w-3 h-3" /> Last Updated: Today • 10:42 AM
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Monthly Income */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Monthly Income</p>
                <h4 className="text-3xl font-bold text-slate-900">{formatInr(84500)}</h4>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-50 text-blue-600">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Income Sources</p>
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600">Salary</span>
                  <span className="font-medium text-slate-900">75%</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600">Freelancing</span>
                  <span className="font-medium text-slate-900">15%</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600">Investments</span>
                  <span className="font-medium text-slate-900">10%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Monthly Expenses */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Monthly Expenses</p>
                <h4 className="text-3xl font-bold text-slate-900">{formatInr(32400)}</h4>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-red-50 text-red-600">
                <CreditCard className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Top Spending</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-amber-50 text-amber-700 rounded-md text-xs font-medium border border-amber-100">Food (38%)</span>
                <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium border border-blue-100">Rent (37%)</span>
                <span className="px-2 py-1 bg-pink-50 text-pink-700 rounded-md text-xs font-medium border border-pink-100">Shopping (14%)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Total Savings */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Total Savings</p>
                <h4 className="text-3xl font-bold text-slate-900">{formatInr(128500)}</h4>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-purple-50 text-purple-600">
                <PiggyBank className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Goal Progress</p>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">Emergency Fund</span>
                    <span className="text-slate-900 font-medium">60%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">Laptop</span>
                    <span className="text-slate-900 font-medium">47%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: '47%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* AI Insights Banner */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
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
              <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-[10px] uppercase tracking-wider">New</span>
            </h3>
            <AnimatePresence mode="wait">
              <motion.p 
                key={insightIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="text-slate-700 font-medium leading-relaxed"
              >
                {insights[insightIndex]}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

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
                  key={t}
                  onClick={() => setTimeframe(t as any)}
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
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} width={60} tickFormatter={(value) => `₹${value/1000}k`} />
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
                    stroke="#10B981" 
                    strokeWidth="12" 
                    fill="none" 
                    strokeDasharray="452.39" 
                    strokeDashoffset="81.43" // 82% score
                    strokeLinecap="round" 
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-4xl font-bold text-slate-900">82</span>
                  <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mt-1">Excellent</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 mt-4 flex-1">
              <h4 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-2">Breakdown</h4>
              <div className="flex justify-between items-center p-2 hover:bg-slate-50 rounded-lg transition-colors">
                <span className="text-sm text-slate-600">Savings Rate</span>
                <span className="text-sm font-medium text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Excellent</span>
              </div>
              <div className="flex justify-between items-center p-2 hover:bg-slate-50 rounded-lg transition-colors">
                <span className="text-sm text-slate-600">Expense Control</span>
                <span className="text-sm font-medium text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Excellent</span>
              </div>
              <div className="flex justify-between items-center p-2 hover:bg-slate-50 rounded-lg transition-colors">
                <span className="text-sm text-slate-600">Emergency Fund</span>
                <span className="text-sm font-medium text-amber-600 flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> Needs Imp.</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100">
              <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <Brain className="w-4 h-4 text-indigo-500" /> AI Suggestion
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Boost your emergency fund by allocating 5% more of your income this month to achieve a "Secure" status faster.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-100">
            <CardTitle>Recent Transactions</CardTitle>
            <button className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">View All</button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {[
                { name: 'Salary', icon: Briefcase, bg: 'bg-emerald-50', text: 'text-emerald-600', amount: 45000, type: 'income', date: 'Today', method: 'UPI' },
                { name: 'Food & Dining', icon: Utensils, bg: 'bg-amber-50', text: 'text-amber-600', amount: -520, type: 'expense', date: 'Yesterday', method: 'Credit Card' },
                { name: 'Amazon', icon: ShoppingCart, bg: 'bg-blue-50', text: 'text-blue-600', amount: -2150, type: 'expense', date: 'Today', method: 'Debit Card' },
                { name: 'Uber', icon: Car, bg: 'bg-slate-100', text: 'text-slate-600', amount: -350, type: 'expense', date: 'Jul 15', method: 'UPI' },
                { name: 'Electricity', icon: Zap, bg: 'bg-yellow-50', text: 'text-yellow-600', amount: -1450, type: 'expense', date: 'Jul 14', method: 'Net Banking' }
              ].map((tx, i) => (
                <div key={i} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.bg} ${tx.text}`}>
                      <tx.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{tx.name}</p>
                      <p className="text-xs text-slate-500">{tx.date} • {tx.method}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${tx.type === 'income' ? 'text-emerald-600' : 'text-slate-900'}`}>
                      {tx.type === 'income' ? '+' : ''}{formatInr(tx.amount)}
                    </p>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${tx.type === 'income' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                      {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
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
            <div className="h-[280px] w-full flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={spendingData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {spendingData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs font-medium text-slate-500">Total</span>
                <span className="text-xl font-bold text-slate-900">{formatInr(32400)}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              {spendingData.slice(0, 4).map((cat, i) => (
                <div key={i} className="flex flex-col">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }}></div>
                    {cat.name}
                  </div>
                  <span className="font-semibold text-slate-900 text-sm pl-4">{formatInr(cat.value)}</span>
                </div>
              ))}
            </div>
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
            {[
              { name: 'Food', spent: 12500, limit: 15000, percent: 83, color: 'bg-amber-500' },
              { name: 'Shopping', spent: 4500, limit: 11000, percent: 41, color: 'bg-pink-500' },
              { name: 'Travel', spent: 2500, limit: 2700, percent: 92, color: 'bg-red-500' }, // Overspending warning
              { name: 'Entertainment', spent: 3000, limit: 5000, percent: 60, color: 'bg-teal-500' },
            ].map((budget, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium text-slate-700">{budget.name}</span>
                  <span className="text-slate-500">{formatInr(budget.spent)} / {formatInr(budget.limit)}</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${budget.percent > 90 ? 'bg-red-500' : budget.color}`} 
                    style={{ width: `${budget.percent}%` }}
                  ></div>
                </div>
                {budget.percent > 90 && (
                  <p className="text-[10px] text-red-500 mt-1 font-medium flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Near limit
                  </p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Savings Goals */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Savings Goals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { name: 'Emergency Fund', icon: PiggyBank, target: 200000, saved: 120000, percent: 60, est: 'Nov 2026', color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { name: 'Laptop', icon: Laptop, target: 90000, saved: 42000, percent: 47, est: 'Aug 2026', color: 'text-blue-600', bg: 'bg-blue-50' },
              { name: 'Vacation', icon: Plane, target: 50000, saved: 18000, percent: 36, est: 'Jan 2027', color: 'text-purple-600', bg: 'bg-purple-50' },
            ].map((goal, i) => (
              <div key={i} className="p-3 border border-slate-100 rounded-xl hover:shadow-sm transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg ${goal.bg} ${goal.color}`}>
                    <goal.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-semibold text-slate-900 text-sm">{goal.name}</h5>
                    <p className="text-xs text-slate-500">Est. {goal.est}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-slate-900">{goal.percent}%</span>
                  </div>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mb-2">
                  <div className={`h-full rounded-full bg-slate-900`} style={{ width: `${goal.percent}%` }}></div>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Saved: {formatInr(goal.saved)}</span>
                  <span>Target: {formatInr(goal.target)}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Upcoming Bills & Monthly Summary */}
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle>Upcoming Bills</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { name: 'Netflix', time: 'Tomorrow', amount: 649, urgent: true },
                { name: 'Electricity', time: '3 Days', amount: 1450, urgent: true },
                { name: 'Internet', time: '5 Days', amount: 999, urgent: false },
                { name: 'Rent', time: '7 Days', amount: 12000, urgent: false },
              ].map((bill, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-lg border border-slate-50 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-8 rounded-full ${bill.urgent ? 'bg-red-500' : 'bg-slate-300'}`}></div>
                    <div>
                      <p className="font-medium text-sm text-slate-900">{bill.name}</p>
                      <p className={`text-xs ${bill.urgent ? 'text-red-500 font-medium' : 'text-slate-500'}`}>{bill.time}</p>
                    </div>
                  </div>
                  <span className="font-semibold text-slate-900">{formatInr(bill.amount)}</span>
                </div>
              ))}
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
                  <span className="font-semibold text-emerald-400">{formatInr(84500)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Expenses</span>
                  <span className="font-semibold text-red-400">{formatInr(32400)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-700">
                  <span className="text-slate-300">Net Savings</span>
                  <span className="font-bold">{formatInr(52100)}</span>
                </div>
              </div>
              <ul className="text-xs text-slate-300 space-y-1.5 relative z-10 list-disc pl-4">
                <li>Savings increased by 11% compared to last month.</li>
                <li>Food spending reduced by 8%.</li>
                <li>Shopping increased by 15%.</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Floating Quick Actions */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        <AnimatePresence>
          {showQuickActions && (
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="flex flex-col gap-2 mb-2"
            >
              {[
                { label: 'Ask AI', icon: Brain, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                { label: 'Create Goal', icon: Target, color: 'text-purple-600', bg: 'bg-purple-50' },
                { label: 'Create Budget', icon: Activity, color: 'text-orange-600', bg: 'bg-orange-50' },
                { label: 'Transfer Money', icon: Send, color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: 'Add Expense', icon: Minus, color: 'text-red-600', bg: 'bg-red-50' },
                { label: 'Add Income', icon: Plus, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              ].map((action, i) => (
                <motion.button 
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
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

    </div>
  );
}
