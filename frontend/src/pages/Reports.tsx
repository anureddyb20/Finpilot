import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { 
  ArrowUpRight, ArrowDownRight, Download, Printer, Share2, 
  TrendingUp, TrendingDown, CheckCircle2, AlertTriangle, Zap,
  Target, Target as TargetIcon, Clock, CreditCard, Wallet, Smartphone, Shield, AlertCircle, Bot
} from 'lucide-react';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend 
} from 'recharts';

const formatInr = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// --- Mock Data ---

const incomeExpenseData = [
  { month: 'Jan', income: 82000, expenses: 45000, savings: 37000 },
  { month: 'Feb', income: 85000, expenses: 48000, savings: 37000 },
  { month: 'Mar', income: 85000, expenses: 42000, savings: 43000 },
  { month: 'Apr', income: 90000, expenses: 51000, savings: 39000 },
  { month: 'May', income: 85000, expenses: 46000, savings: 39000 },
  { month: 'Jun', income: 95000, expenses: 58000, savings: 37000 },
  { month: 'Jul', income: 85000, expenses: 49000, savings: 36000 },
];

const expenseBreakdownData = [
  { name: 'Rent', value: 18000, color: '#3B82F6' },
  { name: 'Food', value: 12500, color: '#10B981' },
  { name: 'Shopping', value: 8500, color: '#F59E0B' },
  { name: 'Travel', value: 4200, color: '#8B5CF6' },
  { name: 'Bills', value: 3450, color: '#EC4899' },
  { name: 'Entertainment', value: 2350, color: '#F43F5E' },
];

const cashFlowData = [
  { month: 'Jan', netCash: 37000 },
  { month: 'Feb', netCash: 37000 },
  { month: 'Mar', netCash: 43000 },
  { month: 'Apr', netCash: 39000 },
  { month: 'May', netCash: 39000 },
  { month: 'Jun', netCash: 37000 },
  { month: 'Jul', netCash: 36000 },
];

const categoryAnalysis = [
  { category: 'Food', budget: 15000, spent: 12500, remaining: 2500, util: 83, status: 'Safe' },
  { category: 'Shopping', budget: 6000, spent: 8500, remaining: -2500, util: 141, status: 'Exceeded' },
  { category: 'Travel', budget: 5000, spent: 4200, remaining: 800, util: 84, status: 'Safe' },
  { category: 'Bills', budget: 4000, spent: 3450, remaining: 550, util: 86, status: 'Safe' },
];

const topCategories = [
  { category: 'Rent', amount: 18000, percent: 36, trend: 'stable' },
  { category: 'Food', amount: 12500, percent: 25, trend: 'down' },
  { category: 'Shopping', amount: 8500, percent: 17, trend: 'up' },
  { category: 'Travel', amount: 4200, percent: 8, trend: 'stable' },
  { category: 'Bills', amount: 3450, percent: 7, trend: 'up' },
];

const paymentMethods = [
  { name: 'UPI', value: 65, amount: 31850, count: 42, color: '#8B5CF6' },
  { name: 'Credit Card', value: 25, amount: 12250, count: 8, color: '#3B82F6' },
  { name: 'Net Banking', value: 8, amount: 3920, count: 3, color: '#10B981' },
  { name: 'Cash', value: 2, amount: 980, count: 2, color: '#F59E0B' },
];

const topMerchants = [
  { name: 'Amazon', amount: 4500, txns: 4, avg: 1125 },
  { name: 'Swiggy', amount: 3200, txns: 8, avg: 400 },
  { name: 'Zomato', amount: 2800, txns: 6, avg: 466 },
  { name: 'Uber', amount: 1800, txns: 5, avg: 360 },
  { name: 'Flipkart', amount: 1200, txns: 1, avg: 1200 },
];

const reportHistory = [
  { id: 1, name: 'Q2 2026 Financial Summary', date: '2026-07-01', type: 'Quarterly' },
  { id: 2, name: 'June 2026 Monthly Report', date: '2026-07-01', type: 'Monthly' },
  { id: 3, name: 'May 2026 Monthly Report', date: '2026-06-01', type: 'Monthly' },
];

export function Reports() {
  const [dateRange, setDateRange] = useState('This Month');
  const [filterBy, setFilterBy] = useState('All');

  return (
    <div className="space-y-6 pb-20">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Reports & Analytics</h1>
          <p className="text-slate-500">Understand your financial performance through intelligent reports and visual analytics.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
            <Zap className="w-4 h-4" /> Generate Report
          </button>
          <button className="px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" /> Export
          </button>
          <button className="px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-2 hidden sm:flex">
            <Printer className="w-4 h-4" /> Print
          </button>
          <button className="px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-2 hidden sm:flex">
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
            <option>Budget</option>
            <option>Goals</option>
            <option>Recurring</option>
            <option>Financial Health</option>
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
            <h4 className="text-2xl font-black text-slate-900">{formatInr(85000)}</h4>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-emerald-600 flex items-center font-bold bg-emerald-50 px-2 py-0.5 rounded-full"><ArrowUpRight className="w-3 h-3 mr-1"/> 5.2%</span>
              <span className="text-slate-400 font-medium text-xs">vs Last Month</span>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <p className="text-sm font-bold text-slate-500 mb-1">Total Expenses</p>
            <h4 className="text-2xl font-black text-slate-900">{formatInr(49000)}</h4>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-red-600 flex items-center font-bold bg-red-50 px-2 py-0.5 rounded-full"><ArrowUpRight className="w-3 h-3 mr-1"/> 12.1%</span>
              <span className="text-slate-400 font-medium text-xs">vs Last Month</span>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <p className="text-sm font-bold text-slate-500 mb-1">Net Savings</p>
            <h4 className="text-2xl font-black text-slate-900">{formatInr(36000)}</h4>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-emerald-600 flex items-center font-bold bg-emerald-50 px-2 py-0.5 rounded-full"><ArrowUpRight className="w-3 h-3 mr-1"/> 11.0%</span>
              <span className="text-slate-400 font-medium text-xs">vs Last Month</span>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow bg-gradient-to-br from-indigo-900 to-slate-900 text-white border-none">
          <CardContent className="p-5">
            <p className="text-sm font-bold text-indigo-200 mb-1">Financial Health Score</p>
            <div className="flex items-center gap-3">
              <h4 className="text-3xl font-black text-white">86</h4>
              <span className="text-xs font-bold text-emerald-400 flex items-center bg-white/10 px-2 py-1 rounded-full"><TrendingUp className="w-3 h-3 mr-1"/> +4</span>
            </div>
            <div className="mt-3">
              <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400 rounded-full" style={{width: '86%'}}></div>
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
            <select className="text-xs border-none bg-slate-50 rounded font-medium cursor-pointer py-1">
              <option>Monthly</option>
              <option>Quarterly</option>
              <option>Yearly</option>
            </select>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={incomeExpenseData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(value) => `₹${value/1000}k`} />
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
                <span className="text-xl font-black text-slate-900">{formatInr(49000)}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-2 gap-y-3 mt-6">
              {expenseBreakdownData.map((c, i) => (
                <div key={i} className="flex items-center justify-between text-xs p-1.5 hover:bg-slate-50 rounded-lg transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: c.color}}></div>
                    <span className="text-slate-700 font-bold truncate max-w-[70px]">{c.name}</span>
                  </div>
                  <span className="font-bold text-slate-900">{Math.round((c.value/49000)*100)}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Charts & AI Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Monthly Cash Flow Area Chart */}
        <Card className="xl:col-span-2 shadow-sm">
          <CardHeader className="border-b border-slate-50 pb-4">
            <CardTitle>Monthly Cash Flow (Net Cash)</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cashFlowData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorNetCash" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(value) => `₹${value/1000}k`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                    formatter={(value: number) => formatInr(value)}
                  />
                  <Area type="monotone" dataKey="netCash" name="Net Cash Flow" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorNetCash)" />
                </AreaChart>
              </ResponsiveContainer>
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
                <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider">July 2026 Analysis</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <p className="text-sm font-medium text-slate-700 leading-relaxed">
                This month you earned <strong className="text-slate-900">{formatInr(85000)}</strong> and spent <strong className="text-slate-900">{formatInr(49000)}</strong>.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-2.5 text-sm">
                  <TrendingUp className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-slate-700">Your savings increased by <strong className="text-slate-900">11%</strong>.</span>
                </li>
                <li className="flex items-start gap-2.5 text-sm">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span className="text-slate-700">Shopping expenses increased by <strong className="text-slate-900">14%</strong>, exceeding your budget.</span>
                </li>
                <li className="flex items-start gap-2.5 text-sm">
                  <TrendingDown className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-slate-700">Food expenses decreased by <strong className="text-slate-900">8%</strong>.</span>
                </li>
                <li className="flex items-start gap-2.5 text-sm">
                  <TargetIcon className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <span className="text-slate-700">You are on track to complete your <strong className="text-slate-900">Laptop Goal</strong> by November.</span>
                </li>
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
            <CardTitle>Category Analysis</CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
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
                {categoryAnalysis.map((c, i) => (
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
                      <div className="flex items-center justify-end gap-2">
                        <span className={`text-xs font-bold ${c.util > 100 ? 'text-red-600' : 'text-slate-700'}`}>{c.util}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Merchant Analysis */}
        <Card className="shadow-sm">
          <CardHeader className="border-b border-slate-50 pb-4 flex flex-row items-center justify-between">
            <CardTitle>Top Merchants</CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
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
            </div>
            <div className="mt-4 space-y-2">
              {paymentMethods.map((pm, i) => (
                <div key={i} className="flex items-center justify-between text-xs font-bold text-slate-700 bg-slate-50 p-2 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: pm.color}}></div>
                    {pm.name}
                  </div>
                  <span>{pm.value}%</span>
                </div>
              ))}
            </div>
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
                <h4 className="text-lg font-black text-slate-900">{formatInr(85000)}</h4>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Expected Expenses</p>
                <h4 className="text-lg font-black text-slate-900">{formatInr(47500)}</h4>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Predicted Net Savings</p>
              <div className="flex items-end justify-between">
                <h4 className="text-2xl font-black text-emerald-600">{formatInr(37500)}</h4>
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1"><TrendingUp className="w-3 h-3"/> +1.5%</span>
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
              <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs font-medium text-slate-700">Weekend spending is increasing. <span className="font-bold text-slate-900">+18% this month</span>.</p>
              </div>
              <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <Wallet className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-xs font-medium text-slate-700">UPI is your most used payment method, accounting for <span className="font-bold text-slate-900">65%</span> of volume.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm">Report History</CardTitle>
              <button className="text-xs font-bold text-primary hover:underline">View All</button>
            </CardHeader>
            <CardContent className="space-y-2">
              {reportHistory.map(r => (
                <div key={r.id} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors border border-transparent hover:border-slate-100">
                  <div>
                    <p className="text-xs font-bold text-slate-900">{r.name}</p>
                    <p className="text-[10px] font-medium text-slate-400">{r.date} • {r.type}</p>
                  </div>
                  <Download className="w-4 h-4 text-slate-400" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        
      </div>
    </div>
  );
}
