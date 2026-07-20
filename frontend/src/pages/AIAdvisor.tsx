import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { 
  Bot, Send, Mic, Sparkles, TrendingUp, TrendingDown, Shield, 
  Target, Target as TargetIcon, Zap, Activity, AlertTriangle, AlertCircle, CheckCircle2,
  PieChart as PieChartIcon, ArrowRight, MessageSquare, Plus, RefreshCw, Smartphone, CreditCard, HeartPulse
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area 
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

const initialChatMessages = [
  { id: 1, sender: 'ai', text: 'Good Evening, Anu! I am your AI Financial Advisor. I have analyzed your finances for this month and generated today\'s recommendations. What would you like to focus on today?', time: '18:30' },
  { id: 2, sender: 'user', text: 'How much did I spend this month?', time: '18:32' },
  { id: 3, sender: 'ai', text: 'You have spent ₹49,000 so far this month. Your highest spending category is Rent (₹18,000), followed by Food (₹12,500). Your food expenses have actually decreased by 9% compared to last month!', time: '18:32' },
];

const quickQuestions = [
  'Analyze My Spending', 'Budget Review', 'Savings Suggestions', 
  'Investment Advice', 'Financial Health', 'Can I afford a ₹65,000 laptop?'
];

const spendingTrendsData = [
  { day: 'Mon', amount: 1200 },
  { day: 'Tue', amount: 950 },
  { day: 'Wed', amount: 800 },
  { day: 'Thu', amount: 2100 },
  { day: 'Fri', amount: 3500 },
  { day: 'Sat', amount: 5200 },
  { day: 'Sun', amount: 4800 },
];

const budgetCoachData = [
  { category: 'Food', used: 82, status: 'Warning', msg: 'You are close to exceeding this budget. Expected month-end spend is ₹16,000 against a budget of ₹15,000.' },
  { category: 'Shopping', used: 141, status: 'Danger', msg: 'Budget exceeded by ₹2,500. Delay unnecessary shopping until next salary.' },
  { category: 'Travel', used: 45, status: 'Safe', msg: 'Great job! You are well within limits.' }
];

const aiRecommendations = [
  { id: 1, title: 'Reduce Dining Expenses', impact: 'High', description: 'Reduce dining out by ₹2,000 to stay within your overall monthly limit.' },
  { id: 2, title: 'Move Surplus to Emergency Fund', impact: 'Medium', description: 'Your travel budget has ₹3,000 surplus. Consider moving it to your Emergency Fund.' },
  { id: 3, title: 'Increase SIP', impact: 'High', description: 'Based on your savings rate, you can comfortably increase your mutual fund SIP by ₹1,000/month.' },
];

export function AIAdvisor() {
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState(initialChatMessages);
  const [activeTab, setActiveTab] = useState<'Home' | 'Spending' | 'Coach' | 'Simulator' | 'Purchase'>('Home');

  // Simulator State
  const [simFoodReduction, setSimFoodReduction] = useState(0);
  const [simExtraInvestment, setSimExtraInvestment] = useState(0);
  const [simSalaryIncrease, setSimSalaryIncrease] = useState(0);

  // Purchase Advisor State
  const [purchaseItem, setPurchaseItem] = useState('');
  const [purchaseAmount, setPurchaseAmount] = useState('');
  const [purchaseResult, setPurchaseResult] = useState<any>(null);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMsg = { id: Date.now(), sender: 'user', text: chatInput, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, newMsg]);
    setChatInput('');

    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now(), sender: 'ai', 
        text: `Based on your recent transactions, that's an interesting question. Let me pull up your data... (This is a mock response to "${newMsg.text}")`, 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 1500);
  };

  const simulatePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!purchaseItem || !purchaseAmount) return;
    
    const amt = Number(purchaseAmount);
    if (amt > 80000) {
      setPurchaseResult({ status: 'High Risk', text: 'This purchase will consume a large portion of your savings and might delay your Emergency Fund goal by 3 months. Consider saving for it over the next 4 months instead.' });
    } else if (amt > 30000) {
      setPurchaseResult({ status: 'Moderate Risk', text: 'You can afford this, but it will reduce your monthly surplus significantly. Ensure you have no upcoming large bills before proceeding.' });
    } else {
      setPurchaseResult({ status: 'Affordable', text: 'You have enough surplus in your budget this month. This purchase won\'t impact your long-term goals.' });
    }
  };

  // Base values for Simulator
  const baseSavings = 36000;
  const baseScore = 86;
  const simulatedSavings = baseSavings + simFoodReduction - simExtraInvestment + simSalaryIncrease;
  const simulatedScore = Math.min(100, baseScore + (simFoodReduction > 0 ? 2 : 0) + (simExtraInvestment > 0 ? 3 : 0));

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-8rem)] pb-10">
      
      {/* Left Column: AI Chat Interface */}
      <div className="w-full lg:w-1/3 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-full">
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-md relative">
            <Bot className="w-5 h-5" />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full"></div>
          </div>
          <div>
            <h2 className="font-bold text-slate-900">FinPilot AI</h2>
            <p className="text-xs font-medium text-slate-500">Your Personal Financial Advisor</p>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
          {messages.map(msg => (
            <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[85%] p-3.5 rounded-2xl ${
                msg.sender === 'user' 
                  ? 'bg-primary text-white rounded-tr-sm shadow-sm' 
                  : 'bg-white border border-slate-100 text-slate-700 rounded-tl-sm shadow-sm'
              }`}>
                <p className="text-sm leading-relaxed">{msg.text}</p>
              </div>
              <span className="text-[10px] text-slate-400 font-medium mt-1 mx-1">{msg.time}</span>
            </div>
          ))}
          
          {/* Quick Questions Chips */}
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100/50">
            {quickQuestions.map(q => (
              <button 
                key={q} onClick={() => setChatInput(q)}
                className="px-3 py-1.5 bg-white border border-indigo-100 text-indigo-600 text-xs font-bold rounded-full hover:bg-indigo-50 transition-colors shadow-sm"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Input */}
        <div className="p-4 bg-white border-t border-slate-100">
          <form onSubmit={handleSendMessage} className="relative flex items-center">
            <button type="button" className="absolute left-3 p-1.5 text-slate-400 hover:text-indigo-600 transition-colors bg-slate-50 rounded-full">
              <Mic className="w-4 h-4" />
            </button>
            <input 
              type="text" 
              value={chatInput} 
              onChange={e => setChatInput(e.target.value)}
              placeholder="Ask anything about your finances..." 
              className="w-full pl-12 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-sm font-medium"
            />
            <button type="submit" disabled={!chatInput.trim()} className="absolute right-2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Right Column: Interactive Insights & Tools */}
      <div className="w-full lg:w-2/3 flex flex-col gap-4 overflow-y-auto pr-2 scrollbar-hide">
        
        {/* Module Navigation Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide bg-white p-2 rounded-xl shadow-sm border border-slate-100">
          {[
            { id: 'Home', icon: Sparkles, label: 'AI Home' },
            { id: 'Spending', icon: PieChartIcon, label: 'Spending' },
            { id: 'Coach', icon: Target, label: 'Coaches' },
            { id: 'Simulator', icon: Activity, label: 'What-If' },
            { id: 'Purchase', icon: CreditCard, label: 'Purchase' }
          ].map(tab => (
            <button 
              key={tab.id} onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors flex items-center gap-2 ${
                activeTab === tab.id ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'Home' && (
            <motion.div key="home" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              
              {/* Welcome Card */}
              <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-6 shadow-md text-white relative overflow-hidden">
                <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between gap-6 items-start md:items-center">
                  <div>
                    <h2 className="text-2xl font-black mb-1">Good Evening, Anu.</h2>
                    <p className="text-indigo-200 text-sm font-medium mb-4">I've analyzed your finances and generated today's report.</p>
                    <div className="flex gap-4 items-center bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/5 inline-flex">
                      <HeartPulse className="w-5 h-5 text-emerald-400" />
                      <div>
                        <p className="text-xs text-indigo-200 font-bold uppercase tracking-wider">Health Score</p>
                        <p className="text-xl font-black">82<span className="text-sm text-indigo-300">/100</span></p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10 w-full md:w-auto">
                    <p className="text-xs text-indigo-300 font-bold uppercase tracking-wider mb-3 flex items-center gap-2"><Zap className="w-3 h-3 text-amber-400"/> Quick Summary</p>
                    <ul className="space-y-2 text-sm font-medium">
                      <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400"/> Saved {formatInr(18200)} this month.</li>
                      <li className="flex items-center gap-2"><TrendingDown className="w-4 h-4 text-emerald-400"/> Food spending down 9%.</li>
                      <li className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-red-400"/> Shopping increased by 12%.</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Snapshot Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Balance', value: formatInr(120000), trend: '+2%' },
                  { label: 'Income', value: formatInr(85000), trend: 'stable' },
                  { label: 'Expenses', value: formatInr(49000), trend: '+12%' },
                  { label: 'Savings', value: formatInr(36000), trend: '-5%' }
                ].map((item, i) => (
                  <Card key={i} className="shadow-sm border-slate-100">
                    <CardContent className="p-4">
                      <p className="text-xs font-bold text-slate-500 mb-1">{item.label}</p>
                      <p className="text-lg font-black text-slate-900">{item.value}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* AI Recommendations */}
              <Card className="shadow-sm">
                <CardHeader className="pb-3 border-b border-slate-50 flex flex-row items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-500" />
                  <CardTitle>Top AI Recommendations</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  {aiRecommendations.map(rec => (
                    <div key={rec.id} className="flex gap-4 p-4 bg-slate-50 rounded-xl hover:bg-indigo-50/50 transition-colors border border-slate-100">
                      <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${rec.impact === 'High' ? 'bg-red-500' : 'bg-amber-500'}`}></div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm mb-1">{rec.title} <span className="text-[10px] px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-500 ml-2">{rec.impact} Impact</span></h4>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed">{rec.description}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === 'Spending' && (
            <motion.div key="spending" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Daily Spending Patterns</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={spendingTrendsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(value) => `₹${value}`} />
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(value: number) => formatInr(value)} />
                        <Area type="monotone" dataKey="amount" stroke="#8B5CF6" strokeWidth={3} fill="url(#colorSpend)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-6 bg-indigo-50 p-4 rounded-xl flex gap-3 items-start border border-indigo-100">
                    <AlertCircle className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                    <p className="text-sm font-medium text-indigo-900 leading-relaxed">
                      Your weekend spending (<strong className="font-black">{formatInr(10000)}</strong>) is significantly higher than weekdays. A large portion of this goes to dining out. Consider setting a specific weekend budget.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === 'Coach' && (
            <motion.div key="coach" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2"><TargetIcon className="w-5 h-5 text-blue-500" /> Budget Coach</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {budgetCoachData.map((b, i) => (
                  <Card key={i} className={`shadow-sm border-l-4 ${b.status === 'Danger' ? 'border-l-red-500' : b.status === 'Warning' ? 'border-l-amber-500' : 'border-l-emerald-500'}`}>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="font-bold text-slate-900">{b.category} Budget</h4>
                        <span className={`text-xs font-bold px-2 py-1 rounded-md ${b.status === 'Danger' ? 'bg-red-50 text-red-700' : b.status === 'Warning' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>{b.used}% Used</span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium leading-relaxed bg-slate-50 p-2 rounded">{b.msg}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2 mt-8"><Target className="w-5 h-5 text-emerald-500" /> Goal Coach</h3>
              <Card className="shadow-sm">
                <CardContent className="p-5">
                  <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center"><Smartphone className="w-5 h-5 text-blue-600"/></div>
                      <div>
                        <h4 className="font-bold text-slate-900">Laptop Goal</h4>
                        <p className="text-xs text-slate-500">Target: {formatInr(85000)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-slate-900">{formatInr(45000)}</p>
                      <p className="text-xs font-bold text-emerald-600">52% Reached</p>
                    </div>
                  </div>
                  <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm font-medium flex items-start gap-2 border border-blue-100">
                    <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
                    If you increase your monthly contribution by just {formatInr(2000)}, you will complete this goal two months earlier (by September).
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === 'Simulator' && (
            <motion.div key="sim" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Activity className="w-5 h-5 text-indigo-500"/> What-If Simulator</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Controls */}
                    <div className="space-y-6">
                      <div>
                        <label className="text-sm font-bold text-slate-700 flex justify-between mb-2">
                          <span>Reduce Food Spending</span>
                          <span className="text-indigo-600">{formatInr(simFoodReduction)}</span>
                        </label>
                        <input type="range" min="0" max="10000" step="500" value={simFoodReduction} onChange={(e) => setSimFoodReduction(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                      </div>
                      <div>
                        <label className="text-sm font-bold text-slate-700 flex justify-between mb-2">
                          <span>Increase Monthly Investment</span>
                          <span className="text-indigo-600">{formatInr(simExtraInvestment)}</span>
                        </label>
                        <input type="range" min="0" max="20000" step="1000" value={simExtraInvestment} onChange={(e) => setSimExtraInvestment(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                      </div>
                      <div>
                        <label className="text-sm font-bold text-slate-700 flex justify-between mb-2">
                          <span>Salary Increase</span>
                          <span className="text-indigo-600">{formatInr(simSalaryIncrease)}</span>
                        </label>
                        <input type="range" min="0" max="50000" step="1000" value={simSalaryIncrease} onChange={(e) => setSimSalaryIncrease(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                      </div>
                    </div>
                    
                    {/* Results Box */}
                    <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-inner flex flex-col justify-center">
                      <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-6">Simulated Impact</h4>
                      <div className="space-y-6">
                        <div className="flex justify-between items-end">
                          <div>
                            <p className="text-slate-300 text-sm font-medium mb-1">New Net Savings</p>
                            <p className="text-3xl font-black text-white">{formatInr(simulatedSavings)}</p>
                          </div>
                          <span className={`text-sm font-bold px-2 py-1 rounded-md ${simulatedSavings >= baseSavings ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                            {simulatedSavings >= baseSavings ? '+' : ''}{formatInr(simulatedSavings - baseSavings)}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-end border-t border-slate-700 pt-6">
                          <div>
                            <p className="text-slate-300 text-sm font-medium mb-1">Health Score</p>
                            <p className="text-2xl font-black text-white">{simulatedScore}<span className="text-slate-500 text-sm">/100</span></p>
                          </div>
                          <span className={`text-sm font-bold px-2 py-1 rounded-md ${simulatedScore >= baseScore ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                            {simulatedScore >= baseScore ? '+' : ''}{simulatedScore - baseScore} Pts
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === 'Purchase' && (
            <motion.div key="purchase" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              <Card className="shadow-sm">
                <CardHeader className="bg-slate-50 border-b border-slate-100 rounded-t-xl">
                  <CardTitle className="flex items-center gap-2"><CreditCard className="w-5 h-5 text-indigo-500"/> Purchase Advisor</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-sm font-medium text-slate-600 mb-6">Ask me if you can afford a big purchase. I will analyze your current cash flow, upcoming bills, and goals to give you a risk assessment.</p>
                  
                  <form onSubmit={simulatePurchase} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Item Name</label>
                      <input required type="text" value={purchaseItem} onChange={e => setPurchaseItem(e.target.value)} placeholder="e.g. iPhone 15, Vacation" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Estimated Cost (₹)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-3 text-slate-500 font-medium">₹</span>
                        <input required type="number" value={purchaseAmount} onChange={e => setPurchaseAmount(e.target.value)} placeholder="80000" className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium" />
                      </div>
                    </div>
                    <div className="md:col-span-2 mt-2">
                      <button type="submit" className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-md flex items-center justify-center gap-2">
                        <Sparkles className="w-4 h-4" /> Analyze Affordability
                      </button>
                    </div>
                  </form>

                  {purchaseResult && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={`p-5 rounded-2xl border ${purchaseResult.status === 'High Risk' ? 'bg-red-50 border-red-100' : purchaseResult.status === 'Moderate Risk' ? 'bg-amber-50 border-amber-100' : 'bg-emerald-50 border-emerald-100'}`}>
                      <h4 className={`font-black text-lg mb-2 flex items-center gap-2 ${purchaseResult.status === 'High Risk' ? 'text-red-700' : purchaseResult.status === 'Moderate Risk' ? 'text-amber-700' : 'text-emerald-700'}`}>
                        {purchaseResult.status === 'High Risk' ? <AlertTriangle className="w-5 h-5"/> : purchaseResult.status === 'Moderate Risk' ? <AlertCircle className="w-5 h-5"/> : <CheckCircle2 className="w-5 h-5"/>}
                        {purchaseResult.status}
                      </h4>
                      <p className={`text-sm font-medium leading-relaxed ${purchaseResult.status === 'High Risk' ? 'text-red-800' : purchaseResult.status === 'Moderate Risk' ? 'text-amber-800' : 'text-emerald-800'}`}>
                        {purchaseResult.text}
                      </p>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
