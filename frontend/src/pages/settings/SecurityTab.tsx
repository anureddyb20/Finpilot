import { Button } from '../../components/ui/Button';
import { ShieldCheck, Smartphone, Laptop, Key, History } from 'lucide-react';

export function SecurityTab() {
  return (
    <div className="space-y-10">
      
      {/* Security Dashboard */}
      <section>
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-6 flex flex-col md:flex-row items-center gap-6 mb-8">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-8 h-8 text-emerald-600" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-xl font-bold text-slate-900">Your account is highly secure</h3>
            <p className="text-slate-600 text-sm mt-1">Security Score: 95/100. All critical security measures are enabled.</p>
          </div>
          <Button variant="outline" className="shrink-0 border-emerald-200 text-emerald-700 hover:bg-emerald-100">
            View Security Audit
          </Button>
        </div>

        <h3 className="text-lg font-semibold text-slate-900 mb-4">Two-Factor Authentication (2FA)</h3>
        <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-slate-50">
          <div>
            <p className="text-sm font-medium text-slate-900">Authenticator App</p>
            <p className="text-xs text-slate-500">Configured to receive codes via Google Authenticator.</p>
          </div>
          <Button variant="outline" size="sm">Manage</Button>
        </div>
      </section>

      <hr className="border-slate-100" />

      {/* Password & Security */}
      <section>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Password & Security</h3>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between p-4 border border-slate-200 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg text-primary">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">Change Password</p>
                <p className="text-xs text-slate-500">Last changed 4 months ago</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex gap-1">
                    <div className="w-8 h-1.5 bg-green-500 rounded-full"></div>
                    <div className="w-8 h-1.5 bg-green-500 rounded-full"></div>
                    <div className="w-8 h-1.5 bg-green-500 rounded-full"></div>
                    <div className="w-8 h-1.5 bg-slate-200 rounded-full"></div>
                  </div>
                  <span className="text-[10px] text-green-600 font-medium">Strong</span>
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm">Update</Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between p-4 border border-slate-200 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg text-primary">
                <History className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">Session Timeout</p>
                <p className="text-xs text-slate-500">Automatically log out after inactivity.</p>
              </div>
            </div>
            <select className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm w-32">
              <option>15 Minutes</option>
              <option>30 Minutes</option>
              <option>1 Hour</option>
              <option>Never</option>
            </select>
          </div>
        </div>
      </section>

      <hr className="border-slate-100" />

      {/* Trusted Devices & Activity */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Active Devices</h3>
          <button className="text-sm text-red-600 font-medium hover:underline">Logout from all devices</button>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl">
            <div className="flex items-center gap-4">
              <Laptop className="w-6 h-6 text-slate-400" />
              <div>
                <p className="text-sm font-medium text-slate-900 flex items-center gap-2">
                  MacBook Pro (Current)
                  <span className="bg-emerald-100 text-emerald-700 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase">Active</span>
                </p>
                <p className="text-xs text-slate-500">Bengaluru, India • Chrome • IP: 192.168.1.1</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl">
            <div className="flex items-center gap-4">
              <Smartphone className="w-6 h-6 text-slate-400" />
              <div>
                <p className="text-sm font-medium text-slate-900">iPhone 14 Pro</p>
                <p className="text-xs text-slate-500">Mumbai, India • FinPilot iOS App • Yesterday, 2:30 PM</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="text-slate-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50">Revoke</Button>
          </div>
        </div>
      </section>

      <hr className="border-slate-100" />

      {/* Privacy Settings */}
      <section>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Privacy Settings</h3>
        <div className="space-y-4">
          {[
            { label: 'Data Sharing', desc: 'Allow sharing anonymized data for app improvements.' },
            { label: 'AI Data Usage', desc: 'Allow your financial data to train personalized AI models.' },
            { label: 'Analytics Collection', desc: 'Send usage reports to help us find and fix bugs.' },
            { label: 'Marketing Emails', desc: 'Receive offers, updates, and promotional content.' },
            { label: 'Personalized Recommendations', desc: 'Get tailored financial product suggestions.' },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">{item.label}</p>
                <p className="text-xs text-slate-500">{item.desc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked={i < 3} />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          ))}
        </div>
      </section>
      
    </div>
  );
}
