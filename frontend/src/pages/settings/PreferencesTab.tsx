import { Button } from '../../components/ui/Button';

export function PreferencesTab() {
  return (
    <div className="space-y-10">
      
      {/* Currency & Language Settings */}
      <section>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Localization</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Default Currency</label>
            <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm">
              <option value="INR">Indian Rupee (₹)</option>
              <option value="USD" disabled>USD ($) - Coming Soon</option>
              <option value="EUR" disabled>EUR (€) - Coming Soon</option>
              <option value="GBP" disabled>GBP (£) - Coming Soon</option>
              <option value="AED" disabled>AED (د.إ) - Coming Soon</option>
              <option value="JPY" disabled>JPY (¥) - Coming Soon</option>
            </select>
            <p className="text-xs text-slate-500">Currently only INR is fully supported.</p>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Display Language</label>
            <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm">
              <option>English</option>
              <option>Hindi</option>
              <option>Kannada</option>
              <option>Telugu</option>
              <option>Tamil</option>
              <option>Malayalam</option>
            </select>
          </div>
        </div>
      </section>

      <hr className="border-slate-100" />

      {/* Appearance */}
      <section>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Appearance</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <label className="cursor-pointer">
            <input type="radio" name="theme" className="peer sr-only" defaultChecked />
            <div className="p-4 border-2 border-slate-100 rounded-xl peer-checked:border-primary peer-checked:bg-blue-50 transition-all text-center">
              <div className="w-12 h-12 bg-white border border-slate-200 rounded-full mx-auto mb-2 flex items-center justify-center">☀️</div>
              <span className="text-sm font-medium text-slate-900">Light</span>
            </div>
          </label>
          <label className="cursor-pointer">
            <input type="radio" name="theme" className="peer sr-only" />
            <div className="p-4 border-2 border-slate-100 rounded-xl peer-checked:border-primary peer-checked:bg-blue-50 transition-all text-center opacity-70">
              <div className="w-12 h-12 bg-slate-900 rounded-full mx-auto mb-2 flex items-center justify-center">🌙</div>
              <span className="text-sm font-medium text-slate-900">Dark</span>
            </div>
          </label>
          <label className="cursor-pointer">
            <input type="radio" name="theme" className="peer sr-only" />
            <div className="p-4 border-2 border-slate-100 rounded-xl peer-checked:border-primary peer-checked:bg-blue-50 transition-all text-center">
              <div className="w-12 h-12 bg-gradient-to-tr from-white to-slate-900 rounded-full mx-auto mb-2 border border-slate-200 flex items-center justify-center">⚙️</div>
              <span className="text-sm font-medium text-slate-900">System</span>
            </div>
          </label>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900">Compact Mode</p>
              <p className="text-xs text-slate-500">Reduce spacing between elements to show more data.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900">Reduce Motion</p>
              <p className="text-xs text-slate-500">Disable UI animations for a simpler experience.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </section>

      <hr className="border-slate-100" />

      {/* Financial Preferences */}
      <section>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Financial Preferences</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Salary Day</label>
            <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm">
              {[...Array(31)].map((_, i) => (
                <option key={i+1} value={i+1}>{i+1}</option>
              ))}
              <option value="last">Last day of month</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Financial Year</label>
            <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm">
              <option>April to March (India)</option>
              <option>January to December</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Savings Target (%)</label>
            <input type="number" defaultValue="20" min="0" max="100" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm" />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Investment Preference</label>
            <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm">
              <option>Conservative</option>
              <option>Moderate</option>
              <option>Aggressive</option>
            </select>
          </div>
        </div>
      </section>

      <hr className="border-slate-100" />

      {/* AI Preferences */}
      <section>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">AI Preferences</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">AI Tone</label>
            <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm">
              <option>Professional</option>
              <option>Friendly</option>
              <option>Detailed</option>
              <option>Simple</option>
            </select>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Preferred Advice Type</label>
            <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm">
              <option>All</option>
              <option>Savings</option>
              <option>Budgeting</option>
              <option>Investing</option>
              <option>Debt Reduction</option>
            </select>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <Button>Save Preferences</Button>
        </div>
      </section>

    </div>
  );
}
