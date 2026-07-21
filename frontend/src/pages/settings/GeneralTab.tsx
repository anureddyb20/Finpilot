import { Button } from '../../components/ui/Button';
import { Camera, CheckCircle2, AlertCircle } from 'lucide-react';

export function GeneralTab() {
  return (
    <div className="space-y-10">
      {/* Personalization Section */}
      <section>
        <div className="flex items-center gap-4 mb-6">
          <div className="relative group">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-slate-100 border-4 border-white shadow-lg">
              <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Profile" className="w-full h-full object-cover" />
            </div>
            <button className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full shadow-md border border-slate-100 text-slate-600 hover:text-primary transition-colors">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Good Evening, Anu</h2>
            <p className="text-slate-500 text-sm">Welcome back.</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-primary font-bold text-sm">
              92%
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">Your profile is almost complete</p>
              <p className="text-xs text-slate-500">Complete your profile to unlock better AI recommendations.</p>
            </div>
          </div>
          <Button variant="outline" size="sm">Complete Now</Button>
        </div>
      </section>

      <hr className="border-slate-100" />

      {/* Account Settings */}
      <section>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Account Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Full Name</label>
            <input type="text" defaultValue="Anu Reddy" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm" />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Email Address</label>
            <div className="relative">
              <input type="email" defaultValue="anu.reddy@example.com" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm pr-10" />
              <CheckCircle2 className="w-4 h-4 text-green-500 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
            <p className="text-xs text-slate-500">Verified</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Mobile Number</label>
            <div className="relative">
              <input type="tel" defaultValue="+91 98765 43210" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm pr-10" />
              <AlertCircle className="w-4 h-4 text-amber-500 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
            <div className="flex justify-between items-center">
              <p className="text-xs text-amber-600">Verification pending</p>
              <button className="text-xs text-primary font-medium hover:underline">Verify now</button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Date of Birth</label>
            <input type="date" defaultValue="1995-08-15" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm" />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Occupation</label>
            <input type="text" defaultValue="Software Engineer" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">City</label>
              <input type="text" defaultValue="Bengaluru" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Country</label>
              <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm">
                <option>India</option>
                <option>USA</option>
                <option>UK</option>
              </select>
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <Button>Save Changes</Button>
        </div>
      </section>

      <hr className="border-slate-100" />

      {/* Account Statistics */}
      <section>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Account Statistics</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
            <p className="text-xs text-slate-500 font-medium mb-1">Member Since</p>
            <p className="text-lg font-semibold text-slate-900">Oct 2024</p>
          </div>
          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
            <p className="text-xs text-slate-500 font-medium mb-1">Total Transactions</p>
            <p className="text-lg font-semibold text-slate-900">1,248</p>
          </div>
          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
            <p className="text-xs text-slate-500 font-medium mb-1">Financial Health</p>
            <p className="text-lg font-semibold text-green-600">Excellent</p>
          </div>
          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
            <p className="text-xs text-slate-500 font-medium mb-1">AI Conversations</p>
            <p className="text-lg font-semibold text-slate-900">34</p>
          </div>
        </div>
      </section>
    </div>
  );
}
