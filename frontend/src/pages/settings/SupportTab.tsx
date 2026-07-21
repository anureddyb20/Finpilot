import { Button } from '../../components/ui/Button';
import { HelpCircle, MessageSquare, Bug, Lightbulb, FileText, RefreshCw, Zap } from 'lucide-react';

export function SupportTab() {
  return (
    <div className="space-y-10">
      
      {/* Quick Actions */}
      <section>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Edit Profile', icon: Zap },
            { label: 'Change Password', icon: Zap },
            { label: 'Export Data', icon: Zap },
            { label: 'Contact Support', icon: Zap },
          ].map((item, i) => (
            <button key={i} className="flex flex-col items-center gap-2 p-4 border border-slate-200 rounded-xl hover:border-primary hover:bg-blue-50 transition-all">
              <item.icon className="w-5 h-5 text-primary" />
              <span className="text-xs font-medium text-slate-700">{item.label}</span>
            </button>
          ))}
        </div>
      </section>

      <hr className="border-slate-100" />

      {/* Help & Support */}
      <section>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Help & Support</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-start gap-3 p-4 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
            <HelpCircle className="w-5 h-5 text-slate-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-slate-900">FAQs</p>
              <p className="text-xs text-slate-500 mt-1">Browse frequently asked questions and guides.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
            <MessageSquare className="w-5 h-5 text-slate-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-slate-900">Contact Support</p>
              <p className="text-xs text-slate-500 mt-1">Get in touch with our customer success team.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
            <Bug className="w-5 h-5 text-slate-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-slate-900">Report a Bug</p>
              <p className="text-xs text-slate-500 mt-1">Found an issue? Let us know so we can fix it.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
            <Lightbulb className="w-5 h-5 text-slate-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-slate-900">Request a Feature</p>
              <p className="text-xs text-slate-500 mt-1">Have an idea? We'd love to hear it.</p>
            </div>
          </div>
        </div>
        
        <div className="flex gap-4 mt-4">
          <a href="#" className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
            <FileText className="w-3 h-3" /> Privacy Policy
          </a>
          <a href="#" className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
            <FileText className="w-3 h-3" /> Terms & Conditions
          </a>
        </div>
      </section>

      <hr className="border-slate-100" />

      {/* About FinPilot */}
      <section>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">About FinPilot</h3>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900">FinPilot</p>
              <p className="text-sm text-slate-500">Your intelligent financial companion.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-2 text-sm">
            <div>
              <p className="text-slate-500 text-xs mb-0.5">Version</p>
              <p className="font-medium text-slate-900">2.4.1</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs mb-0.5">Build Number</p>
              <p className="font-medium text-slate-900">241005</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs mb-0.5">Release Date</p>
              <p className="font-medium text-slate-900">Oct 20, 2026</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs mb-0.5">Platform</p>
              <p className="font-medium text-slate-900">Web / React</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs mb-0.5">Developer</p>
              <p className="font-medium text-slate-900">DeepMind AAC</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs mb-0.5">License</p>
              <p className="font-medium text-slate-900">MIT</p>
            </div>
          </div>
        </div>
      </section>

      <hr className="border-slate-100" />

      {/* Reset Options */}
      <section>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Reset Options</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl">
            <div className="flex items-center gap-3">
              <RefreshCw className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-sm font-medium text-slate-900">Reset Preferences</p>
                <p className="text-xs text-slate-500">Revert theme, notifications, and AI settings to default.</p>
              </div>
            </div>
            <Button variant="outline" size="sm">Reset</Button>
          </div>
          
          <div className="flex items-center justify-between p-4 border border-red-100 bg-red-50 rounded-xl">
            <div className="flex items-center gap-3">
              <RefreshCw className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-sm font-bold text-red-700">Factory Reset</p>
                <p className="text-xs text-red-600">Reset the entire application settings (Data is preserved).</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="border-red-200 text-red-700 hover:bg-red-100">Factory Reset</Button>
          </div>
        </div>
      </section>

    </div>
  );
}
