import toast from 'react-hot-toast';
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { 
  ArrowUpRight, Search, Filter, Plus, FileDown, 
  Trash2, MoreHorizontal, FileText, CheckCircle2, Clock, RefreshCw, 
  Utensils, ShoppingCart, Zap, Car, Briefcase, Bot, Tag, 
  X, Edit3, Image as ImageIcon, Monitor, RotateCcw
} from 'lucide-react';
import { AreaChart, Area, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

// Format currency in INR
const formatInr = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export interface Transaction {
  id: string;
  user_id: string;
  date: string;
  time: string;
  category: string;
  merchant: string;
  amount: number;
  type: string;
  method: string;
  status: string;
  notes: string;
  tags: string[];
}

const getCategoryStyles = (category: string) => {
  const mapping: Record<string, any> = {
    'Food': { icon: Utensils, iconBg: 'bg-amber-50', iconText: 'text-amber-600' },
    'Salary': { icon: Briefcase, iconBg: 'bg-emerald-50', iconText: 'text-emerald-600' },
    'Shopping': { icon: ShoppingCart, iconBg: 'bg-pink-50', iconText: 'text-pink-600' },
    'Travel': { icon: Car, iconBg: 'bg-blue-50', iconText: 'text-blue-600' },
    'Bills': { icon: Zap, iconBg: 'bg-yellow-50', iconText: 'text-yellow-600' },
    'Entertainment': { icon: Monitor, iconBg: 'bg-purple-50', iconText: 'text-purple-600' },
    'Refund': { icon: RotateCcw, iconBg: 'bg-slate-100', iconText: 'text-slate-600' },
    'Freelancing': { icon: Briefcase, iconBg: 'bg-emerald-50', iconText: 'text-emerald-600' },
    'Investment': { icon: ArrowUpRight, iconBg: 'bg-indigo-50', iconText: 'text-indigo-600' },
    'Rent': { icon: FileText, iconBg: 'bg-orange-50', iconText: 'text-orange-600' },
    'Healthcare': { icon: FileText, iconBg: 'bg-red-50', iconText: 'text-red-600' },
    'Education': { icon: FileText, iconBg: 'bg-blue-50', iconText: 'text-blue-600' },
    'Business': { icon: Briefcase, iconBg: 'bg-slate-50', iconText: 'text-slate-600' },
    'Insurance': { icon: FileText, iconBg: 'bg-teal-50', iconText: 'text-teal-600' },
    'Taxes': { icon: FileText, iconBg: 'bg-red-50', iconText: 'text-red-600' },
  };
  return mapping[category] || { icon: FileText, iconBg: 'bg-slate-100', iconText: 'text-slate-600' };
};

const analyticsData = [
  { name: '1 Jul', amount: 2400 },
  { name: '5 Jul', amount: 1398 },
  { name: '10 Jul', amount: 9800 },
  { name: '15 Jul', amount: 3908 },
  { name: '19 Jul', amount: 4800 },
];

const categories = ['Salary', 'Freelancing', 'Investment', 'Food', 'Rent', 'Shopping', 'Travel', 'Healthcare', 'Bills', 'Entertainment', 'Education', 'Business', 'Insurance', 'Taxes', 'Others'];
const paymentMethods = ['Cash', 'UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Wallet', 'Cheque'];
const types = ['Income', 'Expense', 'Transfer', 'Refund'];

export function Transactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: 'All',
    dateRange: 'All',
    paymentMethod: 'All',
    status: 'All',
    minAmount: '',
    maxAmount: ''
  });
  const [selectedTxnIds, setSelectedTxnIds] = useState<string[]>([]);
  const [, setIsLoading] = useState(true);
  
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewTxn, setViewTxn] = useState<any>(null); // For detail view
  const [editingTxnId, setEditingTxnId] = useState<string | null>(null);
  const [toast, setToast] = useState<{message: string, type: 'success'|'error'} | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{title: string, message: string, onConfirm: () => void} | null>(null);
  
  const showToast = (message: string, type: 'success'|'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };
  
  // New transaction form state
  const [newTxn, setNewTxn] = useState({
    type: 'Expense', amount: '', category: 'Food', method: 'UPI', merchant: '', date: '', time: '', notes: '', tags: ''
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedTxnIds(transactions.map(t => t.id));
    } else {
      setSelectedTxnIds([]);
    }
  };

  const toggleSelectTxn = (id: string) => {
    if (selectedTxnIds.includes(id)) {
      setSelectedTxnIds(selectedTxnIds.filter(i => i !== id));
    } else {
      setSelectedTxnIds([...selectedTxnIds, id]);
    }
  };

  const fetchTransactions = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .is('deleted_at', null)
        .order('date', { ascending: false })
        .order('time', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTransactions();

    if (!user) return;
    const subscription = supabase
      .channel('transactions_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'transactions',
        filter: `user_id=eq.${user.id}`
      }, () => {
        fetchTransactions();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user, fetchTransactions]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesSearch = 
        t.merchant.toLowerCase().includes(searchTerm.toLowerCase()) || 
        t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.notes && t.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
        t.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = selectedType === 'All' || t.type.toLowerCase() === selectedType.toLowerCase();
      
      const matchesCategory = filters.category === 'All' || t.category === filters.category;
      const matchesMethod = filters.paymentMethod === 'All' || t.method === filters.paymentMethod;
      const matchesStatus = filters.status === 'All' || t.status === filters.status;
      
      let matchesAmount = true;
      if (filters.minAmount) matchesAmount = matchesAmount && t.amount >= parseFloat(filters.minAmount);
      if (filters.maxAmount) matchesAmount = matchesAmount && t.amount <= parseFloat(filters.maxAmount);

      let matchesDate = true;
      if (filters.dateRange !== 'All') {
        const today = new Date();
        const txDate = new Date(t.date);
        if (filters.dateRange === 'This Month') {
          matchesDate = txDate.getMonth() === today.getMonth() && txDate.getFullYear() === today.getFullYear();
        } else if (filters.dateRange === 'Last Month') {
          const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
          matchesDate = txDate.getMonth() === lastMonth.getMonth() && txDate.getFullYear() === lastMonth.getFullYear();
        } else if (filters.dateRange === 'Last 7 Days') {
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(today.getDate() - 7);
          matchesDate = txDate >= sevenDaysAgo;
        }
      }

      return matchesSearch && matchesType && matchesCategory && matchesMethod && matchesStatus && matchesAmount && matchesDate;
    });
  }, [transactions, searchTerm, selectedType, filters]);

  const handleDeleteSelected = async () => {
    setConfirmDialog({
      title: 'Delete Transactions',
      message: `Are you sure you want to delete ${selectedTxnIds.length} selected transactions?`,
      onConfirm: async () => {
        try {
          const { error } = await supabase
            .from('transactions')
            .delete()
            .in('id', selectedTxnIds);

          if (error) throw error;
          
          setTransactions(transactions.filter(t => !selectedTxnIds.includes(t.id)));
          setSelectedTxnIds([]);
          setViewTxn(null);
          showToast('Transactions deleted successfully');
        } catch (error: any) {
          console.error('Error deleting transactions:', error);
          showToast(error.message || 'Failed to delete transactions', 'error');
        }
      }
    });
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const txData = {
        user_id: user.id,
        date: newTxn.date || new Date().toISOString().split('T')[0],
        time: newTxn.time || new Date().toLocaleTimeString('en-US', { hour12: false, hour: 'numeric', minute: 'numeric' }),
        category: newTxn.category,
        merchant: newTxn.merchant || 'Unknown',
        amount: parseFloat(newTxn.amount) || 0,
        type: newTxn.type.toLowerCase(),
        method: newTxn.method,
        status: 'Completed',
        notes: newTxn.notes,
        tags: newTxn.tags ? newTxn.tags.split(',').map(t => t.trim()) : [],
      };

      if (editingTxnId) {
        const { error } = await supabase
          .from('transactions')
          .update(txData)
          .eq('id', editingTxnId);
        if (error) throw error;
        setTransactions(transactions.map(t => t.id === editingTxnId ? { ...t, ...txData } as Transaction : t));
        if (viewTxn?.id === editingTxnId) {
          setViewTxn({ ...viewTxn, ...txData });
        }
      } else {
        const { data, error } = await supabase
          .from('transactions')
          .insert([txData])
          .select()
          .single();
        if (error) throw error;
        setTransactions([data, ...transactions]);
      }

      setIsAddModalOpen(false);
      setEditingTxnId(null);
      setNewTxn({ type: 'Expense', amount: '', category: 'Food', method: 'UPI', merchant: '', date: '', time: '', notes: '', tags: '' });
      showToast(editingTxnId ? 'Transaction updated successfully' : 'Transaction saved successfully');
    } catch (error) {
      console.error('Error saving transaction:', error);
      showToast(error.message || 'Failed to save transaction', 'error');
    }
  };

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0);
  const netCashFlow = totalIncome - totalExpense;

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Transactions</h1>
          <p className="text-slate-500">Manage, categorize, and track all your financial activities.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => toast.success('Feature coming soon!', { icon: '🚧' })}  className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2">
            <FileDown className="w-4 h-4" /> Export
          </button>
          <button onClick={() => setIsAddModalOpen(true)} className="px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Transaction
          </button>
        </div>
      </div>

      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm font-medium text-slate-500 mb-1">Total Transactions</p>
            <h4 className="text-2xl font-bold text-slate-900">{transactions.length}</h4>
            <div className="mt-2 flex items-center text-sm font-medium text-emerald-600">
              <ArrowUpRight className="w-4 h-4 mr-1" /> 12% vs last month
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm font-medium text-slate-500 mb-1">Income This Month</p>
            <h4 className="text-2xl font-bold text-slate-900">{formatInr(totalIncome)}</h4>
            <div className="mt-2 flex items-center text-sm font-medium text-emerald-600">
              <ArrowUpRight className="w-4 h-4 mr-1" /> 5.2% vs last month
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm font-medium text-slate-500 mb-1">Expenses This Month</p>
            <h4 className="text-2xl font-bold text-slate-900">{formatInr(totalExpense)}</h4>
            <div className="mt-2 flex items-center text-sm font-medium text-red-600">
              <ArrowUpRight className="w-4 h-4 mr-1" /> 8.4% vs last month
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm font-medium text-slate-500 mb-1">Net Cash Flow</p>
            <h4 className="text-2xl font-bold text-slate-900">{formatInr(netCashFlow)}</h4>
            <div className="mt-2 flex items-center text-sm font-medium text-emerald-600">
              <ArrowUpRight className="w-4 h-4 mr-1" /> 2.1% vs last month
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Table Area */}
        <Card className="lg:col-span-3 flex flex-col h-[700px]">
          <CardHeader className="border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search transactions..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            <div className="flex gap-2">
              <select 
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="All">All Types</option>
                <option value="Income">Income</option>
                <option value="Expense">Expense</option>
                <option value="Transfer">Transfer</option>
              </select>
              <button onClick={() => setIsFilterModalOpen(true)} className="px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2 text-sm relative">
                <Filter className="w-4 h-4" /> Filters
                {(filters.category !== 'All' || filters.dateRange !== 'All' || filters.paymentMethod !== 'All' || filters.status !== 'All' || filters.minAmount || filters.maxAmount) && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary rounded-full"></span>
                )}
              </button>
            </div>
          </CardHeader>

          {/* Bulk Actions Bar */}
          {selectedTxnIds.length > 0 && (
            <div className="bg-blue-50 px-6 py-3 flex items-center justify-between border-b border-blue-100">
              <span className="text-sm font-medium text-blue-700">{selectedTxnIds.length} selected</span>
              <div className="flex gap-2">
                <button onClick={() => toast.success('Feature coming soon!', { icon: '🚧' })}  className="text-sm px-3 py-1.5 bg-white border border-blue-200 text-blue-700 rounded hover:bg-blue-100 transition-colors">Edit Category</button>
                <button onClick={handleDeleteSelected} className="text-sm px-3 py-1.5 bg-red-100 border border-red-200 text-red-700 rounded hover:bg-red-200 transition-colors flex items-center gap-1">
                  <Trash2 className="w-4 h-4"/> Delete
                </button>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4 font-medium">
                    <input type="checkbox" onChange={handleSelectAll} checked={selectedTxnIds.length === transactions.length && transactions.length > 0} className="rounded border-slate-300 text-primary focus:ring-primary" />
                  </th>
                  <th className="px-6 py-4 font-medium">Date & ID</th>
                  <th className="px-6 py-4 font-medium">Merchant / Category</th>
                  <th className="px-6 py-4 font-medium text-right">Amount</th>
                  <th className="px-6 py-4 font-medium">Status / Method</th>
                  <th className="px-6 py-4 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} onClick={() => setViewTxn(tx)} className="hover:bg-slate-50 transition-colors cursor-pointer group">
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <input 
                        type="checkbox" 
                        checked={selectedTxnIds.includes(tx.id)}
                        onChange={() => toggleSelectTxn(tx.id)}
                        className="rounded border-slate-300 text-primary focus:ring-primary" 
                      />
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900">{tx.date}</p>
                      <p className="text-xs text-slate-500">{tx.id} • {tx.time}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getCategoryStyles(tx.category).iconBg} ${getCategoryStyles(tx.category).iconText}`}>
                          {React.createElement(getCategoryStyles(tx.category).icon, { className: 'w-5 h-5' })}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{tx.merchant}</p>
                          <p className="text-xs text-slate-500">{tx.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className={`font-bold ${tx.type === 'income' ? 'text-emerald-600' : 'text-slate-900'}`}>
                        {tx.type === 'income' ? '+' : ''}{tx.type === 'expense' ? '-' : ''}{formatInr(tx.amount)}
                      </p>
                      <span className={`inline-block mt-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${tx.type === 'income' ? 'bg-emerald-50 text-emerald-700' : tx.type === 'refund' ? 'bg-slate-100 text-slate-700' : 'bg-red-50 text-red-700'}`}>
                        {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 mb-1">
                        {tx.status === 'Completed' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : 
                         tx.status === 'Pending' ? <Clock className="w-3.5 h-3.5 text-amber-500" /> : 
                         <RefreshCw className="w-3.5 h-3.5 text-slate-500" />}
                        <span className="text-xs font-medium text-slate-700">{tx.status}</span>
                      </div>
                      <p className="text-xs text-slate-500">{tx.method}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={(e) => { e.stopPropagation(); setViewTxn(tx); }} className="text-slate-400 hover:text-primary transition-colors opacity-0 group-hover:opacity-100">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredTransactions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-500">
                      No transactions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Transaction Details Panel */}
          <AnimatePresence mode="wait">
            {viewTxn ? (
              <motion.div
                key="details"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <Card className="border-primary/20 shadow-md">
                  <CardHeader className="pb-4 border-b border-slate-100 flex flex-row justify-between items-start">
                    <div>
                      <CardTitle>Transaction Details</CardTitle>
                      <p className="text-xs text-slate-500 mt-1">{viewTxn.id}</p>
                    </div>
                    <button onClick={() => setViewTxn(null)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-6">
                    <div className="text-center">
                      <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-3 ${getCategoryStyles(viewTxn.category).iconBg} ${getCategoryStyles(viewTxn.category).iconText}`}>
                        {React.createElement(getCategoryStyles(viewTxn.category).icon, { className: 'w-8 h-8' })}
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-1">{formatInr(viewTxn.amount)}</h3>
                      <p className="text-sm font-medium text-slate-500">{viewTxn.merchant}</p>
                    </div>
                    
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between border-b border-slate-50 pb-2">
                        <span className="text-slate-500">Date & Time</span>
                        <span className="font-medium text-slate-900">{viewTxn.date} at {viewTxn.time}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-50 pb-2">
                        <span className="text-slate-500">Status</span>
                        <span className="font-medium text-emerald-600">{viewTxn.status}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-50 pb-2">
                        <span className="text-slate-500">Payment Method</span>
                        <span className="font-medium text-slate-900">{viewTxn.method}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-50 pb-2">
                        <span className="text-slate-500">Category</span>
                        <span className="font-medium text-slate-900">{viewTxn.category}</span>
                      </div>
                      <div className="flex flex-col border-b border-slate-50 pb-2 gap-1">
                        <span className="text-slate-500">Notes</span>
                        <span className="font-medium text-slate-900">{viewTxn.notes || '-'}</span>
                      </div>
                      
                      {viewTxn.tags && viewTxn.tags.length > 0 && (
                        <div className="flex gap-2 pt-2">
                          {viewTxn.tags.map((tag: string, i: number) => (
                            <span key={i} className="flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium">
                              <Tag className="w-3 h-3" /> {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-4 flex gap-3">
                      <button onClick={() => {
                        setNewTxn({
                          type: viewTxn.type.charAt(0).toUpperCase() + viewTxn.type.slice(1),
                          amount: viewTxn.amount.toString(),
                          category: viewTxn.category,
                          method: viewTxn.method,
                          merchant: viewTxn.merchant,
                          date: viewTxn.date,
                          time: viewTxn.time,
                          notes: viewTxn.notes || '',
                          tags: viewTxn.tags ? viewTxn.tags.join(', ') : ''
                        });
                        setEditingTxnId(viewTxn.id);
                        setIsAddModalOpen(true);
                      }} className="flex-1 bg-white border border-slate-200 text-slate-700 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 flex items-center justify-center gap-2">
                        <Edit3 className="w-4 h-4"/> Edit
                      </button>
                      <button onClick={async () => {
                        setConfirmDialog({
                          title: 'Delete Transaction',
                          message: 'Are you sure you want to delete this transaction?',
                          onConfirm: async () => {
                            try {
                              const { error } = await supabase
                                .from('transactions')
                                .delete()
                                .eq('id', viewTxn.id);
                              if (error) throw error;
                              setTransactions(transactions.filter(t => t.id !== viewTxn.id));
                              setViewTxn(null);
                              showToast('Transaction deleted successfully');
                            } catch (error: any) {
                              console.error('Error deleting transaction:', error);
                              showToast(error.message || 'Failed to delete transaction', 'error');
                            }
                          }
                        });
                      }} className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg text-sm font-medium hover:bg-red-100 flex items-center justify-center gap-2">
                        <Trash2 className="w-4 h-4"/> Delete
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Spending Trend Mini */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Spending Trend (Jul)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[120px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={analyticsData}>
                          <defs>
                            <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                          <Area type="monotone" dataKey="amount" stroke="#2563EB" fillOpacity={1} fill="url(#colorAmt)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* AI Assistant Widget */}
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-5 border border-indigo-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                    <Bot className="w-16 h-16 text-indigo-600" />
                  </div>
                  <div className="flex items-center gap-2 mb-3 relative z-10">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-indigo-600" />
                    </div>
                    <span className="font-bold text-indigo-900 text-sm">AI Advisor</span>
                  </div>
                  <div className="space-y-3 relative z-10 text-sm text-slate-700">
                    <p className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0"></span>
                      UPI is your most frequently used payment method this week.
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0"></span>
                      Food expenses increased by 18% compared to last month.
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0"></span>
                      Netflix & Spotify recurring charges detected. Convert to goals?
                    </p>
                  </div>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Highest Expense</p>
                      <p className="font-semibold text-slate-900">{formatInr(2450)} <span className="text-xs text-slate-500 font-normal">(Amazon)</span></p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Avg Daily Spending</p>
                      <p className="font-semibold text-slate-900">{formatInr(840)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Top Category</p>
                      <p className="font-semibold text-slate-900">Food & Dining</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Add Transaction Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setIsAddModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h2 className="text-lg font-bold text-slate-900">{editingTxnId ? 'Edit Transaction' : 'Add Transaction'}</h2>
                <button onClick={() => { setIsAddModalOpen(false); setEditingTxnId(null); setNewTxn({ type: 'Expense', amount: '', category: 'Food', method: 'UPI', merchant: '', date: '', time: '', notes: '', tags: '' }); }} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
              </div>
              
              <div className="p-6 overflow-y-auto flex-1">
                <form id="add-txn-form" onSubmit={handleAddSubmit} className="space-y-6">
                  {/* Type Selector */}
                  <div className="flex p-1 bg-slate-100 rounded-lg">
                    {types.map(t => (
                      <button 
                        key={t} type="button"
                        onClick={() => setNewTxn({...newTxn, type: t})}
                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${newTxn.type === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Amount (₹) *</label>
                      <input required type="number" value={newTxn.amount} onChange={e => setNewTxn({...newTxn, amount: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="0.00" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Merchant / Title *</label>
                      <input required type="text" value={newTxn.merchant} onChange={e => setNewTxn({...newTxn, merchant: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="e.g. Amazon, Salary" />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
                      <select value={newTxn.category} onChange={e => setNewTxn({...newTxn, category: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary">
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Payment Method</label>
                      <select value={newTxn.method} onChange={e => setNewTxn({...newTxn, method: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary">
                        {paymentMethods.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Date</label>
                      <input type="date" value={newTxn.date} onChange={e => setNewTxn({...newTxn, date: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Time</label>
                      <input type="time" value={newTxn.time} onChange={e => setNewTxn({...newTxn, time: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Notes</label>
                    <textarea rows={2} value={newTxn.notes} onChange={e => setNewTxn({...newTxn, notes: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="Optional details..."></textarea>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Tags (comma separated)</label>
                    <input type="text" value={newTxn.tags} onChange={e => setNewTxn({...newTxn, tags: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="e.g. Business, Travel" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Receipt</label>
                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer">
                      <ImageIcon className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                      <p className="text-sm text-slate-600 font-medium">Click to upload or drag and drop</p>
                      <p className="text-xs text-slate-400 mt-1">PNG, JPG, PDF up to 5MB</p>
                    </div>
                  </div>
                </form>
              </div>

              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
                <button type="button" onClick={() => { setIsAddModalOpen(false); setEditingTxnId(null); setNewTxn({ type: 'Expense', amount: '', category: 'Food', method: 'UPI', merchant: '', date: '', time: '', notes: '', tags: '' }); }} className="px-4 py-2 text-slate-700 font-medium hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                <button type="submit" form="add-txn-form" className="px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors">{editingTxnId ? 'Update Transaction' : 'Save Transaction'}</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


            {/* Filter Modal */}
      <AnimatePresence>
        {isFilterModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setIsFilterModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h2 className="text-lg font-bold text-slate-900">Filters</h2>
                <button onClick={() => setIsFilterModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
              </div>
              
              <div className="p-6 overflow-y-auto flex-1 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
                  <select 
                    value={filters.category} 
                    onChange={e => setFilters({...filters, category: e.target.value})} 
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="All">All Categories</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Date Range</label>
                  <select 
                    value={filters.dateRange} 
                    onChange={e => setFilters({...filters, dateRange: e.target.value})} 
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="All">All Time</option>
                    <option value="Last 7 Days">Last 7 Days</option>
                    <option value="This Month">This Month</option>
                    <option value="Last Month">Last Month</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Payment Method</label>
                  <select 
                    value={filters.paymentMethod} 
                    onChange={e => setFilters({...filters, paymentMethod: e.target.value})} 
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="All">All Methods</option>
                    {paymentMethods.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
                  <select 
                    value={filters.status} 
                    onChange={e => setFilters({...filters, status: e.target.value})} 
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Completed">Completed</option>
                    <option value="Pending">Pending</option>
                    <option value="Refunded">Refunded</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Min Amount (₹)</label>
                    <input 
                      type="number" 
                      value={filters.minAmount} 
                      onChange={e => setFilters({...filters, minAmount: e.target.value})} 
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary" 
                      placeholder="0" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Max Amount (₹)</label>
                    <input 
                      type="number" 
                      value={filters.maxAmount} 
                      onChange={e => setFilters({...filters, maxAmount: e.target.value})} 
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary" 
                      placeholder="No limit" 
                    />
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <button 
                  onClick={() => {
                    setFilters({ category: 'All', dateRange: 'All', paymentMethod: 'All', status: 'All', minAmount: '', maxAmount: '' });
                  }}
                  className="text-sm font-medium text-slate-500 hover:text-slate-700"
                >
                  Reset All
                </button>
                <button 
                  onClick={() => setIsFilterModalOpen(false)} 
                  className="px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-4 right-4 z-[60] px-4 py-3 rounded-lg shadow-xl border flex items-center gap-3 text-sm font-medium ${
              toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
            }`}
          >
            {toast.type === 'error' ? <X className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Dialog */}
      <AnimatePresence>
        {confirmDialog && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setConfirmDialog(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6"
            >
              <h3 className="text-lg font-bold text-slate-900 mb-2">{confirmDialog.title}</h3>
              <p className="text-slate-500 text-sm mb-6">{confirmDialog.message}</p>
              <div className="flex gap-3 justify-end">
                <button 
                  onClick={() => setConfirmDialog(null)} 
                  className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition-colors text-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    confirmDialog.onConfirm();
                    setConfirmDialog(null);
                  }} 
                  className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}