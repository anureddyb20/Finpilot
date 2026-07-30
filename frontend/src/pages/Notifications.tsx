import { useState, useMemo } from 'react';
import { 
  Bell, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  Target, 
  PieChart, 
  Receipt, 
  Repeat,
  BarChart,
  Bot,
  ShieldAlert,
  Trophy,
  Check,
  Archive,
  Trash2,
  Calendar,
  Clock
} from 'lucide-react';
import { cn } from '../components/ui/Button';

// -- MOCK DATA --
type Priority = 'critical' | 'high' | 'medium' | 'low';
type Category = 'transactions' | 'budgets' | 'goals' | 'recurring' | 'reports' | 'ai' | 'security' | 'achievements' | 'system';
type Type = 'information' | 'success' | 'warning' | 'critical' | 'achievement' | 'reminder' | 'ai_recommendation';

interface Notification {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  priority: Priority;
  category: Category;
  type: Type;
  isRead: boolean;
  isImportant: boolean;
  isArchived: boolean;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Unknown device attempted login.',
    description: 'A login attempt was blocked from an unrecognized device in Mumbai. Please review your security settings immediately.',
    date: 'Today',
    time: '10:45 AM',
    priority: 'critical',
    category: 'security',
    type: 'critical',
    isRead: false,
    isImportant: true,
    isArchived: false,
  },
  {
    id: '2',
    title: 'Shopping Budget exceeded by ₹1,200.',
    description: 'You have spent ₹16,200 on Shopping this month, exceeding your budget of ₹15,000.',
    date: 'Today',
    time: '09:30 AM',
    priority: 'high',
    category: 'budgets',
    type: 'warning',
    isRead: false,
    isImportant: false,
    isArchived: false,
  },
  {
    id: '3',
    title: 'Salary of ₹85,000 received.',
    description: 'Your monthly salary has been credited to your HDFC Bank account.',
    date: 'Today',
    time: '08:00 AM',
    priority: 'medium',
    category: 'transactions',
    type: 'success',
    isRead: false,
    isImportant: true,
    isArchived: false,
  },
  {
    id: '4',
    title: 'Subscription savings opportunity detected.',
    description: 'You are paying ₹1,499/mo for 3 streaming services. Consolidating or cancelling one could save you ₹5,988 yearly.',
    date: 'Yesterday',
    time: '04:15 PM',
    priority: 'medium',
    category: 'ai',
    type: 'ai_recommendation',
    isRead: true,
    isImportant: false,
    isArchived: false,
  },
  {
    id: '5',
    title: 'Completed first financial goal.',
    description: 'Congratulations! You reached your Emergency Fund goal of ₹1,00,000. Keep up the great financial habits.',
    date: 'Yesterday',
    time: '01:00 PM',
    priority: 'medium',
    category: 'achievements',
    type: 'achievement',
    isRead: true,
    isImportant: true,
    isArchived: false,
  },
  {
    id: '6',
    title: 'Electricity bill due in 2 days.',
    description: 'Your recurring payment for BESCOM (₹2,150) is due on the 23rd.',
    date: 'Yesterday',
    time: '10:00 AM',
    priority: 'medium',
    category: 'recurring',
    type: 'reminder',
    isRead: true,
    isImportant: false,
    isArchived: false,
  },
  {
    id: '7',
    title: 'Monthly report is ready.',
    description: 'Your detailed financial summary for the previous month is now available for review and download.',
    date: 'Oct 15',
    time: '09:00 AM',
    priority: 'low',
    category: 'reports',
    type: 'information',
    isRead: true,
    isImportant: false,
    isArchived: false,
  }
];

// Map types to icons and colors
const getTypeStyles = (type: Type) => {
  switch (type) {
    case 'critical':
      return { icon: ShieldAlert, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' };
    case 'warning':
      return { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' };
    case 'success':
      return { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' };
    case 'achievement':
      return { icon: Trophy, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-100' };
    case 'ai_recommendation':
      return { icon: Bot, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' };
    case 'reminder':
      return { icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' };
    case 'information':
    default:
      return { icon: Info, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' };
  }
};

export function Notifications() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [statusFilter, setStatusFilter] = useState<'all' | 'unread' | 'read' | 'important' | 'archived'>('all');
  const [categoryFilter, setCategoryFilter] = useState<Category | 'all'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'yesterday' | 'week' | 'month'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Derived stats
  const unreadCount = notifications.filter(n => !n.isRead && !n.isArchived).length;
  const todayCount = notifications.filter(n => n.date === 'Today' && !n.isArchived).length;
  const criticalCount = notifications.filter(n => n.priority === 'critical' && !n.isArchived).length;
  const aiCount = notifications.filter(n => n.category === 'ai' && !n.isArchived).length;

  // Filtering Logic
  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      // 1. Status Filter
      if (statusFilter === 'unread' && n.isRead) return false;
      if (statusFilter === 'read' && !n.isRead) return false;
      if (statusFilter === 'important' && !n.isImportant) return false;
      if (statusFilter === 'archived' && !n.isArchived) return false;
      if (statusFilter !== 'archived' && n.isArchived) return false; // Hide archived by default

      // 2. Category Filter
      if (categoryFilter !== 'all' && n.category !== categoryFilter) return false;

      // 3. Date Filter (simplified for mock data)
      if (dateFilter === 'today' && n.date !== 'Today') return false;
      if (dateFilter === 'yesterday' && n.date !== 'Yesterday') return false;
      // Note: complex date logic omitted for mock

      // 4. Search Filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!n.title.toLowerCase().includes(query) && !n.description.toLowerCase().includes(query)) return false;
      }

      return true;
    }).sort((a, b) => {
      // Critical always at top
      if (a.priority === 'critical' && b.priority !== 'critical') return -1;
      if (b.priority === 'critical' && a.priority !== 'critical') return 1;
      return 0; // Keeping original order otherwise
    });
  }, [notifications, statusFilter, categoryFilter, dateFilter, searchQuery]);

  // Actions
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const archive = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isArchived: true } : n));
  };

  const remove = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      
      {/* Header & Top Summary Cards */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Notification Center</h1>
            <p className="text-slate-500 mt-1">Stay updated with your latest financial events and alerts.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Unread</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{unreadCount}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <Bell className="w-6 h-6" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Today</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{todayCount}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-600">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 border border-red-100 shadow-sm flex items-center justify-between relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
            <div>
              <p className="text-sm font-medium text-red-600">Critical Alerts</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{criticalCount}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600">
              <ShieldAlert className="w-6 h-6" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 border border-indigo-100 shadow-sm flex items-center justify-between relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
            <div>
              <p className="text-sm font-medium text-indigo-600">AI Recommendations</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{aiCount}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Bot className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Sidebar Filters */}
        <div className="w-full lg:w-64 shrink-0 space-y-6">
          
          {/* Status Filter */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Status</h3>
            <div className="space-y-1">
              {[
                { id: 'all', label: 'All Notifications' },
                { id: 'unread', label: 'Unread' },
                { id: 'read', label: 'Read' },
                { id: 'important', label: 'Important' },
                { id: 'archived', label: 'Archived' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setStatusFilter(f.id as any)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    statusFilter === f.id ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50"
                  )}
                >
                  {f.label}
                  {f.id === 'unread' && unreadCount > 0 && (
                    <span className="bg-primary text-white text-[10px] px-2 py-0.5 rounded-full">{unreadCount}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Categories</h3>
            <div className="space-y-1">
              {[
                { id: 'all', label: 'All Categories', icon: Bell },
                { id: 'transactions', label: 'Transactions', icon: Receipt },
                { id: 'budgets', label: 'Budgets', icon: PieChart },
                { id: 'goals', label: 'Goals', icon: Target },
                { id: 'recurring', label: 'Recurring', icon: Repeat },
                { id: 'reports', label: 'Reports', icon: BarChart },
                { id: 'ai', label: 'AI Advisor', icon: Bot },
                { id: 'security', label: 'Security', icon: ShieldAlert },
                { id: 'achievements', label: 'Achievements', icon: Trophy },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setCategoryFilter(f.id as any)}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    categoryFilter === f.id ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <f.icon className="w-4 h-4" />
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date Filter */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Date</h3>
            <div className="space-y-1">
              {['all', 'today', 'yesterday', 'week', 'month'].map(id => (
                <button
                  key={id}
                  onClick={() => setDateFilter(id as any)}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors capitalize",
                    dateFilter === id ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50"
                  )}
                >
                  {id === 'all' ? 'Any Time' : id === 'week' ? 'This Week' : id === 'month' ? 'This Month' : id}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden min-h-[600px]">
          
          {/* Top Bar: Search & Actions */}
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search notifications..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
            
            <button 
              onClick={markAllAsRead}
              className="text-sm font-medium text-primary hover:text-blue-700 whitespace-nowrap"
            >
              Mark all as read
            </button>
          </div>

          {/* Notifications Feed */}
          <div className="flex-1 overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">You're all caught up!</h3>
                <p className="text-slate-500 text-sm max-w-sm">
                  No new notifications right now. We'll notify you whenever something important happens.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredNotifications.map((notification) => {
                  const style = getTypeStyles(notification.type);
                  const Icon = style.icon;

                  return (
                    <div 
                      key={notification.id} 
                      className={cn(
                        "p-5 hover:bg-slate-50 transition-colors flex gap-4 group relative",
                        !notification.isRead && "bg-blue-50/30"
                      )}
                    >
                      {/* Unread indicator */}
                      {!notification.isRead && (
                        <div className="absolute left-0 top-0 w-1 h-full bg-primary rounded-r"></div>
                      )}

                      {/* Icon */}
                      <div className={cn("w-12 h-12 rounded-full flex items-center justify-center shrink-0 border", style.bg, style.color, style.border)}>
                        <Icon className="w-6 h-6" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-sm font-bold text-slate-900">{notification.title}</h4>
                              {notification.priority === 'critical' && (
                                <span className="bg-red-100 text-red-700 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Critical</span>
                              )}
                            </div>
                            <p className="text-sm text-slate-600 mb-2 line-clamp-2">{notification.description}</p>
                            <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
                              <span>{notification.date} at {notification.time}</span>
                              <span>•</span>
                              <span className="capitalize">{notification.category}</span>
                            </div>
                          </div>
                          
                          {/* Quick Actions (Hover) */}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 bg-white rounded-lg border border-slate-200 shadow-sm p-1">
                            {!notification.isRead && (
                              <button onClick={() => markAsRead(notification.id)} className="p-1.5 text-slate-400 hover:text-primary rounded hover:bg-blue-50 transition-colors" title="Mark as read">
                                <Check className="w-4 h-4" />
                              </button>
                            )}
                            <button onClick={() => archive(notification.id)} className="p-1.5 text-slate-400 hover:text-slate-900 rounded hover:bg-slate-100 transition-colors" title="Archive">
                              <Archive className="w-4 h-4" />
                            </button>
                            <button onClick={() => remove(notification.id)} className="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors" title="Delete">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        {/* Suggested Action Button (if any) */}
                        {notification.type === 'ai_recommendation' && (
                          <div className="mt-3">
                            <button className="text-xs font-medium px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors">
                              Review Subscriptions
                            </button>
                          </div>
                        )}
                        {notification.type === 'warning' && notification.category === 'budgets' && (
                          <div className="mt-3">
                            <button className="text-xs font-medium px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors">
                              Adjust Budget
                            </button>
                          </div>
                        )}
                        {notification.priority === 'critical' && (
                          <div className="mt-3">
                            <button className="text-xs font-bold px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm shadow-red-500/20">
                              Secure Account Now
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
