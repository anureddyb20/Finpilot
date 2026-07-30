import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Receipt, 
  PieChart, 
  Target, 
  Repeat, 
  BarChart, 
  Bot, 
  Settings, 
  LogOut,
  Zap
} from 'lucide-react';
import { cn } from '../ui/Button';
import { supabase } from '../../lib/supabase';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Transactions', href: '/transactions', icon: Receipt },
  { name: 'Budgets', href: '/budgets', icon: PieChart },
  { name: 'Goals', href: '/goals', icon: Target },
  { name: 'Recurring', href: '/recurring', icon: Repeat },
  { name: 'Reports', href: '/reports', icon: BarChart },
  { name: 'AI Advisor', href: '/ai-advisor', icon: Bot },
];

export function Sidebar() {
  const navigate = useNavigate();
  
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="flex flex-col w-64 bg-white border-r border-slate-100 h-screen fixed left-0 top-0">
      <div className="flex items-center gap-2 px-6 h-16 border-b border-slate-100">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold text-slate-900">FinPilot</span>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive 
                  ? 'bg-blue-50 text-primary' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )
            }
          >
            <item.icon className="w-5 h-5" />
            {item.name}
          </NavLink>
        ))}
      </div>

      <div className="p-4 border-t border-slate-100 space-y-1">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              isActive ? 'bg-blue-50 text-primary' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            )
          }
        >
          <Settings className="w-5 h-5" />
          Settings
        </NavLink>
        <button 
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors w-full"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
