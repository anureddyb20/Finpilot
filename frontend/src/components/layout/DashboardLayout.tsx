import { Outlet, Link } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Bell, Search } from 'lucide-react';

export function DashboardLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="pl-64 flex flex-col flex-1">
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center bg-slate-50 rounded-full px-4 py-2 border border-slate-200 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all w-96">
            <Search className="w-4 h-4 text-slate-400 mr-2" />
            <input 
              type="text" 
              placeholder="Search transactions, budgets, or ask AI..." 
              className="bg-transparent border-none outline-none text-sm w-full text-slate-900 placeholder:text-slate-400"
            />
          </div>
          
          <div className="flex items-center gap-4">
            <Link to="/notifications" className="relative p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </Link>
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-accent p-[2px]">
              <div className="w-full h-full rounded-full border-2 border-white overflow-hidden bg-white">
                <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Profile" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </header>
        
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
