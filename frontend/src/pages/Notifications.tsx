import { useState, useMemo, useEffect, useCallback } from 'react';
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
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

type Priority = 'critical' | 'high' | 'medium' | 'low';
type Category = 'transactions' | 'budgets' | 'goals' | 'recurring' | 'reports' | 'ai' | 'security' | 'achievements' | 'system';
type Type = 'information' | 'success' | 'warning' | 'critical' | 'achievement' | 'reminder' | 'ai_recommendation';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: Category;
  type: Type;
  related_module: string | null;
  related_record_id: string | null;
  priority: Priority;
  is_read: boolean;
  is_archived: boolean;
  action_url: string | null;
  read_at: string | null;
  created_at: string;
}

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

const formatDateString = (dateStr: string) => {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const formatTimeString = (dateStr: string) => {
  return new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

export function Notifications() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [statusFilter, setStatusFilter] = useState<'all' | 'unread' | 'read' | 'important' | 'archived'>('all');
  const [categoryFilter, setCategoryFilter] = useState<Category | 'all'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'yesterday' | 'week' | 'month'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setNotifications(data || []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();

    if (!user) return;
    const subscription = supabase
      .channel('notifications_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, () => {
        fetchNotifications();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user, fetchNotifications]);

  // Derived stats
  const unreadCount = notifications.filter(n => !n.is_read && !n.is_archived).length;
  const todayCount = notifications.filter(n => formatDateString(n.created_at) === 'Today' && !n.is_archived).length;
  const criticalCount = notifications.filter(n => n.priority === 'critical' && !n.is_archived).length;
  const aiCount = notifications.filter(n => n.category === 'ai' && !n.is_archived).length;

  // Filtering Logic
  const filteredNotifications = useMemo(() => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    return notifications.filter(n => {
      // 1. Status Filter
      if (statusFilter === 'unread' && n.is_read) return false;
      if (statusFilter === 'read' && !n.is_read) return false;
      if (statusFilter === 'important' && (n.priority !== 'critical' && n.priority !== 'high')) return false;
      if (statusFilter === 'archived' && !n.is_archived) return false;
      if (statusFilter !== 'archived' && n.is_archived) return false;

      // 2. Category Filter
      if (categoryFilter !== 'all' && n.category !== categoryFilter) return false;

      // 3. Date Filter
      const nDate = new Date(n.created_at);
      if (dateFilter === 'today' && formatDateString(n.created_at) !== 'Today') return false;
      if (dateFilter === 'yesterday' && formatDateString(n.created_at) !== 'Yesterday') return false;
      if (dateFilter === 'week' && nDate < startOfWeek) return false;
      if (dateFilter === 'month' && nDate < startOfMonth) return false;

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
      return 0; // Keeping original order (which is by created_at desc)
    });
  }, [notifications, statusFilter, categoryFilter, dateFilter, searchQuery]);

  // Actions
  const markAllAsRead = async () => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('is_read', false);
      if (error) throw error;
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error(error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (error) {
      console.error(error);
    }
  };

  const archive = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_archived: true })
        .eq('id', id);
      if (error) throw error;
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_archived: true } : n));
    } catch (error) {
      console.error(error);
    }
  };

  const remove = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);
      if (error) throw error;
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  const handleActionClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    if (notification.action_url) {
      navigate(notification.action_url);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      
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
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-slate-500">Loading notifications...</div>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">You're all caught up!</h3>
                <p className="text-slate-500 text-sm max-w-sm">
                  New financial updates will appear here.
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
                        !notification.is_read && "bg-blue-50/30"
                      )}
                    >
                      {/* Unread indicator */}
                      {!notification.is_read && (
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
                              <span>{formatDateString(notification.created_at)} at {formatTimeString(notification.created_at)}</span>
                              <span>•</span>
                              <span className="capitalize">{notification.category}</span>
                            </div>
                          </div>
                          
                          {/* Quick Actions (Hover) */}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 bg-white rounded-lg border border-slate-200 shadow-sm p-1">
                            {!notification.is_read && (
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
                        {notification.action_url && (
                          <div className="mt-3">
                            <button 
                              onClick={() => handleActionClick(notification)}
                              className={cn(
                                "text-xs font-medium px-3 py-1.5 rounded-lg transition-colors shadow-sm",
                                notification.priority === 'critical' 
                                  ? "bg-red-600 text-white hover:bg-red-700 shadow-red-500/20"
                                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                              )}
                            >
                              {notification.priority === 'critical' ? 'Action Required' : 'View Details'}
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
