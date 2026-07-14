import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { ArrowUpRight, ArrowDownRight, Wallet, PiggyBank, CreditCard, TrendingUp } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const data = [
  { name: 'Jan', income: 4000, expense: 2400 },
  { name: 'Feb', income: 3000, expense: 1398 },
  { name: 'Mar', income: 2000, expense: 9800 },
  { name: 'Apr', income: 2780, expense: 3908 },
  { name: 'May', income: 1890, expense: 4800 },
  { name: 'Jun', income: 2390, expense: 3800 },
  { name: 'Jul', income: 3490, expense: 4300 },
];

const StatCard = ({ title, value, icon: Icon, trend, trendValue, isPositive }: any) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <h4 className="text-3xl font-bold text-slate-900">${value}</h4>
        </div>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-primary'}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <span className={`flex items-center text-sm font-medium ${trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
          {trend === 'up' ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
          {trendValue}%
        </span>
        <span className="text-sm text-slate-500">vs last month</span>
      </div>
    </CardContent>
  </Card>
);

export function Dashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500">Welcome back! Here's your financial overview.</p>
      </div>

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ staggerChildren: 0.1 }}
      >
        <StatCard 
          title="Total Balance" 
          value="24,562.00" 
          icon={Wallet} 
          trend="up" 
          trendValue="12.5" 
          isPositive={true} 
        />
        <StatCard 
          title="Monthly Income" 
          value="8,450.00" 
          icon={TrendingUp} 
          trend="up" 
          trendValue="8.2" 
          isPositive={true} 
        />
        <StatCard 
          title="Monthly Expenses" 
          value="3,240.00" 
          icon={CreditCard} 
          trend="down" 
          trendValue="4.1" 
          isPositive={false} 
        />
        <StatCard 
          title="Total Savings" 
          value="12,850.00" 
          icon={PiggyBank} 
          trend="up" 
          trendValue="14.2" 
          isPositive={true} 
        />
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Cash Flow</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="income" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                  <Area type="monotone" dataKey="expense" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Financial Health Score</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center pt-8">
            <div className="relative w-48 h-48 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="96" cy="96" r="88" stroke="#F1F5F9" strokeWidth="12" fill="none" />
                <circle 
                  cx="96" cy="96" r="88" 
                  stroke="#10B981" 
                  strokeWidth="12" 
                  fill="none" 
                  strokeDasharray="552.92" 
                  strokeDashoffset="110.58" // 80% score
                  strokeLinecap="round" 
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-5xl font-bold text-slate-900">80</span>
                <span className="text-sm font-medium text-emerald-600">Excellent</span>
              </div>
            </div>
            <p className="text-center text-sm text-slate-500 mt-8 leading-relaxed">
              Your financial health is looking great! You've maintained a solid savings rate this month.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
