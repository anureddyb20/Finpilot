import { Button } from '../../components/ui/Button';
import { Building2, CreditCard, Wallet, Landmark, Download, Database, FileSpreadsheet, Trash2 } from 'lucide-react';

export function DataIntegrationsTab() {
  return (
    <div className="space-y-10">
      
      {/* Connected Accounts */}
      <section>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Connected Accounts</h3>
        <p className="text-sm text-slate-500 mb-6">Manage your connected financial institutions and wallets.</p>
        
        <div className="space-y-4">
          {/* Active Connection */}
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between p-4 border border-slate-200 rounded-xl bg-slate-50">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">HDFC Bank</p>
                <p className="text-xs text-slate-500">Savings Account •••• 4589</p>
                <p className="text-[10px] text-emerald-600 font-medium mt-0.5">Last synced: 2 hours ago</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Sync</Button>
              <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">Disconnect</Button>
            </div>
          </div>

          {/* Connect New */}
          <h4 className="text-sm font-medium text-slate-900 mt-6 mb-3">Add New Connection</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { label: 'Bank Account', icon: Landmark },
              { label: 'Credit Card', icon: CreditCard },
              { label: 'UPI', icon: Wallet },
            ].map((item, i) => (
              <button key={i} className="flex flex-col items-center gap-2 p-4 border border-slate-200 rounded-xl hover:border-primary hover:bg-blue-50 transition-all">
                <item.icon className="w-6 h-6 text-slate-600" />
                <span className="text-xs font-medium text-slate-700">{item.label}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-2">Support for Investment and Insurance accounts coming soon.</p>
        </div>
      </section>

      <hr className="border-slate-100" />

      {/* Export Options */}
      <section>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Export Data</h3>
        <p className="text-sm text-slate-500 mb-6">Download your financial data for external use.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Data to Export</label>
            <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm">
              <option>All Data</option>
              <option>Transactions Only</option>
              <option>Budgets</option>
              <option>Goals</option>
              <option>Recurring Payments</option>
              <option>Reports</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Format</label>
            <div className="flex gap-2">
              {['CSV', 'Excel', 'PDF', 'JSON'].map((fmt) => (
                <button key={fmt} className="flex-1 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100 focus:border-primary focus:bg-blue-50 transition-all">
                  {fmt}
                </button>
              ))}
            </div>
          </div>
        </div>
        <Button className="mt-4 gap-2">
          <Download className="w-4 h-4" />
          Generate Export
        </Button>
      </section>

      <hr className="border-slate-100" />

      {/* Data Management */}
      <section>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Data Management</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl">
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-sm font-medium text-slate-900">Backup Data</p>
                <p className="text-xs text-slate-500">Create a secure encrypted backup of your data.</p>
              </div>
            </div>
            <Button variant="outline" size="sm">Backup Now</Button>
          </div>

          <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-sm font-medium text-slate-900">Restore Backup</p>
                <p className="text-xs text-slate-500">Restore data from a previous backup file.</p>
              </div>
            </div>
            <Button variant="outline" size="sm">Restore</Button>
          </div>

          <div className="flex items-center justify-between p-4 border border-red-100 bg-red-50 rounded-xl mt-8">
            <div className="flex items-center gap-3">
              <Trash2 className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-sm font-bold text-red-700">Delete Account & Data</p>
                <p className="text-xs text-red-600">Permanently remove your account and all associated data.</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="border-red-200 text-red-700 hover:bg-red-100">Delete</Button>
          </div>
        </div>
      </section>
    </div>
  );
}
